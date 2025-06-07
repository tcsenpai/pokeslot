// Configuration management for Pokemon Slot Machine
class Config {
    constructor() {
        this.environment = this.detectEnvironment();
        this.config = this.loadConfig();
    }
    
    detectEnvironment() {
        // Detect if running in development or production
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            return 'development';
        }
        return 'production';
    }
    
    loadConfig() {
        const baseConfig = {
            // Game settings
            defaultCoins: 100,
            maxBet: 3,
            minBet: 1,
            
            // Audio settings
            audioEnabled: true,
            masterVolume: 0.3,
            
            // Performance settings
            enableAnimations: true,
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            
            // Session settings
            sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
            autoSaveInterval: 30000, // 30 seconds
            
            // Security settings
            maxLoginAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 minutes
            
            // Feature flags
            enableLeaderboard: true,
            enableGuest: true,
            enableRegistration: true,
            
            // Mobile optimizations
            mobileBreakpoint: 768,
            touchOptimized: 'ontouchstart' in window,
        };
        
        const environmentConfig = {
            development: {
                apiBase: 'http://localhost:5001/api',
                debug: true,
                enableConsoleLogging: true,
            },
            production: {
                apiBase: '/api', // Assumes reverse proxy
                debug: false,
                enableConsoleLogging: false,
            }
        };
        
        return {
            ...baseConfig,
            ...environmentConfig[this.environment]
        };
    }
    
    get(key) {
        return this.config[key];
    }
    
    set(key, value) {
        this.config[key] = value;
        // Save to localStorage for persistence
        try {
            localStorage.setItem(`pokeslot_config_${key}`, JSON.stringify(value));
        } catch (e) {
            console.warn('Failed to save config to localStorage:', e);
        }
    }
    
    // Load user preferences from localStorage
    loadUserPreferences() {
        const preferences = ['audioEnabled', 'masterVolume', 'enableAnimations'];
        preferences.forEach(pref => {
            try {
                const stored = localStorage.getItem(`pokeslot_config_${pref}`);
                if (stored !== null) {
                    this.config[pref] = JSON.parse(stored);
                }
            } catch (e) {
                console.warn(`Failed to load preference ${pref}:`, e);
            }
        });
    }
    
    // Environment helpers
    isDevelopment() {
        return this.environment === 'development';
    }
    
    isProduction() {
        return this.environment === 'production';
    }
    
    // Responsive helpers
    isMobile() {
        return window.innerWidth <= this.get('mobileBreakpoint');
    }
    
    // Accessibility helpers
    prefersReducedMotion() {
        return this.get('reducedMotion');
    }
}

// Global config instance
window.gameConfig = new Config();
window.gameConfig.loadUserPreferences();