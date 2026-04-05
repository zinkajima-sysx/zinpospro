const subscribePage = {
    state: {
        step: 'plan',
        plan: null,
        loading: false,
        transfer_name: '',
        transfer_date: '',
        requestData: null,
        statusData: null
    },

    getIdToko() {
        const idFromAuth = window.authStore?.state?.id_toko;
        if (idFromAuth) return idFromAuth;
        try {
            const raw = localStorage.getItem('zinpos_last_registered');
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed?.id_toko || null;
        } catch (_) {
            return null;
        }
    },

    render() {
        const main = document.getElementById('main-content');
        if (main) {
            main.innerHTML = this.renderContent();
            this.bind();
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        const app = document.getElementById('app');
        if (!app) return;
        app.innerHTML = `
            <div style="min-height:100dvh;background:var(--bg-main);display:flex;align-items:center;justify-content:center;padding:24px;">
                <div style="width:100%;max-width:820px;">
                    ${this.renderContent()}
                </div>
            </div>
        `;
        this.bind();
        if (window.lucide) window.lucide.createIcons();
    },

    renderContent() {
        const id_toko = this.getIdToko();
        if (!id_toko) {
            return `
                <div class="card" style="padding:22px;">
                    <h2 style="font-size:18px;font-weight:900;margin-bottom:8px;">Berlangganan</h2>
                    <p class="text-muted" style="font-size:13px;line-height:1.7;margin:0;">
                        ID toko tidak ditemukan. Silakan login terlebih dahulu atau daftar toko baru.
                    </p>
                </div>
            `;
        }

        const billing = window.CONFIG?.BILLING || {};
        const bankName = billing.bankName || '-';
        const bankAccount = billing.bankAccount || '-';
        const bankHolder = billing.bankHolder || '-';
        const billingEmail = billing.email || '';

        const status = this.state.statusData?.toko?.subscription_status || window.authStore?.state?.storeProfile?.subscription_status || '';
        const paidUntil = this.state.statusData?.toko?.paid_until || window.authStore?.state?.storeProfile?.paid_until || '';
        const isActive = this.isActiveSubscription(status, paidUntil);

        const header = `
            <div class="flex-between" style="margin-bottom:14px;flex-wrap:wrap;gap:10px;">
                <div>
                    <h1 style="font-size:22px;font-weight:900;margin-bottom:2px;">Berlangganan</h1>
                    <p class="text-muted" style="font-size:13px;">Aktifkan paket agar bisa menggunakan aplikasi</p>
                </div>
                <div style="font-size:12px;color:var(--text-muted);">
                    ID Toko: <span style="font-weight:800;color:var(--text);">${this.escape(id_toko)}</span>
                </div>
            </div>
        `;

        if (isActive) {
            return `
                ${header}
                <div class="card" style="padding:22px;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                        <div style="width:44px;height:44px;border-radius:14px;background:#dcfce7;display:flex;align-items:center;justify-content:center;">
                            <i data-lucide="check-circle" style="width:22px;height:22px;color:#16a34a;"></i>
                        </div>
                        <div>
                            <div style="font-weight:900;">Langganan Aktif</div>
                            <div class="text-muted" style="font-size:12px;">Berlaku sampai: ${this.escape(this.formatDate(paidUntil) || '-')}</div>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="height:44px;background:#1e1b4b;border-color:#1e1b4b;" onclick="appStore.setPage('dashboard')">Masuk Dashboard</button>
                </div>
            `;
        }

        const currentStep = this.state.step;
        const stepUi = currentStep === 'plan'
            ? this.renderPlanStep()
            : currentStep === 'transfer'
                ? this.renderTransferStep({ bankName, bankAccount, bankHolder, billingEmail })
                : this.renderWaitingStep({ bankName, bankAccount, bankHolder, billingEmail });

        return `
            ${header}
            ${stepUi}
        `;
    },

    renderPlanStep() {
        return `
            <div class="card" style="padding:22px;margin-bottom:12px;">
                <h2 style="font-size:16px;font-weight:900;margin-bottom:10px;">Pilih Paket</h2>
                <div class="grid grid-cols-2" style="gap:12px;">
                    <div class="card" style="padding:16px;border:1px solid var(--border);">
                        <div style="font-weight:900;font-size:14px;margin-bottom:6px;">1 Bulan</div>
                        <div class="text-muted" style="font-size:12px;margin-bottom:10px;">Rp 65.000 / bulan</div>
                        <button class="btn btn-primary btn-sm" style="background:#1e1b4b;border-color:#1e1b4b;" onclick="subscribePage.choosePlan('monthly')">Pilih</button>
                    </div>
                    <div class="card" style="padding:16px;border:1px solid var(--border);">
                        <div style="font-weight:900;font-size:14px;margin-bottom:6px;">1 Tahun</div>
                        <div class="text-muted" style="font-size:12px;margin-bottom:10px;">Rp 500.000 / tahun</div>
                        <button class="btn btn-primary btn-sm" style="background:#1e1b4b;border-color:#1e1b4b;" onclick="subscribePage.choosePlan('yearly')">Pilih</button>
                    </div>
                </div>
                <div style="margin-top:12px;font-size:12px;color:var(--text-muted);line-height:1.7;">
                    Setelah transfer, kirim bukti transfer via email agar kami bisa mengaktifkan akun Anda.
                </div>
            </div>
        `;
    },

    renderTransferStep({ bankName, bankAccount, bankHolder, billingEmail }) {
        const plan = this.state.plan;
        const amount = plan === 'monthly' ? 65000 : 500000;
        return `
            <div class="card" style="padding:22px;margin-bottom:12px;">
                <div class="flex-between" style="gap:10px;flex-wrap:wrap;margin-bottom:12px;">
                    <div>
                        <div style="font-weight:900;">Instruksi Transfer</div>
                        <div class="text-muted" style="font-size:12px;">Paket: ${plan === 'monthly' ? '1 Bulan' : '1 Tahun'} (Rp ${amount.toLocaleString('id-ID')})</div>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="subscribePage.backToPlan()">Ganti Paket</button>
                </div>

                <div class="card" style="padding:14px;margin-bottom:12px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        <div>
                            <div class="text-muted" style="font-size:11px;">Bank</div>
                            <div style="font-weight:900;">${this.escape(bankName)}</div>
                        </div>
                        <div>
                            <div class="text-muted" style="font-size:11px;">No. Rekening</div>
                            <div style="font-weight:900;">${this.escape(bankAccount)}</div>
                        </div>
                        <div>
                            <div class="text-muted" style="font-size:11px;">Atas Nama</div>
                            <div style="font-weight:900;">${this.escape(bankHolder)}</div>
                        </div>
                        <div>
                            <div class="text-muted" style="font-size:11px;">Email Bukti Transfer</div>
                            <div style="font-weight:900;">${this.escape(billingEmail || '-')}</div>
                        </div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label style="font-size:12px;font-weight:800;color:var(--text-muted);letter-spacing:.06em;">NAMA PENGIRIM (WAJIB)</label>
                        <input id="sub-transfer-name" type="text" class="search-input" style="padding-left:14px;margin-top:6px;" value="${this.escape(this.state.transfer_name)}" placeholder="Nama di rekening pengirim" required>
                    </div>
                    <div class="form-group">
                        <label style="font-size:12px;font-weight:800;color:var(--text-muted);letter-spacing:.06em;">TANGGAL TRANSFER (WAJIB)</label>
                        <input id="sub-transfer-date" type="date" class="search-input" style="padding-left:14px;margin-top:6px;" value="${this.escape(this.state.transfer_date)}" required>
                    </div>
                </div>

                <div class="form-group" style="margin-top:12px;">
                    <label style="font-size:12px;font-weight:800;color:var(--text-muted);letter-spacing:.06em;">BUKTI TRANSFER (WAJIB)</label>
                    <input id="sub-proof" type="file" class="search-input" style="padding:10px 14px;margin-top:6px;height:auto;" accept="image/*,application/pdf" required>
                    <div class="text-muted" style="font-size:12px;margin-top:8px;line-height:1.6;">
                        Format: JPG/PNG/PDF, maks 2.5MB.
                    </div>
                </div>

                <button id="sub-create-btn" class="btn btn-primary" style="margin-top:14px;height:46px;background:#1e1b4b;border-color:#1e1b4b;width:100%;">
                    Saya Sudah Transfer (Kirim Bukti)
                </button>
            </div>
        `;
    },

    renderWaitingStep({ bankName, bankAccount, bankHolder, billingEmail }) {
        const d = this.state.requestData;
        const lastReq = this.state.statusData?.last_request;
        const req = d || lastReq;
        const total = req?.total_amount;
        const plan = req?.plan || this.state.plan;
        const proofUrl = req?.proof_url || '';

        return `
            <div class="card" style="padding:22px;margin-bottom:12px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                    <div style="width:44px;height:44px;border-radius:14px;background:#e0e7ff;display:flex;align-items:center;justify-content:center;">
                        <i data-lucide="clock" style="width:22px;height:22px;color:#4f46e5;"></i>
                    </div>
                    <div>
                        <div style="font-weight:900;">Menunggu Verifikasi</div>
                        <div class="text-muted" style="font-size:12px;">Kami akan mengaktifkan akun setelah bukti transfer diverifikasi</div>
                    </div>
                </div>

                <div class="card" style="padding:14px;margin-bottom:12px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        <div>
                            <div class="text-muted" style="font-size:11px;">Paket</div>
                            <div style="font-weight:900;">${plan === 'monthly' ? '1 Bulan' : plan === 'yearly' ? '1 Tahun' : '-'}</div>
                        </div>
                        <div>
                            <div class="text-muted" style="font-size:11px;">Nominal</div>
                            <div style="font-weight:900;">${total ? `Rp ${Number(total).toLocaleString('id-ID')}` : '-'}</div>
                        </div>
                        <div>
                            <div class="text-muted" style="font-size:11px;">Rekening Tujuan</div>
                            <div style="font-weight:900;">${this.escape([bankName, bankAccount, bankHolder].filter(Boolean).join(' | ') || '-')}</div>
                        </div>
                        <div>
                            <div class="text-muted" style="font-size:11px;">Email Bukti Transfer</div>
                            <div style="font-weight:900;">${this.escape(billingEmail || '-')}</div>
                        </div>
                    </div>
                </div>

                <div class="card" style="padding:14px;margin-bottom:12px;">
                    <div style="font-weight:900;margin-bottom:6px;">Bukti Transfer</div>
                    <div class="text-muted" style="font-size:12px;line-height:1.7;">
                        Bukti transfer sudah tersimpan di sistem. Untuk backup, Anda juga bisa mengirim email bukti transfer.
                        Jika email tidak masuk, admin tetap bisa cek bukti di panel Super Admin.
                    </div>
                    ${proofUrl ? `
                        <div style="margin-top:10px;">
                            <a class="btn btn-outline btn-sm" href="${this.escape(proofUrl)}" target="_blank" rel="noopener noreferrer">Lihat Bukti</a>
                        </div>
                    ` : ``}
                </div>

                <div class="flex" style="gap:10px;flex-wrap:wrap;">
                    ${req?.mailto ? `
                        <a class="btn btn-primary" style="height:44px;background:#1e1b4b;border-color:#1e1b4b;" href="${req.mailto}">
                            Buka Email Bukti
                        </a>
                    ` : `
                        <button class="btn btn-outline" style="height:44px;" onclick="subscribePage.copyBillingEmail()">Salin Email Admin</button>
                    `}
                    <button class="btn btn-outline" style="height:44px;" onclick="subscribePage.refreshStatus()">Refresh Status</button>
                </div>
            </div>
        `;
    },

    bind() {
        const btn = document.getElementById('sub-create-btn');
        if (btn) {
            btn.onclick = () => this.createRequest();
        }
        const proof = document.getElementById('sub-proof');
        if (proof) {
            proof.onchange = () => {
                const f = proof.files && proof.files[0] ? proof.files[0] : null;
                this.state.proofFile = f || null;
            };
        }
    },

    choosePlan(plan) {
        this.state.plan = plan;
        this.state.step = 'transfer';
        this.state.requestData = null;
        this.render();
    },

    backToPlan() {
        this.state.step = 'plan';
        this.state.plan = null;
        this.state.requestData = null;
        this.render();
    },

    async createRequest() {
        if (this.state.loading) return;
        const id_toko = this.getIdToko();
        if (!id_toko) {
            showToast('ID toko tidak ditemukan', 'error');
            return;
        }
        const plan = this.state.plan;
        if (!plan) {
            showToast('Pilih paket terlebih dahulu', 'warning');
            return;
        }

        const tn = document.getElementById('sub-transfer-name');
        const td = document.getElementById('sub-transfer-date');
        this.state.transfer_name = tn ? String(tn.value || '').trim() : '';
        this.state.transfer_date = td ? String(td.value || '').trim() : '';
        const proofInput = document.getElementById('sub-proof');
        const proofFile = (proofInput && proofInput.files && proofInput.files[0]) ? proofInput.files[0] : (this.state.proofFile || null);

        if (!this.state.transfer_name) {
            showToast('Nama pengirim wajib diisi', 'warning');
            return;
        }
        if (!this.state.transfer_date) {
            showToast('Tanggal transfer wajib diisi', 'warning');
            return;
        }
        if (!proofFile) {
            showToast('Bukti transfer wajib diunggah', 'warning');
            return;
        }
        if (proofFile.size > 2_500_000) {
            showToast('Ukuran bukti transfer terlalu besar (maks 2.5MB)', 'warning');
            return;
        }

        this.state.loading = true;
        const btn = document.getElementById('sub-create-btn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Memproses...';
        }

        try {
            const proofDataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ''));
                reader.onerror = () => reject(new Error('Gagal membaca file bukti transfer'));
                reader.readAsDataURL(proofFile);
            });

            const res = await fetch('/api/subscription/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_toko,
                    plan,
                    transfer_name: this.state.transfer_name,
                    transfer_date: this.state.transfer_date,
                    proof_base64: proofDataUrl,
                    proof_mime: proofFile.type || ''
                })
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error || 'Gagal membuat permintaan pembayaran');
            this.state.requestData = json.data;
            this.state.step = 'waiting';
            showToast('Permintaan pembayaran dibuat. Bukti sudah terkirim ke sistem.', 'success');
            this.render();
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Gagal memproses', 'error');
        } finally {
            this.state.loading = false;
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Saya Sudah Transfer (Kirim Bukti)';
            }
        }
    },

    async refreshStatus() {
        const id_toko = this.getIdToko();
        if (!id_toko) return;
        try {
            const res = await fetch(`/api/subscription/status?id_toko=${encodeURIComponent(id_toko)}`, { cache: 'no-store' });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error || 'Gagal memuat status');
            this.state.statusData = json.data;
            const status = json.data?.toko?.subscription_status || '';
            const paidUntil = json.data?.toko?.paid_until || '';
            if (this.isActiveSubscription(status, paidUntil)) {
                showToast('Langganan aktif. Selamat datang!', 'success');
                if (window.authStore?.state?.user) window.appStore.setPage('dashboard');
            } else {
                showToast('Status belum aktif. Menunggu verifikasi admin.', 'info');
            }
            this.render();
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Gagal memuat status', 'error');
        }
    },

    copyBillingEmail() {
        const email = window.CONFIG?.BILLING?.email || '';
        if (!email) {
            showToast('Email admin belum dikonfigurasi', 'warning');
            return;
        }
        navigator.clipboard?.writeText(email);
        showToast('Email admin disalin', 'success');
    },

    isActiveSubscription(subscription_status, paid_until) {
        const status = String(subscription_status || '').toLowerCase();
        if (status !== 'active') return false;
        if (!paid_until) return true;
        const t = new Date(paid_until).getTime();
        if (Number.isNaN(t)) return false;
        return t > Date.now();
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

    escape(v) {
        return String(v ?? '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
    }
};

window.subscribePage = subscribePage;
