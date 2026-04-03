/**
 * Settings & Master Data Page
 */
const settingsPage = {
    activeTab: 'products', // products, customers, suppliers, users, store
    data: [],
    filteredData: [],
    currentPage: 1,
    rowsPerPage: 10,

    render() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="page-container">
                <header style="margin-bottom: 32px;">
                    <h1 style="font-size: 28px; margin-bottom: 4px;">Pengaturan & Master Data</h1>
                    <p class="text-muted">Kelola data dasar aplikasi dan konfigurasi toko</p>
                </header>

                <div class="card" style="padding: 0; overflow: hidden;">
                    <div class="settings-layout" style="display: flex; min-height: 600px;">
                        <!-- Sidebar Tabs -->
                        <aside style="width: 240px; border-right: 1px solid var(--border); background: var(--bg-main); padding: 24px 16px;">
                            <nav style="display: flex; flex-direction: column; gap: 8px;">
                                ${this._canAccess('master_products') ? `<button class="settings-tab-btn ${this.activeTab === 'products' ? 'active' : ''}" onclick="settingsPage.switchTab('products')">
                                    <i data-lucide="package"></i> Produk & Stok
                                </button>` : ''}
                                ${this._canAccess('master_customers') ? `<button class="settings-tab-btn ${this.activeTab === 'customers' ? 'active' : ''}" onclick="settingsPage.switchTab('customers')">
                                    <i data-lucide="users"></i> Pelanggan
                                </button>` : ''}
                                ${this._canAccess('master_suppliers') ? `<button class="settings-tab-btn ${this.activeTab === 'suppliers' ? 'active' : ''}" onclick="settingsPage.switchTab('suppliers')">
                                    <i data-lucide="truck"></i> Supplier
                                </button>` : ''}
                                ${this._canAccess('master_users') ? `<button class="settings-tab-btn ${this.activeTab === 'users' ? 'active' : ''}" onclick="settingsPage.switchTab('users')">
                                    <i data-lucide="shield-check"></i> Pengguna / Staff
                                </button>` : ''}
                                ${this._canAccess('master_access') ? `<button class="settings-tab-btn ${this.activeTab === 'access' ? 'active' : ''}" onclick="settingsPage.switchTab('access')">
                                    <i data-lucide="lock"></i> Hak Akses
                                </button>` : ''}
                                ${this._canAccess('master_categories') ? `<button class="settings-tab-btn ${this.activeTab === 'categories' ? 'active' : ''}" onclick="settingsPage.switchTab('categories')">
                                    <i data-lucide="tag"></i> Kategori
                                </button>` : ''}
                                <div style="height: 1px; background: var(--border); margin: 16px 0;"></div>
                                ${this._canAccess('master_store') ? `<button class="settings-tab-btn ${this.activeTab === 'store' ? 'active' : ''}" onclick="settingsPage.switchTab('store')">
                                    <i data-lucide="store"></i> Informasi Toko
                                </button>` : ''}
                            </nav>
                        </aside>

                        <!-- Content Area -->
                        <main style="flex: 1; padding: 32px;" id="settings-tab-content">
                            ${this.renderActiveTab()}
                        </main>
                    </div>
                </div>
            </div>
            
            <!-- Global Settings Modal -->
            <div id="settings-modal" class="modal-container" style="display:none;"></div>
        `;

        if (window.lucide) window.lucide.createIcons();
        this.addStylesIfMissing();
        this.loadData();
        if (this.activeTab === 'store') this.setupStoreListener();
    },


    async loadData() {
        const contentArea = document.getElementById('settings-tab-content');
        if (this.activeTab === 'store') return;

        try {
            if (this.activeTab === 'products') {
                this.data = await window.productsAPI.getAll();
                this.filteredData = [...this.data];
                this.renderProductsTable();
            } else if (this.activeTab === 'customers') {
                this.data = await window.customersAPI.getAll();
                this.filteredData = [...this.data];
                this.renderCustomersTable();
            } else if (this.activeTab === 'suppliers') {
                this.data = await window.suppliersAPI.getAll();
                this.filteredData = [...this.data];
                this.renderSuppliersTable();
            } else if (this.activeTab === 'users') {
                this.data = await window.usersAPI.getAll();
                this.filteredData = [...this.data];
                this.renderUsersTable();
            } else if (this.activeTab === 'access') {
                this.renderAccessPage();
            } else if (this.activeTab === 'categories') {
                this.renderCategoriesTab();
            }
        } catch (error) {
            console.error('Error loading settings data:', error);
            window.appStore.addNotification('Gagal memuat data', 'error');
        }
    },

    switchTab(tab) {
        this.activeTab = tab;
        this.render();
    },

    renderActiveTab() {
        switch(this.activeTab) {
            case 'products': return `<div id="products-list-container">Memuat data...</div>`;
            case 'customers': return `<div id="customers-list-container">Memuat data...</div>`;
            case 'suppliers': return `<div id="suppliers-list-container">Memuat data...</div>`;
            case 'users': return `<div id="users-list-container">Memuat data...</div>`;
            case 'access': return `<div id="access-container">Memuat data...</div>`;
            case 'categories': return `<div id="categories-container">Memuat data...</div>`;
            case 'store': return this.renderStoreConfig();
            default: return 'Tab not found';
        }
    },

    // --- PRODUCTS & STOCK ---
    renderProductsTable() {
        const container = document.getElementById('products-list-container');
        if (!container) return;

        container.innerHTML = `
            <div class="flex-between" style="margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
                <h2 style="font-size: 20px;">Daftar Produk</h2>
                <div class="flex" style="gap: 12px; flex-wrap: wrap;">
                    <div class="search-container" style="width: 260px;">
                        <i data-lucide="search" class="search-icon"></i>
                        <input type="text" id="master-search" class="search-input" placeholder="Cari produk..." oninput="settingsPage.handleSearch()">
                    </div>
                    <button class="btn btn-outline" onclick="settingsPage.showBulkModal()">
                        <i data-lucide="layers"></i> Bulk Input
                    </button>
                    <button class="btn btn-outline" onclick="settingsPage.showProductListModal()">
                        <i data-lucide="list"></i> Daftar Produk
                    </button>
                    <button class="btn btn-primary" onclick="settingsPage.showProductModal()">
                        <i data-lucide="plus"></i> Tambah Produk
                    </button>
                </div>
            </div>
            <div class="flex-between" style="margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                <div id="master-rows-selector"></div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Produk</th>
                            <th>Kategori</th>
                            <th style="text-align: right;">Harga Jual</th>
                            <th style="text-align: center;">Stok</th>
                            <th style="text-align: center;" class="table-hide-mobile">Stok Min</th>
                            <th style="text-align: center;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="master-table-body"></tbody>
                </table>
                <div id="master-pagination" class="pagination"></div>
            </div>
        `;
        renderRowsSelector({
            current: this.rowsPerPage,
            containerId: 'master-rows-selector',
            onChange: `(n) => { settingsPage.rowsPerPage = n; settingsPage.currentPage = 1; settingsPage.renderTableData(); }`
        });
        this.renderTableData();
    },

    async showProductModal(id = null) {
        const product = id ? this.data.find(p => String(p.id) === String(id)) : null;
        const modal = document.getElementById('settings-modal');

        // Load categories for dropdown
        const categories = await window.categoryAPI.getAll();
        const categoryOptions = categories.map(c =>
            `<option value="${c.id}" ${product?.category_id == c.id ? 'selected' : ''}>${c.name}</option>`
        ).join('');
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>${id ? 'Edit' : 'Tambah'} Produk</h2>
                    <button class="close-btn-red" onclick="settingsPage.closeModal()">Tutup</button>
                </div>
                <form id="product-form">
                    <div class="grid grid-cols-2" style="gap: 16px;">
                        <div class="form-group col-span-2">
                            <label>Nama Produk</label>
                            <input type="text" name="name" value="${product?.name || ''}" class="search-input" style="padding-left: 12px;" required>
                        </div>
                        <div class="form-group">
                            <label>Kategori</label>
                            <input id="ac-category" class="search-input" style="padding-left: 12px;" placeholder="Cari kategori...">
                        </div>
                        <div class="form-group">
                            <label>Satuan</label>
                            <input id="ac-unit" class="search-input" style="padding-left: 12px;" placeholder="Cari satuan...">
                        </div>
                        <div class="form-group">
                            <label>Harga Beli</label>
                            <input type="text" name="purchase_price" value="${product?.purchase_price || 0}" class="search-input rupiah-input" style="padding-left: 12px;" inputmode="numeric">
                        </div>
                        <div class="form-group">
                            <label>Harga Jual</label>
                            <input type="text" name="selling_price" value="${product?.selling_price || 0}" class="search-input rupiah-input" style="padding-left: 12px;" inputmode="numeric" required>
                        </div>
                        <div class="form-group">
                            <label>Stok Saat Ini</label>
                            <input type="number" name="stock" value="${product?.stock ?? 0}" class="search-input" style="padding-left: 12px;">
                        </div>
                        <div class="form-group">
                            <label>Stok Minimal <span style="font-size:11px;color:var(--text-muted);">(warning ≤ nilai ini)</span></label>
                            <input type="number" name="min_stock" value="${product?.min_stock ?? 5}" class="search-input" style="padding-left: 12px;">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 24px;">Simpan Produk</button>
                </form>
            </div>
        `;
        
        modal.style.display = 'flex';
        applyRupiahFormatter('.rupiah-input');

        const unitList = ['Pcs','Lusin','Kodi','Gross','Rim','Box','Dus','Karton','Pack','Botol','Kaleng','Tube','Karung','Palet','Miligram','Gram','Kilogram','Kuintal','Ton','Mililiter','Liter','Galon','Meter','Centimeter','Roll','Meter Persegi','Set','Blister','Tablet','Pasang','Renceng','Toples'];

        const acCategory = createAutocomplete({
            inputEl: document.getElementById('ac-category'),
            items: categories.map(c => ({ value: String(c.id), label: c.name })),
            placeholder: 'Cari kategori...',
            initialValue: product?.category_id ? String(product.category_id) : '',
            initialLabel: product?.categories?.name || ''
        });

        const acUnit = createAutocomplete({
            inputEl: document.getElementById('ac-unit'),
            items: unitList.map(u => ({ value: u, label: u })),
            placeholder: 'Cari satuan...',
            initialValue: product?.unit || 'Pcs',
            initialLabel: product?.unit || 'Pcs'
        });

        document.getElementById('product-form').onsubmit = async (e) => {
            e.preventDefault();
            const rawCategoryId = acCategory.getValue();
            const formData = {
                name: e.target.name.value,
                category_id: rawCategoryId ? parseInt(rawCategoryId) : null,
                unit: acUnit.getValue() || 'Pcs',
                purchase_price: getRawValue(e.target.purchase_price),
                selling_price: getRawValue(e.target.selling_price),
                stock: parseInt(e.target.stock.value) ?? 0,
                min_stock: parseInt(e.target.min_stock.value) ?? 5
            };
            
            try {
                if (id) {
                    await window.productsAPI.update(id, formData);
                    window.appStore.addNotification('Produk diperbarui', 'success');
                } else {
                    await window.productsAPI.create(formData);
                    window.appStore.addNotification('Produk berhasil ditambahkan', 'success');
                }
                this.closeModal();
                this.loadData();
            } catch (err) {
                console.error(err);
                window.appStore.addNotification('Gagal menyimpan produk', 'error');
            }
        };
    },

    async deleteProduct(id) {
        const ok = await showConfirm({ title: 'Hapus Produk', message: 'Produk ini akan dihapus permanen. Lanjutkan?', confirmText: 'Hapus', type: 'danger' });
        if (!ok) return;
        try {
            await window.productsAPI.delete(id);
            window.appStore.addNotification('Produk dihapus', 'success');
            this.loadData();
        } catch (err) {
            window.appStore.addNotification('Gagal menghapus produk', 'error');
        }
    },

    async showBulkModal() {
        const modal = document.getElementById('settings-modal');
        const categories = await window.categoryAPI.getAll();
        const unitList = ['Pcs','Lusin','Kodi','Gross','Rim','Box','Dus','Karton','Pack','Botol','Kaleng','Tube','Karung','Palet','Miligram','Gram','Kilogram','Kuintal','Ton','Mililiter','Liter','Galon','Meter','Centimeter','Roll','Meter Persegi','Set','Blister','Tablet','Pasang','Renceng','Toples'];

        // Inline style untuk input kecil di bulk table
        const inp = `font-size:12px;padding:5px 7px;height:30px;border-radius:8px;border:1px solid var(--border);background:var(--bg-main);width:100%;box-sizing:border-box;`;

        const buildRow = (i) => `
            <tr data-row="${i}" style="border-bottom:1px solid var(--border);">
                <td style="padding:4px 5px;"><input type="text" name="name" style="${inp}min-width:120px;" placeholder="Nama produk" required></td>
                <td style="padding:4px 5px;">
                    <input type="text" name="category_label" list="bulk-cat-list-${i}" style="${inp}width:110px;" placeholder="Kategori">
                    <input type="hidden" name="category_id">
                    <datalist id="bulk-cat-list-${i}">${categories.map(c=>`<option value="${c.name}" data-id="${c.id}">`).join('')}</datalist>
                </td>
                <td style="padding:4px 5px;">
                    <input type="text" name="unit" list="bulk-unit-list-${i}" style="${inp}width:90px;" placeholder="Satuan" value="Pcs">
                    <datalist id="bulk-unit-list-${i}">${unitList.map(u=>`<option value="${u}">`).join('')}</datalist>
                </td>
                <td style="padding:4px 5px;"><input type="text" name="purchase_price" style="${inp}width:90px;" placeholder="0" inputmode="numeric" class="rupiah-input"></td>
                <td style="padding:4px 5px;"><input type="text" name="selling_price" style="${inp}width:90px;" placeholder="0" inputmode="numeric" class="rupiah-input" required></td>
                <td style="padding:4px 5px;"><input type="number" name="stock" style="${inp}width:55px;" placeholder="0" value="0"></td>
                <td style="padding:4px 5px;"><input type="number" name="min_stock" style="${inp}width:55px;" placeholder="5" value="5"></td>
                <td style="padding:4px 5px;text-align:center;">
                    <button type="button" onclick="this.closest('tr').remove()" style="color:var(--danger);padding:2px;background:none;border:none;cursor:pointer;">
                        <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                    </button>
                </td>
            </tr>
        `;

        modal.innerHTML = `
            <div class="modal-content" style="max-width:860px;width:96%;padding:20px;">
                <div class="modal-header" style="margin-bottom:14px;">
                    <h2 style="font-size:18px;">Bulk Input Produk</h2>
                    <button class="close-btn-red" onclick="settingsPage.closeModal()">Tutup</button>
                </div>
                <p class="text-muted" style="font-size:12px;margin-bottom:12px;">Tambahkan beberapa produk sekaligus. Klik "+ Baris" untuk menambah baris baru.</p>
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="font-size:11px;color:var(--text-muted);background:var(--bg-main);">
                                <th style="padding:6px 5px;text-align:left;min-width:130px;">Nama Produk *</th>
                                <th style="padding:6px 5px;text-align:left;min-width:110px;">Kategori</th>
                                <th style="padding:6px 5px;text-align:left;min-width:90px;">Satuan</th>
                                <th style="padding:6px 5px;text-align:left;min-width:90px;">Harga Beli</th>
                                <th style="padding:6px 5px;text-align:left;min-width:90px;">Harga Jual *</th>
                                <th style="padding:6px 5px;text-align:left;min-width:55px;">Stok</th>
                                <th style="padding:6px 5px;text-align:left;min-width:55px;">Min</th>
                                <th style="padding:6px 5px;width:28px;"></th>
                            </tr>
                        </thead>
                        <tbody id="bulk-rows">
                            ${buildRow(0)}
                            ${buildRow(1)}
                            ${buildRow(2)}
                        </tbody>
                    </table>
                </div>
                <div class="flex-between" style="margin-top:14px;">
                    <button type="button" class="btn btn-outline btn-sm" id="bulk-add-row" style="font-size:12px;">
                        <i data-lucide="plus"></i> Tambah Baris
                    </button>
                    <div class="flex" style="gap:10px;">
                        <button type="button" class="btn btn-outline" onclick="settingsPage.closeModal()" style="font-size:13px;">Batal</button>
                        <button type="button" class="btn btn-primary" id="bulk-save-btn" style="font-size:13px;">
                            <i data-lucide="save"></i> Simpan Semua
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        if (window.lucide) window.lucide.createIcons();
        applyRupiahFormatter('.rupiah-input');

        // Resolve category_id dari label saat input berubah
        const resolveCatId = (row) => {
            const label = row.querySelector('[name="category_label"]').value.trim();
            const match = categories.find(c => c.name.toLowerCase() === label.toLowerCase());
            row.querySelector('[name="category_id"]').value = match ? match.id : '';
        };
        document.getElementById('bulk-rows').addEventListener('change', e => {
            if (e.target.name === 'category_label') resolveCatId(e.target.closest('tr'));
        });

        let rowCount = 3;
        document.getElementById('bulk-add-row').addEventListener('click', () => {
            const tbody = document.getElementById('bulk-rows');
            const div = document.createElement('tbody');
            div.innerHTML = buildRow(rowCount++);
            const tr = div.firstElementChild;
            tbody.appendChild(tr);
            applyRupiahFormatter('.rupiah-input');
            if (window.lucide) window.lucide.createIcons();
        });

        document.getElementById('bulk-save-btn').addEventListener('click', async () => {
            const rows = document.querySelectorAll('#bulk-rows tr');
            const products = [];

            rows.forEach(row => {
                const name = row.querySelector('[name="name"]').value.trim();
                if (!name) return;
                // Resolve category_id dari hidden input (diisi saat change event)
                const catLabel = row.querySelector('[name="category_label"]')?.value.trim();
                let catVal = row.querySelector('[name="category_id"]')?.value;
                if (!catVal && catLabel) {
                    const match = categories.find(c => c.name.toLowerCase() === catLabel.toLowerCase());
                    catVal = match ? String(match.id) : '';
                }
                products.push({
                    name,
                    category_id: catVal ? parseInt(catVal) : null,
                    unit: row.querySelector('[name="unit"]').value || 'Pcs',
                    purchase_price: getRawValue(row.querySelector('[name="purchase_price"]')),
                    selling_price: getRawValue(row.querySelector('[name="selling_price"]')),
                    stock: parseInt(row.querySelector('[name="stock"]').value) || 0,
                    min_stock: parseInt(row.querySelector('[name="min_stock"]').value) || 5
                });
            });

            if (products.length === 0) {
                showToast('Isi minimal satu produk', 'warning');
                return;
            }

            const btn = document.getElementById('bulk-save-btn');
            btn.disabled = true;
            btn.textContent = 'Menyimpan...';

            try {
                // Check duplicates first
                const names = products.map(p => p.name);
                const dupes = await window.productsAPI.checkDuplicates(names);
                if (dupes.length > 0) {
                    showToast(`Nama sudah ada: ${dupes.join(', ')}`, 'error');
                    btn.disabled = false;
                    btn.innerHTML = '<i data-lucide="save"></i> Simpan Semua';
                    if (window.lucide) window.lucide.createIcons();
                    return;
                }

                const id_toko = window.authStore.state.id_toko;
                const { error } = await window.supabase
                    .from('products')
                    .insert(products.map(p => ({ ...p, id_toko })));

                if (error) throw error;
                showToast(`${products.length} produk berhasil ditambahkan`, 'success');
                this.closeModal();
                this.loadData();
            } catch (err) {
                console.error(err);
                showToast('Gagal menyimpan produk', 'error');
                btn.disabled = false;
                btn.innerHTML = '<i data-lucide="save"></i> Simpan Semua';
                if (window.lucide) window.lucide.createIcons();
            }
        });
    },

    async showProductListModal() {
        const modal = document.getElementById('settings-modal');
        modal.innerHTML = `
            <div class="modal-content" style="max-width:700px;width:95%;padding:28px;">
                <div class="modal-header" style="margin-bottom:20px;">
                    <h2>Daftar Semua Produk</h2>
                    <button class="close-btn-red" onclick="settingsPage.closeModal()">Tutup</button>
                </div>
                <div class="flex-between" style="margin-bottom:16px;gap:12px;flex-wrap:wrap;">
                    <div class="search-container" style="width:240px;">
                        <i data-lucide="search" class="search-icon"></i>
                        <input type="text" id="plist-search" class="search-input" placeholder="Cari produk..." oninput="settingsPage._plistFilter()">
                    </div>
                    <button class="btn btn-outline" onclick="settingsPage._plistExportPDF()">
                        <i data-lucide="file-text"></i> Simpan PDF
                    </button>
                </div>
                <div style="overflow-x:auto;">
                    <table id="plist-table" style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="font-size:13px;color:var(--text-muted);border-bottom:1px solid var(--border);">
                                <th style="padding:10px 8px;text-align:left;">#</th>
                                <th style="padding:10px 8px;text-align:left;">Nama Produk</th>
                                <th style="padding:10px 8px;text-align:left;">Kategori</th>
                                <th style="padding:10px 8px;text-align:left;">Satuan</th>
                            </tr>
                        </thead>
                        <tbody id="plist-body">
                            <tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-muted);">Memuat data...</td></tr>
                        </tbody>
                    </table>
                </div>
                <div id="plist-pagination" class="pagination" style="margin-top:16px;"></div>
            </div>
        `;
        modal.style.display = 'flex';
        if (window.lucide) window.lucide.createIcons();

        // Load all products
        const allProducts = await window.productsAPI.getAll();
        settingsPage._plistData = allProducts;
        settingsPage._plistFiltered = [...allProducts];
        settingsPage._plistPage = 1;
        settingsPage._plistPerPage = 10;
        settingsPage._plistRender();
    },

    _plistRender() {
        const tbody = document.getElementById('plist-body');
        const pagEl = document.getElementById('plist-pagination');
        if (!tbody) return;

        const data = this._plistFiltered || [];
        const page = this._plistPage || 1;
        const perPage = this._plistPerPage || 10;
        const start = (page - 1) * perPage;
        const slice = data.slice(start, start + perPage);
        const totalPages = Math.ceil(data.length / perPage);

        if (slice.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-muted);">Tidak ada data</td></tr>`;
            if (pagEl) pagEl.innerHTML = '';
            return;
        }

        tbody.innerHTML = slice.map((p, i) => `
            <tr style="border-bottom:1px solid var(--border);font-size:14px;">
                <td style="padding:10px 8px;color:var(--text-muted);">${start + i + 1}</td>
                <td style="padding:10px 8px;font-weight:600;">${p.name}</td>
                <td style="padding:10px 8px;"><span class="badge badge-info">${p.categories?.name || '-'}</span></td>
                <td style="padding:10px 8px;">${p.unit || '-'}</td>
            </tr>
        `).join('');

        // Pagination
        let pHtml = `<span class="text-muted" style="font-size:13px;">${start + 1}–${Math.min(data.length, start + perPage)} dari ${data.length} produk</span><div class="flex" style="gap:8px;">`;
        pHtml += `<button class="btn btn-outline btn-sm" ${page === 1 ? 'disabled' : ''} onclick="settingsPage._plistPage=${page-1};settingsPage._plistRender()">Prev</button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
                pHtml += `<button class="btn ${page === i ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="settingsPage._plistPage=${i};settingsPage._plistRender()">${i}</button>`;
            } else if (i === page - 2 || i === page + 2) {
                pHtml += `<span style="padding:0 4px;">...</span>`;
            }
        }
        pHtml += `<button class="btn btn-outline btn-sm" ${page === totalPages ? 'disabled' : ''} onclick="settingsPage._plistPage=${page+1};settingsPage._plistRender()">Next</button></div>`;
        if (pagEl) pagEl.innerHTML = pHtml;
    },

    _plistFilter() {
        const q = (document.getElementById('plist-search')?.value || '').toLowerCase();
        this._plistFiltered = (this._plistData || []).filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.categories?.name || '').toLowerCase().includes(q) ||
            (p.unit || '').toLowerCase().includes(q)
        );
        this._plistPage = 1;
        this._plistRender();
    },

    _plistExportPDF() {
        const data = this._plistFiltered || [];
        const storeName = window.appConfig?.store?.name || 'ZinPOS Pro';
        const now = new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });

        const rows = data.map((p, i) => `
            <tr>
                <td style="padding:6px 10px;border:1px solid #ddd;">${i + 1}</td>
                <td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;">${p.name}</td>
                <td style="padding:6px 10px;border:1px solid #ddd;">${p.categories?.name || '-'}</td>
                <td style="padding:6px 10px;border:1px solid #ddd;">${p.unit || '-'}</td>
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html><html><head>
            <meta charset="UTF-8">
            <title>Daftar Produk - ${storeName}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 24px; color: #333; }
                h2 { margin: 0 0 4px; } p { margin: 0 0 16px; color: #666; font-size: 13px; }
                table { width: 100%; border-collapse: collapse; font-size: 13px; }
                thead tr { background: #f5f5f5; }
                th { padding: 8px 10px; border: 1px solid #ddd; text-align: left; }
                tr:nth-child(even) { background: #fafafa; }
                @media print { body { padding: 0; } }
            </style>
            </head><body>
            <h2>${storeName}</h2>
            <p>Daftar Produk &mdash; Dicetak: ${now} &mdash; Total: ${data.length} produk</p>
            <table>
                <thead><tr><th>#</th><th>Nama Produk</th><th>Kategori</th><th>Satuan</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
            </body></html>
        `;

        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 500);
    },

    // --- SHARED TABLE LOGIC ---
    handleSearch() {
        const query = document.getElementById('master-search').value.toLowerCase();
        if (this.activeTab === 'products') {
            this.filteredData = this.data.filter(p => p.name.toLowerCase().includes(query) || (p.category_id && String(p.category_id).toLowerCase().includes(query)));
        } else if (this.activeTab === 'customers') {
            this.filteredData = this.data.filter(c => c.name.toLowerCase().includes(query));
        } else if (this.activeTab === 'suppliers') {
            this.filteredData = this.data.filter(s => s.name.toLowerCase().includes(query));
        } else if (this.activeTab === 'users') {
            this.filteredData = this.data.filter(u => (u.full_name || u.username).toLowerCase().includes(query));
        }
        this.currentPage = 1;
        this.renderTableData();
    },

    renderTableData() {
        const tbody = document.getElementById('master-table-body');
        if (!tbody) return;

        const start = (this.currentPage - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;
        const paginatedItems = this.filteredData.slice(start, end);

        if (paginatedItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 40px;">Tidak ada data ditemukan</td></tr>`;
            if (document.getElementById('master-pagination')) document.getElementById('master-pagination').innerHTML = '';
            return;
        }

        tbody.innerHTML = paginatedItems.map(item => this.renderTableRow(item)).join('');
        this.renderPagination();
        if (window.lucide) window.lucide.createIcons();
    },

    renderTableRow(item) {
        switch(this.activeTab) {
            case 'products':
                return `
                    <tr>
                        <td style="font-weight: 600;">${item.name}</td>
                        <td><span class="badge badge-info">${item.categories?.name || '-'}</span></td>
                        <td style="text-align: right; font-weight: 600;">Rp ${(item.selling_price || 0).toLocaleString('id-ID')}</td>
                        <td style="text-align: center;">
                            ${(() => {
                                const stock = item.stock || 0;
                                const min = item.min_stock ?? 5;
                                const isOut = stock === 0;
                                const isLow = stock <= min && !isOut;
                                const cls = isOut ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success';
                                const label = isOut ? '⚠ Habis' : isLow ? `⚠ ${stock}` : stock;
                                return `<span class="badge ${cls}">${label} ${item.unit || ''}</span>`;
                            })()}
                        </td>
                        <td style="text-align: center;" class="table-hide-mobile">${item.min_stock ?? 5} ${item.unit || ''}</td>
                        <td style="text-align: center;">
                            <div class="flex-center" style="gap: 8px;">
                                <button class="btn btn-outline btn-sm" onclick="settingsPage.showProductModal('${item.id}')">Edit</button>
                                <button class="btn btn-outline btn-warning btn-sm" onclick="settingsPage.deleteProduct('${item.id}')">Hapus</button>
                            </div>
                        </td>
                    </tr>
                `;
            case 'customers':
                return `
                    <tr>
                        <td style="font-weight: 600;">${item.name}</td>
                        <td>${item.phone || '-'}</td>
                        <td style="text-align: center;">
                            <div class="flex-center" style="gap: 8px;">
                                <button class="btn btn-outline btn-sm" onclick="settingsPage.showCustomerModal('${item.id}')">Edit</button>
                                <button class="btn btn-outline btn-warning btn-sm" onclick="settingsPage.deleteCustomer('${item.id}')">Hapus</button>
                            </div>
                        </td>
                    </tr>
                `;
            case 'suppliers':
                return `
                    <tr>
                        <td style="font-weight: 600;">${item.name}</td>
                        <td>${item.phone || '-'}</td>
                        <td style="text-align: center;">
                            <div class="flex-center" style="gap: 8px;">
                                <button class="btn btn-outline btn-sm" onclick="settingsPage.showSupplierModal('${item.id}')">Edit</button>
                                <button class="btn btn-outline btn-warning btn-sm" onclick="settingsPage.deleteSupplier('${item.id}')">Hapus</button>
                            </div>
                        </td>
                    </tr>
                `;
            case 'users':
                return `
                    <tr>
                        <td style="font-weight: 600;">${item.nama_user || item.username}</td>
                        <td><span class="badge badge-info">${item.role || 'Staff'}</span></td>
                        <td style="text-align: center;">
                            <div class="flex-center" style="gap: 8px;">
                                <button class="btn btn-outline btn-sm" onclick="settingsPage.showUserModal('${item.id_user}')">Edit</button>
                                <button class="btn btn-outline btn-warning btn-sm" onclick="settingsPage.deleteUser('${item.id_user}')">Hapus</button>
                            </div>
                        </td>
                    </tr>
                `;
            default: return '';
        }
    },

    renderPagination() {
        renderPagination({
            currentPage: this.currentPage,
            totalItems: this.filteredData.length,
            rowsPerPage: this.rowsPerPage,
            containerId: 'master-pagination',
            onPageChange: `(p) => { settingsPage.changePage(p); }`
        });
    },

    changePage(page) {
        this.currentPage = page;
        this.renderTableData();
    },

    // --- CUSTOMERS ---
    renderCustomersTable() {
        const container = document.getElementById('customers-list-container');
        if (!container) return;

        container.innerHTML = `
            <div class="flex-between" style="margin-bottom: 24px;">
                <h2 style="font-size: 20px;">Daftar Pelanggan</h2>
                <div class="flex" style="gap: 12px;">
                    <div class="search-container" style="width: 300px;">
                        <i data-lucide="search" class="search-icon"></i>
                        <input type="text" id="master-search" class="search-input" placeholder="Cari pelanggan..." oninput="settingsPage.handleSearch()">
                    </div>
                    <button class="btn btn-primary" onclick="settingsPage.showCustomerModal()">
                        <i data-lucide="plus"></i> Tambah Pelanggan
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Kontak</th>
                            <th style="text-align: center;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="master-table-body">
                        <!-- Injected -->
                    </tbody>
                </table>
                <div id="master-pagination" class="pagination"></div>
            </div>
        `;
        this.renderTableData();
    },

    showCustomerModal(id = null) {
        const customer = id ? this.data.find(c => String(c.id) === String(id)) : null;
        const modal = document.getElementById('settings-modal');
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>${id ? 'Edit' : 'Tambah'} Pelanggan</h2>
                    <button class="close-btn-red" onclick="settingsPage.closeModal()">Tutup</button>
                </div>
                <form id="customer-form">
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label>Nama Lengkap</label>
                        <input type="text" name="name" value="${customer?.name || ''}" class="search-input" style="padding-left: 12px;" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label>Nomor Telepon</label>
                        <input type="text" name="phone" value="${customer?.phone || ''}" class="search-input" style="padding-left: 12px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 24px;">
                        <label>Alamat</label>
                        <textarea name="address" class="search-input" style="padding-left: 12px; min-height: 80px; padding-top: 10px;">${customer?.address || ''}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Simpan Pelanggan</button>
                </form>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        document.getElementById('customer-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = {
                name: e.target.name.value,
                phone: e.target.phone.value,
                address: e.target.address.value
            };
            
            try {
                if (id) {
                    await window.customersAPI.update(id, formData);
                    window.appStore.addNotification('Data pelanggan diperbarui', 'success');
                } else {
                    await window.customersAPI.create(formData);
                    window.appStore.addNotification('Pelanggan berhasil ditambahkan', 'success');
                }
                this.closeModal();
                this.loadData();
            } catch (err) {
                window.appStore.addNotification('Gagal menyimpan data', 'error');
            }
        };
    },

    async deleteCustomer(id) {
        const ok = await showConfirm({ title: 'Hapus Pelanggan', message: 'Data pelanggan ini akan dihapus permanen. Lanjutkan?', confirmText: 'Hapus', type: 'danger' });
        if (!ok) return;
        try {
            await window.customersAPI.delete(id);
            window.appStore.addNotification('Pelanggan dihapus', 'success');
            this.loadData();
        } catch (err) {
            window.appStore.addNotification('Gagal menghapus data', 'error');
        }
    },

    // --- SUPPLIERS ---
    renderSuppliersTable() {
        const container = document.getElementById('suppliers-list-container');
        if (!container) return;

        container.innerHTML = `
            <div class="flex-between" style="margin-bottom: 24px;">
                <h2 style="font-size: 20px;">Daftar Supplier</h2>
                <div class="flex" style="gap: 12px;">
                    <div class="search-container" style="width: 300px;">
                        <i data-lucide="search" class="search-icon"></i>
                        <input type="text" id="master-search" class="search-input" placeholder="Cari supplier..." oninput="settingsPage.handleSearch()">
                    </div>
                    <button class="btn btn-primary" onclick="settingsPage.showSupplierModal()">
                        <i data-lucide="plus"></i> Tambah Supplier
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nama Supplier</th>
                            <th>Kontak</th>
                            <th style="text-align: center;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="master-table-body">
                        <!-- Injected -->
                    </tbody>
                </table>
                <div id="master-pagination" class="pagination"></div>
            </div>
        `;
        this.renderTableData();
    },

    showSupplierModal(id = null) {
        const supplier = id ? this.data.find(s => String(s.id) === String(id)) : null;
        const modal = document.getElementById('settings-modal');
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>${id ? 'Edit' : 'Tambah'} Supplier</h2>
                    <button class="close-btn-red" onclick="settingsPage.closeModal()">Tutup</button>
                </div>
                <form id="supplier-form">
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label>Nama Toko/Supplier</label>
                        <input type="text" name="name" value="${supplier?.name || ''}" class="search-input" style="padding-left: 12px;" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label>Info Kontak (Telp/WA)</label>
                        <input type="text" name="phone" value="${supplier?.phone || ''}" class="search-input" style="padding-left: 12px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 24px;">
                        <label>Alamat</label>
                        <textarea name="address" class="search-input" style="padding-left: 12px; min-height: 80px; padding-top: 10px;">${supplier?.address || ''}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Simpan Supplier</button>
                </form>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        document.getElementById('supplier-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = {
                name: e.target.name.value,
                phone: e.target.phone.value,
                address: e.target.address.value
            };
            
            try {
                if (id) {
                    await window.suppliersAPI.update(id, formData);
                    window.appStore.addNotification('Data supplier diperbarui', 'success');
                } else {
                    await window.suppliersAPI.create(formData);
                    window.appStore.addNotification('Supplier berhasil ditambahkan', 'success');
                }
                this.closeModal();
                this.loadData();
            } catch (err) {
                window.appStore.addNotification('Gagal menyimpan data', 'error');
            }
        };
    },

    async deleteSupplier(id) {
        const ok = await showConfirm({ title: 'Hapus Supplier', message: 'Data supplier ini akan dihapus permanen. Lanjutkan?', confirmText: 'Hapus', type: 'danger' });
        if (!ok) return;
        try {
            await window.suppliersAPI.delete(id);
            window.appStore.addNotification('Supplier dihapus', 'success');
            this.loadData();
        } catch (err) {
            window.appStore.addNotification('Gagal menghapus data', 'error');
        }
    },

    // --- USERS / STAFF ---
    renderUsersTable() {
        const container = document.getElementById('users-list-container');
        if (!container) return;

        container.innerHTML = `
             <div class="flex-between" style="margin-bottom: 24px;">
                <h2 style="font-size: 20px;">Pengaturan Staff</h2>
                <div class="flex" style="gap: 12px;">
                    <div class="search-container" style="width: 300px;">
                        <i data-lucide="search" class="search-icon"></i>
                        <input type="text" id="master-search" class="search-input" placeholder="Cari staff..." oninput="settingsPage.handleSearch()">
                    </div>
                    <button class="btn btn-primary" onclick="settingsPage.showUserModal()">
                        <i data-lucide="plus"></i> Tambah Staff
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Role</th>
                            <th style="text-align: center;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="master-table-body">
                        <!-- Injected -->
                    </tbody>
                </table>
                <div id="master-pagination" class="pagination"></div>
            </div>
        `;
        this.renderTableData();
    },

    showUserModal(id = null) {
        const user = id ? this.data.find(u => String(u.id_user) === String(id)) : null;
        const modal = document.getElementById('settings-modal');
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>${id ? 'Edit' : 'Tambah'} Staff</h2>
                    <button class="close-btn-red" onclick="settingsPage.closeModal()">Tutup</button>
                </div>
                <form id="user-form">
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label>Nama Lengkap</label>
                        <input type="text" name="full_name" value="${user?.nama_user || ''}" class="search-input" style="padding-left: 12px;" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label>Username</label>
                        <input type="text" name="username" value="${user?.username || ''}" class="search-input" style="padding-left: 12px;" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 24px;">
                        <label>Role</label>
                        <select name="role" class="search-input" style="padding-left: 12px;">
                            <option value="Staff" ${user?.role === 'Staff' ? 'selected' : ''}>Staff</option>
                            <option value="Admin" ${user?.role === 'Admin' ? 'selected' : ''}>Admin</option>
                            <option value="Manager" ${user?.role === 'Manager' ? 'selected' : ''}>Manager</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Simpan Staff</button>
                </form>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        document.getElementById('user-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = {
                nama_user: e.target.full_name.value,
                username: e.target.username.value,
                role: e.target.role.value
            };
            
            try {
                if (id) {
                    await window.usersAPI.update(id, formData);
                    window.appStore.addNotification('Data staff diperbarui', 'success');
                } else {
                    await window.usersAPI.create(formData);
                    window.appStore.addNotification('Staff berhasil ditambahkan', 'success');
                }
                this.closeModal();
                this.loadData();
            } catch (err) {
                window.appStore.addNotification('Gagal menyimpan data', 'error');
            }
        };
    },

    async deleteUser(id) {
        const ok = await showConfirm({ title: 'Hapus Staff', message: 'Akun staff ini akan dihapus permanen. Lanjutkan?', confirmText: 'Hapus', type: 'danger' });
        if (!ok) return;
        try {
            await window.usersAPI.delete(id);
            window.appStore.addNotification('Staff dihapus', 'success');
            this.loadData();
        } catch (err) {
            window.appStore.addNotification('Gagal menghapus data', 'error');
        }
    },

    // --- KATEGORI ---
    async renderCategoriesTab() {
        const container = document.getElementById('categories-container');
        if (!container) return;

        const cats = await window.categoryAPI.getAll();
        this._catData = cats;
        this._catPage = 1;
        this._catRows = 10;

        container.innerHTML = `
            <div class="flex-between" style="margin-bottom:24px;flex-wrap:wrap;gap:12px;">
                <h2 style="font-size:20px;">Daftar Kategori</h2>
                <button class="btn btn-primary" onclick="settingsPage.showCategoryModal()">
                    <i data-lucide="plus"></i> Tambah Kategori
                </button>
            </div>
            <div class="flex-between" style="margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                <div id="cat-rows-selector"></div>
                <span id="cat-count" class="text-muted" style="font-size:13px;"></span>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nama Kategori</th>
                            <th style="text-align:center;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="cat-table-body"></tbody>
                </table>
            </div>
            <div id="cat-pagination" class="pagination" style="margin-top:12px;"></div>
        `;

        renderRowsSelector({
            current: this._catRows,
            containerId: 'cat-rows-selector',
            onChange: `(n) => { settingsPage._catRows = n; settingsPage._catPage = 1; settingsPage._renderCatTable(); }`
        });

        this._renderCatTable();
        if (window.lucide) window.lucide.createIcons();
    },

    _renderCatTable() {
        const data  = this._catData || [];
        const page  = this._catPage || 1;
        const rows  = this._catRows || 10;
        const slice = paginate(data, page, rows);
        const start = (page - 1) * rows;
        const tbody = document.getElementById('cat-table-body');
        if (!tbody) return;

        tbody.innerHTML = slice.length === 0
            ? `<tr><td colspan="3" style="text-align:center;padding:32px;color:var(--text-muted);">Belum ada kategori</td></tr>`
            : slice.map((c, i) => `
                <tr>
                    <td style="color:var(--text-muted);width:40px;">${start + i + 1}</td>
                    <td style="font-weight:600;">${c.name}</td>
                    <td style="text-align:center;">
                        <div class="flex-center" style="gap:8px;">
                            <button class="btn btn-outline btn-sm" onclick="settingsPage.showCategoryModal(${c.id},'${c.name.replace(/'/g,"\\'")}')">Edit</button>
                            <button class="btn btn-outline btn-warning btn-sm" onclick="settingsPage.deleteCategory(${c.id})">Hapus</button>
                        </div>
                    </td>
                </tr>`).join('');

        renderPagination({
            currentPage: page,
            totalItems: data.length,
            rowsPerPage: rows,
            containerId: 'cat-pagination',
            onPageChange: `(p) => { settingsPage._catPage = p; settingsPage._renderCatTable(); }`
        });

        if (window.lucide) window.lucide.createIcons();
    },

    showCategoryModal(id = null, currentName = '') {
        const modal = document.getElementById('settings-modal');
        modal.innerHTML = `
            <div class="modal-content" style="max-width:400px;">
                <div class="modal-header">
                    <h2>${id ? 'Edit' : 'Tambah'} Kategori</h2>
                    <button class="close-btn-red" onclick="settingsPage.closeModal()">Tutup</button>
                </div>
                <form id="cat-form">
                    <div class="form-group" style="margin-bottom:20px;">
                        <label>Nama Kategori</label>
                        <input type="text" id="cat-name-input" class="search-input" style="padding-left:12px;margin-top:6px;"
                            value="${currentName}" placeholder="Contoh: Minuman" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%;">Simpan</button>
                </form>
            </div>
        `;
        modal.style.display = 'flex';
        document.getElementById('cat-name-input').focus();

        document.getElementById('cat-form').onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('cat-name-input').value.trim();
            if (!name) return;
            try {
                if (id) {
                    await window.categoryAPI.update(id, name);
                    showToast('Kategori diperbarui', 'success');
                } else {
                    await window.categoryAPI.create(name);
                    showToast('Kategori ditambahkan', 'success');
                }
                this.closeModal();
                this.renderCategoriesTab();
            } catch (err) {
                showToast(err.message || 'Gagal menyimpan kategori', 'error');
            }
        };
    },

    async deleteCategory(id) {
        const ok = await showConfirm({ title: 'Hapus Kategori', message: 'Kategori ini akan dihapus. Produk yang menggunakan kategori ini tidak akan terpengaruh.', confirmText: 'Hapus', type: 'danger' });
        if (!ok) return;
        try {
            await window.categoryAPI.delete(id);
            showToast('Kategori dihapus', 'success');
            this.renderCategoriesTab();
        } catch (err) {
            showToast('Gagal menghapus kategori', 'error');
        }
    },

    // --- HAK AKSES ---
    async renderAccessPage() {
        const container = document.getElementById('access-container');
        if (!container) return;

        const MENUS = [
            // Menu Utama
            { id: 'dashboard',         label: 'Dashboard',       group: 'Menu Utama' },
            { id: 'pos',               label: 'Kasir',           group: 'Menu Utama' },
            { id: 'purchase',          label: 'Restock',         group: 'Menu Utama' },
            { id: 'expense',           label: 'Biaya',           group: 'Menu Utama' },
            { id: 'debt',              label: 'Piutang',         group: 'Menu Utama' },
            { id: 'report',            label: 'Laporan',         group: 'Menu Utama' },
            // Master Data
            { id: 'settings',          label: 'Master (Menu)',   group: 'Master Data' },
            { id: 'master_products',   label: 'Produk & Stok',   group: 'Master Data' },
            { id: 'master_customers',  label: 'Pelanggan',       group: 'Master Data' },
            { id: 'master_suppliers',  label: 'Supplier',        group: 'Master Data' },
            { id: 'master_users',      label: 'Pengguna/Staff',  group: 'Master Data' },
            { id: 'master_access',     label: 'Hak Akses',       group: 'Master Data' },
            { id: 'master_store',      label: 'Info Toko',       group: 'Master Data' },
            { id: 'master_categories', label: 'Kategori',        group: 'Master Data' },
        ];

        // Load entitas
        const id_toko = window.authStore.state.id_toko;
        const { data: entitasList } = await supabase
            .from('entitas')
            .select('id_entitas, entitas')
            .eq('id_toko', id_toko);

        const list = entitasList || [];
        const firstId = list[0]?.id_entitas || '';

        container.innerHTML = `
            <div class="flex-between" style="margin-bottom:24px;align-items:flex-start;gap:16px;flex-wrap:wrap;">
                <div>
                    <h2 style="font-size:20px;margin-bottom:4px;">Manajemen Hak Akses</h2>
                    <p class="text-muted" style="font-size:13px;">Atur menu yang dapat diakses oleh setiap entitas/peran.</p>
                </div>
            </div>
            <div class="flex" style="gap:20px;align-items:flex-start;flex-wrap:wrap;">
                <!-- Sidebar entitas -->
                <div style="min-width:180px;flex-shrink:0;">
                    <p style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.08em;margin-bottom:10px;">PILIH ENTITAS</p>
                    <div id="entitas-list" style="display:flex;flex-direction:column;gap:8px;">
                        ${list.map(e => `
                            <button class="access-entitas-btn ${e.id_entitas === firstId ? 'active' : ''}"
                                onclick="settingsPage._accessSelectEntitas('${e.id_entitas}','${e.entitas}')"
                                data-eid="${e.id_entitas}">
                                ${e.entitas}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Panel menu checkboxes -->
                <div class="card" style="flex:1;min-width:280px;padding:24px;">
                    <div id="access-panel">
                        <p class="text-muted" style="font-size:13px;">Pilih entitas untuk mengatur akses menu.</p>
                    </div>
                </div>
            </div>

            <style>
                .access-entitas-btn {
                    width:100%;text-align:left;padding:10px 14px;border-radius:12px;
                    border:1px solid var(--border);background:var(--bg-card);
                    font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;
                    color:var(--text-main);
                }
                .access-entitas-btn:hover { background:var(--primary-surface);border-color:var(--primary); }
                .access-entitas-btn.active { background:var(--primary);color:white;border-color:var(--primary); }
                .menu-check-card {
                    display:flex;align-items:center;gap:10px;padding:12px 14px;
                    border:1px solid var(--border);border-radius:12px;cursor:pointer;
                    transition:all .2s;background:var(--bg-main);
                }
                .menu-check-card:hover { border-color:var(--primary);background:var(--primary-surface); }
                .menu-check-card input[type=checkbox] { width:16px;height:16px;accent-color:var(--primary);cursor:pointer; }
            </style>
        `;

        if (window.lucide) window.lucide.createIcons();

        // Auto-load first entitas
        if (list.length > 0) {
            this._accessSelectEntitas(list[0].id_entitas, list[0].entitas, MENUS);
        }

        // Store MENUS for reuse
        this._accessMenus = MENUS;
    },

    async _accessSelectEntitas(id_entitas, label, menus) {
        const MENUS = menus || this._accessMenus || [];

        // Update active button
        document.querySelectorAll('.access-entitas-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.eid === id_entitas);
        });

        this._accessCurrentEntitas = id_entitas;
        this._accessCurrentLabel = label;

        // Load existing access
        let existing = {};
        try {
            const rows = await window.menuAccessAPI.getByEntitas(id_entitas);
            rows.forEach(r => { existing[r.menu_id] = r.is_visible; });
        } catch(e) { console.error(e); }

        const panel = document.getElementById('access-panel');
        if (!panel) return;

        // Render per grup
        const groups = [...new Set(MENUS.map(m => m.group))];
        const groupsHtml = groups.map(grp => {
            const items = MENUS.filter(m => m.group === grp);
            return `
                <div style="margin-bottom:16px;">
                    <p style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.07em;margin-bottom:8px;">${grp.toUpperCase()}</p>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;">
                        ${items.map(m => {
                            const checked = existing[m.id] !== undefined ? existing[m.id] === 1 : true;
                            return `
                                <label class="menu-check-card">
                                    <input type="checkbox" name="menu_access" value="${m.id}" ${checked ? 'checked' : ''}>
                                    <span style="font-size:13px;font-weight:600;">${m.label}</span>
                                </label>`;
                        }).join('')}
                    </div>
                </div>`;
        }).join('');

        panel.innerHTML = `
            <div class="flex-between" style="margin-bottom:16px;flex-wrap:wrap;gap:10px;">
                <h3 style="font-size:16px;">
                    Akses Menu untuk <span style="color:var(--primary);">"${label}"</span>
                </h3>
                <button class="btn btn-outline btn-sm" onclick="settingsPage._accessToggleAll()">
                    <i data-lucide="check-square"></i> Pilih Semua
                </button>
            </div>
            <div id="access-menu-grid" style="margin-bottom:20px;">
                ${groupsHtml}
            </div>
            <div style="text-align:right;">
                <button class="btn btn-primary" onclick="settingsPage._accessSave()">
                    <i data-lucide="save"></i> Simpan Pengaturan
                </button>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    },

    _accessToggleAll() {
        const boxes = document.querySelectorAll('[name="menu_access"]');
        const allChecked = [...boxes].every(b => b.checked);
        boxes.forEach(b => b.checked = !allChecked);
    },

    async _accessSave() {
        const boxes = document.querySelectorAll('[name="menu_access"]');
        const menuMap = {};
        boxes.forEach(b => { menuMap[b.value] = b.checked ? 1 : 0; });

        try {
            await window.menuAccessAPI.saveAccess(this._accessCurrentEntitas, menuMap);
            showToast(`Hak akses "${this._accessCurrentLabel}" berhasil disimpan`, 'success');
        } catch(err) {
            console.error(err);
            showToast('Gagal menyimpan hak akses', 'error');
        }
    },

    // --- STORE CONFIG ---
    renderStoreConfig() {
        // Fetch from appConfig or mock
        const store = window.appConfig.store || {
            name: 'ZinPOS Pro Station',
            address: 'Jl. Raya No. 123, Indonesia',
            phone: '081234567890',
            footer: 'Terima kasih telah berbelanja!'
        };

        return `
            <h2 style="font-size: 20px; margin-bottom: 24px;">Informasi Toko</h2>
            <div class="card" style="max-width: 600px; padding: 32px;">
                <form id="store-form">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">Nama Toko</label>
                        <input type="text" name="name" class="search-input" style="padding-left: 16px;" value="${store.name}" required>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">Alamat</label>
                        <textarea name="address" class="search-input" style="padding-left: 16px; min-height: 80px; padding-top: 12px;">${store.address}</textarea>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">Nomor HP / WhatsApp</label>
                        <input type="text" name="phone" class="search-input" style="padding-left: 16px;" value="${store.phone}">
                    </div>
                    <div style="margin-bottom: 32px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">Pesan Footer Nota</label>
                        <input type="text" name="footer" class="search-input" style="padding-left: 16px;" value="${store.footer}">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Simpan Perubahan</button>
                </form>
            </div>
        `;
    },

    setupStoreListener() {
        const form = document.getElementById('store-form');
        if (!form) return;
        form.onsubmit = (e) => {
            e.preventDefault();
            const config = {
                name: form.name.value,
                address: form.address.value,
                phone: form.phone.value,
                footer: form.footer.value
            };
            window.appConfig.saveStoreConfig(config);
            window.appStore.addNotification('Pengaturan toko disimpan', 'success');
        };
    },

    // --- UTILS ---
    _canAccess(menuId) {
        const access = window.authStore.state.menuAccess;
        if (!access) return true; // null = semua boleh
        return access.includes(menuId);
    },

    closeModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) modal.style.display = 'none';
    },

    addStylesIfMissing() {
        if (document.getElementById('settings-styles')) return;
        const style = document.createElement('style');
        style.id = 'settings-styles';
        style.textContent = `
            .settings-tab-btn {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                padding: 12px 16px;
                border-radius: 12px;
                border: none;
                background: transparent;
                color: var(--text-muted);
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
            }
            .settings-tab-btn:hover {
                background: var(--bg-card);
                color: var(--text-main);
            }
            .settings-tab-btn.active {
                background: white;
                color: var(--primary);
                box-shadow: var(--shadow-sm);
            }
            .settings-tab-btn i {
                width: 18px;
                height: 18px;
            }
            .btn-warning {
                border-color: var(--danger);
                color: var(--danger);
            }
            .btn-warning:hover {
                background: var(--danger);
                color: white;
            }
        `;
        document.head.appendChild(style);
    }
};

window.settingsPage = settingsPage;
