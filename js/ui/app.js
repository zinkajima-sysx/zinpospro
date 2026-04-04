/**
 * Main Application Entry Point
 */
const App = {
    async init() {
        console.log('Initializing ZinPOS Pro App...');
        if (window.supabaseReady) {
            try {
                await window.supabaseReady;
            } catch (e) {
                const app = document.getElementById('app');
                if (app) {
                    app.innerHTML = `
                        <div style="min-height:100dvh;background:var(--bg-main);display:flex;align-items:center;justify-content:center;padding:24px;">
                            <div class="card" style="max-width:520px;width:100%;padding:28px;">
                                <h2 style="font-size:18px;font-weight:800;margin-bottom:10px;">Konfigurasi belum siap</h2>
                                <p class="text-muted" style="font-size:13px;line-height:1.6;margin-bottom:12px;">
                                    Aplikasi belum dapat terhubung ke database. Pastikan environment variables sudah di-set di Vercel:
                                    <strong>SUPABASE_URL</strong> dan <strong>SUPABASE_ANON_KEY</strong>.
                                </p>
                                <p class="text-muted" style="font-size:12px;line-height:1.6;margin-bottom:0;">
                                    Detail error: ${(e && e.message) ? String(e.message) : 'unknown'}
                                </p>
                            </div>
                        </div>
                    `;
                }
                return;
            }
        }
        const rerender = () => {
            const authState = window.authStore.state;
            const saState = window.superAdminStore ? window.superAdminStore.state : { loading: false, token: null };
            if (authState.loading || saState.loading) return;
            if (!authState.user && !saState.token) {
                this.renderLogin();
                return;
            }

            if (!authState.user && saState.token && window.appStore.state.activePage !== 'superadmin') {
                window.appStore.setPage('superadmin');
            }
            this.renderApp();
        };

        window.authStore.subscribe(() => rerender());
        if (window.superAdminStore) window.superAdminStore.subscribe(() => rerender());

        if (window.superAdminStore) await window.superAdminStore.init();
        await window.authStore.init();
        const loader = document.getElementById('page-loader');
        if (loader) loader.style.display = 'none';
        rerender();
    },

    renderLogin() {
        window.loginPage.render();
    },

    renderApp() {
        const appElement = document.getElementById('app');
        appElement.innerHTML = `
            <main id="main-content" class="main-content"></main>
            <nav id="navbar" class="navbar-pill"></nav>
        `;
        this.renderShell();
        this.handlePageChange(window.appStore.state.activePage);
        window.appStore.subscribe((state) => this.handlePageChange(state.activePage));
    },

    renderShell() {
        window.Navbar.mount();
        if (window.lucide) window.lucide.createIcons();
    },

    handlePageChange(pageId) {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        mainContent.innerHTML = '';
        switch (pageId) {
            case 'dashboard': this.renderDashboard(); break;
            case 'pos':        if (window.posPage)      window.posPage.render();      break;
            case 'purchase':   if (window.purchasePage) window.purchasePage.render(); break;
            case 'expense':    if (window.expensePage)  window.expensePage.render();  break;
            case 'debt':       if (window.debtPage)     window.debtPage.render();     break;
            case 'report':     if (window.reportPage)   window.reportPage.render();   break;
            case 'settings':   if (window.settingsPage) window.settingsPage.render(); break;
            case 'superadmin': if (window.superAdminPage) window.superAdminPage.render(); break;
            default: mainContent.innerHTML = `<div class="page-container"><h1>Halaman tidak ditemukan</h1></div>`;
        }
        if (window.lucide) window.lucide.createIcons();
    },

    // ─── DASHBOARD ────────────────────────────────────────────────────────────

    async renderDashboard() {
        const mainContent = document.getElementById('main-content');
        const userName = window.authStore.state.userName || window.authStore.state.userRole || 'Pengguna';

        mainContent.innerHTML = `
            <div class="page-container" style="max-width:1200px;">
                <div class="flex-between" style="margin-bottom:24px;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h1 style="font-size:22px;font-weight:700;margin-bottom:2px;">Selamat Datang, ${userName}!</h1>
                        <p class="text-muted" style="font-size:13px;">Pantau performa toko Anda hari ini</p>
                    </div>
                    <button id="logout-btn" class="btn btn-outline btn-sm" style="gap:6px;">
                        <i data-lucide="log-out" style="width:15px;height:15px;color:var(--danger);"></i>
                        <span style="color:var(--danger);">Keluar</span>
                    </button>
                </div>

                <!-- Stat Cards -->
                <div class="grid grid-cols-2 lg:grid-cols-4" style="gap:16px;margin-bottom:20px;">
                    <div class="card" style="padding:18px 20px;">
                        <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Total Penjualan</p>
                        <div class="flex-between" style="align-items:flex-end;gap:8px;flex-wrap:wrap;">
                            <span id="stat-sales" style="font-size:20px;font-weight:700;">Rp 0</span>
                            <span id="badge-sales" class="dash-badge dash-badge-up">+0%</span>
                        </div>
                    </div>
                    <div class="card" style="padding:18px 20px;">
                        <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Total Profit</p>
                        <div class="flex-between" style="align-items:flex-end;gap:8px;flex-wrap:wrap;">
                            <span id="stat-profit" style="font-size:20px;font-weight:700;color:var(--success);">Rp 0</span>
                            <span id="badge-profit" class="dash-badge dash-badge-up">+0%</span>
                        </div>
                    </div>
                    <div class="card" style="padding:18px 20px;">
                        <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Jumlah Transaksi</p>
                        <div class="flex-between" style="align-items:flex-end;gap:8px;flex-wrap:wrap;">
                            <span id="stat-count" style="font-size:20px;font-weight:700;">0</span>
                            <span id="badge-count" class="dash-badge dash-badge-up">+0%</span>
                        </div>
                    </div>
                    <div class="card" style="padding:18px 20px;">
                        <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Pengeluaran</p>
                        <div class="flex-between" style="align-items:flex-end;gap:8px;flex-wrap:wrap;">
                            <span id="stat-expense" style="font-size:20px;font-weight:700;color:var(--danger);">Rp 0</span>
                            <span id="badge-expense" class="dash-badge dash-badge-down">-0%</span>
                        </div>
                    </div>
                </div>

                <!-- Chart -->
                <div class="card" style="padding:24px;margin-bottom:20px;">
                    <div class="flex-between" style="margin-bottom:16px;flex-wrap:wrap;gap:12px;">
                        <div>
                            <h3 style="font-size:16px;font-weight:700;margin-bottom:6px;">Tren Penjualan</h3>
                            <div class="flex" style="gap:16px;" id="chart-legend">
                                <span style="font-size:12px;color:#6366f1;display:flex;align-items:center;gap:5px;">
                                    <span style="width:24px;height:3px;background:#6366f1;border-radius:2px;display:inline-block;"></span>
                                    <span>Hari Ini</span>
                                </span>
                                <span style="font-size:12px;color:#a78bfa;display:flex;align-items:center;gap:5px;">
                                    <span style="width:24px;height:3px;background:#a78bfa;border-radius:2px;display:inline-block;"></span>
                                    <span>Kemarin</span>
                                </span>
                            </div>
                        </div>
                        <div class="flex" style="gap:6px;">
                            <button class="chart-period-btn active" data-period="daily"   onclick="App._chartPeriod('daily')">Harian</button>
                            <button class="chart-period-btn"        data-period="weekly"  onclick="App._chartPeriod('weekly')">Mingguan</button>
                            <button class="chart-period-btn"        data-period="monthly" onclick="App._chartPeriod('monthly')">Bulanan</button>
                        </div>
                    </div>
                    <div style="height:260px;position:relative;">
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>

                <!-- Bottom 3 Cards -->
                <div class="grid grid-cols-1 lg:grid-cols-3" style="gap:16px;">
                    <div class="card" style="padding:20px;">
                        <div class="flex" style="align-items:center;gap:12px;margin-bottom:16px;">
                            <div style="width:40px;height:40px;border-radius:12px;background:#ede9fe;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                                <i data-lucide="package" style="width:20px;height:20px;color:#7c3aed;"></i>
                            </div>
                            <span style="font-weight:700;font-size:15px;">Stok Barang</span>
                        </div>
                        <div style="font-size:28px;font-weight:800;" id="stat-total-products">0</div>
                        <div style="font-size:13px;color:var(--text-muted);margin-top:4px;">Produk</div>
                    </div>
                    <div class="card" style="padding:20px;">
                        <div class="flex" style="align-items:center;gap:12px;margin-bottom:16px;">
                            <div style="width:40px;height:40px;border-radius:12px;background:#fef3c7;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                                <i data-lucide="alert-triangle" style="width:20px;height:20px;color:#d97706;"></i>
                            </div>
                            <span style="font-weight:700;font-size:15px;">Stok Menipis</span>
                        </div>
                        <div style="font-size:28px;font-weight:800;" id="stat-low-stock">0</div>
                        <div style="font-size:13px;color:var(--text-muted);margin-top:4px;">Item</div>
                        <button onclick="window.appStore.setPage('purchase')"
                            style="margin-top:10px;background:#ef4444;color:white;border:none;border-radius:8px;padding:4px 12px;font-size:12px;font-weight:700;cursor:pointer;">
                            Perlu Restok!
                        </button>
                    </div>
                    <div class="card" style="padding:20px;">
                        <div class="flex" style="align-items:center;gap:12px;margin-bottom:16px;">
                            <div style="width:40px;height:40px;border-radius:12px;background:#dcfce7;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                                <i data-lucide="trending-up" style="width:20px;height:20px;color:#16a34a;"></i>
                            </div>
                            <span style="font-weight:700;font-size:15px;">Barang Terlaris</span>
                        </div>
                        <div id="best-seller-mini" style="display:flex;flex-direction:column;gap:8px;">
                            <p class="text-muted" style="font-size:13px;">Memuat...</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .dash-badge { font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;white-space:nowrap; }
                .dash-badge-up   { background:#dcfce7;color:#16a34a; }
                .dash-badge-down { background:#fee2e2;color:#dc2626; }
                .chart-period-btn {
                    padding:5px 14px;border-radius:20px;border:1px solid var(--border);
                    background:transparent;font-size:12px;font-weight:600;cursor:pointer;
                    color:var(--text-muted);transition:all .2s;
                }
                .chart-period-btn.active { background:var(--primary);color:white;border-color:var(--primary); }
            </style>
        `;

        document.getElementById('logout-btn').onclick = async () => {
            const ok = await showConfirm({ title: 'Keluar', message: 'Yakin ingin keluar?', confirmText: 'Ya, Keluar', type: 'warning' });
            if (ok) await window.authStore.logout();
        };

        if (window.lucide) window.lucide.createIcons();
        this._dashPeriod = 'daily';
        this.loadDashboardData();
    },

    async loadDashboardData() {
        try {
            const [sales, products, expenses] = await Promise.all([
                window.salesAPI.getHistory(),
                window.productsAPI.getAll(),
                window.expensesAPI.getAll()
            ]);

            this._dashSales    = sales;
            this._dashProducts = products;
            this._dashExpenses = expenses;

            const now = new Date();
            const inMonth = (arr, offset) => arr.filter(x => {
                const d = new Date(x.created_at);
                return d.getMonth() === (now.getMonth() - offset + 12) % 12 &&
                       d.getFullYear() === (offset === 0 ? now.getFullYear() : new Date(now.getFullYear(), now.getMonth() - offset, 1).getFullYear());
            });

            const thisMonthSales = inMonth(sales, 0);
            const lastMonthSales = inMonth(sales, 1);
            const thisMonthExp   = inMonth(expenses, 0);
            const lastMonthExp   = inMonth(expenses, 1);

            const sum = (arr, key) => arr.reduce((s, x) => s + parseFloat(x[key] || 0), 0);
            const totalSales  = sum(thisMonthSales, 'total');
            const prevSales   = sum(lastMonthSales, 'total');
            const totalExp    = sum(thisMonthExp, 'amount');
            const prevExp     = sum(lastMonthExp, 'amount');
            const totalProfit = totalSales - totalExp;
            const prevProfit  = prevSales - prevExp;

            const pct = (cur, prev) => prev ? Math.round(((cur - prev) / prev) * 100) : (cur > 0 ? 100 : 0);
            const badge = (val) => {
                const up = val >= 0;
                return `<span class="dash-badge ${up ? 'dash-badge-up' : 'dash-badge-down'}">${up ? '+' : ''}${val}%</span>`;
            };

            document.getElementById('stat-sales').textContent   = `Rp ${totalSales.toLocaleString('id-ID')}`;
            document.getElementById('stat-profit').textContent  = `Rp ${totalProfit.toLocaleString('id-ID')}`;
            document.getElementById('stat-count').textContent   = thisMonthSales.length;
            document.getElementById('stat-expense').textContent = `Rp ${totalExp.toLocaleString('id-ID')}`;

            document.getElementById('badge-sales').outerHTML   = badge(pct(totalSales, prevSales));
            document.getElementById('badge-profit').outerHTML  = badge(pct(totalProfit, prevProfit));
            document.getElementById('badge-count').outerHTML   = badge(pct(thisMonthSales.length, lastMonthSales.length));
            document.getElementById('badge-expense').outerHTML = badge(pct(totalExp, prevExp));

            document.getElementById('stat-total-products').textContent = products.length;
            const lowStock = products.filter(p => (p.stock || 0) <= (p.min_stock ?? 5));
            document.getElementById('stat-low-stock').textContent = lowStock.length;

            // Best seller
            const sellCounts = {};
            sales.forEach(s => (s.items || []).forEach(item => {
                sellCounts[item.name] = (sellCounts[item.name] || 0) + item.qty;
            }));
            const top3 = Object.entries(sellCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
            document.getElementById('best-seller-mini').innerHTML = top3.length
                ? top3.map(([name, qty]) => `
                    <div class="flex-between" style="font-size:13px;">
                        <span style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:150px;">${name}</span>
                        <span class="dash-badge dash-badge-up">${qty} terjual</span>
                    </div>`).join('')
                : '<p class="text-muted" style="font-size:13px;">Belum ada data</p>';

            this.renderSalesChart('daily');

        } catch (err) {
            console.error('Dashboard error:', err);
        }
    },

    async _chartPeriod(period) {
        this._dashPeriod = period;
        document.querySelectorAll('.chart-period-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.period === period)
        );
        const legendMap = {
            daily:   ['Hari Ini', 'Kemarin'],
            weekly:  ['Minggu Ini', 'Minggu Lalu'],
            monthly: ['Bulan Ini', 'Bulan Lalu']
        };
        const legs = document.querySelectorAll('#chart-legend span span:last-child');
        if (legs[0]) legs[0].textContent = legendMap[period][0];
        if (legs[1]) legs[1].textContent = legendMap[period][1];
        await this.renderSalesChart(period);
    },

    async renderSalesChart(period = 'daily') {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;

        const id_toko = window.authStore.state.id_toko;
        const now = new Date();
        let labels = [], thisData = [], lastData = [], labelA = '', labelB = '';

        if (period === 'daily') {
            // Hari ini vs kemarin — per jam
            labelA = 'Hari Ini'; labelB = 'Kemarin';
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yestStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

            const { data: rows } = await supabase
                .from('sales').select('total, created_at')
                .eq('id_toko', id_toko)
                .gte('created_at', yestStart.toISOString());

            const s = rows || [];
            for (let h = 0; h < 24; h++) {
                labels.push(`${String(h).padStart(2,'0')}:00`);
                thisData.push(s.filter(x => { const d = new Date(x.created_at); return d >= todayStart && d.getHours() === h; }).reduce((a,x) => a + parseFloat(x.total), 0));
                lastData.push(s.filter(x => { const d = new Date(x.created_at); return d >= yestStart && d < todayStart && d.getHours() === h; }).reduce((a,x) => a + parseFloat(x.total), 0));
            }

        } else if (period === 'weekly') {
            // Minggu ini vs minggu lalu — per hari
            labelA = 'Minggu Ini'; labelB = 'Minggu Lalu';
            const dow = now.getDay() === 0 ? 6 : now.getDay() - 1;
            const weekStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
            const lWeekStart = new Date(weekStart); lWeekStart.setDate(weekStart.getDate() - 7);

            const { data: rows } = await supabase
                .from('sales').select('total, created_at')
                .eq('id_toko', id_toko)
                .gte('created_at', lWeekStart.toISOString());

            const s = rows || [];
            const dayNames = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
            for (let d = 0; d < 7; d++) {
                const td = new Date(weekStart);  td.setDate(weekStart.getDate() + d);
                const ld = new Date(lWeekStart); ld.setDate(lWeekStart.getDate() + d);
                labels.push(dayNames[d]);
                thisData.push(s.filter(x => new Date(x.created_at).toDateString() === td.toDateString()).reduce((a,x) => a + parseFloat(x.total), 0));
                lastData.push(s.filter(x => new Date(x.created_at).toDateString() === ld.toDateString()).reduce((a,x) => a + parseFloat(x.total), 0));
            }

        } else {
            // Bulan ini vs bulan lalu — per tanggal
            labelA = 'Bulan Ini'; labelB = 'Bulan Lalu';
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

            const { data: rows } = await supabase
                .from('sales').select('total, created_at')
                .eq('id_toko', id_toko)
                .gte('created_at', lastMonthStart.toISOString());

            const s = rows || [];
            const daysThis = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const daysLast = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
            const maxDays  = Math.max(daysThis, daysLast);

            for (let d = 1; d <= maxDays; d++) {
                labels.push(`${d}`);
                const td = new Date(now.getFullYear(), now.getMonth(), d);
                const ld = new Date(now.getFullYear(), now.getMonth() - 1, d);
                thisData.push(d <= daysThis ? s.filter(x => new Date(x.created_at).toDateString() === td.toDateString()).reduce((a,x) => a + parseFloat(x.total), 0) : null);
                lastData.push(d <= daysLast ? s.filter(x => new Date(x.created_at).toDateString() === ld.toDateString()).reduce((a,x) => a + parseFloat(x.total), 0) : null);
            }
        }

        const chartCtx = ctx.getContext('2d');
        const grad1 = chartCtx.createLinearGradient(0, 0, 0, 260);
        grad1.addColorStop(0, 'rgba(99,102,241,0.25)'); grad1.addColorStop(1, 'rgba(99,102,241,0)');
        const grad2 = chartCtx.createLinearGradient(0, 0, 0, 260);
        grad2.addColorStop(0, 'rgba(167,139,250,0.18)'); grad2.addColorStop(1, 'rgba(167,139,250,0)');

        if (window.dashboardChart) window.dashboardChart.destroy();
        window.dashboardChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: labelA, data: thisData,
                        borderColor: '#6366f1', borderWidth: 2.5,
                        backgroundColor: grad1, fill: true, tension: 0.4,
                        pointRadius: 4, pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#fff', pointBorderWidth: 2, spanGaps: true
                    },
                    {
                        label: labelB, data: lastData,
                        borderColor: '#a78bfa', borderWidth: 2,
                        backgroundColor: grad2, fill: true, tension: 0.4,
                        pointRadius: 4, pointBackgroundColor: '#a78bfa',
                        pointBorderColor: '#fff', pointBorderWidth: 2, spanGaps: true
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b', padding: 12,
                        callbacks: { label: c => `${c.dataset.label}: Rp ${(c.raw || 0).toLocaleString('id-ID')}` }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9', drawBorder: false },
                        ticks: { callback: v => v >= 1000000 ? (v/1000000).toFixed(0)+'jt' : v >= 1000 ? (v/1000).toFixed(0)+'rb' : v }
                    },
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 12 } }
                }
            }
        });
    }
};

window.App = App;

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
