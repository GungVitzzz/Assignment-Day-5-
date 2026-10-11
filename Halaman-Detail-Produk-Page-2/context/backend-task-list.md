# Task List — Backend Product API

Checklist implementasi backend Node.js, Express.js, PostgreSQL, dan OpenAPI/Swagger. Urutan ini mengikuti `prd.md` dan `architecture.md`.

## 1. Setup proyek

- [ ] Inisialisasi `package.json` dan tetapkan versi Node.js LTS.
- [ ] Instal `express`, `pg`, `zod` (atau validator setara), `dotenv`, `swagger-jsdoc`, dan `swagger-ui-express`.
- [ ] Tambahkan tooling pengembangan: `nodemon`, linter/formatter, test runner, dan `supertest`.
- [ ] Buat `.env.example` dengan `PORT`, `NODE_ENV`, `DATABASE_URL`, dan `DATABASE_SSL`.
- [ ] Pastikan `.env` masuk `.gitignore` dan tidak ada kredensial di source code.

## 2. Struktur Layered MVC

- [ ] Buat `src/app.js` dan `src/server.js`.
- [ ] Buat folder `config`, `routes`, `controllers`, `services`, `repositories`, `models`, `validators`, `middleware`, `errors`, `utils`, dan `docs`.
- [ ] Buat `product.routes.js`, `product.controller.js`, `product.service.js`, serta `product.repository.js`.
- [ ] Tegakkan aturan layer: controller tidak mengakses database; service tidak menggunakan `req`/`res`; repository tidak menentukan HTTP status.
- [ ] Buat response builder bersama untuk envelope `data`/`error` dan `meta`.

## 3. PostgreSQL dan migrasi

- [ ] Siapkan database dan role PostgreSQL khusus aplikasi dengan hak minimum.
- [ ] Buat connection pool `pg` dengan timeout serta SSL yang dikonfigurasi melalui environment.
- [ ] Buat migration `products` dengan nama, harga `NUMERIC(12,2)`, currency, deskripsi, dan audit timestamp.
- [ ] Buat migration `product_images` dengan foto utama, urutan, serta foreign key ke produk.
- [ ] Buat migration `product_variants` dengan warna/ukuran dan `stock_quantity` 0–999.
- [ ] Tambahkan constraint, foreign key, unique index foto utama, index variasi, dan unique kombinasi warna/ukuran.
- [ ] Buat seed Molecule 01 + Champaca beserta foto utama dan variasi `100 ml`, quantity `10`.
- [ ] Uji migrasi dari database kosong dan uji rollback bila tool migrasi mendukungnya.

## 4. Middleware dan pertahanan data

- [ ] Pasang `express.json({ limit: "100kb" })`.
- [ ] Buat middleware request ID yang membuat UUID, menyimpannya pada request, dan mengirim `X-Request-Id`.
- [ ] Tangani JSON malformed sebagai `400 INVALID_JSON` dalam format error standar.
- [ ] Buat validator path ID UUID untuk endpoint detail.
- [ ] Buat validator body `POST` dengan allow-list field.
- [ ] Validasi nama dan deskripsi tidak kosong/panjang maksimum; harga positif; currency ISO uppercase.
- [ ] Validasi URL foto hanya `/assets/...` atau `https://` dan tolak `data:`/`javascript:`.
- [ ] Validasi variasi: minimal satu, type valid, warna/ukuran sesuai type, dan quantity integer 0–999.
- [ ] Tolak `id`, timestamp, dan field tak dikenal untuk mencegah mass assignment.
- [ ] Tambahkan API not-found middleware dan centralized error handler; jangan kirim stack trace ke client.

## 5. Implementasi endpoint

- [ ] Implementasikan `GET /api/products` melalui route → controller → service → repository.
- [ ] Ambil foto utama dan ringkasan variasi untuk daftar produk secara efisien.
- [ ] Implementasikan `GET /api/products/:id` dengan foto dan seluruh variasi produk.
- [ ] Kembalikan `404 PRODUCT_NOT_FOUND` untuk UUID valid yang tidak ditemukan.
- [ ] Implementasikan `POST /api/products` dengan transaksi database.
- [ ] Insert produk, foto, dan variasi; lakukan `ROLLBACK` jika salah satu insert gagal.
- [ ] Pastikan tepat satu foto utama dan kembalikan `201` dengan header `Location`.
- [ ] Gunakan query SQL berparameter di repository tanpa interpolasi SQL.
- [ ] Map `snake_case` database menjadi resource API `camelCase`.

## 6. Format respons API

- [ ] Respons sukses memakai `data` dan `meta.requestId`/`meta.timestamp`.
- [ ] Daftar produk menyertakan `meta.count`.
- [ ] Respons error memakai `error.code`, `error.message`, `error.details` (hanya validasi), serta `meta`.
- [ ] Cocokkan nilai `meta.requestId` dengan header `X-Request-Id`.
- [ ] Pastikan `Content-Type` seluruh respons API adalah JSON.

## 7. Swagger dan OpenAPI

- [ ] Buat definisi OpenAPI 3.1 di `src/docs/openapi.js` atau YAML setara.
- [ ] Publikasikan Swagger UI di `/api-docs` dan spesifikasi JSON di `/openapi.json`.
- [ ] Dokumentasikan parameter, request body, status sukses/error, serta header `X-Request-Id`.
- [ ] Definisikan schema reusable: `Product`, `ProductImage`, `ProductVariant`, `ProductCreateInput`, `ApiMeta`, dan `ApiError`.
- [ ] Verifikasi endpoint dari Swagger UI dan validasi dokumen OpenAPI di test/CI.
- [ ] Lindungi atau nonaktifkan Swagger UI pada production jika dokumentasi tidak ditujukan untuk publik.

## 8. Pengujian dan kesiapan rilis

- [ ] Buat unit test untuk validator, mapper, service, dan response builder.
- [ ] Buat integration test PostgreSQL untuk seluruh endpoint.
- [ ] Uji `200`, `201`, `400`, `404`, `500`, body malformed, URL foto berbahaya, dan kegagalan transaksi.
- [ ] Uji constraint database secara langsung, termasuk foto utama tunggal dan quantity valid.
- [ ] Uji graceful shutdown untuk menutup PostgreSQL pool.
- [ ] Tambahkan README: instalasi, environment, migrasi, seed, menjalankan server, dan URL Swagger.
