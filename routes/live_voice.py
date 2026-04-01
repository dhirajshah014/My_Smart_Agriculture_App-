import os
import json
import base64
import asyncio
import threading
from flask import session
from flask_socketio import emit
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# We use a global client or per-session client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    http_options={'api_version': 'v1alpha'}
)

# Active sessions store: { sid: { 'task': asyncio_task, 'queue': input_queue } }
active_sessions = {}

def register_live_handlers(socketio):
    
    @socketio.on('connect', namespace='/live')
    def handle_connect():
        print(f"[Live] Client connected: {request.sid}")
    
    @socketio.on('start_session', namespace='/live')
    def handle_start(data):
        sid = request.sid
        lang = data.get('language', 'English')
        
        # Initialize an input queue for this session
        input_queue = asyncio.Queue()
        
        # Start the background asyncio task for this sid
        loop = asyncio.new_event_loop()
        thread = threading.Thread(target=run_async_loop, args=(loop, sid, input_queue, lang, socketio))
        thread.start()
        
        active_sessions[sid] = {
            'thread': thread,
            'loop': loop,
            'queue': input_queue
        }
    
    @socketio.on('audio_in', namespace='/live')
    def handle_audio(data):
        sid = request.sid
        if sid in active_sessions:
            # Data is now received as raw binary bytes (16-bit PCM 16kHz)
            asyncio.run_coroutine_threadsafe(
                active_sessions[sid]['queue'].put(data), 
                active_sessions[sid]['loop']
            )

    @socketio.on('disconnect', namespace='/live')
    def handle_disconnect():
        sid = request.sid
        print(f"[Live] Client disconnected: {sid}")
        if sid in active_sessions:
            # Signal the loop to stop
            asyncio.run_coroutine_threadsafe(
                active_sessions[sid]['queue'].put(None), 
                active_sessions[sid]['loop']
            )
            del active_sessions[sid]

def run_async_loop(loop, sid, queue, lang, socketio):
    asyncio.set_event_loop(loop)
    loop.run_until_complete(gemini_live_session(sid, queue, lang, socketio))

async def gemini_live_session(sid, queue, lang, socketio):
    try:
        config = types.LiveConnectConfig(
            model="gemini-2.5-flash",
            system_instruction=f"You are TerraBot Pro, a real-time agricultural assistant. Respond strictly in {lang} native script. Keep responses concise as this is a voice conversation.",
            response_modalities=[types.LiveModality.AUDIO]
        )
        
        async with client.aio.live.connect(model="gemini-2.5-flash", config=config) as session:
            print(f"[Live] Gemini Session Started for {sid}")
            
            # Sub-task to handle incoming AI audio
            async def receive_from_gemini():
                async for message in session.receive():
                    if message.server_content and message.server_content.model_turn:
                        for part in message.server_content.model_turn.parts:
                            if part.inline_data:
                                # Send RAW BINARY audio back to the frontend
                                socketio.emit('audio_out', part.inline_data.data, namespace='/live', room=sid)

            # Task for sending user audio
            async def send_to_gemini():
                while True:
                    audio_data = await queue.get()
                    if audio_data is None: break # Shutdown signal
                    
                    # Gemini expects 'input_audio_buffer.append' structure via SDK
                    await session.send(input=types.LiveClientContent(
                        data=audio_data,
                        mime_type="audio/pcm"
                    ), end_of_turn=False)

            # Run both concurrently
            await asyncio.gather(receive_from_gemini(), send_to_gemini())
            
    except Exception as e:
        print(f"[Live Error] {e}")
        socketio.emit('error', {'msg': str(e)}, namespace='/live', room=sid)
