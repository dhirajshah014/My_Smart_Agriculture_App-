    const path = window.location.pathname;

// --- SHARED UTILITIES ---
const showNotification = (msg, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${msg}`);
    const toast = document.createElement('div');
    toast.className = `fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl transition-all animate-bounce ${type === 'warning' ? 'bg-red-600 text-white font-bold' : 'bg-primary text-white font-bold'}`;
    toast.innerHTML = `<div class="flex items-center gap-3">
        <span class="material-symbols-outlined">${type === 'warning' ? 'warning' : 'info'}</span>
        <span class="text-sm">${msg}</span>
    </div>`;
    document.body.appendChild(toast);
    setTimeout(() => { 
        toast.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
};

document.addEventListener('DOMContentLoaded', () => {

    // 1. HOME DASHBOARD (Trigger on root, dashboard, or index)
    if (path === '/' || path === '/dashboard' || path.includes('index')) {
        initHome();
    }

    // 2. CROP PREDICTION
    if (path.includes('predict')) {
        initPredict();
        initPricePredict();
    }

    // 3. YIELD PREDICTION
    if (path.includes('yield')) {
        initYield();
    }

    // 4. AI ASSISTANT (CHATBOT)
    if (path.includes('assistant')) {
        initAssistant();
    }

    // 5. ADMIN SUITE
    if (path.includes('admin')) {
        if (path.includes('/admin/workbench')) {
            initWorkbench();
        } else if (path.includes('/admin/datasets')) {
            initDatasets();
        } else if (path.includes('/admin/logs')) {
            initLogs();
            setInterval(initLogs, 10000); // Auto-refresh every 10s
        }
 else if (path === '/admin') {
            initAdmin();
        }
    }

    // 6. FARMER ADVISORY
    if (path.includes('advisory')) {
        initAdvisory();
    }

    // 6. FARMER ADVISORY
    if (path.includes('advisory')) {
        initAdvisory();
    }

    // --- VOICE ASSISTANT (GLOBAL) ---
    initVoice();
});

// --- HOME DASHBOARD LOGIC ---
function showLanguagePopup() {
    const modal = document.getElementById('languageModal');
    const content = document.getElementById('modalContent');
    if (!modal || !content) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function hideLanguagePopup() {
    const modal = document.getElementById('languageModal');
    const content = document.getElementById('modalContent');
    if (!modal || !content) return;
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }, 300);
}

function selectLanguage(lang) {
    localStorage.setItem('terra_preferred_lang', lang);
    localStorage.setItem('terra_auto_start_voice', 'true');
    window.location.href = '/assistant';
}

async function initHome() {
    // Override default voiceBtn on home page
    const homeVoiceBtn = document.getElementById('voiceBtn');
    if (homeVoiceBtn) {
        homeVoiceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showLanguagePopup();
        }, true);
    }

    // 1. Weather Data (Default to Chicago for professional demo or actual IP)
    try {
        const res = await fetch('/api/weather?city=Chicago');
        const data = await res.json();
        if (data.main) {
            document.getElementById('weatherCity').innerText = data.name + ", " + data.sys.country;
            document.getElementById('weatherTemp').innerText = Math.round(data.main.temp) + "°";
            document.getElementById('weatherHum').innerText = data.main.humidity + "% Humidity";
            document.getElementById('weatherRain').innerText = (data.rain ? data.rain['1h'] : '0.0') + "mm Rain";
            
            const icon = document.getElementById('weatherIcon');
            if (data.weather && data.weather[0].main === 'Rain') icon.innerText = 'rainy';
            else if (data.weather && data.weather[0].main === 'Clouds') icon.innerText = 'cloud';
            else icon.innerText = 'wb_sunny';
        } else {
            throw new Error("Invalid Weather Data");
        }
    } catch (e) { 
        console.error("Weather failed, using defaults", e);
        // Fallback for Professional Demo
        if (document.getElementById('weatherCity')) {
            document.getElementById('weatherCity').innerText = "Varanasi, India";
            document.getElementById('weatherTemp').innerText = "28°";
            document.getElementById('weatherHum').innerText = "65% Humidity";
            document.getElementById('weatherRain').innerText = "0.0mm Rain";
        }
    }

    // 2. Dashboard Summary (Real ML Data)
    try {
        const res = await fetch('/api/dashboard_summary');
        const summary = await res.json();
        
        // Populate Accuracy & Latest Result
        document.getElementById('mlAccuracy').innerText = (summary.accuracy * 100).toFixed(1) + "%";
        const activeCrop = document.getElementById('activeCrop');
        activeCrop.innerText = summary.last_prediction;
        
        if (summary.last_prediction !== 'Pending Analysis') {
            document.getElementById('cropStatus').innerText = "Last Updated: Just Now";
            activeCrop.classList.add('text-tertiary-fixed');
        }
        
        // Update Alerts Feed
        const feed = document.getElementById('activityFeed');
        if (feed && summary.alerts) {
            feed.innerHTML = summary.alerts.map(alert => `
                <div class="flex gap-3 items-start p-3 bg-white rounded-lg shadow-sm border border-primary/5 transition-all hover:translate-x-1">
                    <span class="material-symbols-outlined text-primary text-sm">notifications_active</span>
                    <div class="text-[11px] font-bold text-primary">${alert}</div>
                </div>
            `).join('');
        }

        // Render Benchmarks Chart
        if (summary.benchmarks) {
            renderYieldChart(summary.benchmarks);
        }
    } catch (e) { console.error("Summary failed", e); }
}

function renderYieldChart(data) {
    const container = document.getElementById('yieldChart');
    if (!container) return;

    const loader = document.getElementById('yieldChartLoader');
    if (loader) loader.classList.add('opacity-0');
    setTimeout(() => { if (loader) loader.classList.add('hidden'); }, 300);

    const trace = {
        x: data.map(d => d.month),
        y: data.map(d => d.value),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Yield Trend',
        line: { color: '#173b1e', width: 3, shape: 'spline' },
        marker: { size: 8, color: '#e9c400' },
        fill: 'tozeroy',
        fillcolor: 'rgba(23, 59, 30, 0.05)'
    };

    const layout = {
        margin: { t: 10, b: 40, l: 40, r: 20 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        showlegend: false,
        autosize: true,
        height: 300,
        font: { family: 'Inter', size: 10 },
        xaxis: { gridcolor: 'rgba(0,0,0,0.05)', zeroline: false },
        yaxis: { gridcolor: 'rgba(0,0,0,0.05)', zeroline: false, title: 'Tons/Hectare (Avg)' }
    };

    Plotly.newPlot('yieldChart', [trace], layout, {responsive: true, displayModeBar: false});
}

// --- CROP PREDICTION LOGIC ---
function initPredict() {
    const btn = document.getElementById('predictBtn');
    if (!btn) return;

    btn.addEventListener('click', async (e) => {
        if (e) e.preventDefault();
        const data = {
            N: document.getElementById('n_val').value,
            P: document.getElementById('p_val').value,
            K: document.getElementById('k_val').value,
            ph: document.getElementById('ph_val').value,
            temperature: document.getElementById('temp_val').value,
            rainfall: document.getElementById('rain_val').value,
            humidity: 80 
        };

        btn.innerText = "Analyzing...";
        try {
            const res = await fetch('/api/predict_crop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            const card = document.getElementById('resultCard');
            if (card) {
                card.classList.remove('hidden');
                const cropName = result.crop || "Unknown";
                document.getElementById('cropResult').innerText = cropName;
                document.getElementById('cropReason').innerText = `Your soil profile is highly compatible with ${cropName}. Maintaining current irrigation is recommended.`;
                
                // --- Link with Price Prediction ---
                const priceCropSelect = document.getElementById('priceCrop');
                if (priceCropSelect) {
                    const lowercaseCrop = cropName.toLowerCase();
                    // Check if the crop exists in the select options
                    const option = Array.from(priceCropSelect.options).find(opt => opt.value === lowercaseCrop);
                    if (option) {
                        priceCropSelect.value = lowercaseCrop;
                        showNotification(`Market insights loaded for ${cropName}`, 'info');
                    }
                }
            }
        } catch (e) { console.error(e); }
        btn.innerHTML = 'Run Analysis <span class="material-symbols-outlined">science</span>';
    });
}

// --- CROP PRICE PREDICTION LOGIC ---
function initPricePredict() {
    const btn = document.getElementById('pricePredictBtn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const crop = document.getElementById('priceCrop').value;
        const days = document.getElementById('daysAhead').value;
        const loader = document.getElementById('priceChartLoader');
        const placeholder = document.getElementById('noDataPlaceholder');
        const resultCard = document.getElementById('priceResultCard');

        btn.innerText = "Predicting...";
        if (loader) loader.classList.remove('hidden');
        if (placeholder) placeholder.classList.add('hidden');

        try {
            const res = await fetch('/api/predict_price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ crop: crop, days_ahead: days })
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            // Update Result Card
            if (resultCard) {
                resultCard.classList.remove('hidden');
                document.getElementById('predictedPriceVal').innerText = data.predicted_price;
                
                // Safe check for history index (Today is at index 30)
                const todayPrice = (data.history && data.history.length > 30) ? data.history[30].price : data.predicted_price;
                const trend = data.predicted_price > todayPrice ? 'rise' : 'dip';
                
                document.getElementById('priceAdvice').innerText = `Based on trends, we predict a ${trend} in ${crop} prices. ${data.recommendation}.`;
            }

            // Render Visualization
            renderPriceChart(data.history, crop);

        } catch (e) {
            console.error(e);
            showNotification("Price prediction failing. Try again.", "warning");
        } finally {
            btn.innerHTML = 'Estimate Price <span class="material-symbols-outlined text-lg">payments</span>';
            if (loader) loader.classList.add('hidden');
        }
    });

    function renderPriceChart(history, cropName) {
        const x = history.map(h => h.date);
        const y = history.map(h => h.price);
        
        // Split indices
        const splitIdx = 30; // 30 days of history, then prediction

        const traceHistory = {
            x: x.slice(0, splitIdx + 1),
            y: y.slice(0, splitIdx + 1),
            type: 'scatter',
            mode: 'lines',
            name: 'Historical',
            line: { color: '#506356', width: 3 }
        };

        const tracePrediction = {
            x: x.slice(splitIdx),
            y: y.slice(splitIdx),
            type: 'scatter',
            mode: 'lines',
            name: 'Forecast',
            line: { color: '#ba1a1a', width: 4, dash: 'dot' },
            fill: 'tozeroy',
            fillcolor: 'rgba(186, 26, 26, 0.05)'
        };

        const layout = {
            title: { text: `${cropName.toUpperCase()} Market Price Trajectory`, font: { family: 'Manrope', size: 16, color: '#173b1e', weight: 800 } },
            margin: { t: 60, b: 40, l: 60, r: 40 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            xaxis: { gridcolor: 'rgba(0,0,0,0.05)', tickfont: { size: 10 } },
            yaxis: { title: 'Price (₹/quintal)', gridcolor: 'rgba(0,0,0,0.05)', tickfont: { size: 10 } },
            showlegend: true,
            legend: { x: 0, y: 1.1, orientation: 'h' },
            hovermode: 'closest',
            autosize: true
        };

        Plotly.newPlot('priceTrendGraph', [traceHistory, tracePrediction], layout, {responsive: true, displayModeBar: false});
    }
}

// --- YIELD PREDICTION LOGIC ---
function initYield() {
    const btn = document.getElementById('yieldPredictBtn');
    if (!btn) return;

    btn.addEventListener('click', async (e) => {
        if (e) e.preventDefault();
        const data = {
            crop: document.getElementById('cropType').value,
            area: document.getElementById('areaSize').value,
            rainfall: document.getElementById('histRainfall').value,
            temperature: document.getElementById('avgTemp').value
        };

        btn.innerText = "Calculating...";
        try {
            const res = await fetch('/api/predict_yield', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if (document.getElementById('yieldHarvestResult')) {
                document.getElementById('yieldHarvestResult').innerText = result.yield;
            }
            if (document.getElementById('unitYield')) {
                document.getElementById('unitYield').innerText = result.unit_yield + " T/ha";
            }

            // Render Regression Chart
            const chartDiv = document.getElementById('regressionGraph');
            if (chartDiv) {
                const loader = document.getElementById('regressionLoader');
                if (loader) loader.classList.add('hidden');
                setTimeout(() => {
                    const pts = result.regression_points;
                    const trace1 = {
                        x: pts.x,
                        y: pts.y_actual,
                        mode: 'markers',
                        name: 'Actual',
                        marker: { color: '#173b1e' }
                    };
                    const trace2 = {
                        x: pts.x,
                        y: pts.y_pred,
                        mode: 'lines',
                        name: 'Predicted',
                        line: { color: '#e9c400', dash: 'dash' }
                    };
                    const layout = {
                        margin: { t: 30, b: 40, l: 50, r: 30 },
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        autosize: true,
                        height: 300,
                        xaxis: { title: { text: pts.variable, font: { size: 10 } } },
                        yaxis: { title: { text: 'Yield (T/ha)', font: { size: 10 } } },
                        font: { family: 'Inter', size: 10 }
                    };
                    Plotly.newPlot('regressionGraph', [trace1, trace2], layout, {responsive: true, displayModeBar: false});
                }, 100);
            }

        } catch (e) { console.error(e); }
        btn.innerHTML = '<span class="material-symbols-outlined">calculate</span> Estimate Yield';
    });
}

// --- GLOBAL TTS HELPER ---
let availableVoices = [];
const loadVoices = () => {
    availableVoices = window.speechSynthesis.getVoices();
};
if (window.speechSynthesis) {
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
}

function speak(text, lang = 'en-US') {
    if (!window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    // Special robust handling for Nepali and Telugu using Google Translate TTS 
    // (Bypasses missing OS voice packages and script misreads on local TTS)
    if (lang === 'te-IN' || lang === 'ne-NP') {
        const urlLang = lang === 'te-IN' ? 'te' : 'ne';
        const chunks = text.match(/.{1,150}([\s।\.\?!]|$)/g) || [text];
        
        const playChunks = (index) => {
            if (index >= chunks.length) return;
            const chunk = chunks[index].trim();
            if (!chunk) { playChunks(index + 1); return; }
            
            const audioUrl = `/api/tts_fallback?lang=${urlLang}&text=${encodeURIComponent(chunk)}`;
            const audio = new Audio(audioUrl);
            audio.onended = () => playChunks(index + 1);
            audio.play().catch(e => {
                console.warn('Google TTS Audio failed', e);
                playChunks(index + 1);
            });
        };
        playChunks(0);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // "Friendly AI Agent" tuning
    utterance.pitch = 1.0; 
    utterance.rate = 1.0;  

    // Deep Search for voices
    const searchVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return null;

        // 1. Try Google cloud voices first (highest quality in Chrome)
        let match = voices.find(v => v.name.includes('Google') && (v.lang === lang || v.lang.startsWith(lang.split('-')[0])));
        
        // 2. Exact locale match
        if (!match) match = voices.find(v => v.lang === lang || v.lang.replace('_', '-') === lang);
        
        // 3. Language broad match
        if (!match) {
            const prefix = lang.split('-')[0];
            match = voices.find(v => v.lang.startsWith(prefix));
        }

        // 4. Phonetic/Regional Fallbacks for Indic languages
        if (!match) {
            if (lang.startsWith('ne') || lang.startsWith('te')) {
                // Search specifically for any Hindi voice or any Indian-accented voice
                match = voices.find(v => v.lang.includes('IN') || v.lang.startsWith('hi'));
            }
        }
        return match;
    };

    let voice = searchVoices();
    
    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang; // CRITICAL: align utterance lang with voice lang
        console.log(`[TTS] Speaking in ${voice.name} (${voice.lang}) for ${lang}`);
    } else {
        console.warn(`[TTS] No compatible voice found for ${lang}. Falling back to default.`);
    }
    
    // Force a small delay to ensure voices are ready
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 50);
}

function initAssistant() {
    const input = document.getElementById('userInput');
    const send = document.getElementById('sendBtn');
    const container = document.getElementById('chatMessages');
    const langSelect = document.getElementById('langSelect');
    const speakerToggle = document.getElementById('speakerToggle');
    const voiceBtn = document.getElementById('voiceBtn');

    let voiceEnabled = true;

    if (speakerToggle) {
        speakerToggle.addEventListener('click', () => {
            voiceEnabled = !voiceEnabled;
            speakerToggle.innerHTML = `<span class="material-symbols-outlined text-[18px]">${voiceEnabled ? 'volume_up' : 'volume_off'}</span>`;
            speakerToggle.classList.toggle('bg-primary/5', voiceEnabled);
            speakerToggle.classList.toggle('bg-red-50', !voiceEnabled);
            if (!voiceEnabled) window.speechSynthesis.cancel();
        });
    }

    const appendMsg = (text, isAi = false) => {
        const div = document.createElement('div');
        div.className = isAi ? "flex gap-4 max-w-2xl" : "flex gap-4 max-w-2xl ml-auto flex-row-reverse";
        div.innerHTML = `
            <div class="w-8 h-8 rounded-full ${isAi ? 'bg-primary/10' : 'bg-surface-variant'} flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-sm">${isAi ? 'smart_toy' : 'person'}</span>
            </div>
            <div class="${isAi ? 'glass-card' : 'bg-primary text-white'} p-6 rounded-2xl ${isAi ? 'rounded-tl-none' : 'rounded-tr-none'} shadow-sm">
                <p class="leading-relaxed text-sm">${text}</p>
            </div>
        `;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    };

    const handleSend = async () => {
        const msg = input.value;
        if (!msg) return;
        appendMsg(msg, false);
        input.value = "";

        // Create a placeholder for the AI response to show streaming effect
        const aiMsgDiv = document.createElement('div');
        aiMsgDiv.className = "flex gap-4 max-w-2xl animate-pulse-subtle";
        aiMsgDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-sm">smart_toy</span>
            </div>
            <div class="glass-card p-6 rounded-2xl rounded-tl-none shadow-sm">
                <p class="leading-relaxed text-sm ai-response-text italic opacity-50">TerraBot is thinking...</p>
            </div>
        `;
        container.appendChild(aiMsgDiv);
        const textContainer = aiMsgDiv.querySelector('.ai-response-text');
        container.scrollTop = container.scrollHeight;

        try {
            const selectedLangText = langSelect ? langSelect.options[langSelect.selectedIndex].text : 'English';
            const res = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: msg, 
                    language: selectedLangText 
                })
            });
            
            if (!res.ok) {
                textContainer.classList.remove('italic', 'opacity-50');
                textContainer.innerText = "Error: Server connection lost. Please retry.";
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";
            
            // Prepare for stream
            textContainer.innerText = "";
            textContainer.classList.remove('italic', 'opacity-50');
            aiMsgDiv.classList.remove('animate-pulse-subtle');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                
                // Update UI incrementally
                textContainer.innerText = fullText;
                container.scrollTop = container.scrollHeight;
            }
            
            // Auto-speak if enabled (Full text for better pronunciation)
            if (voiceEnabled && fullText) {
                speak(fullText, langSelect ? langSelect.value : 'en-US');
            }
        } catch (e) { 
            console.error(e);
            textContainer.classList.remove('italic', 'opacity-50');
            textContainer.innerText = "Connection Error: Unable to reach the AI brain. Please check your network.";
        }
    };

    if (send) send.addEventListener('click', handleSend);
    if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });

    // --- AUTO-START LOGIC ---
    const autoStart = localStorage.getItem('terra_auto_start_voice');
    const preferredLang = localStorage.getItem('terra_preferred_lang');
    
    if (autoStart === 'true') {
        localStorage.removeItem('terra_auto_start_voice');
        if (preferredLang && langSelect) {
            langSelect.value = preferredLang;
        }
        // Small delay to ensure everything is ready
        setTimeout(() => {
            if (voiceBtn) voiceBtn.click();
            showNotification(`TerraBot Voice Guidance Started (${preferredLang})`, 'info');
        }, 800);
    }

    // Assistant-specific Mic Logic
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            if (!('webkitSpeechRecognition' in window)) {
                showNotification("Speech not supported", 'warning');
                return;
            }

            const recognition = new webkitSpeechRecognition();
            recognition.lang = langSelect ? langSelect.value : 'en-US';
            recognition.start();

            voiceBtn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-pulse text-red-500">mic</span>';
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                input.value = transcript;
                handleSend();
            };

            recognition.onend = () => {
                voiceBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">mic</span>';
            };
            
            recognition.onerror = () => {
                voiceBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">mic</span>';
                showNotification("Voice capture failed", 'warning');
            };
        });
    }
}

// --- ADMIN LOGIC ---
async function initAdmin() {
    const loader = document.getElementById('adminLoader');
    try {
        const res = await fetch('/api/model_stats');
        const stats = await res.json();
        
        if (loader) loader.classList.add('opacity-0');
        setTimeout(() => { if (loader) loader.classList.add('hidden'); }, 300);

        if (document.getElementById('adminAccuracy')) document.getElementById('adminAccuracy').innerText = (stats.accuracy * 100).toFixed(1) + "%";
        if (document.getElementById('adminRmse')) document.getElementById('adminRmse').innerText = stats.rmse;
        if (document.getElementById('adminMae')) document.getElementById('adminMae').innerText = stats.mae;
        if (document.getElementById('adminPredictions')) document.getElementById('adminPredictions').innerText = stats.throughput;
        if (document.getElementById('adminInsight')) document.getElementById('adminInsight').innerText = stats.insight;

        // Feature Importance
        const featContainer = document.getElementById('featureImportance');
        if (featContainer) {
            featContainer.innerHTML = stats.feature_importance.map(f => `
                <div class="space-y-1.5">
                    <div class="flex justify-between text-[11px] font-bold">
                        <span class="text-primary">${f.name}</span>
                        <span class="text-outline">${f.value}</span>
                    </div>
                    <div class="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div class="h-full bg-primary" style="width: ${f.value * 100}%"></div>
                    </div>
                </div>
            `).join('');
        }

        // Optimization Flow Chart
        if (stats.history) {
            renderOptimizationFlow(stats.history);
        }

        // Regional Table
        const regTable = document.getElementById('regionalTable');
        if (regTable && stats.regional_benchmarks) {
            regTable.innerHTML = stats.regional_benchmarks.map(r => `
                <tr class="hover:bg-zinc-50/50 transition-colors">
                    <td class="px-6 py-4 font-bold text-primary">${r.region}</td>
                    <td class="px-6 py-4 font-mono text-[10px]">${r.acc}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                             <span class="w-1.5 h-1.5 rounded-full ${r.status === 'STABLE' ? 'bg-emerald-500' : 'bg-red-500'}"></span>
                             <span class="px-2 py-0.5 rounded-full ${r.status === 'STABLE' ? 'bg-emerald-50' : 'bg-red-50'} ${r.status === 'STABLE' ? 'text-emerald-700' : 'text-red-700'} text-[9px] font-extrabold uppercase">${r.status}</span>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        // Recent Evaluations
        const evalContainer = document.getElementById('recentEvaluations');
        if (evalContainer && stats.evaluations) {
            evalContainer.innerHTML = stats.evaluations.map(e => `
                <div class="flex items-center justify-between p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-all cursor-pointer group">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                            <span class="material-symbols-outlined text-${e.color}">${e.icon}</span>
                        </div>
                        <div>
                            <p class="text-[12px] font-bold text-primary">${e.name}</p>
                            <p class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Epoch ${e.epoch} • ${e.date}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xs font-black text-primary">${e.acc}</p>
                        <p class="text-[8px] font-bold text-zinc-400 uppercase">Val. Acc</p>
                    </div>
                </div>
            `).join('');
        }

    } catch (e) { 
        console.error(e); 
        if (loader) loader.innerText = "Error Loading Telemetry";
    }
}

function renderOptimizationFlow(history) {
    const container = document.getElementById('optimizationChart');
    if (!container) return;

    const trace1 = {
        x: history.epochs,
        y: history.accuracy,
        name: 'Accuracy',
        type: 'scatter',
        mode: 'lines',
        line: { color: '#173b1e', width: 3, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: 'rgba(23, 59, 30, 0.05)'
    };

    const trace2 = {
        x: history.epochs,
        y: history.loss,
        name: 'Loss',
        type: 'scatter',
        mode: 'lines',
        line: { color: '#ba1a1a', width: 2, dash: 'dot', shape: 'spline' },
        yaxis: 'y2'
    };

    const layout = {
        margin: { t: 10, b: 40, l: 40, r: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        showlegend: false,
        autosize: true,
        height: 250,
        font: { family: 'Inter', size: 10 },
        xaxis: { gridcolor: 'rgba(0,0,0,0.05)', zeroline: false, title: 'Training Epochs' },
        yaxis: { gridcolor: 'rgba(0,0,0,0.05)', zeroline: false, title: 'Accuracy', range: [0, 1.1] },
        yaxis2: { 
            title: 'Loss', 
            overlaying: 'y', 
            side: 'right', 
            range: [0, 0.6],
            gridcolor: 'transparent'
        }
    };

    Plotly.newPlot('optimizationChart', [trace1, trace2], layout, {responsive: true, displayModeBar: false});
}


async function initWorkbench() {
    try {
        const res = await fetch('/api/admin/workbench');
        const data = await res.json();

        // Active Model
        const active = data.active;
        if (document.getElementById('activeModelName')) document.getElementById('activeModelName').innerText = active.name;
        if (document.getElementById('activeModelEpoch')) document.getElementById('activeModelEpoch').innerText = `Epoch ${active.epoch}/${active.total_epochs}`;
        if (document.getElementById('activeModelProgress')) document.getElementById('activeModelProgress').style.width = (active.epoch / active.total_epochs * 100) + "%";
        if (document.getElementById('activeModelLoss')) document.getElementById('activeModelLoss').innerText = active.loss;
        if (document.getElementById('activeModelAcc')) document.getElementById('activeModelAcc').innerText = active.acc;
        if (document.getElementById('activeModelTime')) document.getElementById('activeModelTime').innerText = active.time;

        // Queued Model
        const queued = data.queued;
        if (document.getElementById('queuedModelName')) document.getElementById('queuedModelName').innerText = queued.name;
        if (document.getElementById('queuedModelStatus')) document.getElementById('queuedModelStatus').innerText = queued.status;
        if (document.getElementById('queuedModelLoss')) document.getElementById('queuedModelLoss').innerText = queued.loss;
        if (document.getElementById('queuedModelAcc')) document.getElementById('queuedModelAcc').innerText = queued.acc;
        if (document.getElementById('queuedModelEta')) document.getElementById('queuedModelEta').innerText = queued.eta;

        // Kernel Logs

        const logContainer = document.getElementById('kernelLogs');
        if (logContainer && active.logs) {
            const timeStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            active.logs.forEach(msg => {
                const p = document.createElement('p');
                p.innerHTML = `<span class="opacity-30">${timeStr}</span> ${msg}`;
                logContainer.prepend(p);
            });
            if (logContainer.children.length > 10) logContainer.lastElementChild.remove();
        }

        // History Table
        const historyTable = document.getElementById('historyTable');
        if (historyTable) {
            historyTable.innerHTML = data.history.map(h => `
                <tr class="hover:bg-zinc-50/50 transition-colors border-b border-zinc-50">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-zinc-400 text-sm">deployed_code</span>
                            <span class="text-primary font-bold">${h.name}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-zinc-400 font-mono text-[10px] uppercase">${h.version}</td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black">${h.acc}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex justify-end gap-2">
                             <button class="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-primary transition-colors cursor-pointer group">
                                <span class="material-symbols-outlined text-sm">settings_backup_restore</span>
                             </button>
                             <button class="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-primary transition-colors cursor-pointer">
                                <span class="material-symbols-outlined text-sm">play_circle</span>
                             </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        // Sensitivity Chart
        if (active.sensitivity) {
            renderSensitivityChart(active.sensitivity);
        }

        // Run Button Logic
        const runBtn = document.getElementById('runButton');
        if (runBtn && !runBtn.dataset.init) {
            runBtn.dataset.init = "true";
            runBtn.addEventListener('click', () => {
                showNotification("Initializing training kernel on Spark Cluster...", "info");
                runBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">refresh</span> Provisioning...';
                runBtn.disabled = true;
                setTimeout(() => {
                    showNotification("Training sequence successfully started.", "success");
                    runBtn.innerHTML = 'Initialize Run';
                    runBtn.disabled = false;
                }, 2000);
            });
        }

        // Deploy Model Logic

        const deployBtn = document.getElementById('deployModelBtn');
        if (deployBtn && !deployBtn.dataset.init) {
            deployBtn.dataset.init = "true";
            deployBtn.addEventListener('click', () => {
                showNotification("Validating artifact integrity...", "info");
                deployBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> Deploying...';
                deployBtn.disabled = true;

                setTimeout(() => {
                    showNotification("Deploying to Planetary Cluster (Asia-South-1)...", "info");
                    setTimeout(() => {
                        showNotification("Model v4.2 successfully deployed to production.", "success");
                        deployBtn.innerHTML = '<span class="material-symbols-outlined text-sm">rocket_launch</span> Deploy Model';
                        deployBtn.disabled = false;
                    }, 2500);
                }, 2000);
            });
        }

    } catch (e) { console.error(e); }
}


function renderSensitivityChart(sensitivity) {
    const container = document.getElementById('sensitivityChart');
    if (!container) return;

    const data = [{
        x: sensitivity.map(s => s.feature),
        y: sensitivity.map(s => s.val),
        type: 'bar',
        marker: {
            color: '#173b1e',
            opacity: 0.1,
            line: { color: '#173b1e', width: 1.5 }
        },
        hoverinfo: 'y',
        selected: { marker: { opacity: 1 } },
        unselected: { marker: { opacity: 0.1 } }
    }];

    const layout = {
        margin: { t: 0, b: 20, l: 30, r: 10 },
        height: 140,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        showlegend: false,
        xaxis: { 
            gridcolor: 'transparent',
            tickfont: { family: 'Inter', size: 9, color: '#9ca3af', weight: 'bold' } 
        },
        yaxis: { 
            gridcolor: 'rgba(0,0,0,0.05)',
            tickfont: { family: 'Inter', size: 8, color: '#9ca3af' },
            range: [0, 1]
        },
        bargap: 0.4
    };

    Plotly.newPlot('sensitivityChart', data, layout, { responsive: true, displayModeBar: false });
}


async function initDatasets() {
    try {
        const res = await fetch('/api/admin/datasets');
        const data = await res.json();

        // Stats
        if (document.getElementById('totalRecords')) document.getElementById('totalRecords').innerText = data.stats.total_records;
        if (document.getElementById('totalFeatures')) document.getElementById('totalFeatures').innerText = data.stats.total_features;
        if (document.getElementById('avgLatency')) document.getElementById('avgLatency').innerText = data.stats.avg_latency;
        if (document.getElementById('storageUsage')) document.getElementById('storageUsage').innerText = data.stats.storage_usage;

        // Catalog
        const catalog = document.getElementById('datasetCatalog');
        if (catalog && data.catalog) {
            catalog.innerHTML = data.catalog.map(c => `
                <tr class="hover:bg-zinc-50/50 transition-colors group">
                    <td class="px-8 py-6">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <span class="material-symbols-outlined text-[20px]">database</span>
                            </div>
                            <div class="space-y-1">
                                <p class="text-primary font-extrabold text-[14px]">${c.name}</p>
                                <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">${c.modified} • ${c.size}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-8 py-6 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">${c.source}</td>
                    <td class="px-8 py-6">
                        <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded tracking-widest uppercase border border-emerald-200">${c.format}</span>
                    </td>
                    <td class="px-8 py-6 text-right">
                        <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="p-2 hover:bg-primary/5 rounded-lg text-primary transition-colors" title="Download">
                                <span class="material-symbols-outlined text-[18px]">download</span>
                            </button>
                            <button class="p-2 hover:bg-primary/5 rounded-lg text-primary transition-colors" title="Settings">
                                <span class="material-symbols-outlined text-[18px]">settings</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) { console.error("Dataset init error:", e); }
}


async function initLogs() {
    try {
        const res = await fetch('/api/admin/logs');
        const data = await res.json();

        // Resources
        if (document.getElementById('uptimeValue')) document.getElementById('uptimeValue').innerText = data.resources.uptime;
        if (document.getElementById('sessionTime')) document.getElementById('sessionTime').innerText = `Current session: ${data.resources.session}`;
        if (document.getElementById('cpuValue')) document.getElementById('cpuValue').innerText = data.resources.cpu + "%";
        if (document.getElementById('cpuBar')) document.getElementById('cpuBar').style.width = data.resources.cpu + "%";
        if (document.getElementById('memoryValue')) document.getElementById('memoryValue').innerText = data.resources.memory + "%";
        if (document.getElementById('memoryBar')) document.getElementById('memoryBar').style.width = data.resources.memory + "%";
        if (document.getElementById('queryExecTime')) document.getElementById('queryExecTime').innerText = data.resources.query_ms + "ms";
        if (document.getElementById('activeConnCount')) document.getElementById('activeConnCount').innerText = `${data.resources.connections} / 100`;
        if (document.getElementById('globalLoadVal')) document.getElementById('globalLoadVal').innerText = `Global Load: ${((data.resources.connections * 100) / 100).toFixed(1)}K REQ/S`;

        // Refresh Timer Logic
        const timer = document.getElementById('lastRefreshTime');
        if (timer) {
            timer.innerText = "Last refresh: 0s ago";
            if (window.logRefreshInterval) clearInterval(window.logRefreshInterval);
            let lastRefresh = 0;
            window.logRefreshInterval = setInterval(() => {
                lastRefresh++;
                timer.innerText = `Last refresh: ${lastRefresh}s ago`;
                if (lastRefresh >= 10) clearInterval(window.logRefreshInterval);
            }, 1000);
        }



        // Alerts
        const alertList = document.getElementById('alertsList');
        if (alertList) {
            alertList.innerHTML = data.alerts.map(a => `
                <div class="p-4 bg-white border-l-4 border-${a.type === 'error' ? 'red-500' : (a.type === 'warn' ? 'amber-500' : 'emerald-500')} rounded-r-xl shadow-sm space-y-2 group hover:bg-zinc-50 transition-colors">
                    <div class="flex justify-between items-start">
                        <span class="text-[9px] font-black text-${a.type === 'error' ? 'red-500' : (a.type === 'warn' ? 'amber-500' : 'emerald-500')} uppercase tracking-widest">${a.title}</span>
                        <span class="text-[8px] font-bold text-zinc-400">${a.time}</span>
                    </div>
                    <p class="text-[11px] text-zinc-600 font-bold leading-relaxed">${a.msg}</p>
                </div>
            `).join('');
            
            const criticalCount = data.alerts.filter(a => a.type === 'error').length;
            if (document.getElementById('alertCount')) document.getElementById('alertCount').innerText = `${criticalCount} Critical`;
        }


        // Logs
        const logTable = document.getElementById('logsTable');
        if (logTable) {
            logTable.innerHTML = data.logs.map(l => `
                <tr class="hover:bg-zinc-50/50 transition-colors">
                    <td class="px-8 py-6 text-zinc-400">${l.time}</td>
                    <td class="px-8 py-6">
                        <span class="px-2 py-0.5 rounded ${l.level === 'error' ? 'bg-red-500 text-white' : 'bg-zinc-100 text-zinc-500'} text-[8px] font-black uppercase">${l.level}</span>
                    </td>
                    <td class="px-8 py-6 text-primary">${l.mod}</td>
                    <td class="px-8 py-6 text-zinc-600 italic">${l.msg}</td>
                    <td class="px-8 py-6 text-right text-zinc-400">${l.lat}</td>
                </tr>
            `).join('');
        }
        // --- LATENCY MONITOR CHART ---

        const monitor = document.getElementById('latencyMonitor');
        if (monitor) {
            const times = Array.from({length: 20}, (_, i) => `${14}:${(i*2).toString().padStart(2, '0')}`);
            const latency_crop = Array.from({length: 20}, () => Math.floor(Math.random() * 50) + 120);
            const latency_yield = Array.from({length: 20}, () => Math.floor(Math.random() * 80) + 180);

            const trace1 = {
                x: times, y: latency_crop, name: '/predict_crop',
                type: 'scatter', mode: 'lines+markers',
                line: { color: '#173b1e', width: 3, shape: 'spline' },
                marker: { size: 6, color: '#173b1e' }
            };
            const trace2 = {
                x: times, y: latency_yield, name: '/predict_yield',
                type: 'scatter', mode: 'lines+markers',
                line: { color: '#705d00', width: 3, shape: 'spline' },
                marker: { size: 6, color: '#705d00' }
            };

            const layout = {
                height: 256, margin: { t: 10, r: 20, l: 40, b: 40 },
                showlegend: false,
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
                xaxis: { showgrid: false, zeroline: false, font: { family: 'Inter', size: 10, color: '#94a3b8' } },
                yaxis: { gridcolor: '#f1f5f9', zeroline: false, font: { family: 'Inter', size: 10, color: '#94a3b8' } },
                hovermode: 'x unified'
            };

            Plotly.newPlot('latencyMonitor', [trace1, trace2], layout, { responsive: true, displayModeBar: false });
        }

        // --- FILTER & EXPORT LOGIC ---
        const exportBtn = document.getElementById('logsExportBtn');
        if (exportBtn && !exportBtn.dataset.init) {
            exportBtn.dataset.init = "true";
            exportBtn.addEventListener('click', () => {
                const rows = Array.from(logTable.querySelectorAll('tr'));
                const csvData = rows.map(row => {
                    const cols = Array.from(row.querySelectorAll('td'));
                    return cols.map(c => `"${c.innerText.replace(/"/g, '""')}"`).join(',');
                }).join('\n');
                
                const blob = new Blob([`Timestamp,Level,Module,Message,Latency\n${csvData}`], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download', `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
        }

        // Filtering Logic
        const filters = ['filterInfo', 'filterWarn', 'filterError'];
        filters.forEach(id => {
            const btn = document.getElementById(id);
            if (btn && !btn.dataset.init) {
                btn.dataset.init = "true";
                btn.addEventListener('click', () => {
                    const level = id.replace('filter', '').toLowerCase();
                    const rows = Array.from(logTable.querySelectorAll('tr'));
                    rows.forEach(row => {
                        const rowLevel = row.querySelector('span').innerText.toLowerCase();
                        row.style.display = (rowLevel === level || row.dataset.filtered === 'false') ? '' : 'none';
                    });
                    showNotification(`Filtered logs by: ${level.toUpperCase()}`);
                });
            }
        });

    } catch (e) { console.error("Logs init error:", e); }
}



// --- VOICE ASSISTANT LOGIC (REPLACED BY initAssistant) ---

// --- FARMER ADVISORY LOGIC ---
async function initAdvisory() {
    const btn = document.getElementById('getAdvisoryBtn');
    const speakBtn = document.getElementById('speakAdvisoryBtn');
    const container = document.getElementById('advisoryCards');
    if (!btn) return;

    let currentSummary = "";

    btn.addEventListener('click', async () => {
        const data = {
            rainfall: document.getElementById('adv_rain')?.value || 100,
            humidity: document.getElementById('adv_hum')?.value || 80,
            predicted_crop: document.getElementById('adv_crop')?.value || 'rice',
            N: document.getElementById('adv_n')?.value || 100,
            ph: document.getElementById('adv_ph')?.value || 6.5
        };

        btn.innerText = "Analyzing...";
        try {
            const res = await fetch('/api/advisory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const advice = await res.json();
            currentSummary = advice.summary;

            // Render Cards
            container.innerHTML = `
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-primary/5 hover:shadow-md transition-all">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">agriculture</span>
                        <h3 class="font-headline font-bold text-primary">Crop Selection</h3>
                    </div>
                    <p class="text-sm text-secondary leading-relaxed">${advice.crop_advice}</p>
                </div>
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-primary/5 hover:shadow-md transition-all">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-xl">water_drop</span>
                        <h3 class="font-headline font-bold text-primary">Irrigation</h3>
                    </div>
                    <p class="text-sm text-secondary leading-relaxed">${advice.irrigation}</p>
                </div>
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-primary/5 hover:shadow-md transition-all">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="material-symbols-outlined text-[#173b1e] bg-primary/10 p-2 rounded-xl">compost</span>
                        <h3 class="font-headline font-bold text-primary">Fertilizer</h3>
                    </div>
                    <p class="text-sm text-secondary leading-relaxed">${advice.fertilizer}</p>
                </div>
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-primary/5 hover:shadow-md transition-all">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="material-symbols-outlined text-red-600 bg-red-50 p-2 rounded-xl">coronavirus</span>
                        <h3 class="font-headline font-bold text-primary">Disease Prevention</h3>
                    </div>
                    <p class="text-sm text-secondary leading-relaxed">${advice.disease_prevention}</p>
                </div>
            `;

            if (advice.alerts && advice.alerts.length > 0) {
                advice.alerts.forEach(alert => showNotification(alert, 'warning'));
            }

            speakBtn.classList.remove('hidden');

        } catch (e) { console.error(e); }
        btn.innerHTML = 'Generate Advisory <span class="material-symbols-outlined">auto_awesome</span>';
    });

    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            if (!currentSummary) return;
            const utterance = new SpeechSynthesisUtterance(currentSummary);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        });
    }
}
