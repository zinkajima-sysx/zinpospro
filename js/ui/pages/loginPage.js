/**
 * Modern Login Page Component
 */
const loginPage = {
    render() {
        const appContainer = document.getElementById('app');
        // For login, we clear the entire app container to hide the navbar
        appContainer.innerHTML = `
            <div class="login-container">
                <div class="login-card card">
                    <div class="login-header">
                        <div class="login-logo">
                            <img src="assets/icons/icon.png" style="width:96px;height:96px;object-fit:contain;">
                        </div>
                        <h1>ZinPOS Pro</h1>
                        <p class="text-muted">Selamat datang, silakan masuk ke akun Anda</p>
                    </div>

                    <form id="login-form" class="login-form">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <div class="input-wrapper">
                                <i data-lucide="user" class="input-icon"></i>
                                <input type="text" id="username" name="username" placeholder="Masukkan username" required>
                            </div>
                            <span class="error-msg" id="username-error"></span>
                        </div>

                        <div class="form-group">
                            <label for="password">Kata Sandi</label>
                            <div class="input-wrapper">
                                <i data-lucide="lock" class="input-icon"></i>
                                <input type="password" id="password" name="password" placeholder="••••••••" required>
                            </div>
                            <span class="error-msg" id="password-error"></span>
                        </div>

                        <button type="submit" class="btn btn-primary login-btn" id="login-submit">
                            <span>Masuk</span>
                            <div class="btn-loader" id="btn-loader" style="display: none;"></div>
                        </button>
                    </form>

                    <div class="login-footer">
                        <p class="text-muted">Butuh bantuan? <a href="#" class="text-primary">Hubungi Admin</a></p>
                        <p style="margin-top:10px;font-size:13px;color:var(--text-muted);">
                            Belum punya akun?
                            <a href="#" onclick="registerPage.render()" style="color:#1e1b4b;font-weight:700;">Daftar Toko Baru</a>
                        </p>
                        <p style="margin-top:10px;font-size:13px;color:var(--text-muted);">
                            Login sebagai
                            <a href="#" onclick="superAdminPage.renderStandalone()" style="color:#1e1b4b;font-weight:700;">Super Admin</a>
                        </p>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        if (window.lucide) window.lucide.createIcons();
        this.setupListeners();
    },

    setupListeners() {
        const form = document.getElementById('login-form');
        const submitBtn = document.getElementById('login-submit');
        const loader = document.getElementById('btn-loader');

        form.onsubmit = async (e) => {
            e.preventDefault();
            const username = form.username.value;
            const password = form.password.value;

            // Reset errors
            document.getElementById('username-error').textContent = '';
            document.getElementById('password-error').textContent = '';

            // Simple validation
            let isValid = true;
            if (!username) {
                document.getElementById('username-error').textContent = 'Username wajib diisi';
                isValid = false;
            }
            if (!password) {
                document.getElementById('password-error').textContent = 'Kata sandi wajib diisi';
                isValid = false;
            }

            if (!isValid) return;

            // Start Loading
            submitBtn.disabled = true;
            submitBtn.querySelector('span').style.display = 'none';
            loader.style.display = 'block';

            try {
                await window.authStore.login(username, password);
                // On success, app.js listener will re-render the app
                window.appStore.addNotification('Selamat datang kembali!', 'success');
            } catch (error) {
                console.error('Login Error:', error);
                const msg = error && error.message ? String(error.message) : '';
                if (msg.toLowerCase().includes('toko berstatus')) {
                    window.appStore.addNotification(msg, 'error');
                    document.getElementById('password-error').textContent = msg;
                } else {
                    window.appStore.addNotification('Username atau kata sandi salah', 'error');
                    document.getElementById('password-error').textContent = 'Kombinasi username/sandi salah';
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.querySelector('span').style.display = 'inline';
                loader.style.display = 'none';
            }
        };
    },

    addStyles() {
        if (document.getElementById('login-styles')) return;
        const style = document.createElement('style');
        style.id = 'login-styles';
        style.textContent = `
            .login-container {
                position: fixed;
                inset: 0;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                z-index: 9999;
            }

            .login-card {
                width: 100%;
                max-width: 420px;
                padding: 48px 40px;
                text-align: center;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.5);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
                animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }


            .login-logo {
                width: 96px;
                height: 96px;
                background: transparent;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
            }

            .login-header h1 {
                font-size: 24px;
                margin-bottom: 8px;
            }

            .login-header p {
                font-size: 14px;
                margin-bottom: 32px;
            }

            .login-form {
                text-align: left;
            }

            .form-group {
                margin-bottom: 24px;
            }

            .form-group label {
                display: block;
                font-size: 13px;
                font-weight: 600;
                color: var(--text-main);
                margin-bottom: 8px;
            }

            .input-wrapper {
                position: relative;
            }

            .input-icon {
                position: absolute;
                left: 14px;
                top: 50%;
                transform: translateY(-50%);
                width: 18px;
                height: 18px;
                color: var(--text-muted);
            }

            .login-form input {
                width: 100%;
                padding: 14px 14px 14px 44px;
                border-radius: 12px;
                border: 1px solid var(--border);
                background: #fdfdfd;
                font-size: 14px;
                transition: all 0.2s ease;
            }

            .login-form input:focus {
                border-color: var(--primary);
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                outline: none;
            }

            .login-btn {
                width: 100%;
                padding: 14px;
                font-size: 15px;
                margin-top: 8px;
                background: #1e1b4b !important;
                border-color: #1e1b4b !important;
                box-shadow: 0 4px 16px rgba(30, 27, 75, 0.35);
            }
            .login-btn:hover {
                background: #2d2a6e !important;
                border-color: #2d2a6e !important;
            }

            .error-msg {
                display: block;
                font-size: 11px;
                color: var(--danger);
                margin-top: 4px;
                height: 14px;
            }

            .login-footer {
                margin-top: 32px;
                font-size: 14px;
            }

            .btn-loader {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 0.8s linear infinite;
                margin: 0 auto;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
};

window.loginPage = loginPage;
