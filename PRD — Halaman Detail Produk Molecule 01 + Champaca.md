# PRD — Halaman Detail Produk Molecule 01 + Champaca

## Informasi Dokumen

| Informasi | Keterangan |
|---|---|
| Versi | 1.0 |
| Status | Draft untuk exercise |
| Konteks | Pembelajaran Front-End Development |
| Teknologi | HTML, CSS, dan JavaScript murni |
| Scope | Satu halaman detail produk dengan data dan aset lokal |
| Referensi | [Halaman produk Escentric Molecules](https://www.escentric.com/products/molecule-01-champaca) |
| Tanggal pemeriksaan | 6 Oktober 2026 |

Nama produk, deskripsi aroma, ukuran, harga, dan komponen aroma mengikuti halaman produk yang diperiksa. Harga menggunakan GBP sesuai storefront UK pada saat pemeriksaan; harga, mata uang, serta ketersediaan dapat berbeda menurut pasar dan waktu. Stok demo bukan representasi inventaris toko.

## 1. Product Overview

Halaman detail produk membantu calon pembeli memahami karakter parfum, melihat foto produk, memilih jumlah, dan meninjau detail sebelum mencoba tindakan pembelian. Versi exercise berfokus pada presentasi produk dan interaksi frontend; tombol pembelian tidak melakukan transaksi.

| Data | Nilai |
|---|---|
| Nama | Molecule 01 + Champaca |
| Jenis | Fragrance |
| Ukuran | 100 ml |
| Harga acuan | £135 per item (storefront UK saat diperiksa) |
| Accord | Woody, floral, aromatic |
| Komposisi aroma | Iso E Super + champaca |
| Deskripsi singkat | Perpaduan Iso E Super yang transparan, hangat, dan woody dengan champaca yang kaya, floral, dan berlapis. |
| Galeri | Tiga foto produk pada halaman referensi |
| Ketersediaan acuan | Tersedia saat halaman diperiksa; status pada exercise menggunakan data demo |

Konten utama mencakup header toko, galeri, informasi dan harga produk, pilihan ukuran, quantity, tombol aksi, panel detail, rekomendasi, serta footer.

## 2. Problem + Target User

### Problem

Calon pembeli parfum perlu memahami karakter aroma dan detail produk sebelum memutuskan apakah produk sesuai. Informasi penting perlu mudah ditemukan, sementara interaksi ukuran, jumlah, dan tombol aksi perlu memberikan feedback yang jelas.

Masalah yang ingin diselesaikan:

- Informasi aroma yang panjang sulit dipindai jika tidak disusun dengan baik.
- Foto produk, accord, ukuran, dan harga perlu terbaca sebagai satu konteks produk.
- Pengguna perlu melihat jumlah dan estimasi subtotal yang sedang dipilih.
- Tombol aksi harus memberi feedback yang jelas tanpa menyiratkan transaksi sungguhan.

### Target User

Calon pembeli parfum yang mengakses toko melalui desktop atau smartphone dan ingin mengevaluasi aroma serta detail produk sebelum melanjutkan.

Kebutuhan utama: melihat produk, memahami profil aromanya, mengetahui ukuran dan harga, menyesuaikan jumlah, serta memperoleh konfirmasi atas interaksi.

## 3. Goals + Non-Goals

### Goals

1. Menampilkan informasi produk dengan hierarki yang jelas.
2. Memungkinkan pengguna menelusuri foto produk.
3. Menampilkan ukuran 100 ml, harga, accord, dan ringkasan aroma secara konsisten.
4. Memungkinkan pengguna mengubah quantity dalam batas yang ditentukan.
5. Menampilkan subtotal dan feedback aksi berdasarkan pilihan terbaru.
6. Menyediakan panel detail yang dapat dibuka dan ditutup.
7. Memberikan pengalaman responsif, dapat diakses, dan nyaman pada desktop maupun mobile.

### Non-Goals

Versi ini tidak mencakup:

- Login, registrasi, checkout, pembayaran, atau pemrosesan pesanan.
- Keranjang belanja atau wishlist yang tersimpan.
- API, backend, database, atau sinkronisasi stok/harga.
- Pemilihan variasi aroma atau ukuran lain; exercise hanya menampilkan satu produk dan satu ukuran.
- Ulasan, rating, pencarian, filter, maupun personalisasi rekomendasi.
- Halaman admin atau pengelolaan katalog.
- Penentuan formula/daftar bahan parfum yang tidak tersedia pada sumber data exercise.

## 4. User Flow

1. Pengguna membuka halaman produk.
2. Halaman menampilkan galeri, nama, harga, accord, ukuran 100 ml, dan deskripsi singkat.
3. Pengguna memilih thumbnail untuk mengganti foto utama.
4. Pengguna membuka panel Description, Notes, Ingredients, atau Delivery & Returns untuk membaca detail yang disediakan.
5. Pengguna menambah atau mengurangi quantity.
6. Ringkasan quantity dan subtotal diperbarui.
7. Pengguna menekan “Add to bag”.
8. Halaman menampilkan feedback bahwa aksi tersebut hanya simulasi frontend dan tidak menambahkan item ke keranjang sungguhan.
9. Pengguna dapat mengaktifkan atau menonaktifkan tampilan wishlist demo.

### Kondisi Awal

- Foto pertama tampil sebagai foto utama.
- Ukuran yang ditampilkan adalah 100 ml.
- Quantity bernilai 1.
- Harga satuan ditampilkan sebagai £135 dan subtotal awal £135.
- Belum ada pesan hasil aksi; wishlist demo tidak aktif.
- Quantity menggunakan stok maksimum demo 10 item.

## 5. Features + Requirements

| ID | Fitur | Requirement |
|---|---|---|
| FR-01 | Header | Menampilkan identitas toko dan navigasi dasar secara ringkas. |
| FR-02 | Galeri produk | Menampilkan foto utama dengan proporsi terjaga dan tiga thumbnail yang dapat dipilih. Gambar memiliki teks alternatif yang bermakna. |
| FR-03 | Informasi produk | Menampilkan nama, jenis produk, harga per item, dan deskripsi singkat. |
| FR-04 | Accord | Menampilkan kategori Woody, Floral, dan Aromatic dengan label yang mudah dipindai. |
| FR-05 | Ukuran | Menampilkan satu ukuran yang tersedia pada exercise: 100 ml. Tidak menyediakan pilihan ukuran palsu. |
| FR-06 | Quantity | Menyediakan tombol − dan + dengan nilai minimum 1 dan maksimum stok demo 10. |
| FR-07 | Ringkasan harga | Menampilkan quantity dan subtotal berdasarkan harga satuan × quantity, dengan format GBP. |
| FR-08 | Panel detail | Menyediakan panel Description, Notes, Ingredients, dan Delivery & Returns yang dapat dibuka/tutup. Isi hanya menggunakan konten yang disiapkan untuk exercise; jangan mengarang klaim bahan atau kebijakan pengiriman. |
| FR-09 | Add to bag demo | Menampilkan feedback yang mudah dikenali setelah ditekan. Aksi tidak membuat pesanan atau menyimpan keranjang. |
| FR-10 | Wishlist demo | Tombol dapat diaktifkan/dinonaktifkan dan mengekspos status aktifnya; status tidak disimpan setelah halaman dimuat ulang. |
| FR-11 | Rekomendasi | Menampilkan bagian “You may also like” dengan kartu rekomendasi statis bila aset/data demo tersedia. Aksi rekomendasi di luar scope. |
| FR-12 | Footer dan responsif | Menampilkan footer minimal. Pada desktop, galeri dan informasi berdampingan; pada mobile, konten tersusun vertikal tanpa scroll horizontal. |

### Aturan Interaksi

- Thumbnail aktif memiliki penanda visual dan status yang dapat dikenali pembaca layar.
- Mengganti foto tidak mengubah ukuran, quantity, atau harga.
- Quantity dimulai dari 1; tombol − nonaktif pada 1 dan tombol + nonaktif pada 10.
- Input quantity manual tidak termasuk scope.
- Subtotal dihitung dengan rumus: harga per item × quantity.
- Format harga mengikuti locale UK pada demo, misalnya £135 dan £270.
- “Add to bag” menampilkan pesan simulasi yang menyebutkan ukuran dan jumlah; tidak mengubah state keranjang.
- Wishlist demo dapat diaktifkan dan dinonaktifkan; interaksinya tidak disimpan.
- Panel detail memiliki status buka/tutup yang terlihat dan dapat dioperasikan dengan keyboard.
- Semua perubahan state kembali ke kondisi awal saat halaman dimuat ulang.

## 6. User Stories

| ID | User Story |
|---|---|
| US-01 | Sebagai calon pembeli, saya ingin melihat foto produk agar dapat mengenali botol dan kemasannya. |
| US-02 | Sebagai calon pembeli, saya ingin memahami accord dan deskripsi aroma agar dapat menilai karakter parfum. |
| US-03 | Sebagai calon pembeli, saya ingin mengetahui ukuran dan harga agar dapat mempertimbangkan produk. |
| US-04 | Sebagai calon pembeli, saya ingin mengubah quantity dan melihat subtotal agar memahami pilihan saya. |
| US-05 | Sebagai calon pembeli, saya ingin membaca panel detail agar dapat menemukan informasi yang saya perlukan. |
| US-06 | Sebagai calon pembeli, saya ingin mendapat feedback setelah menekan tombol aksi agar tahu bahwa interaksi berhasil. |

## 7. Acceptance Criteria

Acceptance criteria adalah kondisi yang harus terpenuhi agar fitur dianggap selesai.

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| AC-01 | Pengguna membuka halaman | Header, galeri, nama, harga, accord, ukuran, quantity, tombol aksi, panel detail, dan footer tampil. |
| AC-02 | Halaman pertama kali dibuka | Foto pertama aktif; ukuran 100 ml; quantity 1; subtotal £135; tidak ada feedback aksi. |
| AC-03 | Pengguna memilih thumbnail kedua | Foto utama berubah ke foto kedua; thumbnail aktif diperbarui dan memiliki status aksesibel. |
| AC-04 | Pengguna melihat informasi aroma | Accord menampilkan Woody, Floral, dan Aromatic; ringkasan tidak mengubah klaim produk. |
| AC-05 | Quantity bernilai 1 | Tombol − nonaktif; quantity tidak dapat menjadi 0. |
| AC-06 | Pengguna menaikkan quantity menjadi 2 | Quantity tampil sebagai 2 dan subtotal diperbarui menjadi £270. |
| AC-07 | Quantity bernilai 10 | Tombol + nonaktif; quantity tidak dapat menjadi 11. |
| AC-08 | Pengguna membuka panel detail | Konten panel yang dipilih tampil dan status expanded dapat dikenali pembaca layar. |
| AC-09 | Pengguna menekan “Add to bag” | Feedback simulasi tampil dengan ukuran dan quantity terkini; tidak ada checkout atau penyimpanan keranjang. |
| AC-10 | Pengguna mengaktifkan wishlist demo | Status tombol berubah; menekan lagi mengembalikan status nonaktif. |
| AC-11 | Pengguna memuat ulang halaman | Quantity, galeri, panel, wishlist, dan feedback kembali ke kondisi awal. |
| AC-12 | Halaman dibuka pada lebar 375 px | Tidak ada scroll horizontal; gambar, teks, tombol, dan panel tetap dapat digunakan. |
| AC-13 | Pengguna bernavigasi dengan keyboard | Semua kontrol interaktif dapat dijangkau dan dioperasikan dengan keyboard serta memiliki fokus yang terlihat. |
| AC-14 | Alur utama dijalankan | Tidak ada error JavaScript; harga dan subtotal sesuai quantity yang tampil. |

## 8. Constraints + Success Criteria

### Constraints

- Implementasi menggunakan HTML, CSS, dan JavaScript murni tanpa framework.
- Data produk disimpan langsung di frontend; tidak ada API atau backend.
- Aset foto disiapkan secara lokal sebelum implementasi.
- Harga £135 adalah nilai acuan untuk exercise berdasarkan storefront UK saat diperiksa; bukan jaminan harga live.
- Stok maksimum 10 hanya batas demo, bukan informasi inventaris Escentric Molecules.
- Hanya satu produk dan satu ukuran ditampilkan.
- Pilihan quantity dan status interaksi tidak disimpan setelah halaman dimuat ulang.
- Konten Ingredients serta Delivery & Returns hanya boleh berasal dari materi yang disediakan; jangan menambahkan klaim yang tidak terverifikasi.

### Success Criteria

Halaman dianggap berhasil apabila:

1. Seluruh acceptance criteria lulus saat pengujian manual.
2. Informasi produk, accord, ukuran, dan harga dapat ditemukan dengan mudah.
3. Galeri, quantity, subtotal, dan feedback selalu konsisten dengan state terkini.
4. Quantity selalu berada dalam rentang 1–10.
5. Halaman dapat digunakan pada mobile dan desktop tanpa konten terpotong.
6. Kontrol interaktif memiliki fokus dan label/status yang aksesibel.
7. Tidak ada error JavaScript saat menjalankan alur utama.
