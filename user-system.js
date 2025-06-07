class UserSystem {
    constructor() {
        this.apiBase = window.gameConfig?.get('apiBase') || 'http://localhost:5001/api';
        this.currentUser = null;
        this.sessionId = null;
        this.loginAttempts = 0;
        this.isLoading = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.initializeEventListeners();
        this.checkSession();
    }
    
    initializeEventListeners() {
        // Modal controls
        document.getElementById('login-btn').addEventListener('click', () => this.showModal('login-modal'));
        document.getElementById('register-btn').addEventListener('click', () => this.showModal('register-modal'));
        document.getElementById('leaderboard-btn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        
        // Form submissions
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }
    
    async checkSession() {
        const sessionId = localStorage.getItem('pokeslot_session');
        if (sessionId) {
            try {
                const response = await fetch(`${this.apiBase}/session?session_id=${sessionId}`);
                const data = await response.json();
                
                if (data.success) {
                    this.sessionId = sessionId;
                    this.currentUser = {
                        id: data.session.user_id,
                        username: data.session.username,
                        coins: data.session.coins,
                        is_guest: data.session.is_guest
                    };
                    this.updateUserDisplay();
                    
                    // Update game coins if this is integrated with the slot machine
                    if (window.game) {
                        window.game.coins = this.currentUser.coins;
                        window.game.updateDisplay();
                    }
                } else {
                    localStorage.removeItem('pokeslot_session');
                    // Auto-start guest mode if no valid session
                    await this.autoStartGuest();
                }
            } catch (error) {
                console.error('Session check failed:', error);
                localStorage.removeItem('pokeslot_session');
                // Auto-start guest mode on connection error
                await this.autoStartGuest();
            }
        } else {
            // No session found, auto-start guest mode
            await this.autoStartGuest();
        }
    }
    
    async autoStartGuest() {
        try {
            const response = await fetch(`${this.apiBase}/guest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.sessionId = data.session_id;
                this.currentUser = {
                    id: null,
                    username: data.user.username || 'Guest',
                    coins: 100,
                    is_guest: true
                };
                localStorage.setItem('pokeslot_session', this.sessionId);
                this.updateUserDisplay();
                
                // Update game state
                if (window.game) {
                    window.game.coins = 100;
                    window.game.updateDisplay();
                }
            } else {
                throw new Error('Guest session creation failed');
            }
        } catch (error) {
            console.error('Auto-guest failed:', error);
            // Fallback to offline mode with proper structure
            this.currentUser = {
                id: null,
                username: 'Offline Player',
                coins: 100,
                is_guest: true
            };
            this.updateUserDisplay();
            if (window.game) {
                window.game.coins = 100;
                window.game.updateDisplay();
            }
        }
    }
    
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        // Clear form data
        const modal = document.getElementById(modalId);
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        const username = document.getElementById('login-username').value?.trim();
        const password = document.getElementById('login-password').value;
        
        // Validation
        if (!username || !password) {
            this.showMessage('Please enter both username and password', 'error');
            return;
        }
        
        // Rate limiting
        if (this.loginAttempts >= window.gameConfig?.get('maxLoginAttempts')) {
            this.showMessage('Too many login attempts. Please wait.', 'error');
            return;
        }
        
        this.setLoading(true);
        this.loginAttempts++;
        
        try {
            const response = await this.makeRequest('/login', {
                method: 'POST',
                body: { username, password }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.sessionId = data.session_id;
                this.currentUser = {
                    id: data.user.id,
                    username: data.user.username,
                    coins: data.user.coins,
                    is_guest: false
                };
                localStorage.setItem('pokeslot_session', this.sessionId);
                this.updateUserDisplay();
                this.closeModal('login-modal');
                
                // Reset login attempts on successful login
                this.loginAttempts = 0;
                
                // CRITICAL: Sync game coins with user account
                if (window.game) {
                    window.game.coins = this.currentUser.coins;
                    window.game.updateDisplay();
                    window.game.showMessage(`Welcome back, ${this.currentUser.username}! You have ${this.currentUser.coins} coins.`, 3000);
                }
                
                this.showMessage(`Welcome back! Loaded ${this.currentUser.coins} coins.`, 'success');
            } else {
                this.showMessage(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            window.errorHandler?.handleUserError('login', error);
            this.showMessage('Connection error. Please check your internet connection.', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    async handleRegister(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        const username = document.getElementById('register-username').value?.trim();
        const password = document.getElementById('register-password').value;
        const email = document.getElementById('register-email').value?.trim();
        
        // Enhanced validation
        const usernameError = this.validateUsername(username);
        if (usernameError) {
            this.showMessage(usernameError, 'error');
            return;
        }
        
        const passwordError = this.validatePassword(password);
        if (passwordError) {
            this.showMessage(passwordError, 'error');
            return;
        }
        
        const emailError = this.validateEmail(email);
        if (emailError) {
            this.showMessage(emailError, 'error');
            return;
        }
        
        this.setLoading(true);
        
        try {
            const response = await this.makeRequest('/register', {
                method: 'POST',
                body: { username, password, email }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.sessionId = data.session_id;
                this.currentUser = {
                    id: data.user_id,
                    username: username,
                    coins: 100,
                    is_guest: false
                };
                localStorage.setItem('pokeslot_session', this.sessionId);
                this.updateUserDisplay();
                this.closeModal('register-modal');
                
                // Update game state
                if (window.game) {
                    window.game.coins = 100;
                    window.game.updateDisplay();
                    window.game.showMessage(`Welcome to the Game Corner, ${username}!`, 3000);
                }
                
                this.showMessage('Registration successful! Welcome trainer!', 'success');
            } else {
                this.showMessage(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            window.errorHandler?.handleUserError('register', error);
            this.showMessage('Connection error. Please check your internet connection.', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    async guestLogin() {
        try {
            const response = await fetch(`${this.apiBase}/guest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.sessionId = data.session_id;
                this.currentUser = data.user;
                this.currentUser.is_guest = true;
                localStorage.setItem('pokeslot_session', this.sessionId);
                this.updateUserDisplay();
                
                // Update game state
                if (window.game) {
                    window.game.coins = 100;
                    window.game.updateDisplay();
                    window.game.showMessage('Playing as guest! Your progress won\'t be saved.', 3000);
                }
                
                this.showMessage('Playing as guest - have fun!', 'success');
            } else {
                this.showMessage('Failed to start guest session', 'error');
            }
        } catch (error) {
            console.error('Guest login error:', error);
            this.showMessage('Connection error. Make sure the backend server is running!', 'error');
        }
    }
    
    async showLeaderboard() {
        this.showModal('leaderboard-modal');
        document.getElementById('leaderboard-content').innerHTML = 'Loading...';
        
        try {
            const response = await fetch(`${this.apiBase}/leaderboard`);
            const data = await response.json();
            
            if (data.leaderboard) {
                this.renderLeaderboard(data.leaderboard);
            } else {
                document.getElementById('leaderboard-content').innerHTML = 'Failed to load leaderboard';
            }
        } catch (error) {
            console.error('Leaderboard error:', error);
            document.getElementById('leaderboard-content').innerHTML = 'Connection error';
        }
    }
    
    renderLeaderboard(leaderboard) {
        const container = document.getElementById('leaderboard-content');
        
        if (leaderboard.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #95a5a6;">No players yet!</p>';
            return;
        }
        
        let html = '';
        leaderboard.forEach((player, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank}` : '';
            
            html += `
                <div class="leaderboard-entry ${rankClass}">
                    <div>
                        <span class="leaderboard-rank">#${rank}</span>
                        <strong>${player.username}</strong>
                    </div>
                    <div class="leaderboard-stats">
                        <div>${player.coins} coins</div>
                        <div>Wins: ${player.total_wins}</div>
                        <div>Best: ${player.biggest_win}</div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    async logout() {
        this.currentUser = null;
        this.sessionId = null;
        localStorage.removeItem('pokeslot_session');
        
        // Auto-start guest mode after logout
        await this.autoStartGuest();
        
        // Show message
        if (window.game) {
            window.game.showMessage('Logged out. Now playing as guest.', 2000);
        }
        
        this.showMessage('Logged out - switched to guest mode', 'success');
    }
    
    updateUserDisplay() {
        const userDisplay = document.getElementById('user-display');
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (this.currentUser && this.currentUser.username) {
            if (this.currentUser.is_guest) {
                userDisplay.textContent = `Playing as: ${this.currentUser.username}`;
                userDisplay.style.color = '#f39c12';
                loginBtn.style.display = 'inline-block';
                registerBtn.style.display = 'inline-block';
                logoutBtn.style.display = 'none';
            } else {
                userDisplay.textContent = `Trainer: ${this.currentUser.username} (${this.currentUser.coins || 0} coins)`;
                userDisplay.style.color = '#27ae60';
                loginBtn.style.display = 'none';
                registerBtn.style.display = 'none';
                logoutBtn.style.display = 'inline-block';
            }
        } else {
            userDisplay.textContent = 'Loading...';
            userDisplay.style.color = '#95a5a6';
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    }
    
    async updateStats(coins, winAmount = 0) {
        if (!this.sessionId) return;
        
        try {
            await fetch(`${this.apiBase}/update-stats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    coins: coins,
                    win_amount: winAmount
                })
            });
            
            // Update local user data and UI
            if (this.currentUser) {
                this.currentUser.coins = coins;
                this.updateUserDisplay(); // Refresh UI to show updated coins
            }
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    }
    
    // Method to sync game coins with user account
    syncGameWithUser() {
        if (this.currentUser && window.game) {
            window.game.coins = this.currentUser.coins;
            window.game.updateDisplay();
        }
    }
    
    // Method to get current user coins (with fallback)
    getCurrentCoins() {
        return this.currentUser ? this.currentUser.coins : 100;
    }
    
    showMessage(message, type = 'info') {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 2000;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: 'Press Start 2P', monospace;
            font-size: 10px;
            color: white;
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'};
            border: 2px solid ${type === 'error' ? '#c0392b' : type === 'success' ? '#229954' : '#2980b9'};
            animation: fadeIn 0.3s ease;
        `;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => document.body.removeChild(messageEl), 300);
        }, 3000);
    }
    
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    // Enhanced request method with retry logic and error handling
    async makeRequest(endpoint, options = {}) {
        const url = `${this.apiBase}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 seconds
        };
        
        const requestOptions = {
            ...defaultOptions,
            ...options,
            body: options.body ? JSON.stringify(options.body) : undefined
        };
        
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), requestOptions.timeout);
                
                const response = await fetch(url, {
                    ...requestOptions,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return response;
                
            } catch (error) {
                if (attempt === this.maxRetries) {
                    window.errorHandler?.handleNetworkError(endpoint);
                    throw error;
                }
                
                // Exponential backoff
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                
                window.errorHandler?.logWarning('Request Retry', { 
                    endpoint, 
                    attempt: attempt + 1, 
                    error: error.message 
                });
            }
        }
    }
    
    // Loading state management
    setLoading(loading) {
        this.isLoading = loading;
        this.updateUILoadingState(loading);
    }
    
    updateUILoadingState(loading) {
        const buttons = document.querySelectorAll('.user-btn, .modal-btn');
        buttons.forEach(btn => {
            if (loading) {
                btn.disabled = true;
                btn.style.opacity = '0.6';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        });
        
        // Show loading spinner in modals
        const modals = document.querySelectorAll('.modal:not([style*="display: none"])');
        modals.forEach(modal => {
            let spinner = modal.querySelector('.loading-spinner');
            if (loading && !spinner) {
                spinner = document.createElement('div');
                spinner.className = 'loading-spinner';
                spinner.innerHTML = '⌛ Loading...';
                spinner.style.cssText = `
                    text-align: center;
                    color: #f1c40f;
                    font-size: 8px;
                    margin: 10px 0;
                `;
                modal.querySelector('.modal-content').appendChild(spinner);
            } else if (!loading && spinner) {
                spinner.remove();
            }
        });
    }
    
    // Enhanced validation
    validateUsername(username) {
        if (!username || username.length < 3) {
            return 'Username must be at least 3 characters long';
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return 'Username can only contain letters, numbers, underscores and dashes';
        }
        if (username.length > 20) {
            return 'Username must be less than 20 characters';
        }
        return null;
    }
    
    validatePassword(password) {
        if (!password || password.length < 4) {
            return 'Password must be at least 4 characters long';
        }
        if (password.length > 100) {
            return 'Password must be less than 100 characters';
        }
        return null;
    }
    
    validateEmail(email) {
        if (!email) return null; // Email is optional
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return null;
    }
}

// Global function to close modals (used by HTML onclick)
function closeModal(modalId) {
    if (window.userSystem) {
        window.userSystem.closeModal(modalId);
    }
}

// Initialize user system when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.userSystem = new UserSystem();
    
    // Ensure proper initialization order
    window.userSystem.initialized = false;
    
    // Mark as initialized after session check completes
    const originalCheckSession = window.userSystem.checkSession;
    window.userSystem.checkSession = async function() {
        await originalCheckSession.call(this);
        this.initialized = true;
        
        // Trigger any waiting sync operations
        if (window.game) {
            this.syncGameWithUser();
        }
    };
});