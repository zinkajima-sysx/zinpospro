/**
 * Expense Page - Managing shop expenses
 */
const expensePage = {
    render() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="page-container">
                <header class="page-header flex-between">
                    <div>
                        <h1 class="page-title">Biaya & Pengeluaran</h1>
                        <p class="page-subtitle">Catat dan pantau pengeluaran operasional toko</p>
                    </div>
                    <button class="btn btn-primary" onclick="expensePage.showAddModal()">
                        <i data-lucide="plus"></i> Tambah Biaya
                    </button>
                </header>

                <!-- Summary Cards -->
                <div class="grid grid-cols-3" style="gap: 20px; margin-bottom: 32px;">
                    <div class="card p-24">
                        <p class="text-muted" style="margin-bottom: 8px;">Total Bulan Ini</p>
                        <h2 id="expense-total-month" style="color: var(--danger);">Rp 0</h2>
                    </div>
                    <div class="card p-24">
                        <p class="text-muted" style="margin-bottom: 8px;">Total Hari Ini</p>
                        <h2 id="expense-total-today">Rp 0</h2>
                    </div>
                    <div class="card p-24">
                        <p class="text-muted" style="margin-bottom: 8px;">Transaksi Biaya</p>
                        <h2 id="expense-count">0</h2>
                    </div>
                </div>

                <!-- Table Content -->
                <div class="card">
                    <div class="flex-between" style="margin-bottom: 24px;">
                        <div class="search-container" style="flex: 1; max-width: 400px;">
                            <i data-lucide="search" class="search-icon"></i>
                            <input type="text" id="expense-search" class="search-input" placeholder="Cari pengeluaran..." oninput="expensePage.handleSearch()">
                        </div>
                        <div id="expense-rows-selector"></div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Kategori</th>
                                    <th>Keterangan</th>
                                    <th style="text-align: right;">Jumlah</th>
                                    <th style="text-align: center;">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="expense-table-body">
                                <!-- Data will be injected here -->
                            </tbody>
                        </table>
                        <div id="expense-pagination" class="pagination">
                            <!-- Pagination will be injected here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Expense Modal -->
            <div id="expense-modal" class="modal-container" style="display: none;">
                <div class="modal-content card" style="max-width: 500px;">
                    <div class="flex-between" style="margin-bottom: 24px;">
                        <h3>Tambah Pengeluaran</h3>
                        <button class="close-btn-red" onclick="expensePage.closeModal()">Tutup</button>
                    </div>

                    <form onsubmit="expensePage.handleSave(event)">
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label>Kategori</label>
                            <input id="expense-category" class="search-input" style="padding-left: 16px;" placeholder="Cari kategori...">
                        </div>

                        <div class="form-group" style="margin-bottom: 20px;">
                            <label>Keterangan</label>
                            <input type="text" id="expense-desc" class="search-input" style="padding-left: 16px;" placeholder="Contoh: Beli Token Listrik" required>
                        </div>

                        <div class="form-group" style="margin-bottom: 32px;">
                            <label>Jumlah (Rp)</label>
                            <input type="text" id="expense-amount" class="search-input rupiah-input" style="padding-left: 16px;" placeholder="0" inputmode="numeric" required>
                        </div>

                        <button type="submit" class="btn btn-primary" style="width: 100%; height: 50px;">
                            Simpan Pengeluaran
                        </button>
                    </form>
                </div>
            </div>
        `;

        this.loadData();
        if (window.lucide) window.lucide.createIcons();
    },

    state: {
        allData: [],
        filteredData: [],
        currentPage: 1,
        rowsPerPage: 10
    },

    async loadData() {
        try {
            this.state.allData = await window.expensesAPI.getAll();
            this.state.filteredData = [...this.state.allData];
            this.state.currentPage = 1;
            
            this.renderTable();
            this.updateSummary(this.state.allData);
            renderRowsSelector({
                current: this.state.rowsPerPage,
                containerId: 'expense-rows-selector',
                onChange: `(n) => { expensePage.state.rowsPerPage = n; expensePage.state.currentPage = 1; expensePage.renderTable(); }`
            });
        } catch (error) {
            console.error('Error loading expenses:', error);
            window.appStore.addNotification('Gagal memuat data biaya', 'danger');
        }
    },

    handleSearch() {
        const query = document.getElementById('expense-search').value.toLowerCase();
        this.state.filteredData = this.state.allData.filter(ex => 
            (ex.description || '').toLowerCase().includes(query) || 
            (ex.category_name || '').toLowerCase().includes(query)
        );
        this.state.currentPage = 1;
        this.renderTable();
    },

    renderTable() {
        const tbody = document.getElementById('expense-table-body');
        const pagination = document.getElementById('expense-pagination');
        if (!tbody) return;

        const start = (this.state.currentPage - 1) * this.state.rowsPerPage;
        const end = start + this.state.rowsPerPage;
        const pagedData = this.state.filteredData.slice(start, end);

        if (pagedData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">Tidak ada data ditemukan</td></tr>`;
            pagination.innerHTML = '';
            return;
        }

        tbody.innerHTML = pagedData.map(ex => `
            <tr>
                <td>${new Date(ex.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td><span class="badge" style="background: rgba(99, 102, 241, 0.1); color: var(--primary);">${ex.category_name || 'Umum'}</span></td>
                <td>${ex.description}</td>
                <td style="text-align: right; font-weight: 600;">Rp ${ex.amount.toLocaleString('id-ID')}</td>
                <td style="text-align: center;">
                    <button class="text-danger" onclick="expensePage.handleDelete(${ex.id})">
                        <i data-lucide="trash-2" style="width: 16px;"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        this.renderPagination();
        if (window.lucide) window.lucide.createIcons();
    },

    renderPagination() {
        renderPagination({
            currentPage: this.state.currentPage,
            totalItems: this.state.filteredData.length,
            rowsPerPage: this.state.rowsPerPage,
            containerId: 'expense-pagination',
            onPageChange: `(p) => { expensePage.changePage(p); }`
        });
    },

    changePage(page) {
        this.state.currentPage = page;
        this.renderTable();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    updateSummary(expenses) {
        const now = new Date();
        const today = now.toDateString();
        const month = now.getMonth();
        const year = now.getFullYear();

        const totalMonth = expenses
            .filter(ex => {
                const d = new Date(ex.created_at);
                return d.getMonth() === month && d.getFullYear() === year;
            })
            .reduce((sum, ex) => sum + parseFloat(ex.amount), 0);

        const totalToday = expenses
            .filter(ex => new Date(ex.created_at).toDateString() === today)
            .reduce((sum, ex) => sum + parseFloat(ex.amount), 0);

        document.getElementById('expense-total-month').innerText = `Rp ${totalMonth.toLocaleString('id-ID')}`;
        document.getElementById('expense-total-today').innerText = `Rp ${totalToday.toLocaleString('id-ID')}`;
        document.getElementById('expense-count').innerText = expenses.length;
    },

    showAddModal() {
        document.getElementById('expense-modal').style.display = 'flex';
        applyRupiahFormatter('.rupiah-input');
        const expCats = ['Operasional','Gaji Pegawai','Sewa Tempat','Listrik & Air','Transportasi','Perlengkapan','Lainnya'];
        this.acExpCat = createAutocomplete({
            inputEl: document.getElementById('expense-category'),
            items: expCats.map(c => ({ value: c, label: c })),
            placeholder: 'Cari kategori...',
            initialValue: 'Operasional',
            initialLabel: 'Operasional'
        });
    },

    closeModal() {
        document.getElementById('expense-modal').style.display = 'none';
        document.getElementById('expense-desc').value = '';
        document.getElementById('expense-amount').value = '';
    },

    async handleSave(e) {
        e.preventDefault();
        const btn = e.target.querySelector('[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Menyimpan...'; }
        try {
            const expense = {
                category_name: this.acExpCat ? this.acExpCat.getValue() : 'Operasional',
                description: document.getElementById('expense-desc').value,
                amount: getRawValue(document.getElementById('expense-amount'))
            };

            if (!expense.amount || expense.amount <= 0) {
                showToast('Jumlah biaya harus diisi', 'warning');
                return;
            }

            await window.expensesAPI.create(expense);
            showToast('Biaya berhasil disimpan', 'success');
            this.closeModal();
            this.loadData();
        } catch (error) {
            console.error('Save error:', error);
            showToast('Gagal menyimpan biaya: ' + (error.message || ''), 'error');
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = 'Simpan Pengeluaran'; }
        }
    },

    async handleDelete(id) {
        const ok = await showConfirm({ title: 'Hapus Pengeluaran', message: 'Data pengeluaran ini akan dihapus permanen. Lanjutkan?', confirmText: 'Hapus', type: 'danger' });
        if (!ok) return;
        try {
            await window.expensesAPI.delete(id);
            window.appStore.addNotification('Data dihapus', 'success');
            this.loadData();
        } catch (error) {
            window.appStore.addNotification('Gagal menghapus data', 'danger');
        }
    }
};

window.expensePage = expensePage;
