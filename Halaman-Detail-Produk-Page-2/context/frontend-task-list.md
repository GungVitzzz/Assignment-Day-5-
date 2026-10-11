# Task List — Frontend Detail Produk

Checklist integrasi halaman `index.html` dengan Product API. Fokusnya adalah mengganti data produk hard-code dengan data yang tervalidasi dari backend.

## 1. Persiapan integrasi

- [ ] Pastikan halaman dan API berjalan pada origin yang sama, atau konfigurasi base URL API melalui environment/config yang aman.
- [ ] Tentukan ID produk sumber halaman, misalnya UUID produk Molecule 01 + Champaca.
- [ ] Buat modul API khusus, misalnya `api/products.js`, agar pemanggilan `fetch` tidak tersebar di seluruh UI.
- [ ] Tentukan state UI: `loading`, `ready`, `error`, dan `outOfStock`.

## 2. Memanggil dan memvalidasi API

- [ ] Panggil `GET /api/products/:id` saat halaman detail dimuat.
- [ ] Periksa `response.ok`, parse JSON secara aman, dan tangani error jaringan atau JSON invalid.
- [ ] Validasi envelope sukses: `data`, `meta.requestId`, dan tipe field produk wajib.
- [ ] Validasi minimal `name`, `price`, `currency`, `image`, `variants`, dan `description` sebelum render.
- [ ] Simpan `meta.requestId` untuk ditampilkan pada log diagnostik internal bila request gagal.
- [ ] Jangan menggunakan data parsial untuk menjalankan aksi “Add to bag”.

## 3. Render detail produk

- [ ] Render `name` pada `#product-title`, breadcrumb, judul halaman, dan label aksesibilitas terkait.
- [ ] Format `price` dan currency dengan `Intl.NumberFormat`, bukan menggabungkan simbol mata uang secara manual.
- [ ] Render foto utama pada `.main-image` dengan `src` tervalidasi dan `alt` yang berasal dari nama/alt API.
- [ ] Tangani event gambar gagal dan tampilkan fallback/pesan yang ramah pengguna.
- [ ] Render ukuran/warna dari `variants[]`; jangan asumsi produk hanya punya satu variasi.
- [ ] Render deskripsi memakai `textContent`; jangan gunakan `innerHTML` untuk data API.
- [ ] Pertahankan galeri tambahan sebagai konten statis hanya bila belum dikirim API, dan dokumentasikan batasan ini.

## 4. Variasi, stok, dan quantity

- [ ] Tentukan variasi awal yang tersedia dan tampilkan pilihan warna/ukuran bila jumlah variasi lebih dari satu.
- [ ] Set quantity awal menjadi `1` hanya ketika variasi memiliki `quantity > 0`.
- [ ] Nonaktifkan tombol kurang saat quantity `1`.
- [ ] Nonaktifkan tombol tambah saat quantity mencapai `stock_quantity` variasi terpilih.
- [ ] Hitung ulang subtotal serta total tombol dari harga × quantity setiap perubahan.
- [ ] Ketika variasi berubah, reset quantity secara aman dan perbarui batas stok.
- [ ] Jika quantity/stok `0`, tampilkan “Tidak tersedia”, nonaktifkan kontrol serta tombol Add to bag.

## 5. Aksesibilitas dan pengalaman gagal

- [ ] Tampilkan status loading yang dapat dibaca screen reader (`aria-live`).
- [ ] Tampilkan pesan error yang jelas tanpa detail server, stack trace, atau kredensial.
- [ ] Pertahankan fokus keyboard yang masuk akal ketika status UI berubah.
- [ ] Pastikan kontrol quantity dapat digunakan lewat keyboard dan label ARIA memuat nama produk terkini.
- [ ] Jangan memblokir navigasi atau konten statis ketika API sedang memuat/gagal.
- [ ] Sediakan aksi coba lagi untuk request produk yang gagal.

## 6. Kesesuaian dengan format respons backend

- [ ] Baca data dari envelope `response.data`, bukan dari root JSON.
- [ ] Perlakukan `response.meta.requestId` sebagai correlation ID; jangan jadikan data bisnis.
- [ ] Tangani error dengan `response.error.code` dan `response.error.message`.
- [ ] Map `variants[].stock_quantity`/`quantity` secara konsisten dengan kontrak OpenAPI yang dipilih.
- [ ] Perbarui integrasi saat kontrak Swagger/OpenAPI berubah; jangan membuat field tambahan tanpa kontrak backend.

## 7. Pengujian front end

- [ ] Uji respons produk sukses dengan foto, ukuran, quantity, harga, dan deskripsi.
- [ ] Uji produk dengan banyak warna/ukuran dan stok berbeda per variasi.
- [ ] Uji stok `0`, tombol quantity di batas bawah/atas, dan perhitungan subtotal.
- [ ] Uji `400`, `404`, `500`, timeout, jaringan offline, JSON invalid, serta gambar gagal dimuat.
- [ ] Uji teks API yang berisi HTML/skrip agar tampil sebagai teks dan tidak dieksekusi.
- [ ] Uji keyboard, screen reader announcement, tampilan mobile, dan browser utama.
