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

    // --- Cake Game Logic ---
    const cakeOverlay = document.getElementById('cake-overlay');
    const candles = document.querySelectorAll('.candle');
    const cakeMsg = document.getElementById('cake-msg');
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confettiCtx = confettiCanvas.getContext('2d');
    let candlesOut = 0;

    function showCake() {
        cakeOverlay.classList.remove('hidden');
        cakeOverlay.classList.add('active');
        candlesOut = 0;
        candles.forEach(c => {
            c.querySelector('.flame').classList.remove('out');
            c.style.pointerEvents = 'all';
        });
        cakeMsg.textContent = "Blow out the candles! (Click them)";
    }

    candles.forEach(candle => {
        candle.addEventListener('click', () => {
            const flame = candle.querySelector('.flame');
            if (!flame.classList.contains('out')) {
                flame.classList.add('out');
                candlesOut++;
                candle.style.pointerEvents = 'none'; // Prevent double clicks

                if (candlesOut === candles.length) {
                    triggerWin();
                }
            }
        });
    });

    function triggerWin() {
        cakeMsg.textContent = "YAY! HAPPY BIRTHDAY BHAGESH!";
        startConfetti();
        setTimeout(() => {
            cakeOverlay.classList.remove('active');
            cakeOverlay.classList.add('hidden');
            addMessage("You wished for something great!", 'system');
        }, 5000);
    }

    // --- Confetti System ---
    let confettiParticles = [];
    function startConfetti() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        confettiParticles = [];

        for (let i = 0; i < 100; i++) {
            confettiParticles.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * confettiCanvas.height - confettiCanvas.height,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                size: Math.random() * 10 + 5,
                speed: Math.random() * 5 + 2,
                angle: Math.random() * 360
            });
        }
        animateConfetti();
    }

    function animateConfetti() {
        if (cakeOverlay.classList.contains('hidden')) return;

        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        confettiParticles.forEach(p => {
            p.y += p.speed;
            p.angle += 2;

            confettiCtx.save();
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate(p.angle * Math.PI / 180);
            confettiCtx.fillStyle = p.color;
            confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            confettiCtx.restore();

            if (p.y > confettiCanvas.height) {
                p.y = -p.size;
                p.x = Math.random() * confettiCanvas.width;
            }
        });

        requestAnimationFrame(animateConfetti);
    }

    // Chat Logic
    function sendMessage() {
        const text = chatInput.value.trim();
        console.log("Sending message:", text); // Debug
        if (text) {
            addMessage(text, 'user');
            chatInput.value = '';

            if (text.toLowerCase().includes('cake') || text.toLowerCase().includes('birthday')) {
                setTimeout(() => {
                    addMessage("Wait... did you say cake?", 'system');
                    setTimeout(showCake, 1000);
                }, 500);
                return;
            }

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
