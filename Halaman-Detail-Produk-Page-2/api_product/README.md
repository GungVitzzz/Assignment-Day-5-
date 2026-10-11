# Product API

REST API Node.js/Express untuk halaman detail produk. PostgreSQL menyimpan data; API memakai kontrak PRD yang kompatibel dengan UI: ID integer, `image` sebagai string, dan `variants.colorOrSize`/`quantity`.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env` dan ganti `POSTGRES_PASSWORD` dengan nilai lokal yang kuat. Samakan password itu pada `DATABASE_URL`.
2. Jalankan `docker compose up -d postgres` dari folder `api_product` dan tunggu health check PostgreSQL lulus.
3. Jalankan `npm install`, lalu `npm run migrate` untuk menerapkan migrasi dan seed.
4. Jalankan `npm run dev` atau `npm start`.

API tersedia di `http://localhost:3000`; Swagger UI pada `http://localhost:3000/api-docs` (non-production) dan spesifikasi OpenAPI di `/openapi.json`.
Untuk menghentikan database tanpa menghapus datanya, jalankan `docker compose down`.

Jalankan halaman frontend pada origin lokal terpisah, misalnya dari root workspace:

```powershell
python -m http.server 5500
```

Buka `http://localhost:5500`. API mengizinkan CORS hanya dari origin HTTP `localhost`/`127.0.0.1` pada mode development; CORS development dimatikan pada production. Browser akan meminta produk `1` dari `http://localhost:3000`.

## Endpoint

- `GET /api/products`
- `GET /api/products/:id` (ID integer positif)
- `POST /api/products`

Contoh body `POST`:

```json
{
  "name": "Molecule 02",
  "price": 135,
  "currency": "GBP",
  "image": "/assets/molecule-02-bottle.jpg",
  "variants": {
    "colorOrSize": ["100 ml"],
    "quantity": 10
  },
  "description": "A fragrance with a warm, mineral character."
}
```

Setiap respons API memakai envelope `data` atau `error`, metadata `requestId`/`timestamp`, dan header `X-Request-Id`. Produk dibuat dengan ID publik integer yang persisten; UUID tetap digunakan sebagai kunci internal/foreign key database.

Jalankan `npm test` untuk test unit. PostgreSQL harus aktif untuk menjalankan migrasi dan smoke test endpoint.

## Batasan galeri frontend

API saat ini hanya menyediakan satu foto utama (`image`). Foto utama halaman detail bersumber dari API; dua foto galeri tambahan tetap memakai aset statis lokal sampai backend menyediakan kontrak galeri multi-foto.
