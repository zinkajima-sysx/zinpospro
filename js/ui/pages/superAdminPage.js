const superAdminPage = {
    state: {
        loading: false,
        q: '',
        status: 'all',
        includeDeleted: false,
        rows: []
    },
    _initialized: false,
    _loadingRequest: false,

    render(opts = {}) {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        if (!window.superAdminStore?.isLoggedIn()) {
            this._initialized = false;
            mainContent.innerHTML = this.renderLogin();
            this.setupLogin();
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        mainContent.innerHTML = this.renderPanel();
        this.setupPanel();
        if (!opts.skipLoad && !this._initialized) {
            this._initialized = true;
            this.load();
        }
        if (window.lucide) window.lucide.createIcons();
    },

    renderStandalone() {
        const app = document.getElementById('app');
        if (!app) return;
        app.innerHTML = `
            <div style="min-height:100dvh;background:var(--bg-main);display:flex;align-items:center;justify-content:center;padding:24px;">
                <div style="width:100%;max-width:520px;">
                    ${this.renderLogin()}
                    <p style="text-align:center;margin-top:18px;font-size:13px;color:var(--text-muted);">
                        <a href="#" onclick="loginPage.render()" style="color:#1e1b4b;font-weight:800;">Kembali ke login</a>
                    </p>
                </div>
            </div>
        `;
        this.setupLogin();
        if (window.lucide) window.lucide.createIcons();
    },

    renderLogin() {
        return `
            <div class="card" style="padding:32px;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
                        <div style="width:44px;height:44px;border-radius:14px;background:#1e1b4b;display:flex;align-items:center;justify-content:center;">
                            <i data-lucide="shield" style="width:22px;height:22px;color:white;"></i>
                        </div>
                        <div>
                            <h2 style="font-size:18px;font-weight:900;margin:0;">Super Admin</h2>
                            <p class="text-muted" style="margin:2px 0 0;font-size:12px;">Kelola seluruh toko yang terdaftar</p>
                        </div>
                    </div>
                    <form id="superadmin-login-form">
                        <div class="form-group" style="margin-bottom:14px;">
                            <label style="font-size:12px;font-weight:800;color:var(--text-muted);letter-spacing:.06em;">USERNAME</label>
                            <input type="text" id="sa-username" class="search-input" style="padding-left:14px;margin-top:6px;" required autocomplete="off">
                        </div>
                        <div class="form-group" style="margin-bottom:18px;">
                            <label style="font-size:12px;font-weight:800;color:var(--text-muted);letter-spacing:.06em;">PASSWORD</label>
                            <input type="password" id="sa-password" class="search-input" style="padding-left:14px;margin-top:6px;" required>
                        </div>
                        <button id="sa-login-btn" type="submit" class="btn btn-primary" style="width:100%;height:48px;background:#1e1b4b;border-color:#1e1b4b;">Masuk</button>
                    </form>
            </div>
        `;
    },

    renderPanel() {
        const rows = this.state.rows || [];
        const loading = this.state.loading;
        return `
            <div class="page-container" style="max-width:1200px;">
                <div class="flex-between" style="margin-bottom:18px;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h1 style="font-size:22px;font-weight:900;margin-bottom:2px;">Super Admin</h1>
                        <p class="text-muted" style="font-size:13px;">Kelola aktivasi, suspend, dan penghapusan toko</p>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="superAdminPage.logout()" style="gap:6px;">
                        <i data-lucide="log-out" style="width:15px;height:15px;color:var(--danger);"></i>
                        <span style="color:var(--danger);">Keluar</span>
                    </button>
                </div>

                <div class="card" style="padding:16px 16px 10px;margin-bottom:12px;">
                    <div class="flex" style="gap:10px;flex-wrap:wrap;align-items:center;">
                        <div class="search-container" style="width:320px;max-width:100%;">
                            <i data-lucide="search" class="search-icon"></i>
                            <input id="sa-q" class="search-input" placeholder="Cari nama toko / owner / email..." value="${this.escape(this.state.q)}">
                        </div>
                        <select id="sa-status" class="search-input" style="width:180px;padding-left:12px;">
                            <option value="all" ${this.state.status === 'all' ? 'selected' : ''}>Semua Status</option>
                            <option value="active" ${this.state.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="suspended" ${this.state.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                            <option value="deleted" ${this.state.status === 'deleted' ? 'selected' : ''}>Deleted</option>
                        </select>
                        <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);">
                            <input id="sa-include-deleted" type="checkbox" ${this.state.includeDeleted ? 'checked' : ''}>
                            Tampilkan deleted
                        </label>
                        <button id="sa-refresh" class="btn btn-outline btn-sm" style="gap:6px;">
                            <i data-lucide="refresh-cw" style="width:15px;height:15px;"></i>
                            Refresh
                        </button>
                        <div style="margin-left:auto;font-size:12px;color:var(--text-muted);">
                            ${loading ? 'Memuat...' : `${rows.length} toko`}
                        </div>
                    </div>
                </div>

                <div class="card" style="padding:0;overflow:hidden;">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nama Toko</th>
                                    <th class="table-hide-mobile">Owner</th>
                                    <th class="table-hide-mobile">Email</th>
                                    <th>Status</th>
                                    <th style="text-align:right;">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows.length ? rows.map(r => this.renderRow(r)).join('') : `
                                    <tr><td colspan="5" style="padding:18px;color:var(--text-muted);font-size:13px;">Tidak ada data</td></tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    renderRow(r) {
        const status = (r.status || 'active');
        const badge = status === 'active'
            ? `<span style="font-size:11px;font-weight:800;padding:2px 10px;border-radius:999px;background:#dcfce7;color:#16a34a;">ACTIVE</span>`
            : status === 'suspended'
                ? `<span style="font-size:11px;font-weight:800;padding:2px 10px;border-radius:999px;background:#fee2e2;color:#ef4444;">SUSPENDED</span>`
                : `<span style="font-size:11px;font-weight:800;padding:2px 10px;border-radius:999px;background:#e2e8f0;color:#334155;">DELETED</span>`;

        const actions = status === 'active'
            ? `
                <button class="btn btn-outline btn-sm" onclick="superAdminPage.setStatus('${r.id_toko}','suspended')">Suspend</button>
                <button class="btn btn-outline btn-sm btn-warning" onclick="superAdminPage.softDelete('${r.id_toko}')">Delete</button>
              `
            : status === 'suspended'
                ? `
                    <button class="btn btn-primary btn-sm" onclick="superAdminPage.setStatus('${r.id_toko}','active')">Activate</button>
                    <button class="btn btn-outline btn-sm btn-warning" onclick="superAdminPage.softDelete('${r.id_toko}')">Delete</button>
                  `
                : `
                    <button class="btn btn-primary btn-sm" onclick="superAdminPage.setStatus('${r.id_toko}','active')">Restore</button>
                  `;

        return `
            <tr>
                <td style="font-weight:800;">
                    <div style="display:flex;flex-direction:column;gap:2px;">
                        <span>${this.escape(r.nama_toko || '-')}</span>
                        <span class="text-muted" style="font-size:11px;">${this.escape(r.id_toko)}</span>
                    </div>
                </td>
                <td class="table-hide-mobile">${this.escape(r.owner || '-')}</td>
                <td class="table-hide-mobile">${this.escape(r.email || '-')}</td>
                <td>${badge}</td>
                <td style="text-align:right;">
                    <div class="flex" style="justify-content:flex-end;gap:8px;flex-wrap:wrap;">
                        ${actions}
                    </div>
                </td>
            </tr>
        `;
    },

    setupLogin() {
        const form = document.getElementById('superadmin-login-form');
        if (!form) return;
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('sa-login-btn');
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Masuk...';
            }
            try {
                const username = document.getElementById('sa-username').value.trim();
                const password = document.getElementById('sa-password').value;
                const token = await window.superAdminAPI.login(username, password);
                window.superAdminStore.setToken(token);
                window.appStore.setPage('superadmin');
                showToast('Login superadmin berhasil', 'success');
            } catch (err) {
                console.error(err);
                showToast(err.message || 'Login gagal', 'error');
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Masuk';
                }
            }
        };
    },

    setupPanel() {
        const q = document.getElementById('sa-q');
        const status = document.getElementById('sa-status');
        const includeDeleted = document.getElementById('sa-include-deleted');
        const refresh = document.getElementById('sa-refresh');

        if (status) status.onchange = () => { this.state.status = status.value; this.load(); };
        if (includeDeleted) includeDeleted.onchange = () => { this.state.includeDeleted = includeDeleted.checked; this.load(); };
        if (refresh) refresh.onclick = () => this.load();

        if (q) {
            let t = null;
            q.oninput = () => {
                this.state.q = q.value;
                if (t) clearTimeout(t);
                t = setTimeout(() => this.load(), 350);
            };
        }
    },

    async load() {
        if (this._loadingRequest) return;
        this._loadingRequest = true;
        this.state.loading = true;
        this.render({ skipLoad: true });
        try {
            const rows = await window.superAdminAPI.listStores({
                q: this.state.q,
                status: this.state.status,
                includeDeleted: this.state.includeDeleted
            });
            this.state.rows = rows;
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Gagal memuat data', 'error');
            this.state.rows = [];
        } finally {
            this.state.loading = false;
            this._loadingRequest = false;
            this.render({ skipLoad: true });
        }
    },

    async setStatus(id_toko, status) {
        try {
            await window.superAdminAPI.updateStoreStatus(id_toko, status);
            showToast('Status toko diperbarui', 'success');
            await this.load();
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Gagal mengubah status', 'error');
        }
    },

    async softDelete(id_toko) {
        try {
            const ok = confirm('Hapus toko ini? Data tidak akan dihapus permanen, tapi status akan menjadi deleted.');
            if (!ok) return;
            await window.superAdminAPI.softDeleteStore(id_toko);
            showToast('Toko dihapus (soft delete)', 'success');
            await this.load();
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Gagal menghapus toko', 'error');
        }
    },

    logout() {
        window.superAdminStore.logout();
        window.appStore.setPage('dashboard');
        showToast('Logout superadmin', 'info');
        this.render();
    },

    escape(v) {
        return String(v ?? '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
    }
};

window.superAdminPage = superAdminPage;
