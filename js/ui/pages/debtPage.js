/**
 * Piutang Page - Buku Piutang / Kasbon
 */
const debtPage = {
    render() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="page-container">
                <header class="flex-between" style="margin-bottom:24px;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h1 style="font-size:24px;font-weight:700;margin-bottom:4px;">Buku Piutang / Kasbon</h1>
                        <p class="text-muted" style="font-size:13px;">Catatan hutang pelanggan.</p>
                    </div>
                    <div class="card" style="padding:14px 20px;min-width:220px;">
                        <p style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">Total Piutang Belum Lunas</p>
                        <p id="total-debt" style="font-size:20px;font-weight:700;color:var(--danger);">Rp 0</p>
                    </div>
                </header>

                <div class="search-container" style="max-width:360px;margin-bottom:20px;">
                    <i data-lucide="search" class="search-icon"></i>
                    <input type="text" id="debt-search" class="search-input" placeholder="Cari nama pelanggan..." oninput="debtPage.handleSearch()">
                </div>

                <!-- Accordion Belum Lunas -->
                <div id="debt-accordion" style="display:flex;flex-direction:column;gap:12px;margin-bottom:32px;">
                    <div style="text-align:center;padding:40px;color:var(--text-muted);">Memuat data...</div>
                </div>

                <!-- Tabel Lunas -->
                <div class="card" style="padding:24px;">
                    <h3 style="font-size:16px;font-weight:700;margin-bottom:16px;">Riwayat Piutang Lunas</h3>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Pelanggan</th>
                                    <th>Invoice</th>
                                    <th>Total Piutang</th>
                                    <th>Tanggal Lunas</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="paid-debt-body">
                                <tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted);">Memuat...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Modal Pembayaran Piutang -->
            <div id="debt-pay-modal" class="modal-container" style="display:none;">
                <div class="modal-content card" style="max-width:460px;width:92%;">
                    <div class="flex-between" style="margin-bottom:20px;">
                        <h3 style="font-size:17px;font-weight:700;">Pelunasan Piutang</h3>
                        <button class="close-btn-red" onclick="debtPage.closePayModal()">Tutup</button>
                    </div>

                    <div style="margin-bottom:16px;">
                        <p style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.07em;margin-bottom:6px;">NAMA PELANGGAN</p>
                        <div class="search-input" style="padding:12px 16px;background:var(--bg-main);font-weight:600;" id="pay-customer-name">-</div>
                    </div>

                    <div style="margin-bottom:16px;">
                        <p style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.07em;margin-bottom:6px;">SISA PIUTANG</p>
                        <div class="search-input" style="padding:12px 16px;background:var(--bg-main);font-weight:700;font-size:18px;color:var(--danger);" id="pay-sisa-display">Rp 0</div>
                    </div>

                    <div style="margin-bottom:16px;">
                        <p style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.07em;margin-bottom:6px;">JUMLAH UANG DIBAYAR (RP)</p>
                        <div style="display:flex;align-items:center;border:1px solid var(--border);border-radius:12px;overflow:hidden;">
                            <span style="padding:12px 14px;background:var(--bg-main);color:var(--text-muted);font-weight:600;border-right:1px solid var(--border);">Rp</span>
                            <input type="text" id="pay-amount-input" class="rupiah-input"
                                style="flex:1;padding:12px 16px;border:none;outline:none;font-size:16px;background:white;"
                                placeholder="0" inputmode="numeric" oninput="debtPage.calcSisaBaru()">
                        </div>
                    </div>

                    <div id="pay-sisa-baru-box" style="display:none;background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
                        <p style="font-size:11px;font-weight:700;color:#92400e;letter-spacing:.07em;margin-bottom:4px;">SISA PIUTANG BARU (BELUM LUNAS)</p>
                        <p id="pay-sisa-baru" style="font-size:18px;font-weight:700;color:var(--danger);">Rp 0</p>
                    </div>

                    <button class="btn btn-primary" style="width:100%;height:52px;font-size:15px;font-weight:700;letter-spacing:.05em;"
                        onclick="debtPage.simpanPembayaran()">
                        SIMPAN PEMBAYARAN
                    </button>
                </div>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        this.loadData();
    },

    state: { allData: [], grouped: {}, openId: null, payId: null, payMax: 0 },

    async loadData() {
        try {
            const raw = await window.receivablesAPI.getAll();
            this.state.allData = raw;

            // Grup unpaid by customer
            const grouped = {};
            raw.filter(r => r.status === 'unpaid').forEach(r => {
                const cid  = r.customer_id || 'unknown';
                const name = r.customers?.name || 'Pelanggan Tidak Dikenal';
                if (!grouped[cid]) grouped[cid] = { name, items: [] };
                grouped[cid].items.push(r);
            });
            this.state.grouped = grouped;

            this.renderAccordion(grouped);
            this.renderPaidTable(raw.filter(r => r.status === 'paid'));
            this.updateSummary();
        } catch (err) {
            console.error(err);
            document.getElementById('debt-accordion').innerHTML =
                `<p class="text-danger" style="padding:20px;">Gagal memuat data piutang</p>`;
        }
    },

    handleSearch() {
        const q = document.getElementById('debt-search').value.toLowerCase();
        const filtered = {};
        Object.entries(this.state.grouped).forEach(([cid, g]) => {
            if (g.name.toLowerCase().includes(q)) filtered[cid] = g;
        });
        this.renderAccordion(filtered);
    },

    renderAccordion(grouped) {
        const container = document.getElementById('debt-accordion');
        if (!container) return;

        const entries = Object.entries(grouped);
        if (entries.length === 0) {
            container.innerHTML = `<div class="card" style="padding:40px;text-align:center;color:var(--text-muted);">
                <p style="font-size:15px;font-weight:600;">Tidak ada piutang aktif</p>
                <p style="font-size:13px;margin-top:4px;">Piutang otomatis tercatat saat transaksi kasir dengan metode Piutang</p>
            </div>`;
            return;
        }

        container.innerHTML = entries.map(([cid, g]) => {
            const totalSisa = g.items.reduce((s, i) => s + parseFloat(i.sisa_piutang || i.jumlah_piutang), 0);
            const isOpen    = this.state.openId === cid;

            const detailRows = g.items.map(item => {
                const sisa    = parseFloat(item.sisa_piutang ?? item.jumlah_piutang);
                const tgl     = new Date(item.created_at).toLocaleDateString('id-ID');
                const hasSisa = sisa > 0;
                return `
                    <tr style="border-bottom:1px solid var(--border);font-size:13px;">
                        <td style="padding:10px 14px;">${tgl}</td>
                        <td style="padding:10px 14px;color:var(--text-muted);">${item.invoice_number || '-'}</td>
                        <td style="padding:10px 14px;font-weight:700;color:var(--danger);">
                            Rp ${sisa.toLocaleString('id-ID')}
                        </td>
                        <td style="padding:10px 14px;">
                            <span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;
                                background:#fef3c7;color:#d97706;">Belum Lunas</span>
                        </td>
                        <td style="padding:10px 14px;text-align:right;">
                            <button class="btn btn-primary btn-sm" style="font-size:12px;padding:5px 14px;"
                                onclick="debtPage.openPayModal(${item.id}, '${g.name}', ${sisa})">
                                <i data-lucide="check-circle" style="width:13px;height:13px;"></i>
                                ${hasSisa && parseFloat(item.jumlah_piutang) !== sisa ? 'Lunasi Sisa' : 'Lunasi'}
                            </button>
                        </td>
                    </tr>`;
            }).join('');

            return `
                <div class="card" style="padding:0;overflow:hidden;">
                    <div style="display:flex;align-items:center;gap:14px;padding:16px 20px;cursor:pointer;"
                        onclick="debtPage.toggleAccordion('${cid}')">
                        <div style="width:40px;height:40px;border-radius:12px;background:#eff6ff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <i data-lucide="user" style="width:20px;height:20px;color:#3b82f6;"></i>
                        </div>
                        <span style="font-weight:700;font-size:15px;flex:1;">${g.name}</span>
                        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                            <span style="background:#fef08a;color:#854d0e;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;">Ada Tunggakan</span>
                            <span style="background:var(--danger);color:white;font-size:12px;font-weight:700;padding:5px 14px;border-radius:20px;">
                                Total Piutang: Rp ${totalSisa.toLocaleString('id-ID')}
                            </span>
                            <i data-lucide="${isOpen?'chevron-up':'chevron-down'}" style="width:18px;height:18px;color:var(--text-muted);"></i>
                        </div>
                    </div>
                    <div id="acc-${cid}" style="display:${isOpen?'block':'none'};border-top:1px solid var(--border);">
                        <div style="overflow-x:auto;">
                            <table style="width:100%;border-collapse:collapse;">
                                <thead>
                                    <tr style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;background:var(--bg-main);">
                                        <th style="padding:10px 14px;text-align:left;">TANGGAL</th>
                                        <th style="padding:10px 14px;text-align:left;">INVOICE</th>
                                        <th style="padding:10px 14px;text-align:left;">SISA PIUTANG</th>
                                        <th style="padding:10px 14px;text-align:left;">STATUS</th>
                                        <th style="padding:10px 14px;text-align:right;">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody>${detailRows}</tbody>
                            </table>
                        </div>
                    </div>
                </div>`;
        }).join('');

        if (window.lucide) window.lucide.createIcons();
    },

    renderPaidTable(paidData) {
        const tbody = document.getElementById('paid-debt-body');
        if (!tbody) return;

        this._paidData = paidData;
        this._paidPage = 1;
        this._paidRows = 10;

        // Tambah rows selector jika belum ada
        const card = tbody.closest('.card');
        if (card && !card.querySelector('#paid-rows-selector')) {
            const selectorDiv = document.createElement('div');
            selectorDiv.id = 'paid-rows-selector';
            selectorDiv.style.marginBottom = '12px';
            card.insertBefore(selectorDiv, card.querySelector('.table-container') || tbody.closest('table'));
        }

        // Tambah pagination container jika belum ada
        if (!document.getElementById('paid-pagination')) {
            const pag = document.createElement('div');
            pag.id = 'paid-pagination';
            pag.className = 'pagination';
            pag.style.marginTop = '12px';
            tbody.closest('table').after(pag);
        }

        renderRowsSelector({
            current: this._paidRows,
            containerId: 'paid-rows-selector',
            onChange: `(n) => { debtPage._paidRows = n; debtPage._paidPage = 1; debtPage._renderPaidTable(); }`
        });

        this._renderPaidTable();
    },

    _renderPaidTable() {
        const tbody = document.getElementById('paid-debt-body');
        if (!tbody) return;
        const data  = this._paidData || [];
        const slice = paginate(data, this._paidPage, this._paidRows);

        if (!data.length) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted);">Belum ada piutang yang lunas</td></tr>`;
            return;
        }

        tbody.innerHTML = slice.map(d => `
            <tr>
                <td style="font-weight:600;">${d.customers?.name || '-'}</td>
                <td style="color:var(--text-muted);">${d.invoice_number || '-'}</td>
                <td>Rp ${parseFloat(d.jumlah_piutang).toLocaleString('id-ID')}</td>
                <td>${new Date(d.created_at).toLocaleDateString('id-ID')}</td>
                <td><span class="badge badge-success">Lunas</span></td>
            </tr>`).join('');

        renderPagination({
            currentPage: this._paidPage,
            totalItems: data.length,
            rowsPerPage: this._paidRows,
            containerId: 'paid-pagination',
            onPageChange: `(p) => { debtPage._paidPage = p; debtPage._renderPaidTable(); }`
        });
    },

    toggleAccordion(cid) {
        this.state.openId = this.state.openId === cid ? null : cid;
        this.renderAccordion(this.state.grouped);
    },

    updateSummary() {
        const total = this.state.allData
            .filter(d => d.status === 'unpaid')
            .reduce((s, d) => s + parseFloat(d.sisa_piutang ?? d.jumlah_piutang), 0);
        const el = document.getElementById('total-debt');
        if (el) el.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    },

    // ── Modal Pembayaran ──────────────────────────────────────────────────────

    openPayModal(id, customerName, sisa) {
        this.state.payId  = id;
        this.state.payMax = sisa;
        document.getElementById('pay-customer-name').textContent = customerName;
        document.getElementById('pay-sisa-display').textContent  = `Rp ${sisa.toLocaleString('id-ID')}`;
        document.getElementById('pay-amount-input').value = '';
        document.getElementById('pay-sisa-baru-box').style.display = 'none';
        document.getElementById('debt-pay-modal').style.display = 'flex';
        applyRupiahFormatter('.rupiah-input');
        document.getElementById('pay-amount-input').focus();
    },

    closePayModal() {
        document.getElementById('debt-pay-modal').style.display = 'none';
        this.state.payId = null;
    },

    calcSisaBaru() {
        const bayar   = getRawValue(document.getElementById('pay-amount-input'));
        const sisa    = this.state.payMax;
        const sisaBaru = Math.max(0, sisa - bayar);
        const box     = document.getElementById('pay-sisa-baru-box');

        if (bayar > 0 && sisaBaru > 0) {
            box.style.display = 'block';
            document.getElementById('pay-sisa-baru').textContent = `Rp ${sisaBaru.toLocaleString('id-ID')}`;
        } else {
            box.style.display = 'none';
        }
    },

    async simpanPembayaran() {
        const bayar = getRawValue(document.getElementById('pay-amount-input'));
        if (!bayar || bayar <= 0) {
            showToast('Masukkan jumlah pembayaran', 'warning');
            return;
        }
        if (bayar > this.state.payMax) {
            showToast('Jumlah bayar melebihi sisa piutang', 'warning');
            return;
        }

        const btn = document.querySelector('#debt-pay-modal .btn-primary');
        if (btn) { btn.disabled = true; btn.textContent = 'Menyimpan...'; }

        try {
            await window.receivablesAPI.bayar(this.state.payId, bayar);
            const sisaBaru = Math.max(0, this.state.payMax - bayar);
            showToast(sisaBaru <= 0 ? 'Piutang berhasil dilunasi!' : `Pembayaran disimpan, sisa Rp ${sisaBaru.toLocaleString('id-ID')}`, 'success');
            this.closePayModal();
            await this.loadData();
        } catch (err) {
            console.error(err);
            showToast('Gagal menyimpan pembayaran', 'error');
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = 'SIMPAN PEMBAYARAN'; }
        }
    }
};

window.debtPage = debtPage;
