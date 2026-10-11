# PRD — REST API Detail Produk: Molecule 01 + Champaca

## 1. Ringkasan

Bangun REST API Express.js sebagai sumber data halaman detail produk pada `index.html`. Data disimpan hard-code/in-memory; database belum diperlukan. API menyediakan daftar produk, detail produk, dan penambahan produk baru. Semua request body endpoint tulis wajib melewati middleware validasi sebelum diproses.

Produk awal adalah **Molecule 01 + Champaca**: ID `1`, harga `135 GBP`, ukuran `100 ml`, dan batas quantity `10`. Halaman detail mengambil data dari API sehingga nama, harga, foto utama, variasi, batas quantity, serta deskripsi tidak menjadi sumber data hard-code front end.

## 2. Tujuan dan ukuran keberhasilan

### Tujuan

- Menyediakan REST API Node.js/Express untuk daftar, detail, dan pembuatan produk.
- Menggunakan kontrak JSON stabil untuk nama, harga, foto, variasi warna/ukuran dan quantity, serta deskripsi.
- Memvalidasi setiap body `POST` melalui middleware.
- Mengintegrasikan endpoint detail ke halaman produk 2.

### Ukuran keberhasilan

- `GET /api/products` menghasilkan `200` dengan daftar produk.
- `GET /api/products/1` menghasilkan `200` dengan data Molecule 01 + Champaca lengkap.
- `POST /api/products` valid menghasilkan `201`; produk baru dapat dibaca melalui endpoint daftar dan detail selama server aktif.
- Body tidak valid ditolak `400` tanpa memutasi data.
- UI merender field minimum dari respons API dan tidak melewati batas quantity API.

## 3. Persona dan user story

| Peran                        | User story                                                      | Nilai                                    |
| ---------------------------- | --------------------------------------------------------------- | ---------------------------------------- |
| Pengunjung toko              | Saya ingin melihat informasi produk lengkap sebelum membeli.    | Informasi konsisten pada halaman detail. |
| Front end                    | Saya ingin kontrak JSON stabil untuk merender halaman otomatis. | Integrasi sederhana dan dapat diuji.     |
| Pengelola katalog (exercise) | Saya ingin menambah produk yang formatnya tervalidasi.          | Data in-memory tetap rapi.               |
| Developer                    | Saya ingin error yang jelas dan aman.                           | Perilaku API dapat diprediksi.           |

## 4. Ruang lingkup

### Termasuk

- Server Node.js dengan Express.js dan `express.json()`.
- Store produk hard-code/in-memory.
- `GET /api/products`, `GET /api/products/:id`, dan `POST /api/products`.
- Middleware validasi body `POST`, validasi path ID, error handler JSON.
- Integrasi detail produk untuk field minimum exercise.

### Tidak termasuk

- Database/persistensi restart, autentikasi, admin, unggah gambar, pembayaran, checkout, cart server-side.
- `PUT`, `PATCH`, `DELETE`, pagination, pencarian/filter, promosi, stok real-time.
- Rekomendasi, wishlist, footer, dan konten pendukung menjadi dinamis.

## 5. Kontrak API

Base path: `/api/products`. Semua respons menggunakan `Content-Type: application/json; charset=utf-8` dan envelope API yang konsisten. Header `X-Request-Id` juga dikirim pada setiap respons untuk korelasi log dan pelacakan masalah.

### Standar format respons

API menggunakan envelope berorientasi resource: `data` hanya memuat payload utama, `meta` memuat konteks respons, dan error memakai objek `error` yang stabil. Kunci sukses/error tidak dicampur dalam satu respons.

```json
{
  "data": {},
  "meta": {
    "requestId": "018f1f2f-41cc-7f4e-b7dd-634ec8a7b8b8",
    "timestamp": "2026-10-09T00:00:00.000Z"
  }
}
```

`requestId` dibuat middleware pada setiap request (UUID atau ID unik setara), disimpan di `req`, diteruskan ke log, dan tidak dipercaya dari nilai header client. `timestamp` memakai UTC ISO 8601. `data` dapat berupa objek produk atau array produk; field payload tidak dibungkus lagi dengan `success`, `message`, atau `responseCode` karena status HTTP telah menjadi sumber kebenaran.

### Model produk

| Field                  | Tipe     | Ketentuan                                       |
| ---------------------- | -------- | ----------------------------------------------- |
| `id`                   | integer  | ID positif unik, dibuat server.                 |
| `name`                 | string   | Nama produk.                                    |
| `price`                | number   | Harga satuan numerik.                           |
| `currency`             | string   | Kode ISO 4217 tiga huruf kapital.               |
| `image`                | string   | Path aset aplikasi atau URL HTTPS gambar utama. |
| `variants.colorOrSize` | string[] | Minimal satu variasi.                           |
| `variants.quantity`    | integer  | Batas quantity UI, 0–999.                       |
| `description`          | string   | Deskripsi teks biasa.                           |

Contoh produk awal:

```json
{
  "id": 1,
  "name": "Molecule 01 + Champaca",
  "price": 135,
  "currency": "GBP",
  "image": "/assets/molecule-01-champaca-bottle.jpg",
  "variants": { "colorOrSize": ["100 ml"], "quantity": 10 },
  "description": "Molecule 01 + Champaca memadukan Iso E Super yang hangat, woody, dan velvety dengan champaca yang kaya, floral, serta lembut."
}
```

### `GET /api/products`

Mengambil seluruh produk yang tersedia.

Respons sukses — **200 OK**:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Molecule 01 + Champaca",
      "price": 135,
      "currency": "GBP",
      "image": "/assets/molecule-01-champaca-bottle.jpg",
      "variants": { "colorOrSize": ["100 ml"], "quantity": 10 },
      "description": "Molecule 01 + Champaca memadukan Iso E Super yang hangat, woody, dan velvety dengan champaca yang kaya, floral, serta lembut."
    }
  ],
  "meta": {
    "requestId": "018f1f2f-41cc-7f4e-b7dd-634ec8a7b8b8",
    "timestamp": "2026-10-09T00:00:00.000Z",
    "count": 1
  }
}
```

`meta.count` adalah jumlah item yang benar-benar dikembalikan. Endpoint ini belum dipaginasi dalam scope exercise; jika pagination ditambahkan kelak, gunakan query `page` dan `limit`, serta perluas `meta` dengan `page`, `limit`, `total`, dan `totalPages`. Jika belum ada produk, respons tetap `200` dengan `data: []` dan `count: 0`.

### `GET /api/products/:id`

Mengambil detail satu produk, contohnya `GET /api/products/1`.

Respons sukses — **200 OK**:

```json
{
  "data": {
    "id": 1,
    "name": "Molecule 01 + Champaca",
    "price": 135,
    "currency": "GBP",
    "image": "/assets/molecule-01-champaca-bottle.jpg",
    "variants": { "colorOrSize": ["100 ml"], "quantity": 10 },
    "description": "Molecule 01 + Champaca memadukan Iso E Super yang hangat, woody, dan velvety dengan champaca yang kaya, floral, serta lembut."
  },
  "meta": {
    "requestId": "018f1f2f-41cc-7f4e-b7dd-634ec8a7b8b8",
    "timestamp": "2026-10-09T00:00:00.000Z"
  }
}
```

### `POST /api/products`

Menambahkan produk ke store in-memory. Client mengirim `Content-Type: application/json`; `id` tidak boleh dikirim karena dibuat server.

Contoh body:

```json
{
  "name": "Molecule 02",
  "price": 135,
  "currency": "GBP",
  "image": "/assets/molecule-02-bottle.jpg",
  "variants": { "colorOrSize": ["100 ml"], "quantity": 10 },
  "description": "Wewangian berbasis Ambroxan dengan karakter hangat dan mineral."
}
```

Respons sukses — **201 Created**:

```json
{
  "data": {
    "id": 2,
    "name": "Molecule 02",
    "price": 135,
    "currency": "GBP",
    "image": "/assets/molecule-02-bottle.jpg",
    "variants": { "colorOrSize": ["100 ml"], "quantity": 10 },
    "description": "Wewangian berbasis Ambroxan dengan karakter hangat dan mineral."
  },
  "meta": {
    "requestId": "018f1f2f-41cc-7f4e-b7dd-634ec8a7b8b8",
    "timestamp": "2026-10-09T00:00:00.000Z"
  }
}
```

Sertakan header `Location: /api/products/2`. Pembuatan ID harus unik dan tidak memakai `array.length` agar tidak duplikat bila urutan data berubah kelak.

## 6. Validasi dan middleware

### Parameter `:id`

- Harus cocok dengan `^[1-9][0-9]*$`.
- Setelah parsing, harus `Number.isSafeInteger(id)` dan lebih dari 0.
- `0`, negatif, desimal, `+1`, kosong, nonangka, dan integer tidak aman menghasilkan `400`.
- ID valid yang tidak tersedia menghasilkan `404`.

### Body `POST`

Pasang `validateProductBody` setelah `express.json()` dan sebelum handler `POST`. Middleware mengumpulkan semua kesalahan, tidak memutasi store, dan menghentikan request dengan `400` jika ada kesalahan.

| Field                  | Aturan                                                                                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Body                   | Wajib objek JSON biasa, bukan `null`, array, atau kosong. Hanya boleh `name`, `price`, `currency`, `image`, `variants`, `description`; `id` dan field asing ditolak. |
| `name`                 | String setelah `trim()` tidak kosong, maksimum 150 karakter.                                                                                                         |
| `price`                | Number finite > 0, maksimal dua desimal; string numerik ditolak.                                                                                                     |
| `currency`             | String yang cocok `^[A-Z]{3}$`.                                                                                                                                      |
| `image`                | String tidak kosong; path harus diawali `/assets/` atau URL `https://`. Tolak `data:`, `javascript:`, dan skema lain.                                                |
| `variants`             | Objek biasa dengan tepat `colorOrSize` dan `quantity`.                                                                                                               |
| `variants.colorOrSize` | Array 1–20 string; tiap nilai setelah `trim()` tidak kosong dan maksimum 80 karakter.                                                                                |
| `variants.quantity`    | Integer 0–999.                                                                                                                                                       |
| `description`          | String setelah `trim()` tidak kosong, maksimum 2.000 karakter.                                                                                                       |

Handler boleh menyimpan string hasil `trim()` setelah validasi. JSON malformed harus dipetakan ke error JSON `400`, tanpa stack trace.

## 7. Format error

Semua error memakai bentuk berikut:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body is invalid.",
    "details": [
      { "field": "price", "message": "Price must be a positive finite number." }
    ]
  },
  "meta": {
    "requestId": "018f1f2f-41cc-7f4e-b7dd-634ec8a7b8b8",
    "timestamp": "2026-10-09T00:00:00.000Z"
  }
}
```

`details` hanya disertakan untuk validasi body dan tidak memuat data sensitif. Untuk error selain validasi, hilangkan `details` daripada mengirim array kosong. Error handler terpusat wajib membangun envelope ini untuk seluruh error API, termasuk 404 dan error parser JSON.

| Kondisi                  | Status | Kode                    | Pesan                                         |
| ------------------------ | -----: | ----------------------- | --------------------------------------------- |
| Path ID invalid          |    400 | `INVALID_PRODUCT_ID`    | `Product id must be a positive safe integer.` |
| JSON malformed           |    400 | `INVALID_JSON`          | `Request body must be valid JSON.`            |
| Body invalid             |    400 | `VALIDATION_ERROR`      | `Request body is invalid.`                    |
| Produk tidak ditemukan   |    404 | `PRODUCT_NOT_FOUND`     | `Product not found.`                          |
| Route API tidak tersedia |    404 | `ROUTE_NOT_FOUND`       | `API route not found.`                        |
| Error tak terduga        |    500 | `INTERNAL_SERVER_ERROR` | `An unexpected error occurred.`               |

Stack trace dan detail internal hanya dicatat di server log.

## 8. Integrasi halaman detail produk

Ketika halaman dimuat, front end memanggil `GET /api/products/1` dari origin yang sama, lalu memvalidasi struktur `response.data` dan tipe field wajib sebelum merender.

| Data API               | Target UI                                         | Aturan render                                                                                 |
| ---------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `name`                 | `#product-title`, breadcrumb, label aksesibilitas | Gunakan teks biasa; perbarui judul dokumen bila perlu.                                        |
| `price`, `currency`    | `.price`, `#subtotal`, `#button-total`            | Format dengan `Intl.NumberFormat`; total = harga × quantity.                                  |
| `image`                | `.main-image`                                     | Atur `src`; `alt` berasal dari nama. Galeri tambahan boleh statis karena bukan field minimum. |
| `variants.colorOrSize` | `.size-value`                                     | Tampilkan pilihan pertama sebagai teks.                                                       |
| `variants.quantity`    | Kontrol quantity                                  | Nilai awal 1 bila > 0; tambah nonaktif di batas.                                              |
| `description`          | `#description-panel .accordion-content`           | Render sebagai teks, bukan HTML.                                                              |

Jika quantity `0`, tampilkan status tidak tersedia dan nonaktifkan kontrol serta “Add to bag”. Jika request, respons, atau gambar gagal, tampilkan pesan ramah pengguna dan jangan jalankan aksi beli memakai data parsial. Semua teks API wajib dirender dengan `textContent`/DOM API setara, bukan `innerHTML`. Wishlist, galeri, dan add-to-bag tetap demo; tidak ada endpoint cart.

## 9. Struktur direktori — Layered Architecture MVC

Gunakan MVC yang dipisahkan ke dalam layer agar HTTP, aturan bisnis, dan akses data tidak saling bergantung. Karena aplikasi ini REST API, "View" adalah aset halaman statis di `public/`; controller mengembalikan JSON, bukan template HTML server-side.

```text
project-root/
├── package.json
├── .env.example
├── src/
│   ├── server.js                 # Memuat env dan menjalankan HTTP server
│   ├── app.js                    # Express app, middleware global, route, error handler
│   ├── config/
│   │   └── env.js                # Validasi dan ekspor konfigurasi lingkungan
│   ├── routes/
│   │   └── product.routes.js     # Pemetaan method/path ke controller
│   ├── controllers/
│   │   └── product.controller.js # Layer controller: req/res, status, header Location
│   ├── services/
│   │   └── product.service.js    # Layer bisnis: use case list/detail/create dan ID unik
│   ├── repositories/
│   │   └── product.repository.js # Layer data: membaca/menulis store in-memory
│   ├── models/
│   │   └── product.model.js      # Factory/konstanta model dan normalisasi produk
│   ├── data/
│   │   └── products.seed.js      # Produk awal Molecule 01 + Champaca
│   ├── middleware/
│   │   ├── request-id.js         # Membuat requestId dan header X-Request-Id
│   │   ├── validate-product.js   # Validasi body POST
│   │   ├── validate-product-id.js# Validasi parameter :id
│   │   ├── not-found.js          # 404 route API dalam envelope standar
│   │   └── error-handler.js      # Memetakan error ke envelope standar
│   ├── validators/
│   │   └── product.schema.js     # Skema/aturan validasi reusable
│   ├── errors/
│   │   └── app-error.js          # Error terstruktur: status, code, details
│   └── utils/
│       └── api-response.js       # Builder respons sukses/error dan meta
├── public/
│   ├── index.html
│   ├── script.js
│   ├── styles.css
│   └── assets/
└── tests/
    ├── integration/
    │   └── products.api.test.js
    └── unit/
        ├── product.service.test.js
        └── product.schema.test.js
```

Alur request: **route → middleware → controller → service → repository → service → controller → response builder**. Controller tidak boleh mengakses array store secara langsung; service tidak boleh mengetahui `req` atau `res`; repository tidak boleh menentukan HTTP status. `api-response.js` adalah satu-satunya tempat membangun `data`/`error` dan `meta`, agar format selalu seragam.

## 10. Kebutuhan nonfungsional

- Semua respons `/api/*` adalah JSON dengan status HTTP yang tepat.
- Gunakan `express.json({ limit: "100kb" })` dan tangani parser error sebagai JSON.
- Letakkan middleware error terpusat setelah seluruh route.
- Jangan ekspos stack trace, path internal, atau detail runtime.
- URL gambar hanya path aset aplikasi atau HTTPS.
- Dokumentasikan cara menjalankan server dan contoh cURL/Postman untuk tiga endpoint.
- Jika berbeda origin, aktifkan CORS secara eksplisit hanya untuk origin front end yang diperlukan; default exercise memakai origin sama.

## 11. Acceptance criteria

1. `GET /api/products` menghasilkan `200` dan `data` berupa array produk sesuai skema.
2. `GET /api/products/1` menghasilkan `200` dan data Molecule 01 + Champaca lengkap.
3. ID invalid menghasilkan `400` `INVALID_PRODUCT_ID`; ID yang tidak ada menghasilkan `404` `PRODUCT_NOT_FOUND`.
4. `POST` valid menghasilkan `201`, header `Location`, dan ID unik yang dibuat server.
5. Produk hasil `POST` tersedia di endpoint daftar dan detail selama server berjalan.
6. JSON malformed, body kosong, `id`/field asing, atau nilai field invalid menghasilkan `400`; store tidak berubah.
7. Semua body `POST` melewati middleware validasi sebelum handler.
8. Halaman detail merender nama, harga, foto utama, variasi, batas quantity, dan deskripsi dari API.
9. UI tidak melewati batas quantity; quantity `0` menonaktifkan pembelian simulasi.
10. Kegagalan API/kontrak menampilkan error aman; HTML atau JavaScript dari teks API tidak dieksekusi.
11. Setiap respons sukses dan error mempunyai `meta.requestId`, `meta.timestamp`, serta header `X-Request-Id` dengan nilai request ID yang sama.
12. Route, controller, service, repository, middleware, validator, dan response builder berada pada layer terpisah sesuai struktur direktori; controller tidak mengakses store secara langsung.

## 12. Rencana uji minimum

| Skenario        | Request/kondisi                                        | Hasil                                                 |
| --------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| Daftar          | `GET /api/products`                                    | `200`, `data` array.                                  |
| Detail tersedia | `GET /api/products/1`                                  | `200`, field lengkap.                                 |
| ID invalid      | `GET /api/products/abc`                                | `400`, `INVALID_PRODUCT_ID`.                          |
| ID tidak ada    | `GET /api/products/999`                                | `404`, `PRODUCT_NOT_FOUND`.                           |
| POST valid      | Body Molecule 02                                       | `201`, `Location`, ID unik, data in-memory tersimpan. |
| JSON rusak      | Body JSON malformed                                    | `400`, `INVALID_JSON`.                                |
| Field invalid   | Harga string/negatif, quantity 1000, URL `javascript:` | `400`, `VALIDATION_ERROR`, store tidak berubah.       |
| Field asing     | `id` atau properti tambahan                            | `400`, `VALIDATION_ERROR`.                            |
| Envelope respons | Endpoint sukses maupun error | Envelope konsisten; `meta.requestId` sama dengan header `X-Request-Id`. |
| Quantity UI     | Tambah hingga batas                                    | Tombol tambah nonaktif dan total benar.               |
| Produk habis    | Mock quantity `0`                                      | Kontrol/add-to-bag nonaktif.                          |
| Keamanan render | Mock teks berisi tag HTML                              | Tag menjadi teks, tidak dieksekusi.                   |

## 13. Asumsi dan dependensi

- Node.js, npm, dan Express.js tersedia saat implementasi.
- Data hanya tersimpan di memori dan akan reset saat server restart.
- `assets/molecule-01-champaca-bottle.jpg` tersedia untuk disajikan aplikasi.
- Harga `135` mengikuti tampilan GBP saat ini.
- Endpoint daftar menyiapkan katalog mendatang; scope halaman tetap detail produk ID `1`.
