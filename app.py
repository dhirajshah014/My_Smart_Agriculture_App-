from flask import Flask, render_template, session, redirect, url_for, request, abort
from flask_socketio import SocketIO, emit
from routes.api import api
from routes.live_voice import register_live_handlers
import os

app = Flask(__name__)
app.secret_key = 'agri_secure_key_2026' # For secure sessions
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
register_live_handlers(socketio)
app.register_blueprint(api, url_prefix='/api')

@app.before_request
def require_login():
    # Public routes that bypass authentication
    allowed_routes = ['home', 'login', 'signup', 'static']
    
    # Bypass for static assets and the core API (which handles its own authentication logic)
    if request.path.startswith('/static') or request.path.startswith('/api'):
        return
        
    if 'user_id' not in session and request.endpoint not in allowed_routes:
        return redirect(url_for('login'))

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/')
def home():
    if 'user_id' in session:
        role = session.get('user_role')
        if role == 'admin': return redirect(url_for('admin'))
        return redirect(url_for('dashboard'))
    return render_template('landing.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/predict')
def predict():
    return render_template('predict.html')

@app.route('/yield')
def yield_prediction():
    return render_template('yield.html')

@app.route('/assistant')
def assistant():
    return render_template('assistant.html')

@app.route('/live_assistant')
def live_assistant():
    return render_template('live_assistant.html')

@app.route('/admin')
def admin():
    if session.get('user_role') != 'admin':
        return redirect(url_for('home'))
    return render_template('admin.html')

@app.route('/admin/workbench')
def admin_workbench():
    if session.get('user_role') != 'admin':
        return redirect(url_for('home'))
    return render_template('admin_workbench.html')

@app.route('/admin/datasets')
def admin_datasets():
    if session.get('user_role') != 'admin':
        return redirect(url_for('home'))
    return render_template('admin_datasets.html')

@app.route('/admin/logs')
def admin_logs():
    if session.get('user_role') != 'admin':
        return redirect(url_for('home'))
    return render_template('admin_logs.html')

@app.route('/advisory')
def advisory():
    return render_template('advisory.html')

@app.route('/disease')
def disease_detection():
    return render_template('disease.html')

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
