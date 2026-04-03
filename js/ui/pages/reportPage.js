/**
 * Report Page - Rekap Transaksi & Grafik Penjualan
 */
const reportPage = {
    state: {
        allSales: [],
        filtered: [],
        currentPage: 1,
        rowsPerPage: 10,
        filterMethod: 'semua',
        filterDateFrom: '',
        filterDateTo: '',
        chart: null
    },

    render() {
        const mainContent = document.getElementById('main-content');
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];

        mainContent.innerHTML = `
            <div class="page-container">
                <header style="margin-bottom:24px;">
                    <h1 style="font-size:22px;font-weight:700;margin-bottom:4px;">Laporan Penjualan</h1>
                    <p class="text-muted" style="font-size:13px;">Rekap transaksi dan analisa penjualan toko</p>
                </header>

                <!-- Summary Cards -->
                <div class="grid grid-cols-2 lg:grid-cols-4" style="gap:16px;margin-bottom:24px;">
                    <div class="card" style="padding:16px 20px;">
                        <p style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;margin-bottom:6px;">TOTAL PENJUALAN</p>
                        <p id="rep-total" style="font-size:20px;font-weight:700;color:var(--primary);">Rp 0</p>
                    </div>
                    <div class="card" style="padding:16px 20px;">
                        <p style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;margin-bottom:6px;">TRANSAKSI</p>
                        <p id="rep-count" style="font-size:20px;font-weight:700;">0</p>
                    </div>
                    <div class="card" style="padding:16px 20px;">
                        <p style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;margin-bottom:6px;">RATA-RATA / TRANSAKSI</p>
                        <p id="rep-avg" style="font-size:20px;font-weight:700;">Rp 0</p>
                    </div>
                    <div class="card" style="padding:16px 20px;">
                        <p style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;margin-bottom:6px;">PIUTANG PERIODE INI</p>
                        <p id="rep-piutang" style="font-size:20px;font-weight:700;color:var(--danger);">Rp 0</p>
                    </div>
                </div>

                <!-- Chart -->
                <div class="card" style="padding:24px;margin-bottom:24px;">
                    <div class="flex-between" style="margin-bottom:16px;flex-wrap:wrap;gap:10px;">
                        <h3 style="font-size:15px;font-weight:700;">Grafik Penjualan Harian</h3>
                        <div style="display:flex;gap:12px;align-items:center;font-size:12px;">
                            <span style="display:flex;align-items:center;gap:5px;">
                                <span style="width:20px;height:3px;background:#1e1b4b;border-radius:2px;display:inline-block;"></span> Periode Ini
                            </span>
                            <span style="display:flex;align-items:center;gap:5px;">
                                <span style="width:20px;height:3px;background:#a78bfa;border-radius:2px;display:inline-block;"></span> Periode Lalu
                            </span>
                        </div>
                    </div>
                    <div style="height:240px;position:relative;">
                        <canvas id="report-chart"></canvas>
                    </div>
                </div>

                <!-- Filter & Tabel -->
                <div class="card" style="padding:24px;">
                    <!-- Filter Bar -->
                    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;align-items:flex-end;">
                        <div>
                            <label style="font-size:11px;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px;">DARI TANGGAL</label>
                            <input type="date" id="rep-date-from" value="${weekAgo}" class="search-input" style="padding:8px 12px;width:150px;"
                                onchange="reportPage.applyFilter()">
                        </div>
                        <div>
                            <label style="font-size:11px;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px;">SAMPAI TANGGAL</label>
                            <input type="date" id="rep-date-to" value="${today}" class="search-input" style="padding:8px 12px;width:150px;"
                                onchange="reportPage.applyFilter()">
                        </div>
                        <div>
                            <label style="font-size:11px;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px;">BARIS / HALAMAN</label>
                            <select id="rep-rows" class="search-input" style="padding:8px 12px;width:100px;" onchange="reportPage.changeRows()">
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                        <div style="margin-left:auto;display:flex;gap:8px;">
                            <button class="btn btn-outline btn-sm" onclick="reportPage.exportPDF()">
                                <i data-lucide="file-text" style="width:14px;height:14px;"></i> PDF
                            </button>
                            <button class="btn btn-outline btn-sm" onclick="reportPage.exportExcel()">
                                <i data-lucide="table" style="width:14px;height:14px;"></i> Excel
                            </button>
                        </div>
                    </div>

                    <!-- Filter Metode Bayar (Pill) -->
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
                        <span style="font-size:11px;font-weight:700;color:var(--text-muted);align-self:center;margin-right:4px;">METODE:</span>
                        ${['semua','Tunai','QRIS','Transfer','Piutang'].map((m,i) => `
                            <button id="rep-pill-${m}" onclick="reportPage.setMethod('${m}')"
                                style="padding:5px 16px;border-radius:20px;border:1.5px solid ${i===0?'#1e1b4b':'var(--border)'};
                                background:${i===0?'#1e1b4b':'transparent'};
                                color:${i===0?'white':'var(--text-muted)'};
                                font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;">
                                ${m === 'semua' ? 'Semua' : m}
                            </button>`).join('')}
                    </div>

                    <!-- Tabel -->
                    <div style="overflow-x:auto;">
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.06em;background:var(--bg-main);">
                                    <th style="padding:10px 12px;text-align:left;">INVOICE</th>
                                    <th style="padding:10px 12px;text-align:left;">TANGGAL</th>
                                    <th style="padding:10px 12px;text-align:left;" class="table-hide-mobile">PELANGGAN</th>
                                    <th style="padding:10px 12px;text-align:left;">METODE</th>
                                    <th style="padding:10px 12px;text-align:right;">TOTAL</th>
                                    <th style="padding:10px 12px;text-align:center;">STATUS</th>
                                </tr>
                            </thead>
                            <tbody id="report-table-body">
                                <tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">Memuat data...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="report-pagination" class="pagination" style="margin-top:16px;"></div>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        this.loadData();
    },

    async loadData() {
        try {
            const id_toko = window.authStore.state.id_toko;
            const { data, error } = await supabase
                .from('sales')
                .select('*, customers(name)')
                .eq('id_toko', id_toko)
                .order('created_at', { ascending: false });

            if (error) throw error;
            this.state.allSales = data || [];
            this.applyFilter();
        } catch (err) {
            console.error(err);
            showToast('Gagal memuat data laporan', 'error');
        }
    },

    setMethod(method) {
        this.state.filterMethod = method;
        // Update pill styles
        ['semua','Tunai','QRIS','Transfer','Piutang'].forEach(m => {
            const btn = document.getElementById(`rep-pill-${m}`);
            if (!btn) return;
            const active = m === method;
            btn.style.background    = active ? '#1e1b4b' : 'transparent';
            btn.style.color         = active ? 'white' : 'var(--text-muted)';
            btn.style.borderColor   = active ? '#1e1b4b' : 'var(--border)';
        });
        this.state.currentPage = 1;
        this._doFilter();
    },

    applyFilter() {
        this.state.filterDateFrom = document.getElementById('rep-date-from')?.value || '';
        this.state.filterDateTo   = document.getElementById('rep-date-to')?.value   || '';
        this.state.currentPage    = 1;
        this._doFilter();
    },

    _doFilter() {
        const from   = this.state.filterDateFrom;
        const to     = this.state.filterDateTo;
        const method = this.state.filterMethod || 'semua';

        this.state.filtered = this.state.allSales.filter(s => {
            const d = new Date(s.created_at).toISOString().split('T')[0];
            const inDate   = (!from || d >= from) && (!to || d <= to);
            const inMethod = method === 'semua' || s.payment_method === method;
            return inDate && inMethod;
        });

        this.updateSummary();
        this.renderTable();
        this.renderChart();
    },

    updateSummary() {
        const data = this.state.filtered;
        const total   = data.reduce((s, x) => s + parseFloat(x.total), 0);
        const count   = data.length;
        const avg     = count ? Math.round(total / count) : 0;
        const piutang = data.filter(x => x.payment_method === 'Piutang').reduce((s, x) => s + parseFloat(x.total), 0);

        document.getElementById('rep-total').textContent   = `Rp ${total.toLocaleString('id-ID')}`;
        document.getElementById('rep-count').textContent   = count;
        document.getElementById('rep-avg').textContent     = `Rp ${avg.toLocaleString('id-ID')}`;
        document.getElementById('rep-piutang').textContent = `Rp ${piutang.toLocaleString('id-ID')}`;
    },

    renderTable() {
        const tbody = document.getElementById('report-table-body');
        const pagEl = document.getElementById('report-pagination');
        if (!tbody) return;

        const rows    = this.state.rowsPerPage;
        const page    = this.state.currentPage;
        const start   = (page - 1) * rows;
        const slice   = this.state.filtered.slice(start, start + rows);
        const total   = this.state.filtered.length;
        const totalPg = Math.ceil(total / rows);

        const methodColor = { Tunai: '#1e1b4b', QRIS: '#0891b2', Transfer: '#059669', Piutang: '#dc2626' };

        if (!slice.length) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">Tidak ada data</td></tr>`;
            if (pagEl) pagEl.innerHTML = '';
            return;
        }

        tbody.innerHTML = slice.map(s => {
            const tgl = new Date(s.created_at).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
            const mc  = methodColor[s.payment_method] || '#6b7280';
            return `
                <tr style="border-bottom:1px solid var(--border);font-size:13px;">
                    <td style="padding:10px 12px;font-weight:600;color:var(--primary);">${s.invoice_number}</td>
                    <td style="padding:10px 12px;">${tgl}</td>
                    <td style="padding:10px 12px;color:var(--text-muted);" class="table-hide-mobile">${s.customers?.name || 'Umum'}</td>
                    <td style="padding:10px 12px;">
                        <span style="background:${mc}18;color:${mc};font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">
                            ${s.payment_method || 'Tunai'}
                        </span>
                    </td>
                    <td style="padding:10px 12px;text-align:right;font-weight:700;">Rp ${parseFloat(s.total).toLocaleString('id-ID')}</td>
                    <td style="padding:10px 12px;text-align:center;">
                        <span class="badge badge-success">Selesai</span>
                    </td>
                </tr>`;
        }).join('');

        // Pagination
        if (pagEl) {
            let ph = `<span class="text-muted" style="font-size:13px;">${start+1}–${Math.min(total, start+rows)} dari ${total}</span><div class="flex" style="gap:6px;">`;
            ph += `<button class="btn btn-outline btn-sm" ${page===1?'disabled':''} onclick="reportPage.changePage(${page-1})">Prev</button>`;
            for (let i = 1; i <= totalPg; i++) {
                if (i===1||i===totalPg||(i>=page-1&&i<=page+1))
                    ph += `<button class="btn ${page===i?'btn-primary':'btn-outline'} btn-sm" onclick="reportPage.changePage(${i})">${i}</button>`;
                else if (i===page-2||i===page+2) ph += `<span style="padding:0 4px;">...</span>`;
            }
            ph += `<button class="btn btn-outline btn-sm" ${page===totalPg?'disabled':''} onclick="reportPage.changePage(${page+1})">Next</button></div>`;
            pagEl.innerHTML = ph;
        }
    },

    changePage(p) { this.state.currentPage = p; this.renderTable(); },
    changeRows()  { this.state.rowsPerPage = parseInt(document.getElementById('rep-rows').value); this.state.currentPage = 1; this.renderTable(); },

    renderChart() {
        const ctx = document.getElementById('report-chart');
        if (!ctx) return;

        const from = this.state.filterDateFrom;
        const to   = this.state.filterDateTo;

        // Buat array tanggal dari range
        const dates = [];
        const d = new Date(from);
        const end = new Date(to);
        while (d <= end) {
            dates.push(d.toISOString().split('T')[0]);
            d.setDate(d.getDate() + 1);
        }

        // Periode lalu (sama panjangnya)
        const diffDays = dates.length;
        const prevDates = dates.map(dt => {
            const pd = new Date(dt);
            pd.setDate(pd.getDate() - diffDays);
            return pd.toISOString().split('T')[0];
        });

        const sumByDate = (dateArr) => dateArr.map(dt =>
            this.state.allSales
                .filter(s => new Date(s.created_at).toISOString().split('T')[0] === dt)
                .reduce((sum, s) => sum + parseFloat(s.total), 0)
        );

        const thisData = sumByDate(dates);
        const prevData = sumByDate(prevDates);
        const labels   = dates.map(dt => new Date(dt).toLocaleDateString('id-ID', { day:'2-digit', month:'short' }));

        const chartCtx = ctx.getContext('2d');
        const g1 = chartCtx.createLinearGradient(0,0,0,240);
        g1.addColorStop(0,'rgba(30,27,75,0.2)'); g1.addColorStop(1,'rgba(30,27,75,0)');
        const g2 = chartCtx.createLinearGradient(0,0,0,240);
        g2.addColorStop(0,'rgba(167,139,250,0.15)'); g2.addColorStop(1,'rgba(167,139,250,0)');

        if (this.state.chart) this.state.chart.destroy();
        this.state.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label:'Periode Ini', data:thisData, borderColor:'#1e1b4b', borderWidth:2.5, backgroundColor:g1, fill:true, tension:0.4, pointRadius:4, pointBackgroundColor:'#1e1b4b', pointBorderColor:'#fff', pointBorderWidth:2, spanGaps:true },
                    { label:'Periode Lalu', data:prevData, borderColor:'#a78bfa', borderWidth:2, backgroundColor:g2, fill:true, tension:0.4, pointRadius:3, pointBackgroundColor:'#a78bfa', pointBorderColor:'#fff', pointBorderWidth:2, spanGaps:true }
                ]
            },
            options: {
                responsive:true, maintainAspectRatio:false,
                plugins: {
                    legend: { display:false },
                    tooltip: { backgroundColor:'#1e293b', padding:10, callbacks:{ label: c=>`${c.dataset.label}: Rp ${(c.raw||0).toLocaleString('id-ID')}` } }
                },
                scales: {
                    y: { beginAtZero:true, grid:{ color:'#f1f5f9', drawBorder:false }, ticks:{ callback: v=>v>=1000000?(v/1000000).toFixed(0)+'jt':v>=1000?(v/1000).toFixed(0)+'rb':v } },
                    x: { grid:{ display:false }, ticks:{ maxTicksLimit:10 } }
                }
            }
        });
    },

    // ── Export PDF ────────────────────────────────────────────────────────────
    exportPDF() {
        const storeName = window.appConfig?.store?.name || 'ZinPOS Pro';
        const from = this.state.filterDateFrom;
        const to   = this.state.filterDateTo;
        const data = this.state.filtered;

        const rows = data.map((s, i) => `
            <tr style="${i%2===0?'background:#fafafa':''}">
                <td style="padding:6px 10px;border:1px solid #e5e7eb;">${s.invoice_number}</td>
                <td style="padding:6px 10px;border:1px solid #e5e7eb;">${new Date(s.created_at).toLocaleDateString('id-ID')}</td>
                <td style="padding:6px 10px;border:1px solid #e5e7eb;">${s.customers?.name || 'Umum'}</td>
                <td style="padding:6px 10px;border:1px solid #e5e7eb;">${s.payment_method || 'Tunai'}</td>
                <td style="padding:6px 10px;border:1px solid #e5e7eb;text-align:right;font-weight:600;">Rp ${parseFloat(s.total).toLocaleString('id-ID')}</td>
            </tr>`).join('');

        const total = data.reduce((s,x)=>s+parseFloat(x.total),0);

        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>Laporan Penjualan - ${storeName}</title>
        <style>body{font-family:Arial,sans-serif;padding:24px;color:#333;}h2{margin:0 0 4px;}p{margin:0 0 16px;color:#666;font-size:13px;}table{width:100%;border-collapse:collapse;font-size:13px;}th{padding:8px 10px;background:#1e1b4b;color:white;text-align:left;}@media print{body{padding:0;}}</style>
        </head><body>
        <h2>${storeName}</h2>
        <p>Laporan Penjualan: ${from} s/d ${to} &mdash; ${data.length} transaksi</p>
        <table>
            <thead><tr><th>Invoice</th><th>Tanggal</th><th>Pelanggan</th><th>Metode</th><th>Total</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr style="font-weight:700;background:#f3f4f6;">
                <td colspan="4" style="padding:8px 10px;border:1px solid #e5e7eb;">TOTAL</td>
                <td style="padding:8px 10px;border:1px solid #e5e7eb;text-align:right;">Rp ${total.toLocaleString('id-ID')}</td>
            </tr></tfoot>
        </table>
        <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
        </body></html>`;

        const w = window.open('','_blank','width=900,height=700');
        if (w) { w.document.write(html); w.document.close(); }
        else showToast('Izinkan popup untuk export PDF', 'warning');
    },

    // ── Export Excel (CSV) ────────────────────────────────────────────────────
    exportExcel() {
        const data = this.state.filtered;
        const storeName = window.appConfig?.store?.name || 'ZinPOS Pro';

        const header = ['Invoice','Tanggal','Pelanggan','Metode Bayar','Total'];
        const rows = data.map(s => [
            s.invoice_number,
            new Date(s.created_at).toLocaleDateString('id-ID'),
            s.customers?.name || 'Umum',
            s.payment_method || 'Tunai',
            parseFloat(s.total)
        ]);

        const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `laporan-${this.state.filterDateFrom}-${this.state.filterDateTo}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('File CSV berhasil diunduh', 'success');
    }
};

window.reportPage = reportPage;
