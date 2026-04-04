const superAdminPage = {
    state: {
        loading: false,
        q: '',
        status: 'all',
        includeDeleted: false,
        rows: [],
        page: 1,
        perPage: 10,
        subTab: 'stores',
        payStatus: 'submitted',
        payRows: []
    },
    _initialized: false,
    _loadingRequest: false,
    _modalOpen: false,

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
        const subTab = this.state.subTab || 'stores';
        const tabBtn = (id, label) => `
            <button class="btn btn-sm ${subTab === id ? 'btn-primary' : 'btn-outline'}" style="height:36px;${subTab === id ? 'background:#1e1b4b;border-color:#1e1b4b;' : ''}"
                onclick="superAdminPage.switchSubTab('${id}')">${label}</button>
        `;

        const tabs = `
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
                ${tabBtn('stores', 'Toko')}
                ${tabBtn('payments', 'Pembayaran')}
            </div>
        `;

        const rows = this.state.rows || [];
        const page = Math.max(1, parseInt(this.state.page || 1, 10));
        const perPage = Math.max(5, parseInt(this.state.perPage || 10, 10));
        const total = rows.length;
        const totalPages = Math.max(1, Math.ceil(total / perPage));
        const safePage = Math.min(page, totalPages);
        const start = (safePage - 1) * perPage;
        const end = Math.min(total, start + perPage);
        const pageRows = rows.slice(start, end);
        const loading = this.state.loading;
        if (subTab === 'payments') {
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
                    ${tabs}
                    ${this.renderPayments()}
                </div>
            `;
        }

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
                ${tabs}

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
                        <select id="sa-perpage" class="search-input" style="width:120px;padding-left:12px;">
                            <option value="10" ${perPage === 10 ? 'selected' : ''}>10 / halaman</option>
                            <option value="25" ${perPage === 25 ? 'selected' : ''}>25 / halaman</option>
                            <option value="50" ${perPage === 50 ? 'selected' : ''}>50 / halaman</option>
                        </select>
                        <button id="sa-export" class="btn btn-outline btn-sm" style="gap:6px;">
                            <i data-lucide="download" style="width:15px;height:15px;"></i>
                            Export CSV
                        </button>
                        <div style="margin-left:auto;font-size:12px;color:var(--text-muted);">
                            ${loading ? 'Memuat...' : `Menampilkan ${total ? (start + 1) : 0}-${end} dari ${total} toko`}
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
                                    <th class="table-hide-mobile">No HP</th>
                                    <th class="table-hide-mobile">Dibuat</th>
                                    <th>Status</th>
                                    <th style="text-align:right;">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pageRows.length ? pageRows.map(r => this.renderRow(r)).join('') : `
                                    <tr><td colspan="7" style="padding:18px;color:var(--text-muted);font-size:13px;">Tidak ada data</td></tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style="display:flex;justify-content:flex-end;margin-top:12px;">
                    <div class="pagination">
                        <button class="btn btn-outline btn-sm" ${safePage <= 1 ? 'disabled' : ''} onclick="superAdminPage.setPage(${safePage - 1})">Prev</button>
                        <div style="min-width:110px;text-align:center;font-size:13px;color:var(--text-muted);padding:8px 10px;">
                            Hal ${safePage} / ${totalPages}
                        </div>
                        <button class="btn btn-outline btn-sm" ${safePage >= totalPages ? 'disabled' : ''} onclick="superAdminPage.setPage(${safePage + 1})">Next</button>
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
                <button class="btn btn-outline btn-sm" onclick="superAdminPage.showDetail('${r.id_toko}')">Detail</button>
                <button class="btn btn-outline btn-sm" onclick="superAdminPage.setStatus('${r.id_toko}','suspended')">Suspend</button>
                <button class="btn btn-outline btn-sm btn-warning" onclick="superAdminPage.softDelete('${r.id_toko}')">Delete</button>
              `
            : status === 'suspended'
                ? `
                    <button class="btn btn-outline btn-sm" onclick="superAdminPage.showDetail('${r.id_toko}')">Detail</button>
                    <button class="btn btn-primary btn-sm" onclick="superAdminPage.setStatus('${r.id_toko}','active')">Activate</button>
                    <button class="btn btn-outline btn-sm btn-warning" onclick="superAdminPage.softDelete('${r.id_toko}')">Delete</button>
                  `
                : `
                    <button class="btn btn-outline btn-sm" onclick="superAdminPage.showDetail('${r.id_toko}')">Detail</button>
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
                <td class="table-hide-mobile">${this.escape(r.no_tlp || '-')}</td>
                <td class="table-hide-mobile">${this.escape(this.formatDate(r.created_at))}</td>
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

    renderPayments() {
        const loading = this.state.loading;
        const rows = this.state.payRows || [];
        const status = this.state.payStatus || 'submitted';
        return `
            <div class="card" style="padding:16px 16px 10px;margin-bottom:12px;">
                <div class="flex" style="gap:10px;flex-wrap:wrap;align-items:center;">
                    <select id="sa-pay-status" class="search-input" style="width:200px;padding-left:12px;">
                        <option value="submitted" ${status === 'submitted' ? 'selected' : ''}>Submitted</option>
                        <option value="approved" ${status === 'approved' ? 'selected' : ''}>Approved</option>
                        <option value="rejected" ${status === 'rejected' ? 'selected' : ''}>Rejected</option>
                        <option value="all" ${status === 'all' ? 'selected' : ''}>All</option>
                    </select>
                    <button id="sa-pay-refresh" class="btn btn-outline btn-sm" style="gap:6px;">
                        <i data-lucide="refresh-cw" style="width:15px;height:15px;"></i>
                        Refresh
                    </button>
                    <div style="margin-left:auto;font-size:12px;color:var(--text-muted);">
                        ${loading ? 'Memuat...' : `${rows.length} pembayaran`}
                    </div>
                </div>
            </div>

            <div class="card" style="padding:0;overflow:hidden;">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nama Toko</th>
                                <th class="table-hide-mobile">Paket</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th style="text-align:right;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.length ? rows.map(r => this.renderPaymentRow(r)).join('') : `
                                <tr><td colspan="6" style="padding:18px;color:var(--text-muted);font-size:13px;">Tidak ada data</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderPaymentRow(r) {
        const badge = (s) => {
            const v = String(s || 'pending').toLowerCase();
            if (v === 'approved') return `<span style="font-size:11px;font-weight:800;padding:2px 10px;border-radius:999px;background:#dcfce7;color:#16a34a;">APPROVED</span>`;
            if (v === 'rejected') return `<span style="font-size:11px;font-weight:800;padding:2px 10px;border-radius:999px;background:#fee2e2;color:#ef4444;">REJECTED</span>`;
            return `<span style="font-size:11px;font-weight:800;padding:2px 10px;border-radius:999px;background:#e0e7ff;color:#4f46e5;">SUBMITTED</span>`;
        };

        const total = r.total_amount ? `Rp ${Number(r.total_amount).toLocaleString('id-ID')}` : '-';
        const plan = r.plan === 'monthly' ? '1 Bulan' : r.plan === 'yearly' ? '1 Tahun' : (r.plan || '-');

        const actions = String(r.status || '').toLowerCase() === 'submitted'
            ? `
                <button class="btn btn-primary btn-sm" onclick="superAdminPage.approvePayment(${r.id})" style="background:#1e1b4b;border-color:#1e1b4b;">Approve</button>
                <button class="btn btn-outline btn-sm btn-warning" onclick="superAdminPage.rejectPayment(${r.id})">Reject</button>
              `
            : `
                <button class="btn btn-outline btn-sm" onclick="superAdminPage.viewPayment(${r.id})">Detail</button>
              `;

        return `
            <tr>
                <td style="font-weight:900;">REQ-${this.escape(r.id)}</td>
                <td>
                    <div style="display:flex;flex-direction:column;gap:2px;">
                        <span style="font-weight:900;">${this.escape(r.toko_name || '-')}</span>
                        <span class="text-muted" style="font-size:11px;">${this.escape(r.id_toko || '')}</span>
                    </div>
                </td>
                <td class="table-hide-mobile">${this.escape(plan)}</td>
                <td style="font-weight:900;">${this.escape(total)}</td>
                <td>${badge(r.status)}</td>
                <td style="text-align:right;">
                    <div class="flex" style="justify-content:flex-end;gap:8px;flex-wrap:wrap;">
                        ${actions}
                    </div>
                </td>
            </tr>
        `;
    },

    setupPanel() {
        const q = document.getElementById('sa-q');
        const status = document.getElementById('sa-status');
        const includeDeleted = document.getElementById('sa-include-deleted');
        const refresh = document.getElementById('sa-refresh');
        const perpage = document.getElementById('sa-perpage');
        const exportBtn = document.getElementById('sa-export');
        const payStatus = document.getElementById('sa-pay-status');
        const payRefresh = document.getElementById('sa-pay-refresh');

        if (status) status.onchange = () => { this.state.status = status.value; this.state.page = 1; this.load(); };
        if (includeDeleted) includeDeleted.onchange = () => { this.state.includeDeleted = includeDeleted.checked; this.state.page = 1; this.load(); };
        if (refresh) refresh.onclick = () => this.load();
        if (perpage) perpage.onchange = () => { this.state.perPage = parseInt(perpage.value, 10) || 10; this.state.page = 1; this.render({ skipLoad: true }); };
        if (exportBtn) exportBtn.onclick = () => this.exportCsv();

        if (payStatus) payStatus.onchange = () => { this.state.payStatus = payStatus.value; this.loadPayments(); };
        if (payRefresh) payRefresh.onclick = () => this.loadPayments();

        if (q) {
            let t = null;
            q.oninput = () => {
                this.state.q = q.value;
                if (t) clearTimeout(t);
                t = setTimeout(() => { this.state.page = 1; this.load(); }, 350);
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

    async loadPayments() {
        if (this._loadingRequest) return;
        this._loadingRequest = true;
        this.state.loading = true;
        this.render({ skipLoad: true });
        try {
            const rows = await window.superAdminAPI.listSubscriptionRequests({ status: this.state.payStatus, limit: 100 });
            this.state.payRows = rows;
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Gagal memuat pembayaran', 'error');
            this.state.payRows = [];
        } finally {
            this.state.loading = false;
            this._loadingRequest = false;
            this.render({ skipLoad: true });
        }
    },

    switchSubTab(tab) {
        this.state.subTab = tab;
        this.render({ skipLoad: true });
        if (tab === 'payments') this.loadPayments();
    },

    async approvePayment(id) {
        const note = await this.promptReason('Approve', 'Catatan admin (opsional):');
        if (note === null) return;
        try {
            await window.superAdminAPI.decideSubscriptionRequest(String(id), 'approve', note || '');
            showToast('Pembayaran di-approve. Langganan aktif.', 'success');
            await this.loadPayments();
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Gagal approve', 'error');
        }
    },

    async rejectPayment(id) {
        const note = await this.promptReason('Reject', 'Alasan reject (opsional):');
        if (note === null) return;
        try {
            await window.superAdminAPI.decideSubscriptionRequest(String(id), 'reject', note || '');
            showToast('Pembayaran di-reject', 'success');
            await this.loadPayments();
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Gagal reject', 'error');
        }
    },

    viewPayment(id) {
        const row = (this.state.payRows || []).find(x => String(x.id) === String(id));
        if (!row) return;
        const total = row.total_amount ? `Rp ${Number(row.total_amount).toLocaleString('id-ID')}` : '-';
        const plan = row.plan === 'monthly' ? '1 Bulan' : row.plan === 'yearly' ? '1 Tahun' : (row.plan || '-');
        const lines = [
            `REQ-${row.id}`,
            `Nama Toko: ${row.toko_name || '-'}`,
            `ID Toko: ${row.id_toko || '-'}`,
            `Paket: ${plan}`,
            `Total: ${total}`,
            `Nama Pengirim: ${row.transfer_name || '-'}`,
            `Tanggal Transfer: ${row.transfer_date || '-'}`,
            `Status: ${row.status || '-'}`,
            row.admin_note ? `Catatan Admin: ${row.admin_note}` : ''
        ].filter(Boolean).join('\n');
        alert(lines);
    },

    async setStatus(id_toko, status) {
        try {
            let reason = '';
            if (status === 'suspended') {
                reason = await this.promptReason('Suspend', 'Masukkan alasan suspend (opsional):');
                if (reason === null) return;
            }
            await window.superAdminAPI.updateStoreStatus(id_toko, status, reason || '');
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
            const reason = await this.promptReason('Delete', 'Masukkan alasan delete (opsional):');
            if (reason === null) return;
            await window.superAdminAPI.softDeleteStore(id_toko, reason || '');
            showToast('Toko dihapus (soft delete)', 'success');
            await this.load();
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Gagal menghapus toko', 'error');
        }
    },

    setPage(page) {
        this.state.page = Math.max(1, parseInt(page, 10) || 1);
        this.render({ skipLoad: true });
    },

    exportCsv() {
        const rows = this.state.rows || [];
        const header = ['id_toko', 'nama_toko', 'owner', 'email', 'no_tlp', 'status', 'created_at'];
        const csvEscape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const lines = [
            header.join(','),
            ...rows.map(r => header.map(k => csvEscape(r[k])).join(','))
        ];
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zinpos_stores_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    },

    async showDetail(id_toko) {
        if (this._modalOpen) return;
        this._modalOpen = true;
        const row = (this.state.rows || []).find(x => String(x.id_toko) === String(id_toko));
        const logs = await (window.superAdminAPI?.getLogs ? window.superAdminAPI.getLogs(id_toko, 30).catch(() => []) : Promise.resolve([]));

        const modal = document.createElement('div');
        modal.id = 'sa-modal';
        modal.style.position = 'fixed';
        modal.style.inset = '0';
        modal.style.background = 'rgba(15,23,42,.55)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.padding = '18px';
        modal.innerHTML = `
            <div class="card" style="width:100%;max-width:900px;max-height:85dvh;overflow:auto;padding:18px;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;">
                    <div>
                        <div style="font-weight:900;font-size:16px;">Detail Toko</div>
                        <div class="text-muted" style="font-size:12px;">${this.escape(id_toko)}</div>
                    </div>
                    <button class="btn btn-outline btn-sm" id="sa-modal-close">Tutup</button>
                </div>
                <div class="card" style="padding:14px;margin-bottom:12px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        <div><div class="text-muted" style="font-size:11px;">Nama Toko</div><div style="font-weight:800;">${this.escape(row?.nama_toko || '-')}</div></div>
                        <div><div class="text-muted" style="font-size:11px;">Status</div><div style="font-weight:800;">${this.escape(row?.status || 'active')}</div></div>
                        <div><div class="text-muted" style="font-size:11px;">Owner</div><div style="font-weight:800;">${this.escape(row?.owner || '-')}</div></div>
                        <div><div class="text-muted" style="font-size:11px;">Email</div><div style="font-weight:800;">${this.escape(row?.email || '-')}</div></div>
                        <div><div class="text-muted" style="font-size:11px;">No HP</div><div style="font-weight:800;">${this.escape(row?.no_tlp || '-')}</div></div>
                        <div><div class="text-muted" style="font-size:11px;">Dibuat</div><div style="font-weight:800;">${this.escape(this.formatDate(row?.created_at))}</div></div>
                    </div>
                </div>
                <div class="card" style="padding:0;overflow:hidden;">
                    <div style="padding:12px 14px;border-bottom:1px solid var(--border);font-weight:900;">Audit Log</div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Waktu</th>
                                    <th>Aksi</th>
                                    <th>Dari</th>
                                    <th>Ke</th>
                                    <th>Alasan</th>
                                    <th>Oleh</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(logs && logs.length) ? logs.map(l => `
                                    <tr>
                                        <td>${this.escape(this.formatDate(l.created_at))}</td>
                                        <td style="font-weight:800;">${this.escape(l.action || '-')}</td>
                                        <td>${this.escape(l.from_status || '-')}</td>
                                        <td>${this.escape(l.to_status || '-')}</td>
                                        <td>${this.escape(l.reason || '-')}</td>
                                        <td>${this.escape(l.performed_by || '-')}</td>
                                    </tr>
                                `).join('') : `<tr><td colspan="6" style="padding:14px;color:var(--text-muted);font-size:13px;">Belum ada log</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const close = () => {
            modal.remove();
            this._modalOpen = false;
        };
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
        const btn = document.getElementById('sa-modal-close');
        if (btn) btn.onclick = close;
    },

    promptReason(title, label) {
        if (this._modalOpen) return Promise.resolve(null);
        this._modalOpen = true;
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.id = 'sa-reason-modal';
            modal.style.position = 'fixed';
            modal.style.inset = '0';
            modal.style.background = 'rgba(15,23,42,.55)';
            modal.style.zIndex = '9999';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.padding = '18px';
            modal.innerHTML = `
                <div class="card" style="width:100%;max-width:520px;padding:18px;">
                    <div style="font-weight:900;font-size:16px;margin-bottom:6px;">${this.escape(title)}</div>
                    <div class="text-muted" style="font-size:13px;margin-bottom:10px;">${this.escape(label)}</div>
                    <textarea id="sa-reason-input" class="search-input" style="min-height:90px;padding:12px 14px;line-height:1.5;resize:vertical;"></textarea>
                    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:12px;">
                        <button class="btn btn-outline btn-sm" id="sa-reason-cancel">Batal</button>
                        <button class="btn btn-primary btn-sm" id="sa-reason-ok">Simpan</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const cleanup = () => {
                modal.remove();
                this._modalOpen = false;
            };
            modal.addEventListener('click', (e) => { if (e.target === modal) { cleanup(); resolve(null); } });
            const cancel = document.getElementById('sa-reason-cancel');
            const ok = document.getElementById('sa-reason-ok');
            const input = document.getElementById('sa-reason-input');
            if (cancel) cancel.onclick = () => { cleanup(); resolve(null); };
            if (ok) ok.onclick = () => { const v = input ? String(input.value || '').trim() : ''; cleanup(); resolve(v); };
            if (input) input.focus();
        });
    },

    formatDate(v) {
        if (!v) return '';
        try {
            const d = new Date(v);
            if (Number.isNaN(d.getTime())) return String(v);
            return d.toLocaleString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        } catch (_) {
            return String(v);
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
