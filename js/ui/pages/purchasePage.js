/**
 * Purchase Page - Restock items from suppliers
 */
const purchasePage = {
    activeTab: 'new', // new, history
    state: {
        items: [],
        suppliers: [],
        products: [],
        history: [],
        filteredHistory: [],
        currentPage: 1,
        rowsPerPage: 10,
        selectedSupplier: '',
        invoice_number: 'PUR-' + Date.now()
    },

    async render() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="page-container">
                <header class="page-header flex-between" style="margin-bottom: 24px;">
                    <div>
                        <h1 class="page-title">Restock / Pembelian</h1>
                        <p class="page-subtitle">Tambah stok barang dari supplier</p>
                    </div>
                </header>

                <!-- Tabs -->
                <div class="flex" style="gap: 12px; margin-bottom: 24px;">
                    <button class="btn ${this.activeTab === 'new' ? 'btn-primary' : 'btn-outline'}" onclick="purchasePage.switchTab('new')">
                        Restock Baru
                    </button>
                    <button class="btn ${this.activeTab === 'history' ? 'btn-primary' : 'btn-outline'}" onclick="purchasePage.switchTab('history')">
                        Riwayat Restock
                    </button>
                </div>

                <div id="purchase-content">
                    ${this.activeTab === 'new' ? this.renderNewForm() : this.renderHistory()}
                </div>
            </div>
        `;

        if (this.activeTab === 'new') {
            await this.loadInitialData();
            this.addRow(); 
        } else {
            await this.loadHistory();
        }
        
        if (window.lucide) window.lucide.createIcons();
    },

    switchTab(tab) {
        this.activeTab = tab;
        this.render();
    },

    renderNewForm() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-3" style="gap: 24px;">
                <!-- Input Section -->
                <div class="md:col-span-2">
                    <div class="card p-24" style="margin-bottom: 24px;">
                        <div class="grid grid-cols-2" style="gap: 16px; margin-bottom: 24px;">
                            <div class="form-group">
                                <label>Supplier</label>
                                <input id="pur-supplier" class="search-input" style="padding-left: 16px;" placeholder="Cari supplier...">
                            </div>
                            <div class="form-group">
                                <label>No. Faktur</label>
                                <input type="text" id="pur-invoice" class="search-input" style="padding-left: 16px;" value="${this.state.invoice_number}">
                            </div>
                        </div>

                        <hr style="margin-bottom: 24px; border-top: 1px solid var(--border);">

                        <div class="flex-between" style="margin-bottom: 16px;">
                            <h4>Daftar Barang</h4>
                            <button class="btn btn-outline btn-sm" onclick="purchasePage.addRow()">
                                <i data-lucide="plus"></i> Tambah Baris
                            </button>
                        </div>

                        <div id="purchase-items-container">
                            <!-- Dynamic rows -->
                        </div>
                    </div>
                </div>

                <!-- Summary Section -->
                <div class="md:col-span-1">
                    <div class="card p-24" style="position: sticky; top: 24px;">
                        <h3 style="margin-bottom: 24px;">Ringkasan</h3>
                        <div class="flex-between" style="margin-bottom: 12px; font-size: 14px;">
                            <span class="text-muted">Total Pembelian</span>
                            <h2 id="summary-total" style="color: var(--primary);">Rp 0</h2>
                        </div>
                        <div class="flex-between" style="margin-bottom: 32px; font-size: 14px;">
                            <span class="text-muted">Item Terpilih</span>
                            <span id="summary-items" style="font-weight: 600;">0 Item</span>
                        </div>

                        <button class="btn btn-primary" style="width: 100%; height: 50px;" onclick="purchasePage.handleSave()">
                            Simpan Restock
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderHistory() {
        return `
            <div class="card">
                <div class="flex-between" style="margin-bottom: 24px;">
                    <div class="search-container" style="flex: 1; max-width: 400px;">
                        <i data-lucide="search" class="search-icon"></i>
                        <input type="text" id="pur-search" class="search-input" placeholder="Cari no. faktur / supplier..." oninput="purchasePage.handleHistorySearch()">
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>No. Faktur</th>
                                <th>Supplier</th>
                                <th style="text-align: right;">Total</th>
                                <th style="text-align: center;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="pur-history-body">
                            <!-- Injected -->
                        </tbody>
                    </table>
                    <div id="pur-pagination" class="pagination"></div>
                </div>
            </div>
        `;
    },

    async loadHistory() {
        try {
            window.appStore.setLoading(true);
            const history = await window.purchasesAPI.getAll();
            this.state.history = history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            this.state.filteredHistory = [...this.state.history];
            this.renderHistoryTable();
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            window.appStore.setLoading(false);
        }
    },

    handleHistorySearch() {
        const query = document.getElementById('pur-search').value.toLowerCase();
        this.state.filteredHistory = this.state.history.filter(h => 
            h.invoice_number.toLowerCase().includes(query) || 
            (h.suppliers && h.suppliers.name.toLowerCase().includes(query))
        );
        this.state.currentPage = 1;
        this.renderHistoryTable();
    },

    renderHistoryTable() {
        const tbody = document.getElementById('pur-history-body');
        if (!tbody) return;

        const start = (this.state.currentPage - 1) * this.state.rowsPerPage;
        const end = start + this.state.rowsPerPage;
        const paginatedItems = this.state.filteredHistory.slice(start, end);

        if (paginatedItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px;">Tidak ada data pembeliaan</td></tr>`;
            document.getElementById('pur-pagination').innerHTML = '';
            return;
        }

        tbody.innerHTML = paginatedItems.map(item => `
            <tr>
                <td>${new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                <td><span class="badge badge-info">${item.invoice_number}</span></td>
                <td>${item.suppliers ? item.suppliers.name : '-'}</td>
                <td style="text-align: right; font-weight: 600;">Rp ${item.total.toLocaleString('id-ID')}</td>
                <td style="text-align: center;">
                    <button class="btn btn-outline btn-sm" onclick="purchasePage.viewDetail('${item.id}')">
                        <i data-lucide="eye" style="width: 16px;"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        this.renderPagination();
        if (window.lucide) window.lucide.createIcons();
    },

    renderPagination() {
        const totalPages = Math.ceil(this.state.filteredHistory.length / this.state.rowsPerPage);
        const container = document.getElementById('pur-pagination');
        if (!container) return;

        let html = `
            <span class="text-muted" style="font-size: 14px;">
                Showing ${Math.min(this.state.filteredHistory.length, (this.state.currentPage - 1) * this.state.rowsPerPage + 1)} 
                to ${Math.min(this.state.filteredHistory.length, this.state.currentPage * this.state.rowsPerPage)} 
                of ${this.state.filteredHistory.length} entries
            </span>
            <div class="flex" style="gap: 8px;">
        `;

        // Prev
        html += `<button class="btn btn-outline btn-sm" ${this.state.currentPage === 1 ? 'disabled' : ''} onclick="purchasePage.changePage(${this.state.currentPage - 1})">Prev</button>`;

        // Pages
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.state.currentPage - 1 && i <= this.state.currentPage + 1)) {
                html += `<button class="btn ${this.state.currentPage === i ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="purchasePage.changePage(${i})">${i}</button>`;
            } else if (i === this.state.currentPage - 2 || i === this.state.currentPage + 2) {
                html += `<span style="padding: 0 4px;">...</span>`;
            }
        }

        // Next
        html += `<button class="btn btn-outline btn-sm" ${this.state.currentPage === totalPages ? 'disabled' : ''} onclick="purchasePage.changePage(${this.state.currentPage + 1})">Next</button>`;

        html += `</div>`;
        container.innerHTML = html;
    },

    changePage(page) {
        this.state.currentPage = page;
        this.renderHistoryTable();
    },

    async viewDetail(id) {
        showToast('Fitur detail pembelian sedang dikembangkan', 'info');
    },

    async loadInitialData() {
        try {
            const [suppliers, products] = await Promise.all([
                window.suppliersAPI.getAll(),
                window.productsAPI.getAll()
            ]);

            this.state.suppliers = suppliers;
            this.state.products = products;

            const supEl = document.getElementById('pur-supplier');
            if (supEl) {
                this.acSupplier = createAutocomplete({
                    inputEl: supEl,
                    items: suppliers.map(s => ({ value: String(s.id), label: s.name })),
                    placeholder: 'Cari supplier...',
                    onSelect: (value) => { this.state.selectedSupplier = value; }
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    },

    addRow() {
        const container = document.getElementById('purchase-items-container');
        if (!container) return;

        const id = Date.now();
        const row = document.createElement('div');
        row.className = 'purchase-row grid grid-cols-12 card-border p-16';
        row.style.gap = '12px';
        row.style.marginBottom = '12px';
        row.style.backgroundColor = 'var(--bg-secondary)';
        row.style.borderRadius = '12px';
        row.setAttribute('data-id', id);
        
        row.innerHTML = `
            <div class="col-span-12 md:col-span-5">
                <label style="font-size: 12px; margin-bottom: 4px; display: block;">Produk</label>
                <select class="search-input pur-prod-select" style="padding-left: 16px;" onchange="purchasePage.updateRow(${id})">
                    <option value="">Pilih Produk...</option>
                    ${this.state.products.map(p => `<option value="${p.id}" data-price="${p.purchase_price || 0}">${p.nama_produk}</option>`).join('')}
                </select>
            </div>
            <div class="col-span-4 md:col-span-2">
                <label style="font-size: 12px; margin-bottom: 4px; display: block;">Quantity</label>
                <input type="number" class="search-input pur-qty" placeholder="0" oninput="purchasePage.updateRow(${id})" style="padding-left: 12px;">
            </div>
            <div class="col-span-6 md:col-span-4">
                <label style="font-size: 12px; margin-bottom: 4px; display: block;">Harga Beli (Satuan)</label>
                <input type="text" class="search-input pur-price rupiah-input" placeholder="0" oninput="purchasePage.updateRow(${id})" style="padding-left: 12px;" inputmode="numeric">
            </div>
            <div class="col-span-2 md:col-span-1 flex-center" style="padding-top: 20px;">
                <button class="text-danger" onclick="this.closest('.purchase-row').remove(); purchasePage.calculateTotal()">
                    <i data-lucide="trash-2" style="width: 18px;"></i>
                </button>
            </div>
        `;

        container.appendChild(row);
        applyRupiahFormatter('.rupiah-input');
        if (window.lucide) window.lucide.createIcons();
    },

    updateRow(id) {
        const row = document.querySelector(`.purchase-row[data-id="${id}"]`);
        const select = row.querySelector('.pur-prod-select');
        const priceInput = row.querySelector('.pur-price');
        
        if (select.value && !priceInput.value) {
            const selectedOpt = select.options[select.selectedIndex];
            priceInput.value = selectedOpt.getAttribute('data-price');
        }

        this.calculateTotal();
    },

    calculateTotal() {
        let total = 0;
        let itemCount = 0;
        const rows = document.querySelectorAll('.purchase-row');
        
        rows.forEach(row => {
            const qty = parseFloat(row.querySelector('.pur-qty').value) || 0;
            const price = getRawValue(row.querySelector('.pur-price'));
            if (row.querySelector('.pur-prod-select').value) {
                total += qty * price;
                itemCount++;
            }
        });

        const totalEl = document.getElementById('summary-total');
        const countEl = document.getElementById('summary-items');
        if (totalEl) totalEl.innerText = `Rp ${total.toLocaleString('id-ID')}`;
        if (countEl) countEl.innerText = `${itemCount} Item`;
    },

    async handleSave() {
        const supplier_id = this.acSupplier ? this.acSupplier.getValue() : this.state.selectedSupplier;
        if (!supplier_id) {
            showToast('Pilih supplier terlebih dahulu!', 'warning');
            return;
        }

        const rows = document.querySelectorAll('.purchase-row');
        const items = [];
        let total = 0;

        rows.forEach(row => {
            const product_id = row.querySelector('.pur-prod-select').value;
            const qty = parseInt(row.querySelector('.pur-qty').value);
            const price = getRawValue(row.querySelector('.pur-price'));

            if (product_id && qty > 0) {
                items.push({ id: product_id, qty, price });
                total += qty * price;
            }
        });

        if (items.length === 0) {
            showToast('Tambahkan barang untuk restock!', 'warning');
            return;
        }

        try {
            window.appStore.setLoading(true);
            const purchaseData = {
                invoice_number: document.getElementById('pur-invoice').value,
                supplier_id: supplier_id,
                total: total
            };

            await window.purchasesAPI.create(purchaseData, items);
            window.appStore.addNotification('Stok berhasil diperbarui!', 'success');
            
            this.state.invoice_number = 'PUR-' + Date.now();
            this.activeTab = 'history'; // Switch to history to see new entry
            this.render();
        } catch (error) {
            console.error('Save error:', error);
            window.appStore.addNotification('Gagal menyimpan restock', 'danger');
        } finally {
            window.appStore.setLoading(false);
        }
    }
};

window.purchasePage = purchasePage;
