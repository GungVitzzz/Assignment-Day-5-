# Product detail frontend

Halaman detail produk mengambil produk ID `1` dari Product API yang berjalan di `http://localhost:3000`. HTML dan stylesheet mengikuti desain halaman yang ada di workspace root. Aset gambar dilayani dari folder `../assets` oleh server frontend tanpa dipindahkan atau diubah.

## Menjalankan

Pastikan API dan PostgreSQL sudah aktif (lihat `../api_product/README.md`), lalu jalankan dari folder ini:

```powershell
npm start
```

Buka `http://localhost:5501`. Ganti port dengan environment variable `FRONTEND_PORT` bila diperlukan. URL API dapat diubah melalui `PRODUCT_API_BASE_URL` saat menjalankan server frontend atau elemen meta `product-api-base-url` pada `index.html`; backend harus mengizinkan origin frontend untuk CORS.

## Pengujian

```powershell
npm test
```

Kontrak API saat ini menyediakan satu `quantity` yang berlaku sama pada semua `variants.colorOrSize`. Karena API hanya mengirim satu foto utama (`image`), dua foto galeri lain tetap menggunakan aset statis lokal.
