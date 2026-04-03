/**
 * POS Page - Main Cashier Interface
 */
const posPage = {
    render() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="page-container pos-page">
                <div class="pos-layout">
                    <!-- Products Area -->
                    <div class="products-section">
                        <header class="flex-between" style="margin-bottom: 24px;">
                            <div class="search-container">
                                <i data-lucide="search" class="search-icon"></i>
                                <input type="text" class="search-input" placeholder="Cari produk atau scan barcode..." oninput="posPage.handleSearch(this.value)">
                            </div>

                        </header>

                        <div id="product-list" class="product-grid">
                            <!-- Product cards will be injected here -->
                            <div class="loader-container" style="position: static; height: 200px; background: transparent;">
                                <div class="loader"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Cart Area -->
                    <aside class="cart-section card">
                        <div class="flex-between" style="margin-bottom: 20px;">
                            <h3>Keranjang</h3>
                            <button class="text-danger" onclick="window.cartStore.clear()">
                                <i data-lucide="trash-2" style="width: 18px;"></i>
                            </button>
                        </div>

                        <div id="cart-items" class="cart-items-list" style="flex: 1; overflow-y: auto; margin-bottom: 24px;">
                            <!-- Cart items will be injected here -->
                            <div class="flex-center text-muted" style="height: 100%; flex-direction: column; gap: 12px;">
                                <i data-lucide="shopping-bag" style="width: 48px; height: 48px; opacity: 0.2;"></i>
                                <p>Keranjang masih kosong</p>
                            </div>
                        </div>

                        <div class="cart-summary" style="border-top: 1px solid var(--border); padding-top: 20px;">
                            <div class="flex-between" style="margin-bottom: 12px;">
                                <span class="text-muted">Subtotal</span>
                                <span id="cart-subtotal" style="font-weight: 600;">Rp 0</span>
                            </div>
                            <div class="flex-between" style="margin-bottom: 24px;">
                                <h2 style="color: var(--primary);">Total</h2>
                                <h2 id="cart-total" style="color: var(--primary);">Rp 0</h2>
                            </div>
                            
                            <button class="btn btn-primary" style="width: 100%; height: 56px; font-size: 16px; border-radius: 18px;" onclick="posPage.showPaymentModal()">
                                Bayar Sekarang
                            </button>
                        </div>
                    </aside>
                </div>
            </div>

            <!-- Payment Modal -->
            <div id="payment-modal" class="modal-container" style="display: none;">
                <div class="modal-content card" style="max-width: 500px; width: 90%;">
                    <div class="flex-between" style="margin-bottom: 24px;">
                        <h3>Konfirmasi Pembayaran</h3>
                        <button class="close-btn-red" onclick="posPage.closePaymentModal()">Tutup</button>
                    </div>

                    <div style="text-align: center; margin-bottom: 32px;">
                        <p class="text-muted" style="margin-bottom: 8px;">Total Tagihan</p>
                        <h1 id="payment-total-display" style="font-size: 42px; color: var(--primary);">Rp 0</h1>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Metode Pembayaran</label>
                        <div class="grid grid-cols-2" style="gap: 12px;">
                            <button class="btn btn-outline payment-method-btn active" onclick="posPage.setPaymentMethod('Tunai', this)">
                                <i data-lucide="banknote"></i> Tunai
                            </button>
                            <button class="btn btn-outline payment-method-btn" onclick="posPage.setPaymentMethod('QRIS', this)">
                                <i data-lucide="qr-code"></i> QRIS
                            </button>
                            <button class="btn btn-outline payment-method-btn" onclick="posPage.setPaymentMethod('Transfer', this)">
                                <i data-lucide="send"></i> Transfer
                            </button>
                            <button class="btn btn-outline payment-method-btn" onclick="posPage.setPaymentMethod('Piutang', this)">
                                <i data-lucide="clock"></i> Piutang
                            </button>
                        </div>
                    </div>

                    <div id="cash-input-area" style="margin-bottom: 32px;">
                        <div class="flex-between" style="margin-bottom: 8px;">
                            <label style="font-weight: 500;">Uang Tunai (Rp)</label>
                            <button type="button" onclick="posPage.setExactCash()"
                                style="background:var(--primary);color:white;border:none;border-radius:10px;padding:4px 14px;font-size:12px;font-weight:700;cursor:pointer;">
                                Uang Pas
                            </button>
                        </div>
                        <input type="text" id="cash-amount" class="search-input rupiah-input" style="padding-left: 16px; font-size: 24px; height: 64px;" placeholder="0" oninput="posPage.calculateChange()" inputmode="numeric">
                        
                        <div class="flex-between" style="margin-top: 16px;">
                            <span class="text-muted">Kembalian</span>
                            <span id="change-display" style="font-weight: 700; font-size: 20px; color: var(--success);">Rp 0</span>
                        </div>
                    </div>

                    <!-- Piutang: pilih pelanggan -->
                    <div id="piutang-input-area" style="display:none;margin-bottom:32px;">
                        <label style="display:block;margin-bottom:8px;font-weight:500;">Nama Pelanggan</label>
                        <input id="piutang-customer-input" class="search-input" style="padding-left:16px;" placeholder="Cari nama pelanggan...">
                        <input type="hidden" id="piutang-customer-id">
                    </div>

                    <button class="btn btn-primary" style="width: 100%; height: 60px; font-size: 18px;" onclick="posPage.processCheckout()">
                        Proses Transaksi
                    </button>
                </div>
            </div>

            <!-- Receipt Preview Modal -->
            <div id="receipt-modal" class="modal-container" style="display:none;">
                <div class="modal-content card" style="max-width:420px;width:92%;padding:0;overflow:hidden;">
                    <!-- Header -->
                    <div style="background:var(--primary);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;">
                        <span style="color:white;font-weight:700;font-size:15px;">Preview Struk</span>
                        <span id="receipt-invoice-badge" style="color:white;font-size:12px;opacity:.8;"></span>
                    </div>

                    <!-- Struk Body -->
                    <div style="padding:20px;max-height:60vh;overflow-y:auto;">
                        <div id="receipt-preview-body" style="font-family:'Courier New',monospace;font-size:13px;line-height:1.6;">
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div style="padding:16px 20px;border-top:1px solid var(--border);display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
                        <button class="btn btn-outline" style="font-size:13px;color:var(--danger);border-color:var(--danger);" onclick="posPage.correctTransaction()">
                            <i data-lucide="rotate-ccw" style="width:14px;height:14px;"></i> Koreksi
                        </button>
                        <button class="btn btn-outline" style="font-size:13px;" onclick="posPage.doPrint()">
                            <i data-lucide="printer" style="width:14px;height:14px;"></i> Print
                        </button>
                        <button class="btn btn-primary" style="font-size:13px;background:#25D366;border-color:#25D366;" onclick="posPage.shareToWhatsApp()">
                            <i data-lucide="message-circle" style="width:14px;height:14px;"></i> WA
                        </button>
                    </div>
                    <div style="padding:0 20px 16px;">
                        <button class="btn btn-primary" style="width:100%;font-size:14px;" onclick="posPage.closeReceiptModal()">
                            Selesai &amp; Transaksi Baru
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.loadProducts();
        
        // Subscribe to cart changes
        window.cartStore.subscribe((state) => {
            this.renderCart(state);
        });

        if (window.lucide) window.lucide.createIcons();
    },

    // Mapping emoji & warna berdasarkan nama kategori
    _getCategoryStyle(categoryName, productName) {
        const cat  = (categoryName || '').toLowerCase();
        const name = (productName  || '').toLowerCase();

        const map = [
            { keys: ['mie','mi ','instan','ramen'],          emoji: '🍜', bg: '#fff3e0', color: '#e65100' },
            { keys: ['makanan ringan','snack','keripik','chiki','chitato'], emoji: '🍟', bg: '#fff8e1', color: '#f57f17' },
            { keys: ['kue','roti','biskuit','wafer'],         emoji: '🍪', bg: '#fce4ec', color: '#c2185b' },
            { keys: ['ice cream','es krim','eskrim'],         emoji: '🍦', bg: '#e3f2fd', color: '#1565c0' },
            { keys: ['minuman','air','teh','jus','soda','aqua','pocari'], emoji: '🥤', bg: '#e8f5e9', color: '#2e7d32' },
            { keys: ['kopi','coffee','nescafe'],              emoji: '☕', bg: '#efebe9', color: '#4e342e' },
            { keys: ['minuman seduh','susu','milo','ovomaltine'], emoji: '🥛', bg: '#f3e5f5', color: '#6a1b9a' },
            { keys: ['rokok','cigarette','sampoerna','gudang'], emoji: '🚬', bg: '#eceff1', color: '#546e7a' },
            { keys: ['bahan pokok','beras','gula','minyak','tepung'], emoji: '🌾', bg: '#f9fbe7', color: '#558b2f' },
            { keys: ['bumbu','saos','kecap','sambal'],        emoji: '🧂', bg: '#fff3e0', color: '#bf360c' },
            { keys: ['obat','vitamin','kesehatan'],           emoji: '💊', bg: '#e8eaf6', color: '#283593' },
            { keys: ['kosmetik','sabun','shampo','perawatan'], emoji: '🧴', bg: '#fce4ec', color: '#880e4f' },
            { keys: ['alat listrik','baterai','lampu'],       emoji: '🔌', bg: '#fffde7', color: '#f57f17' },
            { keys: ['bahan','material'],                     emoji: '📦', bg: '#f5f5f5', color: '#616161' },
            { keys: ['makanan'],                              emoji: '🍱', bg: '#fff8e1', color: '#e65100' },
        ];

        // Cek nama produk dulu, lalu kategori
        for (const m of map) {
            if (m.keys.some(k => name.includes(k) || cat.includes(k))) {
                return { emoji: m.emoji, bg: m.bg, color: m.color };
            }
        }
        return { emoji: '🛍️', bg: '#f3f4f6', color: '#6b7280' };
    },

    async loadProducts() {
        const productList = document.getElementById('product-list');
        if (!productList) return;

        try {
            const products = await window.productsAPI.getAll();
            const available = products.filter(p => (p.stock || 0) > 0);

            if (available.length === 0) {
                productList.innerHTML = `
                    <div class="flex-center text-muted" style="height:200px;grid-column:1/-1;flex-direction:column;gap:12px;">
                        <i data-lucide="package-search" style="width:48px;height:48px;opacity:.2;"></i>
                        <p>Belum ada produk. Silakan tambah di Pengaturan.</p>
                    </div>`;
                return;
            }

            productList.innerHTML = available.map(p => {
                const catName = p.categories?.name || '';
                const style   = this._getCategoryStyle(catName, p.name);
                const isLow   = p.stock <= (p.min_stock ?? 5);
                const productData = { id: p.id, name: p.name, price: p.selling_price, sku: p.sku };

                return `
                    <div class="product-item" onclick="window.cartStore.addItem(${JSON.stringify(productData).replace(/"/g, '&quot;')})"
                        style="position:relative;cursor:pointer;">
                        <!-- Emoji Icon -->
                        <div style="width:64px;height:64px;border-radius:16px;background:${style.bg};
                            display:flex;align-items:center;justify-content:center;
                            font-size:32px;margin:0 auto 10px;flex-shrink:0;">
                            ${style.emoji}
                        </div>
                        <div class="product-name" style="font-size:13px;font-weight:600;line-height:1.3;
                            text-align:center;margin-bottom:4px;">${p.name}</div>
                        ${catName ? `<div style="font-size:10px;color:${style.color};font-weight:600;
                            text-align:center;margin-bottom:4px;">${catName}</div>` : ''}
                        <div class="product-price" style="font-size:13px;font-weight:700;
                            color:var(--primary);text-align:center;">
                            Rp ${p.selling_price.toLocaleString('id-ID')}
                        </div>
                        <div style="font-size:10px;text-align:center;margin-top:4px;
                            color:${isLow ? 'var(--danger)' : 'var(--text-muted)'};">
                            Stok: ${p.stock} ${p.unit || ''}
                        </div>
                        ${isLow ? `<div style="position:absolute;top:6px;right:6px;background:#ef4444;
                            color:white;font-size:9px;font-weight:700;padding:2px 6px;
                            border-radius:20px;">Menipis</div>` : ''}
                    </div>`;
            }).join('');

        } catch (error) {
            console.error('Failed to load products:', error);
            productList.innerHTML = `<p class="text-danger" style="padding:20px;">Gagal memuat produk</p>`;
        } finally {
            if (window.lucide) window.lucide.createIcons();
        }
    },

    renderCart(state) {
        const cartItemsContainer = document.getElementById('cart-items');
        const subtotalEl = document.getElementById('cart-subtotal');
        const totalEl = document.getElementById('cart-total');

        if (!cartItemsContainer) return;

        if (state.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="flex-center text-muted" style="height: 100%; flex-direction: column; gap: 12px;">
                    <i data-lucide="shopping-bag" style="width: 48px; height: 48px; opacity: 0.2;"></i>
                    <p>Keranjang masih kosong</p>
                </div>
            `;
        } else {
            cartItemsContainer.innerHTML = state.items.map(item => `
                <div class="flex-between" style="padding: 12px 0; border-bottom: 1px solid var(--border);">
                    <div style="flex: 1;">
                        <div style="font-weight: 500; font-size: 14px;">${item.name}</div>
                        <div style="font-size: 12px; color: var(--text-muted);">Rp ${item.price.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="flex-center" style="gap: 12px;">
                        <button class="page-btn btn-outline" onclick="window.cartStore.updateQty(${item.id}, ${item.qty - 1})">-</button>
                        <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.qty}</span>
                        <button class="page-btn btn-outline" onclick="window.cartStore.updateQty(${item.id}, ${item.qty + 1})">+</button>
                    </div>
                </div>
            `).join('');
        }

        const totalFormatted = `Rp ${state.total.toLocaleString('id-ID')}`;
        subtotalEl.innerText = totalFormatted;
        totalEl.innerText = totalFormatted;

        if (window.lucide) window.lucide.createIcons();
    },

    handleSearch(query) {
        console.log('Search query:', query);
        // TODO: Implement filtering
    },

    showPaymentModal() {
        if (window.cartStore.state.items.length === 0) {
            window.appStore.addNotification('Keranjang masih kosong!', 'warning');
            return;
        }

        const modal = document.getElementById('payment-modal');
        const totalDisplay = document.getElementById('payment-total-display');
        
        totalDisplay.innerText = `Rp ${window.cartStore.state.total.toLocaleString('id-ID')}`;
        modal.style.display = 'flex';
        applyRupiahFormatter('.rupiah-input');
        if (window.lucide) window.lucide.createIcons();
    },

    closePaymentModal() {
        document.getElementById('payment-modal').style.display = 'none';
        document.getElementById('cash-amount').value = '';
        this._piutangAcLoaded = false;
        this._piutangCustomerName = null;
    },

    setPaymentMethod(method, btn) {
        window.cartStore.state.paymentMethod = method;
        document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cashArea    = document.getElementById('cash-input-area');
        const piutangArea = document.getElementById('piutang-input-area');

        cashArea.style.display    = method === 'Tunai'   ? 'block' : 'none';
        piutangArea.style.display = method === 'Piutang' ? 'block' : 'none';

        // Load customer autocomplete saat Piutang dipilih
        if (method === 'Piutang' && !this._piutangAcLoaded) {
            this._piutangAcLoaded = true;
            window.customersAPI.getAll().then(customers => {
                createAutocomplete({
                    inputEl: document.getElementById('piutang-customer-input'),
                    items: customers.map(c => ({ value: String(c.id), label: c.name })),
                    placeholder: 'Cari nama pelanggan...',
                    onSelect: (val, label) => {
                        document.getElementById('piutang-customer-id').value = val;
                        this._piutangCustomerName = label;
                    }
                });
            });
        }
    },

    setExactCash() {
        const total = window.cartStore.state.total;
        const input = document.getElementById('cash-amount');
        if (!input) return;
        input.value = total.toLocaleString('id-ID');
        this.calculateChange();
    },

    calculateChange() {
        const total = window.cartStore.state.total;
        const cashInput = document.getElementById('cash-amount');
        const paid = getRawValue(cashInput);
        const change = Math.max(0, paid - total);
        document.getElementById('change-display').innerText = `Rp ${change.toLocaleString('id-ID')}`;
    },

    async processCheckout() {
        const btn = document.querySelector('#payment-modal .btn-primary:last-of-type');
        if (btn) { btn.disabled = true; btn.textContent = 'Memproses...'; }

        try {
            const total = window.cartStore.state.total;
            const method = window.cartStore.state.paymentMethod || 'Tunai';
            const paid = method === 'Tunai'
                ? getRawValue(document.getElementById('cash-amount'))
                : total;

            if (method === 'Tunai' && paid < total) {
                showToast('Uang tunai kurang dari total tagihan!', 'error');
                return;
            }

            // Validasi pelanggan untuk Piutang
            const customerId = document.getElementById('piutang-customer-id')?.value || null;
            const customerName = this._piutangCustomerName || null;
            if (method === 'Piutang' && !customerId) {
                showToast('Pilih nama pelanggan untuk transaksi piutang!', 'warning');
                return;
            }

            const invoice = 'INV-' + Date.now();
            const items = window.cartStore.state.items;
            const sale = {
                invoice_number: invoice,
                total,
                paid_amount: method === 'Piutang' ? 0 : paid,
                change_amount: method === 'Piutang' ? 0 : Math.max(0, paid - total),
                payment_method: method,
                customer_id: customerId ? parseInt(customerId) : null,
                status: 'completed'
            };

            // Simpan ke Supabase (termasuk kurangi stok)
            const savedSale = await window.salesAPI.create(sale, items);
            savedSale.items = items;
            savedSale.customer_name = customerName;

            // Cleanup
            window.cartStore.clear();
            this.closePaymentModal();

            // Tampilkan receipt preview modal
            this.showSuccessModal(savedSale);

        } catch (error) {
            console.error('Checkout error:', error);
            showToast('Gagal memproses transaksi: ' + (error.message || ''), 'error');
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = 'Proses Transaksi'; }
        }
    },

    showSuccessModal(sale) {
        this.currentSale = sale;
        this._buildReceiptPreview(sale, sale.items || []);
        document.getElementById('receipt-modal').style.display = 'flex';
        if (window.lucide) window.lucide.createIcons();
    },

    _buildReceiptPreview(sale, items) {
        const storeName = window.appConfig?.store?.name || 'ZinPOS Pro';
        const storeAddr = window.appConfig?.store?.address || '';
        const footer    = window.appConfig?.store?.footer || 'Terima kasih telah berbelanja!';
        const now = new Date().toLocaleString('id-ID');

        const sep = `<div style="border-top:1px dashed #999;margin:8px 0;"></div>`;
        const row = (l, r, bold) => `
            <div style="display:flex;justify-content:space-between;${bold?'font-weight:700;':''}">
                <span>${l}</span><span>${r}</span>
            </div>`;

        const itemRows = items.map(i =>
            `<div style="margin-bottom:4px;">
                <div>${i.name}</div>
                <div style="display:flex;justify-content:space-between;color:#555;">
                    <span>${i.qty} x Rp ${i.price.toLocaleString('id-ID')}</span>
                    <span>Rp ${(i.price * i.qty).toLocaleString('id-ID')}</span>
                </div>
            </div>`
        ).join('');

        document.getElementById('receipt-invoice-badge').textContent = sale.invoice_number;
        document.getElementById('receipt-preview-body').innerHTML = `
            <div style="text-align:center;margin-bottom:10px;">
                <div style="font-weight:700;font-size:15px;">${storeName}</div>
                ${storeAddr ? `<div style="font-size:11px;color:#666;">${storeAddr}</div>` : ''}
                <div style="font-size:11px;color:#666;">${now}</div>
            </div>
            ${sep}
            ${itemRows}
            ${sep}
            ${row('SUBTOTAL', 'Rp ' + sale.total.toLocaleString('id-ID'))}
            ${row('BAYAR (' + (sale.payment_method||'Tunai') + ')', 'Rp ' + sale.paid_amount.toLocaleString('id-ID'))}
            ${row('KEMBALI', 'Rp ' + sale.change_amount.toLocaleString('id-ID'), true)}
            ${sale.payment_method === 'Piutang' ? `
                ${sep}
                <div style="font-weight:700;font-size:13px;color:#ef4444;text-align:center;">PIUTANG</div>
                <div style="text-align:center;font-size:12px;">a.n. ${sale.customer_name || '-'}</div>
            ` : ''}
            ${sep}
            <div style="text-align:center;font-size:11px;color:#666;">${footer}</div>
        `;

        // Simpan html untuk print
        this._receiptHtml = document.getElementById('receipt-preview-body').innerHTML;
    },

    closeReceiptModal() {
        document.getElementById('receipt-modal').style.display = 'none';
        this.currentSale = null;
        this._receiptHtml = null;
        this.loadProducts();
    },

    async correctTransaction() {
        // Rollback: hapus sale + kembalikan stok
        if (!this.currentSale) return;
        const ok = await showConfirm({
            title: 'Koreksi Transaksi',
            message: 'Transaksi akan dibatalkan dan stok dikembalikan. Lanjutkan?',
            confirmText: 'Ya, Koreksi',
            type: 'warning'
        });
        if (!ok) return;

        try {
            const sale = this.currentSale;
            const items = sale.items || [];
            const id_toko = window.authStore.state.id_toko;

            // Kembalikan stok
            for (const item of items) {
                const { data: p } = await supabase.from('products').select('stock').eq('id', item.id).single();
                if (p) await supabase.from('products').update({ stock: p.stock + item.qty }).eq('id', item.id);
            }

            // Hapus sale_items & sale
            await supabase.from('sale_items').delete().eq('sale_id', sale.id);
            await supabase.from('sales').delete().eq('id', sale.id);

            // Kembalikan item ke keranjang
            items.forEach(item => {
                for (let i = 0; i < item.qty; i++) {
                    window.cartStore.addItem({ id: item.id, name: item.name, price: item.price });
                }
            });

            document.getElementById('receipt-modal').style.display = 'none';
            this.currentSale = null;
            showToast('Transaksi dibatalkan, item dikembalikan ke keranjang', 'info');
            this.loadProducts();

        } catch (err) {
            console.error(err);
            showToast('Gagal membatalkan transaksi', 'error');
        }
    },

    doPrint() {
        const storeName = window.appConfig?.store?.name || 'ZinPOS Pro';
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>Struk</title>
        <style>
            body{font-family:'Courier New',monospace;font-size:12px;width:58mm;margin:0 auto;padding:8px;}
            @media print{body{width:58mm;}}
        </style></head><body>
        ${this._receiptHtml || ''}
        <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
        </body></html>`;
        const w = window.open('', '_blank', 'width=320,height=600');
        if (w) { w.document.write(html); w.document.close(); }
        else showToast('Izinkan popup di browser untuk cetak struk', 'warning');
    },

    shareToWhatsApp() {
        if (!this.currentSale) return;

        // Custom input dialog
        const overlay = document.createElement('div');
        overlay.style.cssText = `position:fixed;inset:0;background:rgba(15,23,42,0.4);backdrop-filter:blur(4px);z-index:99998;display:flex;align-items:center;justify-content:center;`;
        overlay.innerHTML = `
            <div style="background:#fff;border-radius:20px;padding:32px;max-width:380px;width:90%;box-shadow:0 20px 40px rgba(0,0,0,0.12);">
                <h3 style="margin-bottom:8px;">Kirim ke WhatsApp</h3>
                <p style="color:var(--text-muted);font-size:14px;margin-bottom:20px;">Masukkan nomor WhatsApp pelanggan</p>
                <input id="wa-phone-input" type="tel" class="search-input" style="padding-left:16px;margin-bottom:20px;width:100%;" placeholder="Contoh: 628123456789" value="62">
                <div style="display:flex;gap:12px;">
                    <button id="wa-cancel" style="flex:1;padding:12px;border-radius:12px;border:1px solid var(--border);background:#fff;font-size:14px;cursor:pointer;">Batal</button>
                    <button id="wa-send" style="flex:1;padding:12px;border-radius:12px;border:none;background:#25D366;color:#fff;font-size:14px;font-weight:600;cursor:pointer;">Kirim</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = overlay.querySelector('#wa-phone-input');
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);

        const close = () => overlay.remove();

        overlay.querySelector('#wa-cancel').addEventListener('click', close);
        overlay.querySelector('#wa-send').addEventListener('click', () => {
            const phone = input.value.trim();
            if (!phone) { showToast('Nomor WhatsApp tidak boleh kosong', 'warning'); return; }
            const storeName = window.appConfig?.store?.name || 'ZinPOS Pro';
            const msg = `*STRUK PEMBAYARAN - ${storeName}*\nInvoice: ${this.currentSale.invoice_number}\nTotal: Rp ${this.currentSale.total.toLocaleString('id-ID')}\nStatus: LUNAS\n\nTerima kasih telah berbelanja!`;
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
            close();
        });
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') overlay.querySelector('#wa-send').click(); });
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    }
};

window.posPage = posPage;
