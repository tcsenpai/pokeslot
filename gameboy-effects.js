class GameBoyEffects {
    constructor() {
        this.backgrounds = [
            {
                name: 'celadon',
                class: 'bg-celadon',
                sprite: 'linear-gradient(45deg, #2ecc71 0%, #2ecc71 25%, transparent 25%, transparent 75%, #2ecc71 75%)',
                theme: 'Celadon City Game Corner'
            },
            {
                name: 'johto',
                class: 'bg-johto',
                sprite: 'linear-gradient(45deg, #9b59b6 0%, #9b59b6 25%, transparent 25%, transparent 75%, #9b59b6 75%)',
                theme: 'Johto Region'
            },
            {
                name: 'gamecorner',
                class: 'bg-gamecorner',
                sprite: 'linear-gradient(45deg, #f1c40f 0%, #f1c40f 25%, transparent 25%, transparent 75%, #f1c40f 75%)',
                theme: 'Classic Game Corner'
            },
            {
                name: 'night',
                class: 'bg-night',
                sprite: 'linear-gradient(45deg, #34495e 0%, #34495e 25%, transparent 25%, transparent 75%, #34495e 75%)',
                theme: 'Midnight Gaming'
            },
            {
                name: 'crystal',
                class: 'bg-crystal',
                sprite: 'linear-gradient(45deg, #3498db 0%, #3498db 25%, transparent 25%, transparent 75%, #3498db 75%)',
                theme: 'Crystal Version'
            }
        ];
        
        this.currentTheme = this.selectRandomTheme();
        this.initializeEffects();
    }
    
    selectRandomTheme() {
        // Use a seed based on the day to ensure same theme for the session
        const today = new Date().toDateString();
        const seed = this.hashCode(today + localStorage.getItem('pokeslot_session') || '');
        const index = Math.abs(seed) % this.backgrounds.length;
        return this.backgrounds[index];
    }
    
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
    
    initializeEffects() {
        // Apply background theme
        document.body.className = this.currentTheme.class;
        
        // Set CSS custom property for Pokemon sprite
        document.documentElement.style.setProperty('--pokemon-sprite', this.currentTheme.sprite);
        
        // Create scanlines effect
        this.createScanlines();
        
        // Create Pokemon sprite
        this.createPokemonSprite();
        
        // Show theme name
        this.showThemeMessage();
        
        // Create pixel effects
        this.createPixelClouds();
        this.createPixelSparkles();
        
        // Add Game Boy startup sound effect (visual)
        this.gameBoySoundEffect();
    }
    
    createScanlines() {
        const scanlines = document.createElement('div');
        scanlines.className = 'scanlines';
        document.body.appendChild(scanlines);
    }
    
    createPokemonSprite() {
        const sprite = document.createElement('div');
        sprite.className = 'pokemon-sprite';
        document.body.appendChild(sprite);
    }
    
    showThemeMessage() {
        setTimeout(() => {
            if (window.game) {
                window.game.showMessage(`🎮 ${this.currentTheme.theme} Theme Loaded! 🎮`, 3000);
            }
        }, 2000);
    }
    
    createPixelClouds() {
        // Reduce animations on mobile for better performance
        const isMobile = window.innerWidth <= 768;
        const cloudCount = isMobile ? 2 : 5;
        
        for (let i = 0; i < cloudCount; i++) {
            setTimeout(() => {
                const cloud = document.createElement('div');
                cloud.className = 'pixel-cloud';
                cloud.style.top = Math.random() * 60 + 10 + '%';
                cloud.style.setProperty('--drift-duration', (15 + Math.random() * 10) + 's');
                cloud.style.animationDelay = Math.random() * 15 + 's';
                document.body.appendChild(cloud);
                
                // Remove cloud after animation
                setTimeout(() => {
                    if (cloud.parentNode) {
                        cloud.parentNode.removeChild(cloud);
                    }
                }, 30000);
            }, i * 3000);
        }
        
        // Continuously create new clouds
        setInterval(() => {
            const maxClouds = isMobile ? 1 : 3;
            if (document.querySelectorAll('.pixel-cloud').length < maxClouds) {
                const cloud = document.createElement('div');
                cloud.className = 'pixel-cloud';
                cloud.style.top = Math.random() * 60 + 10 + '%';
                cloud.style.setProperty('--drift-duration', (15 + Math.random() * 10) + 's');
                document.body.appendChild(cloud);
                
                setTimeout(() => {
                    if (cloud.parentNode) {
                        cloud.parentNode.removeChild(cloud);
                    }
                }, 30000);
            }
        }, isMobile ? 12000 : 8000);
    }
    
    createPixelSparkles() {
        const isMobile = window.innerWidth <= 768;
        const sparkleChance = isMobile ? 0.15 : 0.3;
        
        setInterval(() => {
            if (Math.random() < sparkleChance) {
                const sparkle = document.createElement('div');
                sparkle.className = 'pixel-sparkle';
                sparkle.style.left = Math.random() * 100 + '%';
                sparkle.style.top = Math.random() * 100 + '%';
                sparkle.style.animationDelay = Math.random() * 2 + 's';
                
                // Random colors for sparkles
                const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#ffffff'];
                sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
                
                document.body.appendChild(sparkle);
                
                // Remove sparkle after animation
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 4000);
            }
        }, isMobile ? 4000 : 2000);
    }
    
    gameBoySoundEffect() {
        // Visual "sound effect" - flash the screen briefly
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.3);
            pointer-events: none;
            z-index: 9999;
            animation: gameBoySplash 0.5s ease-out;
        `;
        
        // Add the flash animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes gameBoySplash {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 500);
    }
    
    // Method to manually change theme (for testing)
    changeTheme(themeName) {
        const theme = this.backgrounds.find(bg => bg.name === themeName);
        if (theme) {
            this.currentTheme = theme;
            document.body.className = theme.class;
            document.documentElement.style.setProperty('--pokemon-sprite', theme.sprite);
            this.showThemeMessage();
        }
    }
    
    // Get list of available themes
    getThemes() {
        return this.backgrounds.map(bg => bg.name);
    }
    
    // Cycle to next theme (for testing)
    nextTheme() {
        const currentIndex = this.backgrounds.findIndex(bg => bg.name === this.currentTheme.name);
        const nextIndex = (currentIndex + 1) % this.backgrounds.length;
        this.changeTheme(this.backgrounds[nextIndex].name);
    }
}

// Pixel Pokemon sprites using CSS (8-bit style)
const createPixelPokemon = () => {
    const style = document.createElement('style');
    style.textContent = `
        /* Pixel Pikachu */
        .pixel-pikachu {
            width: 32px;
            height: 32px;
            background: 
                /* Body */
                linear-gradient(to right, 
                    transparent 8px, #ffeb3b 8px, #ffeb3b 24px, transparent 24px),
                /* Head */
                linear-gradient(to bottom,
                    transparent 4px, #ffeb3b 4px, #ffeb3b 20px, transparent 20px),
                /* Eyes */
                radial-gradient(circle at 12px 12px, #000 2px, transparent 2px),
                radial-gradient(circle at 20px 12px, #000 2px, transparent 2px),
                /* Cheeks */
                radial-gradient(circle at 8px 16px, #ff5722 3px, transparent 3px),
                radial-gradient(circle at 24px 16px, #ff5722 3px, transparent 3px);
            position: fixed;
            animation: pokemonWalk 4s linear infinite;
            pointer-events: none;
            z-index: -1;
            image-rendering: pixelated;
        }
        
        @keyframes pokemonWalk {
            0% { 
                left: -50px; 
                bottom: 20px;
                transform: scaleX(1);
            }
            25% { 
                left: 25%; 
                bottom: 25px;
            }
            50% { 
                left: 50%; 
                bottom: 20px;
                transform: scaleX(-1);
            }
            75% { 
                left: 75%; 
                bottom: 25px;
            }
            100% { 
                left: calc(100% + 50px); 
                bottom: 20px;
                transform: scaleX(-1);
            }
        }
        
        /* Pixel Pokeball */
        .pixel-pokeball {
            width: 16px;
            height: 16px;
            background: 
                /* Top half */
                linear-gradient(to bottom,
                    #e74c3c 0px, #e74c3c 8px, transparent 8px),
                /* Bottom half */
                linear-gradient(to bottom,
                    transparent 8px, #ecf0f1 8px, #ecf0f1 16px),
                /* Center line */
                linear-gradient(to bottom,
                    transparent 7px, #2c3e50 7px, #2c3e50 9px, transparent 9px),
                /* Center button */
                radial-gradient(circle at center, #2c3e50 3px, transparent 3px);
            border-radius: 50%;
            position: fixed;
            animation: pokeballBounce 3s ease-in-out infinite;
            pointer-events: none;
            z-index: -1;
            image-rendering: pixelated;
        }
        
        @keyframes pokeballBounce {
            0%, 100% { 
                top: 80%; 
                left: 10%;
                transform: rotate(0deg);
            }
            25% { 
                top: 60%; 
                left: 30%;
                transform: rotate(90deg);
            }
            50% { 
                top: 40%; 
                left: 70%;
                transform: rotate(180deg);
            }
            75% { 
                top: 60%; 
                left: 90%;
                transform: rotate(270deg);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Create walking Pikachu occasionally
    setInterval(() => {
        if (Math.random() < 0.2) {
            const pikachu = document.createElement('div');
            pikachu.className = 'pixel-pikachu';
            document.body.appendChild(pikachu);
            
            setTimeout(() => {
                if (pikachu.parentNode) {
                    pikachu.parentNode.removeChild(pikachu);
                }
            }, 4000);
        }
    }, 15000);
    
    // Create bouncing Pokeball occasionally
    setInterval(() => {
        if (Math.random() < 0.3) {
            const pokeball = document.createElement('div');
            pokeball.className = 'pixel-pokeball';
            document.body.appendChild(pokeball);
            
            setTimeout(() => {
                if (pokeball.parentNode) {
                    pokeball.parentNode.removeChild(pokeball);
                }
            }, 3000);
        }
    }, 12000);
};

// Initialize effects when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gameBoyEffects = new GameBoyEffects();
    createPixelPokemon();
    
    // Add theme info to console for developers
    console.log('🎮 Game Boy Effects Loaded!');
    console.log('Current theme:', window.gameBoyEffects.currentTheme.theme);
    console.log('Available themes:', window.gameBoyEffects.getThemes());
    console.log('To change theme: window.gameBoyEffects.changeTheme("themeName")');
});