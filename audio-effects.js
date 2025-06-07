class PokemonAudioEffects {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3; // Reasonable default volume
        this.soundEnabled = true;
        this.initializeAudio();
    }
    
    async initializeAudio() {
        try {
            // Create audio context on first user interaction
            document.addEventListener('click', this.enableAudio.bind(this), { once: true });
            document.addEventListener('keydown', this.enableAudio.bind(this), { once: true });
        } catch (error) {
            console.log('Audio not supported:', error);
            this.soundEnabled = false;
        }
    }
    
    enableAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    // Generate classic Game Boy style beep
    playBeep(frequency = 440, duration = 100, volume = 0.5) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'square'; // Game Boy style square wave
        
        // Envelope for classic Game Boy sound
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * this.masterVolume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    // Generate classic coin sound
    playCoinSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const frequencies = [659.25, 783.99, 1046.50]; // E, G, C notes
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playBeep(freq, 120, 0.4);
            }, index * 50);
        });
    }
    
    // Classic button click sound
    playClickSound() {
        this.playBeep(800, 80, 0.3);
    }
    
    // Spinning reels sound effect
    playSpinSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const duration = 2000; // 2 seconds
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + duration / 1000);
        
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        filterNode.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + duration / 1000);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    // Reel stop sound
    playReelStopSound() {
        this.playBeep(220, 150, 0.4);
    }
    
    // Win sound effect
    playWinSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        // Ascending melody for win
        const melody = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.playBeep(freq, 200, 0.5);
            }, index * 100);
        });
    }
    
    // Big win sound effect
    playBigWinSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        // More elaborate win melody
        const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1046.50, 783.99, 1046.50]; 
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.playBeep(freq, 150, 0.6);
            }, index * 80);
        });
    }
    
    // Jackpot sound effect
    playJackpotSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        // Epic jackpot fanfare
        const fanfare = [
            {freq: 523.25, time: 0},     // C
            {freq: 659.25, time: 100},   // E
            {freq: 783.99, time: 200},   // G
            {freq: 1046.50, time: 300},  // C
            {freq: 1318.51, time: 400},  // E
            {freq: 1567.98, time: 500},  // G
            {freq: 2093.00, time: 600},  // C
            {freq: 1567.98, time: 700},  // G
            {freq: 2093.00, time: 800},  // C
            {freq: 2637.02, time: 900}   // E
        ];
        
        fanfare.forEach(note => {
            setTimeout(() => {
                this.playBeep(note.freq, 200, 0.7);
            }, note.time);
        });
    }
    
    // Lose/error sound
    playLoseSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        // Descending sad melody
        const melody = [523.25, 466.16, 415.30, 369.99]; // C, Bb, Ab, F#
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.playBeep(freq, 300, 0.4);
            }, index * 150);
        });
    }
    
    // Error sound
    playErrorSound() {
        this.playBeep(150, 500, 0.6);
    }
    
    // Classic Pokemon "item get" sound
    playItemGetSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const notes = [659.25, 698.46, 783.99, 880.00, 987.77]; // E, F, G, A, B
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playBeep(freq, 120, 0.5);
            }, index * 60);
        });
    }
    
    // Generate white noise for drum-like effects
    playDrumHit() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const bufferSize = this.audioContext.sampleRate * 0.1; // 0.1 seconds
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        // Generate white noise
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        whiteNoise.buffer = buffer;
        whiteNoise.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(500, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.3 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        whiteNoise.start(this.audioContext.currentTime);
    }
    
    // Pokemon Center healing sound
    playHealingSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const notes = [523.25, 659.25, 783.99]; // C, E, G chord
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'sine'; // Soft healing sound
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3 * this.masterVolume, this.audioContext.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 1);
            }, index * 100);
        });
    }
    
    // Volume control
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    // Toggle sound on/off
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }
    
    // Check if audio is supported
    isSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }
}

// Create global audio effects instance
window.pokemonAudio = new PokemonAudioEffects();