document.addEventListener('DOMContentLoaded', () => {
    const landingScreen = document.getElementById('landing-screen');
    const visualizerScreen = document.getElementById('visualizer-screen');
    const startBtn = document.getElementById('start-btn');
    const bgMusic = document.getElementById('bg-music');
    const canvas = document.getElementById('visualizer-canvas');
    const ctx = canvas.getContext('2d');

    // Chat Elements
    const chatContainer = document.getElementById('chat-container');
    const chatOutput = document.getElementById('chat-output');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    // Audio Context
    let audioContext;
    let analyser;
    let source;
    let isPlaying = false;

    // --- Event Listeners ---
    startBtn.addEventListener('click', startExperience);

    bgMusic.addEventListener('ended', () => {
        isPlaying = false;
        chatContainer.classList.remove('hidden');
    });

    bgMusic.addEventListener('pause', () => {
        isPlaying = false;
        chatContainer.classList.remove('hidden');
    });

    bgMusic.addEventListener('play', () => {
        isPlaying = true;
        chatContainer.classList.add('hidden');
    });

    // Chat Logic
    function sendMessage() {
        const text = chatInput.value.trim();
        if (text) {
            addMessage(text, 'user');
            chatInput.value = '';

            // Simple Echo/Bot Response
            setTimeout(() => {
                const responses = [
                    "Happy Birthday Bhagesh!",
                    "Hope you're enjoying the music!",
                    "Level 24 unlocked!",
                    "This beat is fire.",
                    "Make a wish!"
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage(randomResponse, 'system');
            }, 500);
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function addMessage(text, type) {
        const div = document.createElement('div');
        div.className = `message ${type}`;
        div.textContent = type === 'user' ? `You: ${text}` : `System: ${text}`;
        div.style.color = type === 'user' ? '#ff0055' : '#00ff9d';
        div.style.marginBottom = '5px';
        chatOutput.appendChild(div);
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }

    // --- Visualizer Logic ---
    function startExperience() {
        // Check for file:// protocol restriction
        const isLocal = window.location.protocol === 'file:';

        if (isLocal) {
            alert("Note: The Visualizer requires a web server (like GitHub Pages) to work due to browser security. Playing audio only.");
            // Just play audio, skip Web Audio API graph
            playAudioAndTransition();
            return;
        }

        // Initialize Audio Context on user gesture
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                source = audioContext.createMediaElementSource(bgMusic);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                analyser.fftSize = 256;
            } catch (e) {
                console.error("Web Audio API Error:", e);
                // Fallback to just playing audio if context setup fails
                playAudioAndTransition();
                return;
            }
        }

        playAudioAndTransition(true);
    }

    function playAudioAndTransition(withVisualizer = false) {
        // Play Audio
        bgMusic.play()
            .then(() => {
                isPlaying = true;
                if (withVisualizer) {
                    renderVisualizer();
                }
            })
            .catch(e => {
                console.error("Audio play failed:", e);
                alert("Audio failed to play. Please interact with the document first or check console.");
            })
            .finally(() => {
                // Transition Screens
                landingScreen.classList.remove('active');
                landingScreen.classList.add('hidden');

                setTimeout(() => {
                    landingScreen.style.display = 'none';
                    visualizerScreen.classList.remove('hidden');
                    visualizerScreen.classList.add('active');

                    if (!withVisualizer) {
                        // Show a static message or fallback visual if needed
                        const ctx = canvas.getContext('2d');
                        canvas.width = window.innerWidth;
                        canvas.height = window.innerHeight;
                        ctx.fillStyle = '#000';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = '#333';
                        ctx.font = '20px Courier New';
                        ctx.textAlign = 'center';
                        ctx.fillText("Visualizer disabled in local mode.", canvas.width / 2, canvas.height / 2);
                    }
                }, 1000);
            });

        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    function renderVisualizer() {
        if (!isPlaying) return;

        requestAnimationFrame(renderVisualizer);

        // Resize canvas
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Waves
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] * 1.5; // Scale up

            // Dynamic Color
            const r = barHeight + (25 * (i / bufferLength));
            const g = 250 * (i / bufferLength);
            const b = 50;

            ctx.fillStyle = `rgb(${r},${g},${b})`;

            // Center the waves
            const y = (canvas.height - barHeight) / 2;

            ctx.fillRect(x, y, barWidth, barHeight);

            x += barWidth + 1;
        }
    }
});
