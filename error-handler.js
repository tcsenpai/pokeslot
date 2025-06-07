// Comprehensive error handling and logging system
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.setupGlobalErrorHandling();
    }
    
    setupGlobalErrorHandling() {
        // Catch JavaScript errors
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.stack
            });
        });
        
        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });
        
        // Catch network errors (experimental)
        if ('navigator' in window && 'serviceWorker' in navigator) {
            window.addEventListener('offline', () => {
                this.logError('Network Error', { type: 'offline' });
                this.showUserMessage('Connection lost. Playing in offline mode.', 'warning');
            });
            
            window.addEventListener('online', () => {
                this.logInfo('Network Restored', { type: 'online' });
                this.showUserMessage('Connection restored!', 'success');
            });
        }
    }
    
    logError(type, details) {
        const error = {
            type,
            details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            gameState: this.getGameState()
        };
        
        this.errors.push(error);
        
        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // Log to console in development
        if (window.gameConfig?.isDevelopment()) {
            console.error(`[${type}]`, details);
        }
        
        // Send to analytics in production (if configured)
        if (window.gameConfig?.isProduction()) {
            this.sendErrorToAnalytics(error);
        }
    }
    
    logInfo(type, details) {
        if (window.gameConfig?.get('enableConsoleLogging')) {
            console.info(`[${type}]`, details);
        }
    }
    
    logWarning(type, details) {
        if (window.gameConfig?.get('enableConsoleLogging')) {
            console.warn(`[${type}]`, details);
        }
    }
    
    getGameState() {
        try {
            return {
                coins: window.game?.coins || 0,
                bet: window.game?.bet || 1,
                isSpinning: window.game?.isSpinning || false,
                userLoggedIn: window.userSystem?.isLoggedIn() || false,
                currentTheme: window.gameBoyEffects?.currentTheme?.name || 'unknown'
            };
        } catch (e) {
            return { error: 'Failed to get game state' };
        }
    }
    
    sendErrorToAnalytics(error) {
        // Placeholder for analytics integration
        // In production, you might send to services like Sentry, LogRocket, etc.
        if (window.gameConfig?.get('analyticsEndpoint')) {
            fetch(window.gameConfig.get('analyticsEndpoint'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(error)
            }).catch(() => {
                // Silently fail - don't want error reporting to break the game
            });
        }
    }
    
    showUserMessage(message, type = 'info', duration = 3000) {
        // Show user-friendly error messages
        if (window.game) {
            window.game.showMessage(message, duration);
        } else {
            // Fallback message display
            this.createFloatingMessage(message, type, duration);
        }
    }
    
    createFloatingMessage(message, type, duration) {
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            padding: 12px 20px;
            border-radius: 5px;
            font-family: 'Press Start 2P', monospace;
            font-size: 10px;
            color: white;
            background: ${this.getTypeColor(type)};
            border: 2px solid ${this.getTypeBorderColor(type)};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInTop 0.3s ease-out;
            max-width: 90%;
            text-align: center;
        `;
        messageEl.textContent = message;
        
        // Add animation keyframes if not already added
        if (!document.querySelector('#error-handler-styles')) {
            const style = document.createElement('style');
            style.id = 'error-handler-styles';
            style.textContent = `
                @keyframes slideInTop {
                    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                @keyframes slideOutTop {
                    from { transform: translateX(-50%) translateY(0); opacity: 1; }
                    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideOutTop 0.3s ease-in';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, duration);
    }
    
    getTypeColor(type) {
        const colors = {
            error: '#e74c3c',
            warning: '#f39c12',
            success: '#27ae60',
            info: '#3498db'
        };
        return colors[type] || colors.info;
    }
    
    getTypeBorderColor(type) {
        const colors = {
            error: '#c0392b',
            warning: '#d68910',
            success: '#229954',
            info: '#2980b9'
        };
        return colors[type] || colors.info;
    }
    
    // Handle specific game errors
    handleNetworkError(operation) {
        this.logError('Network Error', { operation });
        this.showUserMessage('Connection error. Please check your internet.', 'error');
    }
    
    handleGameError(operation, error) {
        this.logError('Game Error', { operation, error: error.message });
        this.showUserMessage('Game error occurred. Please refresh if issues persist.', 'error');
    }
    
    handleUserError(operation, error) {
        this.logError('User Error', { operation, error: error.message });
        this.showUserMessage('Account error. Please try again.', 'error');
    }
    
    // Recovery mechanisms
    attemptRecovery() {
        try {
            // Try to restore game state
            if (window.game && window.userSystem) {
                window.userSystem.syncGameWithUser();
                this.logInfo('Recovery', { action: 'syncGameWithUser' });
                return true;
            }
        } catch (e) {
            this.logError('Recovery Failed', { error: e.message });
        }
        return false;
    }
    
    // Get error report for debugging
    getErrorReport() {
        return {
            errors: this.errors,
            gameState: this.getGameState(),
            config: window.gameConfig?.config,
            timestamp: new Date().toISOString()
        };
    }
    
    // Clear errors (for privacy)
    clearErrors() {
        this.errors = [];
    }
}

// Global error handler instance
window.errorHandler = new ErrorHandler();