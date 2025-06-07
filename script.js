class PokemonSlotMachine {
    constructor() {
        this.coins = 100;
        this.bet = 1;
        this.maxBet = 3;
        this.isSpinning = false;
        
        // Pokemon-themed symbols: 4 types + pokeball + lucky 7
        this.symbols = ['🔥', '💧', '🌿', '⚡', '⚪', '7️⃣'];
        this.symbolNames = {
            '🔥': 'Fire Type',
            '💧': 'Water Type', 
            '🌿': 'Grass Type',
            '⚡': 'Electric Type',
            '⚪': 'Pokeball',
            '7️⃣': 'Lucky Seven'
        };
        this.symbolWeights = {
            '⚪': 50,  // Most common - Pokeball (50%)
            '🔥': 20,  // Fire Type (20%)
            '💧': 15,  // Water Type (15%)  
            '🌿': 10,  // Grass Type (10%)
            '⚡': 4,   // Electric Type (4%)
            '7️⃣': 1   // Rarest - Lucky Seven (1%)
        };
        
        // Add entropy for better randomization
        this.randomSeed = Date.now() + Math.random() * 1000000;
        
        // Balanced payout table (more realistic for 100 starting coins)
        this.payouts = {
            '7️⃣7️⃣7️⃣': 500,  // Triple Lucky Seven - MEGA JACKPOT! (1/1M chance)
            '⚡⚡⚡': 200,  // Triple Electric - LEGENDARY! (1/15625 chance)
            '🌿🌿🌿': 80,   // Triple Grass Type (1/1000 chance)
            '💧💧💧': 60,   // Triple Water Type (1/296 chance)
            '🔥🔥🔥': 40,   // Triple Fire Type (1/125 chance)
            '⚪⚪⚪': 15,   // Triple Pokeball (1/8 chance)
        };
        
        // Special combination payouts
        this.specialPayouts = {
            '7️⃣': { count: 2, payout: 25 },    // Any two Lucky Seven
            '⚡': { count: 2, payout: 8 },      // Any two Electric
            '🌿': { count: 2, payout: 4 },      // Any two Grass
            '💧': { count: 2, payout: 3 },      // Any two Water
            '🔥': { count: 2, payout: 2 },      // Any two Fire
        };
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.playStartupSound();
    }
    
    initializeElements() {
        this.coinDisplay = document.getElementById('coin-count');
        this.betDisplay = document.getElementById('bet-amount');
        this.gameMessage = document.getElementById('game-message');
        this.reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];
        this.betButton = document.getElementById('bet-button');
        this.spinButton = document.getElementById('spin-button');
        this.maxBetButton = document.getElementById('max-bet-button');
        
        // Initialize reels with random symbols
        this.reels.forEach(reel => {
            reel.querySelector('.symbol').textContent = this.getRandomSymbol();
        });
    }
    
    bindEvents() {
        this.betButton.addEventListener('click', () => this.increaseBet());
        this.maxBetButton.addEventListener('click', () => this.setMaxBet());
        this.spinButton.addEventListener('click', () => this.spin());
        
        // Keyboard controls for authentic Game Corner feel
        document.addEventListener('keydown', (e) => {
            if (this.isSpinning) return;
            
            switch(e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.spin();
                    break;
                case 'b':
                case 'B':
                    this.increaseBet();
                    break;
                case 'm':
                case 'M':
                    this.setMaxBet();
                    break;
            }
        });
    }
    
    playStartupSound() {
        this.showMessage("Welcome to the Game Corner! Press SPIN to play!", 3000);
    }
    
    // Robust random number generator with better entropy
    getSecureRandom() {
        // Mix multiple entropy sources
        const now = performance.now();
        const random1 = Math.random();
        const random2 = Math.random();
        this.randomSeed = (this.randomSeed * 9301 + 49297) % 233280;
        const seededRandom = this.randomSeed / 233280;
        
        // Combine all sources
        return (random1 + random2 + seededRandom + (now % 1)) % 1;
    }
    
    getRandomSymbol() {
        // Create weighted array for better distribution
        const weightedSymbols = [];
        for (const [symbol, weight] of Object.entries(this.symbolWeights)) {
            for (let i = 0; i < weight; i++) {
                weightedSymbols.push(symbol);
            }
        }
        
        // Use secure random to pick from weighted array
        const randomIndex = Math.floor(this.getSecureRandom() * weightedSymbols.length);
        return weightedSymbols[randomIndex];
    }
    
    increaseBet() {
        if (this.isSpinning) return;
        
        this.bet = this.bet >= this.maxBet ? 1 : this.bet + 1;
        this.updateDisplay();
        this.playClickSound();
        this.showMessage(`Bet set to ${this.bet} coin${this.bet > 1 ? 's' : ''}!`, 1000);
    }
    
    setMaxBet() {
        if (this.isSpinning) return;
        
        this.bet = this.maxBet;
        this.updateDisplay();
        this.playClickSound();
        this.showMessage(`Max bet: ${this.bet} coins!`, 1000);
    }
    
    async spin() {
        if (this.isSpinning || this.coins < this.bet) {
            if (this.coins < this.bet) {
                this.showMessage("Not enough coins! You need more coins to play!", 2000);
                this.playErrorSound();
            }
            return;
        }
        
        this.isSpinning = true;
        this.coins -= this.bet;
        this.updateDisplay();
        this.disableButtons();
        
        this.showMessage("Spinning...", 500);
        this.playSpinSound();
        
        // Generate final results
        const results = [
            this.getRandomSymbol(),
            this.getRandomSymbol(),
            this.getRandomSymbol()
        ];
        
        // Start spinning animation with cycling symbols
        const spinIntervals = this.startSpinning();
        
        // Stop reels one by one with delay
        await this.stopReels(results, spinIntervals);
        
        // Check for wins
        const winAmount = this.checkWin(results);
        if (winAmount > 0) {
            this.coins += winAmount;
            this.showWin(winAmount, results);
        } else {
            this.showMessage("Try again, trainer!", 2000);
            this.playLoseSound();
        }
        
        this.updateDisplay();
        this.enableButtons();
        this.isSpinning = false;
        
        // Update user stats if logged in
        if (window.userSystem && window.userSystem.isLoggedIn()) {
            window.userSystem.updateStats(this.coins, winAmount);
        }
        
        // Check for game over
        if (this.coins < 1) {
            this.showMessage("Game Over! You're out of coins!", 3000);
        }
    }
    
    startSpinning() {
        const spinIntervals = [];
        
        this.reels.forEach((reel, index) => {
            reel.classList.add('spinning');
            const interval = setInterval(() => {
                reel.querySelector('.symbol').textContent = this.getRandomSymbol();
            }, 50 + index * 10); // Slightly different speeds for each reel
            spinIntervals.push(interval);
        });
        
        return spinIntervals;
    }
    
    async stopReels(results, spinIntervals) {
        for (let i = 0; i < this.reels.length; i++) {
            await this.delay(300 + i * 200);
            
            // Stop the spinning interval for this reel
            clearInterval(spinIntervals[i]);
            
            // Remove spinning animation and set final result
            this.reels[i].classList.remove('spinning');
            this.reels[i].querySelector('.symbol').textContent = results[i];
            this.playReelStopSound();
        }
    }
    
    checkWin(results) {
        const resultString = results.join('');
        
        // Check for three of a kind first (highest priority)
        if (this.payouts[resultString]) {
            return this.payouts[resultString] * this.bet;
        }
        
        // Check for special two-symbol payouts
        for (const [symbol, data] of Object.entries(this.specialPayouts)) {
            const symbolCount = results.filter(s => s === symbol).length;
            if (symbolCount >= data.count) {
                return data.payout * this.bet;
            }
        }
        
        return 0;
    }
    
    getWinType(results) {
        const resultString = results.join('');
        
        if (this.payouts[resultString]) {
            return {
                type: 'triple',
                symbol: results[0],
                name: this.symbolNames[results[0]]
            };
        }
        
        for (const [symbol, data] of Object.entries(this.specialPayouts)) {
            const symbolCount = results.filter(s => s === symbol).length;
            if (symbolCount >= data.count) {
                return {
                    type: 'double',
                    symbol: symbol,
                    name: this.symbolNames[symbol]
                };
            }
        }
        
        return null;
    }
    
    showWin(amount, results) {
        const winType = this.getWinType(results);
        let message = "";
        
        if (winType) {
            if (winType.type === 'triple') {
                if (winType.symbol === '7️⃣') {
                    message = `🎰 MEGA JACKPOT! LUCKY SEVENS! 🎰 You won ${amount} coins! You're rich, trainer!`;
                    this.playJackpotSound();
                    this.triggerJackpotCelebration();
                } else if (winType.symbol === '⚡') {
                    message = `⚡ LEGENDARY WIN! Triple Electric! ⚡ You caught ${amount} coins! Pikachu approves!`;
                    this.playJackpotSound();
                    this.triggerJackpotCelebration();
                } else if (winType.symbol === '🌿') {
                    message = `🌿 GRASS POWER! Triple Nature! 🌿 You earned ${amount} coins! Bulbasaur is proud!`;
                    this.playBigWinSound();
                    this.triggerBigWinAnimation();
                } else if (winType.symbol === '💧') {
                    message = `💧 WATER BLAST! Triple Flow! 💧 You got ${amount} coins! Squirtle cheers!`;
                    this.playBigWinSound();
                    this.triggerBigWinAnimation();
                } else if (winType.symbol === '🔥') {
                    message = `🔥 FIRE STORM! Triple Blaze! 🔥 You earned ${amount} coins! Charmander roars!`;
                    this.playBigWinSound();
                    this.triggerWinAnimation();
                } else if (winType.symbol === '⚪') {
                    message = `⚪ POKEBALL TRIPLE! You caught ${amount} coins! Professor Oak smiles!`;
                    this.playWinSound();
                    this.triggerWinAnimation();
                }
            } else if (winType.type === 'double') {
                if (winType.symbol === '7️⃣') {
                    message = `🍀 Double Lucky! Two sevens appeared! You got ${amount} coins!`;
                } else if (winType.symbol === '⚡') {
                    message = `⚡ Double Shock! Two Electric types! You caught ${amount} coins!`;
                } else {
                    message = `✨ Type Match! Two ${winType.name}s! You earned ${amount} coins!`;
                }
                this.playWinSound();
                this.triggerWinAnimation();
            }
        }
        
        this.showMessage(message, 4000);
    }
    
    triggerWinAnimation() {
        this.reels.forEach(reel => {
            reel.classList.add('win-animation');
            setTimeout(() => reel.classList.remove('win-animation'), 1500);
        });
    }
    
    triggerBigWinAnimation() {
        document.querySelector('.slot-machine').classList.add('big-win');
        setTimeout(() => {
            document.querySelector('.slot-machine').classList.remove('big-win');
        }, 1500);
        this.triggerWinAnimation();
    }
    
    triggerJackpotCelebration() {
        document.querySelector('.game-container').classList.add('jackpot-celebration');
        setTimeout(() => {
            document.querySelector('.game-container').classList.remove('jackpot-celebration');
        }, 2000);
        this.triggerBigWinAnimation();
    }
    
    updateDisplay() {
        this.coinDisplay.textContent = this.coins;
        this.betDisplay.textContent = this.bet;
        
        // Update button states
        if (this.coins < this.bet) {
            this.spinButton.disabled = true;
            this.spinButton.textContent = 'NO COINS';
        } else {
            this.spinButton.disabled = false;
            this.spinButton.textContent = 'SPIN!';
        }
    }
    
    disableButtons() {
        this.betButton.disabled = true;
        this.maxBetButton.disabled = true;
        this.spinButton.disabled = true;
        this.spinButton.textContent = 'SPINNING...';
    }
    
    enableButtons() {
        this.betButton.disabled = false;
        this.maxBetButton.disabled = false;
        this.spinButton.disabled = false;
        this.spinButton.textContent = 'SPIN!';
    }
    
    showMessage(message, duration = 2000) {
        this.gameMessage.textContent = message;
        if (duration > 0) {
            setTimeout(() => {
                if (this.gameMessage.textContent === message) {
                    this.gameMessage.textContent = "Good luck, trainer!";
                }
            }, duration);
        }
    }
    
    // Real audio effects using Web Audio API
    playClickSound() {
        if (window.pokemonAudio) {
            window.pokemonAudio.playClickSound();
        }
    }
    
    playSpinSound() {
        if (window.pokemonAudio) {
            window.pokemonAudio.playSpinSound();
        }
    }
    
    playReelStopSound() {
        if (window.pokemonAudio) {
            window.pokemonAudio.playReelStopSound();
        }
    }
    
    playWinSound() {
        if (window.pokemonAudio) {
            window.pokemonAudio.playWinSound();
        }
    }
    
    playBigWinSound() {
        if (window.pokemonAudio) {
            window.pokemonAudio.playBigWinSound();
        }
    }
    
    playJackpotSound() {
        if (window.pokemonAudio) {
            window.pokemonAudio.playJackpotSound();
        }
    }
    
    playLoseSound() {
        if (window.pokemonAudio) {
            window.pokemonAudio.playLoseSound();
        }
    }
    
    playErrorSound() {
        if (window.pokemonAudio) {
            window.pokemonAudio.playErrorSound();
        }
        // Visual feedback too
        this.gameMessage.style.color = '#e74c3c';
        setTimeout(() => this.gameMessage.style.color = '#27ae60', 1000);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Easter eggs and funny messages
const funnyMessages = [
    "Professor Oak would be proud!",
    "Team Rocket is jealous of your luck!",
    "Nurse Joy approves this gambling!",
    "Brock would cook you a victory meal!",
    "Misty's Psyduck is confused by your luck!",
    "Ash wants to trade his Pikachu for your coins!",
    "Giovanni wishes he had your luck!",
    "The Elite Four are impressed!",
    "You're the very best, like no one ever was!",
    "Gotta catch 'em all... coins!",
    "Your Pokemon are cheering for you!",
    "Even Magikarp could learn from you!",
    "You're luckier than finding a shiny Pokemon!",
    "Oak's words echoed: There's a time and place for everything!",
    "Wild JACKPOT appeared!"
];

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new PokemonSlotMachine();
    
    // Wait for user system to initialize, then sync coins
    const checkUserSystem = setInterval(() => {
        if (window.userSystem) {
            // Sync game coins with user system
            if (window.userSystem.currentUser) {
                window.game.coins = window.userSystem.getCurrentCoins();
                window.game.updateDisplay();
            }
            clearInterval(checkUserSystem);
        }
    }, 100);
    
    // Add some fun random messages
    setInterval(() => {
        if (window.game && !window.game.isSpinning && Math.random() < 0.1) {
            const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
            window.game.showMessage(randomMessage, 3000);
        }
    }, 10000);
    
    // Konami code easter egg
    let konamiCode = [];
    const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    
    // Theme cheat code (T-H-E-M-E)
    let themeCode = [];
    const themeCheat = [84, 72, 69, 77, 69]; // T-H-E-M-E
    
    document.addEventListener('keydown', (e) => {
        // Konami code
        konamiCode.push(e.keyCode);
        if (konamiCode.length > konami.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.length === konami.length && 
            konamiCode.every((val, i) => val === konami[i])) {
            if (window.game) {
                window.game.coins += 100;
                window.game.updateDisplay();
                window.game.showMessage("🎮 KONAMI CODE! +100 coins! 🎮", 3000);
                
                // Update user stats if logged in
                if (window.userSystem && window.userSystem.isLoggedIn()) {
                    window.userSystem.updateStats(window.game.coins, 0);
                }
            }
            konamiCode = [];
        }
        
        // Theme cheat code
        themeCode.push(e.keyCode);
        if (themeCode.length > themeCheat.length) {
            themeCode.shift();
        }
        
        if (themeCode.length === themeCheat.length && 
            themeCode.every((val, i) => val === themeCheat[i])) {
            if (window.gameBoyEffects) {
                window.gameBoyEffects.nextTheme();
                if (window.game) {
                    window.game.showMessage("🎨 THEME CHANGED! Type 'THEME' again for next! 🎨", 3000);
                }
            }
            themeCode = [];
        }
    });
});

// Add some CSS classes dynamically for special effects
const style = document.createElement('style');
style.textContent = `
    .easter-egg {
        animation: rainbow 2s linear infinite;
    }
    
    @keyframes rainbow {
        0% { color: #ff0000; }
        16.66% { color: #ff8800; }
        33.33% { color: #ffff00; }
        50% { color: #00ff00; }
        66.66% { color: #0088ff; }
        83.33% { color: #8800ff; }
        100% { color: #ff0000; }
    }
`;
document.head.appendChild(style);