/**
 * Register Page - Pendaftaran Toko Baru
 */
const registerPage = {
    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div style="min-height:100dvh;background:var(--bg-main);display:flex;align-items:center;justify-content:center;padding:24px;">
                <div style="width:100%;max-width:520px;">

                    <!-- Logo -->
                    <div style="text-align:center;margin-bottom:32px;">
                        <img src="assets/icons/icon.png" style="width:80px;height:80px;object-fit:contain;margin-bottom:12px;">
                        <h1 style="font-size:22px;font-weight:700;margin-bottom:4px;">Daftar Toko Baru</h1>
                        <p class="text-muted" style="font-size:13px;">Buat akun ZinPOS Pro untuk toko Anda</p>
                    </div>

                    <div class="card" style="padding:32px;">
                        <form id="register-form">

                            <!-- Step indicator -->
                            <div style="display:flex;gap:8px;margin-bottom:28px;">
                                <div id="step-dot-1" style="flex:1;height:4px;border-radius:4px;background:var(--primary);transition:all .3s;"></div>
                                <div id="step-dot-2" style="flex:1;height:4px;border-radius:4px;background:var(--border);transition:all .3s;"></div>
                            </div>

                            <!-- Step 1: Info Toko -->
                            <div id="step-1">
                                <h3 style="font-size:15px;font-weight:700;margin-bottom:20px;">Informasi Toko</h3>

                                <div class="form-group" style="margin-bottom:16px;">
                                    <label style="font-size:12px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;">NAMA TOKO *</label>
                                    <input type="text" id="reg-nama-toko" class="search-input" style="padding-left:14px;margin-top:6px;"
                                        placeholder="Contoh: Warung Maju Jaya" required>
                                </div>

                                <div class="form-group" style="margin-bottom:16px;">
                                    <label style="font-size:12px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;">NAMA PEMILIK *</label>
                                    <input type="text" id="reg-owner" class="search-input" style="padding-left:14px;margin-top:6px;"
                                        placeholder="Nama lengkap pemilik" required>
                                </div>

                                <div class="grid grid-cols-2" style="gap:12px;margin-bottom:16px;">
                                    <div class="form-group">
                                        <label style="font-size:12px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;">NO. HP / WA *</label>
                                        <input type="tel" id="reg-no-tlp" class="search-input" style="padding-left:14px;margin-top:6px;"
                                            placeholder="08xxxxxxxxxx" required>
                                    </div>
                                    <div class="form-group">
                                        <label style="font-size:12px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;">EMAIL</label>
                                        <input type="email" id="reg-email" class="search-input" style="padding-left:14px;margin-top:6px;"
                                            placeholder="email@toko.com">
                                    </div>
                                </div>

                                <div class="form-group" style="margin-bottom:24px;">
                                    <label style="font-size:12px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;">ALAMAT TOKO</label>
                                    <textarea id="reg-alamat" class="search-input" style="padding:12px 14px;margin-top:6px;min-height:72px;resize:none;"
                                        placeholder="Jl. Contoh No. 1, Kota..."></textarea>
                                </div>

                                <button type="button" class="btn btn-primary" style="width:100%;height:48px;font-size:14px;background:#1e1b4b;border-color:#1e1b4b;"
                                    onclick="registerPage.nextStep()">
                                    Lanjut →
                                </button>
                            </div>

                            <!-- Step 2: Akun Admin -->
                            <div id="step-2" style="display:none;">
                                <h3 style="font-size:15px;font-weight:700;margin-bottom:4px;">Buat Akun Admin</h3>
                                <p class="text-muted" style="font-size:12px;margin-bottom:20px;">Akun ini digunakan untuk login pertama kali</p>

                                <div class="form-group" style="margin-bottom:16px;">
                                    <label style="font-size:12px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;">USERNAME *</label>
                                    <input type="text" id="reg-username" class="search-input" style="padding-left:14px;margin-top:6px;"
                                        placeholder="Contoh: admin_majujaya" required autocomplete="off">
                                    <span id="reg-username-err" style="font-size:11px;color:var(--danger);margin-top:4px;display:block;"></span>
                                </div>

                                <div class="form-group" style="margin-bottom:16px;">
                                    <label style="font-size:12px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;">PASSWORD *</label>
                                    <div style="position:relative;margin-top:6px;">
                                        <input type="password" id="reg-password" class="search-input" style="padding-left:14px;padding-right:44px;"
                                            placeholder="Min. 6 karakter" required>
                                        <button type="button" onclick="registerPage.togglePass('reg-password')"
                                            style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);">
                                            <i data-lucide="eye" style="width:16px;height:16px;"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="form-group" style="margin-bottom:24px;">
                                    <label style="font-size:12px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;">KONFIRMASI PASSWORD *</label>
                                    <input type="password" id="reg-confirm" class="search-input" style="padding-left:14px;margin-top:6px;"
                                        placeholder="Ulangi password" required>
                                    <span id="reg-confirm-err" style="font-size:11px;color:var(--danger);margin-top:4px;display:block;"></span>
                                </div>

                                <div style="display:flex;gap:12px;">
                                    <button type="button" class="btn btn-outline" style="flex:1;height:48px;"
                                        onclick="registerPage.prevStep()">
                                        ← Kembali
                                    </button>
                                    <button type="submit" id="reg-submit-btn" class="btn btn-primary"
                                        style="flex:2;height:48px;font-size:14px;background:#1e1b4b;border-color:#1e1b4b;">
                                        Daftar Sekarang
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>

                    <p style="text-align:center;margin-top:20px;font-size:13px;color:var(--text-muted);">
                        Sudah punya akun?
                        <a href="#" onclick="registerPage.goLogin()" style="color:#1e1b4b;font-weight:700;">Masuk di sini</a>
                    </p>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        this.setupForm();
    },

    setupForm() {
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    },

    nextStep() {
        const namaToko = document.getElementById('reg-nama-toko').value.trim();
        const owner    = document.getElementById('reg-owner').value.trim();
        const noTlp    = document.getElementById('reg-no-tlp').value.trim();

        if (!namaToko || !owner || !noTlp) {
            showToast('Nama toko, pemilik, dan no. HP wajib diisi', 'warning');
            return;
        }

        document.getElementById('step-1').style.display = 'none';
        document.getElementById('step-2').style.display = 'block';
        document.getElementById('step-dot-2').style.background = 'var(--primary)';
        if (window.lucide) window.lucide.createIcons();
        document.getElementById('reg-username').focus();
    },

    prevStep() {
        document.getElementById('step-2').style.display = 'none';
        document.getElementById('step-1').style.display = 'block';
        document.getElementById('step-dot-2').style.background = 'var(--border)';
    },

    togglePass(id) {
        const input = document.getElementById(id);
        input.type = input.type === 'password' ? 'text' : 'password';
    },

    async handleSubmit() {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm  = document.getElementById('reg-confirm').value;

        // Validasi
        document.getElementById('reg-username-err').textContent = '';
        document.getElementById('reg-confirm-err').textContent = '';

        if (!username || username.length < 4) {
            document.getElementById('reg-username-err').textContent = 'Username minimal 4 karakter';
            return;
        }
        if (password.length < 6) {
            showToast('Password minimal 6 karakter', 'warning');
            return;
        }
        if (password !== confirm) {
            document.getElementById('reg-confirm-err').textContent = 'Password tidak cocok';
            return;
        }

        const btn = document.getElementById('reg-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Mendaftarkan...';

        try {
            await window.registerAPI.registerToko({
                nama_toko: document.getElementById('reg-nama-toko').value.trim(),
                owner:     document.getElementById('reg-owner').value.trim(),
                no_tlp:    document.getElementById('reg-no-tlp').value.trim(),
                email:     document.getElementById('reg-email').value.trim(),
                alamat:    document.getElementById('reg-alamat').value.trim(),
                username,
                password
            });

            // Tampilkan sukses lalu redirect ke login
            this.showSuccess(username);

        } catch (err) {
            console.error(err);
            if (err.message?.includes('Username')) {
                document.getElementById('reg-username-err').textContent = err.message;
            } else {
                showToast('Gagal mendaftar: ' + (err.message || 'Coba lagi'), 'error');
            }
            btn.disabled = false;
            btn.textContent = 'Daftar Sekarang';
        }
    },

    showSuccess(username) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div style="min-height:100dvh;background:var(--bg-main);display:flex;align-items:center;justify-content:center;padding:24px;">
                <div class="card" style="max-width:420px;width:100%;padding:40px;text-align:center;">
                    <div style="width:72px;height:72px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
                        <i data-lucide="check-circle" style="width:36px;height:36px;color:#16a34a;"></i>
                    </div>
                    <h2 style="font-size:20px;font-weight:700;margin-bottom:8px;">Toko Berhasil Didaftarkan!</h2>
                    <p class="text-muted" style="font-size:13px;margin-bottom:24px;">
                        Akun admin telah dibuat. Silakan login dengan username <strong>${username}</strong>
                    </p>
                    <button class="btn btn-primary" style="width:100%;height:48px;background:#1e1b4b;border-color:#1e1b4b;"
                        onclick="registerPage.goLogin()">
                        Masuk Sekarang
                    </button>
                </div>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    },

    goLogin() {
        window.loginPage.render();
    }
};

window.registerPage = registerPage;
