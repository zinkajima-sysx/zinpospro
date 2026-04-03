
# Flow UI — ZinPOS Pro

Dokumen ini menjelaskan **alur UI (User Interface Flow)** untuk setiap menu utama aplikasi POS **ZinPOS Pro**.
Tujuannya agar developer atau AI agent memahami struktur halaman, komponen UI, serta interaksi pengguna.

---

# 1. Dashboard

## Tujuan
Menampilkan ringkasan kondisi bisnis secara cepat.

## Layout

Navbar

Stat Cards

Grafik Tren Penjualan

Produk Terlaris | Stok Menipis

Transaksi Terakhir

## Statistik Cards

- Total Penjualan Hari Ini
- Total Transaksi
- Total Produk Terjual
- Total Profit

Indikator:

▲ naik  
▼ turun

## Grafik

Jenis grafik:

Line Chart

Filter:

- Hari
- Bulan
- Tahun

## Card Produk Terlaris

Menampilkan:

- Nama produk
- Jumlah terjual

## Card Stok Menipis

Menampilkan:

- Produk
- Sisa stok

Klik item → buka halaman **Barang**

---

# 2. Kasir

## Layout

Navbar

Search Produk

Grid Produk

Keranjang Belanja

Metode Pembayaran

## Grid Produk

Setiap kartu produk:

Icon Produk  
Nama Produk  
Stock  
Harga

Contoh:

Stock: 12  
Rp 15.000

Klik produk → masuk keranjang

## Keranjang

Isi:

Produk  
Qty  
Subtotal

Tombol:

+ tambah qty  
- kurangi qty  
hapus produk

## Tombol Kasir

Koreksi  
Batal  
Checkout

## Metode Pembayaran

- Cash
- QRIS
- Transfer
- Piutang

Jika Piutang:

Pilih pelanggan  
Tanggal jatuh tempo

## Flow Checkout

Checkout  
↓  
Preview Struk  
↓  
Print  
↓  
Share WhatsApp

---

# 3. Piutang

## Layout

Filter  
Tabel Piutang

## Kolom

Pelanggan  
Invoice  
Total  
Sisa  
Jatuh Tempo  
Status

## Action

Bayar  
Detail

## Flow Pembayaran

Klik Bayar  
↓  
Input jumlah  
↓  
Simpan  
↓  
Update sisa piutang

---

# 4. Restock / Pembelian

## Layout

Supplier  
Form Pembelian  
Daftar Barang

## Form

Supplier  
Tanggal  
Tambah Produk

## Daftar Produk

Produk  
Qty  
Harga  
Subtotal

## Flow

Tambah produk  
↓  
Input qty  
↓  
Hitung total  
↓  
Simpan pembelian  
↓  
Update stok

---

# 5. Biaya / Pengeluaran

## Layout

Form Tambah Pengeluaran  
Tabel Pengeluaran

## Form

Kategori  
Deskripsi  
Jumlah  
Tanggal

## Tabel

Tanggal  
Kategori  
Deskripsi  
Jumlah

---

# 6. Laporan

## Filter

Harian  
Bulanan  
Tahunan  
All

## Tab

Penjualan  
Pembelian  
Pengeluaran  
Stok

## Tampilan

Table View

Default:

10 baris  
pagination

## Export

Export Excel  
Export PDF

---

# 7. Barang

## Layout

Search  
Tambah Barang  
Tabel Produk

## Kolom

Icon  
Nama  
Kategori  
Harga  
Stok

## Action

Edit  
Hapus

---

# 8. Pelanggan

## Layout

Tambah Pelanggan  
Tabel Pelanggan

## Kolom

Nama  
Telepon  
Alamat

---

# 9. Supplier

## Layout

Tambah Supplier  
Tabel Supplier

---

# 10. Pengguna

## Layout

Tambah Pengguna  
Tabel Pengguna

## Kolom

Nama  
Email  
Role

---

# 11. Entitas

Digunakan jika sistem multi-toko.

## Layout

Daftar Toko

---

# 12. Pengaturan Toko

## Form

Nama Toko  
Alamat  
Telepon  
Upload Logo  
Footer Struk

## Flow Upload Logo

Upload logo  
↓  
Supabase Storage  
↓  
Simpan URL  
↓  
settings_toko.logo_url

---

# 13. Dynamic Menu

Digunakan untuk mengatur menu yang tampil di aplikasi.

---

# Flow Transaksi Utama

Kasir  
↓  
Pilih Produk  
↓  
Keranjang  
↓  
Checkout  
↓  
Pembayaran  
↓  
Print Struk  
↓  
Share WhatsApp  
↓  
Masuk ke Laporan

---

# Komponen UI Global

Semua komponen menggunakan:

border-radius: 20px

---

# Standar Tabel

Semua tabel wajib memiliki:

Search bar  
Pagination  
Default 10 rows

---

# Responsive Rules

Jika layar kecil:

Grid produk → 2 kolom  atau menyesuaikan seuai ketersiaan space
Font menyesuaikan  
Navbar collapse

