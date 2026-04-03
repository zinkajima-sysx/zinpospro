# PRD — ZinPOS Pro (PWA POS System)

## 1. Product Overview

ZinPOS Pro adalah aplikasi **Point of Sale berbasis Progressive Web App (PWA)** yang dirancang untuk toko ritel kecil hingga menengah.

Aplikasi harus:

* berjalan di **browser dan dapat di-install sebagai PWA**
* **responsive untuk smartphone dan tablet**
* memiliki **UI modern minimalis**
* mendukung **printer thermal POS**
* memiliki **dashboard analitik real-time**
* memiliki **sistem laporan keuangan lengkap**

Target utama adalah **kasir toko dan pemilik usaha**.

---

# 2. Technology Constraints

Aplikasi dibangun menggunakan:

* HTML
* CSS
* Vanilla JavaScript
* PWA (Service Worker + Manifest)
* Supabase (database & API)

Arsitektur aplikasi harus modular sesuai struktur:

```
pwa-pos-app/
```

dengan folder:

* api
* state
* services
* ui
* utils
* pos

---

# 3. UI / Design System

### Design Style

UI harus memiliki karakteristik:

* Modern
* Minimalis
* Clean layout
* Flat design

### Global Styling Rules

Semua komponen UI wajib mengikuti aturan:

```
border-radius: 20px
```

Semua kartu dan container menggunakan sudut melengkung.

### Responsive Layout

Aplikasi harus:

* responsive di smartphone
* responsive di tablet
* responsive di desktop

Jika layar kecil:

* grid berubah menjadi kolom lebih sedikit
* ukuran font menyesuaikan
* konten tetap terlihat tanpa overflow

---

# 4. Navigation System

Navigation menggunakan **Navbar Pill Style**

Menu utama:

```
Dashboard
Kasir
Piutang
Laporan
Restock / Pembelian
Biaya / Pengeluaran
Data Master
```

### Sub Menu Data Master

```
Barang
Pelanggan
Supplier
Pengguna
Entitas
Pengaturan
Dynamic Menu Settings
```

---

# 5. Dashboard Page

Dashboard adalah halaman analitik utama.

### Dashboard harus berisi:

## Statistik Cards

Stat card menampilkan:

* Total Penjualan Hari Ini
* Total Transaksi
* Total Produk Terjual
* Total Profit

Setiap card memiliki indikator:

```
▲ profit
▼ loss
```

menggunakan warna indikator.

---

## Grafik Tren Penjualan

Visualisasi menggunakan:

```
Line Chart
```

untuk menampilkan:

```
tren penjualan
```

Filter grafik:

```
hari
bulan
tahun
```

### IMPORTANT

Dilarang menggunakan:

```
DONUT CHART
```

---

## Informasi Produk

Dashboard harus memiliki card:

### Produk Tersedia

Menampilkan jumlah produk.

### Produk Stok Menipis

Menampilkan produk dengan stok rendah.

### Produk Terlaris

Menampilkan produk dengan penjualan tertinggi.

---

# 6. Kasir Page

Halaman kasir adalah halaman transaksi utama.

### Layout Produk

Produk ditampilkan dalam **grid layout**.

Setiap kartu produk menampilkan:

```
Stock
Icon Produk
Nama Produk
Harga
```

### Format Harga

Harga menggunakan format rupiah:

```
Rp 10.000
Rp 125.000
```

Separator ribuan wajib.

---

## Metode Pembayaran

Kasir harus mendukung:

```
Cash
Piutang
QRIS
Transfer
```

---

## Fitur Kasir

Kasir harus memiliki:

* keranjang belanja
* tombol **Koreksi**
* tombol **Checkout**
* preview struk
* share struk ke WhatsApp

---

# 7. Struk Transaksi

Struk harus mendukung **print preview** sebelum cetak.

Printer yang digunakan:

```
Thermal POS Printer
```

### Header Struk

Header struk memuat:

```
Logo Toko
Nama Toko
Alamat
```

Data diambil dari tabel:

```
pengaturan_toko
```

---

# 8. Piutang Page

Halaman piutang menampilkan:

* daftar piutang pelanggan
* status pembayaran
* tanggal jatuh tempo

Kasir dapat:

* menambah pembayaran piutang
* melihat riwayat pembayaran

---

# 9. Restock / Pembelian

Halaman ini digunakan untuk:

```
menambah stok barang
```

Fitur:

* pilih supplier
* input barang
* update stok

---

# 10. Biaya / Pengeluaran

Halaman ini mencatat:

```
biaya operasional toko
```

contoh:

* listrik
* gaji
* transport
* pembelian lain

---

# 11. Laporan

Halaman laporan menampilkan **rekap keuangan**.

Filter laporan:

```
Harian
Bulanan
Tahunan
All
```

---

## Tampilan Laporan

Laporan ditampilkan dalam:

```
Table View
```

Dengan:

* pagination
* sorting
* filter

---

## Pagination Rules

Semua tabel wajib memiliki:

```
10 baris default
pagination
```

---

# 12. Export Data

Laporan dapat di-export menjadi:

```
Excel
PDF
```

---

# 13. Print & Share

Struk transaksi dapat:

```
Print thermal printer
Share ke WhatsApp
```

---

# 14. Data Tables Standard

Semua tabel dalam aplikasi harus memiliki:

```
Search bar
Pagination
10 row default
```

---

# 15. Performance Requirements

Aplikasi harus:

* cepat saat membuka kasir
* ringan di tablet murah
* tidak memiliki loading lama

---

# 16. Chart Rules

Grafik yang diperbolehkan:

```
Line Chart
Bar Chart
```

Grafik yang dilarang:

```
Donut Chart
Pie Chart
```

---

# 17. Security & Data

Data utama yang dikelola:

```
produk
pelanggan
supplier
transaksi
piutang
pembelian
pengeluaran
pengguna
entitas
pengaturan toko
```

---

# 18. Printer Support

Printer yang digunakan:

```
POS Thermal Printer
```

Ukuran umum:

```
58mm
80mm
```

---

# 19. Future Features

Dirancang agar mendukung:

```
multi toko
multi user
offline transaksi
sinkronisasi data
```

---

# 20. Non Functional Requirements

Aplikasi harus:

* mobile friendly
* mudah digunakan kasir
* UI konsisten
* performa cepat


# 21. Scema Tabel 

-- =====================================================
-- WARUNG PRO POS - FINAL SUPABASE SCHEMA
-- =====================================================

create extension if not exists "uuid-ossp";

-- =====================================================
-- SETTINGS (TOKO)
-- =====================================================

create table settings (
    id_toko uuid primary key default uuid_generate_v4(),
    nama_toko text not null,
    alamat text,
    no_tlp text,
    email text,
    owner text,
    created_at timestamptz default now()
);

-- =====================================================
-- ENTITAS (ROLE USER)
-- =====================================================

create table entitas (
    id_entitas uuid primary key default uuid_generate_v4(),
    entitas text not null,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

-- =====================================================
-- USERS
-- =====================================================

create table users (
    id_user uuid primary key default uuid_generate_v4(),
    nama_user text not null,
    username text unique not null,
    password text not null,
    entitas_id uuid references entitas(id_entitas),
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

create index idx_users_entitas on users(entitas_id);

-- =====================================================
-- CATEGORIES
-- =====================================================

create table categories (
    id bigserial primary key,
    name text not null,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

create index idx_categories_toko on categories(id_toko);

-- =====================================================
-- PRODUCTS
-- =====================================================

create table products (
    id bigserial primary key,
    name text not null,
    sku text,
    category_id bigint references categories(id),
    purchase_price numeric default 0,
    selling_price numeric not null,
    min_stock integer default 0,
    stock integer default 0,
    unit text,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

create index idx_products_toko on products(id_toko);

-- =====================================================
-- SUPPLIERS
-- =====================================================

create table suppliers (
    id bigserial primary key,
    name text not null,
    phone text,
    address text,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

-- =====================================================
-- CUSTOMERS
-- =====================================================

create table customers (
    id bigserial primary key,
    name text not null,
    phone text,
    address text,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

-- =====================================================
-- SALES
-- =====================================================

create table sales (
    id bigserial primary key,
    invoice_number text not null,
    customer_id bigint references customers(id),

    subtotal numeric default 0,
    discount numeric default 0,
    tax numeric default 0,
    total numeric not null,

    paid_amount numeric default 0,
    change_amount numeric default 0,

    payment_method text,
    status text default 'completed',

    sync_status text default 'pending',
    device_id text,

    id_toko uuid references settings(id_toko) on delete cascade,

    created_at timestamptz default now()
);

create index idx_sales_toko on sales(id_toko);

-- =====================================================
-- SALE ITEMS
-- =====================================================

create table sale_items (
    id bigserial primary key,
    sale_id bigint references sales(id) on delete cascade,
    product_id bigint references products(id),
    qty integer not null,
    price numeric not null,
    subtotal numeric not null,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

create index idx_sale_items_sale on sale_items(sale_id);

-- =====================================================
-- PAYMENTS
-- =====================================================

create table payments (
    id bigserial primary key,
    sale_id bigint references sales(id) on delete cascade,
    amount numeric not null,
    method text,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

-- =====================================================
-- PURCHASES
-- =====================================================

create table purchases (
    id bigserial primary key,
    invoice_number text,
    supplier_id bigint references suppliers(id),

    total numeric not null,

    sync_status text default 'pending',
    device_id text,

    id_toko uuid references settings(id_toko) on delete cascade,

    created_at timestamptz default now()
);

create index idx_purchase_toko on purchases(id_toko);

-- =====================================================
-- PURCHASE ITEMS
-- =====================================================

create table purchase_items (
    id bigserial primary key,
    purchase_id bigint references purchases(id) on delete cascade,
    product_id bigint references products(id),
    qty integer not null,
    price numeric not null,
    subtotal numeric not null,
    id_toko uuid references settings(id_toko) on delete cascade,
    created_at timestamptz default now()
);

create index idx_purchase_items_purchase on purchase_items(purchase_id);

-- =====================================================
-- STOCK MOVEMENTS
-- =====================================================

create table stock_movements (
    id bigserial primary key,
    product_id bigint references products(id),

    type text not null,
    qty integer not null,

    reference_id bigint,
    reference_type text,

    id_toko uuid references settings(id_toko) on delete cascade,

    created_at timestamptz default now()
);

create index idx_stock_product on stock_movements(product_id);

-- =====================================================
-- RECEIVABLES
-- =====================================================

create table receivables (
    id bigserial primary key,
    customer_id bigint references customers(id),

    jumlah_piutang numeric not null,
    status text default 'unpaid',

    id_toko uuid references settings(id_toko) on delete cascade,

    created_at timestamptz default now()
);

-- =====================================================
-- EXPENSES
-- =====================================================

create table expenses (
    id bigserial primary key,
    category_id bigint,
    description text,
    amount numeric not null,

    id_toko uuid references settings(id_toko) on delete cascade,

    created_at timestamptz default now()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

alter table products enable row level security;
alter table categories enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table purchases enable row level security;
alter table purchase_items enable row level security;
alter table payments enable row level security;
alter table suppliers enable row level security;
alter table customers enable row level security;
alter table expenses enable row level security;
alter table receivables enable row level security;
alter table stock_movements enable row level security;

-- =====================================================
-- BASIC RLS POLICY (TOKO ISOLATION)
-- =====================================================

create policy toko_isolation_products
on products
for all
using (id_toko = auth.jwt() ->> 'id_toko');

create policy toko_isolation_sales
on sales
for all
using (id_toko = auth.jwt() ->> 'id_toko');

create policy toko_isolation_purchases
on purchases
for all
using (id_toko = auth.jwt() ->> 'id_toko');