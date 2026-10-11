# Architecture — Product API dengan Node.js dan PostgreSQL

## Ringkasan

Arsitektur ini mendefinisikan REST API produk untuk halaman detail produk menggunakan **Node.js + Express.js** dan **PostgreSQL**. Desain memakai layered MVC agar transport HTTP, logika bisnis, dan akses database terpisah dan mudah diuji.

Data minimum produk yang didukung:

1. nama produk;
2. harga produk;
3. foto produk;
4. variasi produk: warna/ukuran dan jumlah/quantity;
5. deskripsi.

## Keputusan Teknologi

| Area | Pilihan |
| --- | --- |
| Runtime | Node.js LTS |
| HTTP framework | Express.js |
| Database | PostgreSQL 16+ |
| Driver database | `pg` (`node-postgres`) dengan connection pool |
| Validasi request | Zod atau validator ekuivalen di middleware |
| Migrasi | `node-pg-migrate`, Knex migration, atau tool migrasi SQL setara |
| Pengujian | Vitest/Jest + Supertest; PostgreSQL database terpisah untuk test |
| Dokumentasi API | OpenAPI 3.1 dengan `swagger-jsdoc` dan `swagger-ui-express` |

**Keputusan utama:** Express dipilih untuk menjaga exercise tetap sederhana; `pg` dipilih agar SQL, transaksi, dan connection pool PostgreSQL terlihat eksplisit. OpenAPI 3.1 menjadi kontrak dokumentasi yang dapat dibuka manusia melalui Swagger UI sekaligus dipakai untuk validasi/generasi client di masa depan.

## Swagger backend dan dokumentasi OpenAPI

Dokumentasi interaktif tersedia pada `GET /api-docs`; spesifikasi mentah tersedia pada `GET /openapi.json`. Dokumentasi harus berasal dari satu sumber OpenAPI 3.1 yang sama dengan implementasi endpoint, disimpan di `src/docs/openapi.js` atau dipecah ke file YAML dalam `src/docs/`.

Tambahkan dependensi:

```bash
npm install swagger-jsdoc swagger-ui-express
```

Pemasangan minimal pada `src/app.js`:

```js
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { openapiDefinition } from "./docs/openapi.js";

const openapi = swaggerJsdoc({
  definition: openapiDefinition,
  apis: ["./src/routes/*.js", "./src/docs/*.js"],
});

app.get("/openapi.json", (_req, res) => res.json(openapi));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi));
```

Spesifikasi minimum harus mendokumentasikan `GET /api/products`, `GET /api/products/{id}`, dan `POST /api/products`, parameter `id`, skema request pembuatan produk, respons `200`, `201`, `400`, `404`, `500`, envelope `data`/`error`, serta header `X-Request-Id`. Gunakan `components.schemas` untuk `Product`, `ProductVariant`, `ProductCreateInput`, `ApiMeta`, dan `ApiError`; jangan menduplikasi skema inline di setiap operasi.

```js
export const openapiDefinition = {
  openapi: "3.1.0",
  info: { title: "Product API", version: "1.0.0" },
  servers: [{ url: "http://localhost:3000" }],
  paths: {
    "/api/products": {
      get: { summary: "List products", responses: { 200: { description: "OK" } } },
      post: { summary: "Create product", responses: { 201: { description: "Created" } } }
    },
    "/api/products/{id}": {
      get: { summary: "Get product detail", responses: { 200: { description: "OK" }, 404: { description: "Not found" } } }
    }
  }
};
```

Swagger UI hanya untuk development/internal environment atau wajib dilindungi autentikasi di production. Tambahkan pemeriksaan test/CI agar `/openapi.json` valid terhadap OpenAPI 3.1 dan seluruh path yang didokumentasikan benar-benar terdaftar.

## Diagram Arsitektur

```text
Browser / Postman / Swagger UI
             │ HTTP + JSON
             ▼
Express app ── request-id, JSON parser, validator, error handler
             ▼
Routes → Controller → Service → Repository → pg Pool → PostgreSQL
                                      │
                                      └→ api-response (data/error + meta)
```

## Struktur aplikasi — Layered MVC

```text
project-root/
├── package.json
├── .env.example
├── migrations/
│   └── 001_create_product_schema.sql
├── src/
│   ├── server.js                  # Bootstrap server dan graceful shutdown pool
│   ├── app.js                     # Express app, middleware umum, pemasangan route
│   ├── config/
│   │   └── database.js            # Membuat dan mengekspor pg Pool
│   ├── docs/
│   │   └── openapi.js              # Definisi OpenAPI 3.1 untuk Swagger
│   ├── routes/
│   │   └── product.routes.js      # Definisi endpoint dan urutan middleware
│   ├── controllers/
│   │   └── product.controller.js  # Terjemahkan HTTP req/res ↔ use case
│   ├── services/
│   │   └── product.service.js     # Aturan bisnis dan transaksi
│   ├── repositories/
│   │   └── product.repository.js  # Seluruh query SQL berparameter
│   ├── models/
│   │   └── product.model.js       # Mapper row PostgreSQL → resource API
│   ├── validators/
│   │   └── product.schema.js      # Skema input POST/PATCH bila kelak diperlukan
│   ├── middleware/
│   │   ├── request-id.js
│   │   ├── validate-body.js
│   │   ├── not-found.js
│   │   └── error-handler.js
│   ├── errors/
│   │   └── app-error.js
│   └── utils/
│       └── api-response.js        # Envelope data/error + meta requestId/timestamp
├── tests/
│   ├── integration/
│   └── unit/
└── public/                        # index.html, script.js, styles.css, assets
```

Alur request:

```text
Client → Route → Middleware → Controller → Service → Repository → PostgreSQL
                                                               ↓
Client ← Response builder ← Controller ← Service ← Repository ← Row data
```

Tanggung jawab layer:

- **Route** memilih controller dan middleware; tidak memuat aturan bisnis.
- **Controller** membaca input HTTP, menetapkan status/header, lalu memanggil service.
- **Service** menjalankan use case, aturan bisnis, dan transaksi lintas repository.
- **Repository** menjalankan query SQL berparameter saja; tidak mengetahui `req`/`res` atau status HTTP.
- **Model/mapper** mengubah nama kolom `snake_case` database ke format `camelCase` resource API.
- **Middleware** memvalidasi request, memberikan request ID, dan memetakan error.

## Model Data

Model ini memisahkan entitas produk, foto, dan variasi. Pemisahan tersebut memungkinkan satu produk memiliki banyak gambar serta stok berbeda per warna/ukuran.

## Relasi

```text
products 1 ─────< product_images
products 1 ─────< product_variants
```

- Satu produk mempunyai satu atau lebih foto. Tepat satu foto dapat ditandai sebagai foto utama.
- Satu produk mempunyai satu atau lebih variasi. Variasi dapat berupa `color`, `size`, atau `color_size`.
- `stock_quantity` berada pada variasi karena ketersediaan dapat berbeda untuk setiap warna/ukuran.
- `product_images.product_id` dan `product_variants.product_id` adalah foreign key ke `products.id`; penghapusan produk secara internal menghapus data turunannya melalui `ON DELETE CASCADE`.

## Tabel Product

| Kolom | Tipe PostgreSQL | Aturan | Tujuan |
| --- | --- | --- | --- |
| `id` | `UUID` | PK, otomatis | Identitas produk. |
| `name` | `VARCHAR(150)` | tidak kosong | Nama produk. |
| `price` | `NUMERIC(12,2)` | > 0 | Harga presisi. |
| `currency` | `CHAR(3)` | ISO uppercase | Mata uang harga. |
| `description` | `TEXT` | tidak kosong | Deskripsi produk. |
| `created_at` | `TIMESTAMPTZ` | otomatis | Audit waktu dibuat. |
| `updated_at` | `TIMESTAMPTZ` | otomatis/diperbarui service | Audit waktu diubah. |

Foto produk berada pada tabel `product_images`, bukan kolom `products`, agar galeri dapat mendukung banyak foto. Foto dengan `is_primary = true` adalah foto produk yang dikirim di daftar produk.

## Tabel product_variants

| Kolom | Tipe PostgreSQL | Aturan | Tujuan |
| --- | --- | --- | --- |
| `id` | `UUID` | PK, otomatis | Identitas variasi. |
| `product_id` | `UUID` | FK `products.id` | Pemilik variasi. |
| `variant_type` | `VARCHAR(20)` | `color`, `size`, atau `color_size` | Bentuk variasi. |
| `color` | `VARCHAR(80)` | wajib untuk color/color_size | Nilai warna. |
| `size` | `VARCHAR(80)` | wajib untuk size/color_size | Nilai ukuran. |
| `stock_quantity` | `INTEGER` | 0–999 | Jumlah stok pilihan tersebut. |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | audit | Waktu perubahan data. |

## Schema SQL Awal

Gunakan semua nominal uang sebagai `NUMERIC(12,2)`, bukan `FLOAT`, agar presisi harga tetap terjaga. Harga disimpan dalam unit mata uang utama (contoh `135.00 GBP`). Bila sistem nanti membutuhkan multi-mata-uang atau perhitungan finansial yang lebih kompleks, pertimbangkan menyimpan nilai minor unit sebagai integer.

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
  currency CHAR(3) NOT NULL DEFAULT 'GBP'
    CHECK (currency ~ '^[A-Z]{3}$'),
  description TEXT NOT NULL CHECK (length(trim(description)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT products_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order SMALLINT NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT product_images_url_valid CHECK (
    image_url LIKE '/assets/%' OR image_url ~ '^https://'
  )
);

CREATE UNIQUE INDEX product_images_one_primary_per_product
  ON product_images (product_id)
  WHERE is_primary;

CREATE INDEX product_images_product_sort_idx
  ON product_images (product_id, sort_order, id);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type VARCHAR(20) NOT NULL
    CHECK (variant_type IN ('color', 'size', 'color_size')),
  color VARCHAR(80),
  size VARCHAR(80),
  stock_quantity INTEGER NOT NULL DEFAULT 0
    CHECK (stock_quantity >= 0 AND stock_quantity <= 999),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT product_variants_has_value CHECK (
    (variant_type = 'color' AND length(trim(coalesce(color, ''))) > 0 AND size IS NULL)
    OR (variant_type = 'size' AND length(trim(coalesce(size, ''))) > 0 AND color IS NULL)
    OR (variant_type = 'color_size'
        AND length(trim(coalesce(color, ''))) > 0
        AND length(trim(coalesce(size, ''))) > 0)
  )
);

CREATE INDEX product_variants_product_idx
  ON product_variants (product_id);

CREATE UNIQUE INDEX product_variants_unique_color_size
  ON product_variants (
    product_id,
    coalesce(color, ''),
    coalesce(size, '')
  );
```

`product_images.image_url` memenuhi kebutuhan **foto produk**. `product_variants.color`, `product_variants.size`, dan `stock_quantity` memenuhi kebutuhan **warna/ukuran** serta **quantity**. Untuk produk hanya berukuran `100 ml`, buat satu baris variasi dengan `variant_type = 'size'`, `size = '100 ml'`, dan `stock_quantity = 10`.

## Aturan validasi dan pertahanan data

- Service `createProduct` harus membuat `products`, minimal satu `product_images`, dan minimal satu `product_variants` dalam satu transaksi (`BEGIN`/`COMMIT`/`ROLLBACK`).
- Service harus memastikan tepat satu foto utama. Bila client tidak menetapkan foto utama, foto pertama menjadi utama.
- Foto hanya menerima path `/assets/...` atau URL `https://`; `data:` dan `javascript:` ditolak di validator sebelum query berjalan.
- Semua string dibersihkan dengan `trim()` dan seluruh SQL menggunakan parameter `$1`, `$2`, dan seterusnya—jangan membangun query lewat interpolasi string.
- `updated_at` diperbarui oleh service saat produk/variasi diubah; trigger database dapat ditambahkan jika endpoint pembaruan kelak dibuat.
- Hindari hard delete dalam endpoint publik. `ON DELETE CASCADE` hanya menangani pembersihan konsisten jika admin/internal tool menghapus produk.
- Batasi body JSON, misalnya `express.json({ limit: "100kb" })`, untuk mengurangi risiko payload berlebihan.
- Validasi `Content-Type: application/json` pada endpoint tulis dan tolak JSON malformed sebagai `400 INVALID_JSON`.
- Validasi nama/deskripsi panjang maksimum, harga finite dan positif, format currency, URL foto HTTPS/path aset, serta setiap variasi sebelum membuka transaksi.
- Terapkan allow-list field request; tolak `id`, kolom audit, dan field tak dikenal agar client tidak dapat melakukan mass assignment.
- Gunakan role database least-privilege, connection TLS di production, query berparameter, dan batas connection pool.
- Kirim error umum kepada client; stack trace, kredensial, dan detail query hanya dicatat dengan request ID di server log.

## Pemetaan database response

Repository dapat mengambil data melalui `JOIN` atau dua query terukur. Mapper mengubah row `snake_case` menjadi resource `camelCase` berikut:

```json
{
  "id": "c34625da-6f5c-4783-9fb4-c85c2a6fce6a",
  "name": "Molecule 01 + Champaca",
  "price": 135,
  "currency": "GBP",
  "image": {
    "url": "/assets/molecule-01-champaca-bottle.jpg",
    "alt": "Botol parfum Molecule 01 + Champaca 100 ml"
  },
  "variants": [
    {
      "id": "152319fe-8d6b-4b5e-aeb3-bd29e5d43a5a",
      "type": "size",
      "color": null,
      "size": "100 ml",
      "quantity": 10
    }
  ],
  "description": "Molecule 01 + Champaca memadukan Iso E Super dengan champaca."
}
```

Untuk kompatibilitas sementara dengan UI exercise yang membutuhkan `variants.colorOrSize` dan `variants.quantity`, controller dapat membentuk adapter dari variasi pertama. API baru sebaiknya memakai array `variants` di atas agar multi-variasi dapat didukung tanpa perubahan kontrak lagi.

| Sumber database | Field respons | Aturan pemetaan |
| --- | --- | --- |
| `products.id` | `id` | UUID dikirim sebagai string. |
| `products.name` | `name` | Teks yang sudah tervalidasi. |
| `products.price` + `currency` | `price`, `currency` | Konversi `NUMERIC` aman ke number/string sesuai kontrak API; jangan gunakan float untuk perhitungan di SQL. |
| `product_images` dengan `is_primary = true` | `image` | Daftar mengirim foto utama; detail dapat mengirim galeri tambahan. |
| `product_variants` | `variants[]` | Setiap row menjadi objek warna/ukuran/quantity. |
| `products.description` | `description` | Selalu teks biasa; front end memakai `textContent`. |

## Alur setiap operasi

| Endpoint | Service | Akses data |
| --- | --- | --- |
| `GET /api/products` | `listProducts()` | Produk + foto utama + ringkasan variasi. |
| `GET /api/products/:id` | `getProductById(id)` | Produk, seluruh foto, dan seluruh variasi. |
| `POST /api/products` | `createProduct(input)` | Transaksi insert produk → foto → variasi. |

Setiap respons mengikuti envelope yang ditentukan di PRD:

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-10-09T00:00:00.000Z"
  }
}
```

Kesalahan mengikuti envelope `error` yang sama, dengan status HTTP sebagai sumber kebenaran.

### GET `/api/products`

1. Route menjalankan middleware request ID.
2. Controller memanggil `productService.listProducts()`.
3. Repository mengambil produk dan foto utama dengan query berparameter.
4. Mapper membentuk resource ringkas; controller mengirim `200` dalam envelope `data` dan `meta`.

### GET `/api/products/:id`

1. Middleware memvalidasi UUID `id`; nilai invalid menghasilkan `400`.
2. Service meminta detail produk ke repository.
3. Repository mengambil produk, foto, serta variasi; bila produk tidak ada service melempar `PRODUCT_NOT_FOUND`.
4. Error handler mengirim `404` atau controller mengirim `200` dengan resource lengkap.

### POST `/api/products`

1. JSON parser, request ID, dan validator memeriksa body sebelum controller dijalankan.
2. Controller meneruskan input valid ke `productService.createProduct()`.
3. Service membuka transaksi, membuat `products`, `product_images`, dan `product_variants`.
4. Jika semua insert sukses, service melakukan `COMMIT`, mapper membentuk resource, controller mengirim `201` dan header `Location`.
5. Jika satu langkah gagal, service melakukan `ROLLBACK`; error handler mengirim envelope error tanpa data parsial.

## Konfigurasi dan keamanan

`.env` tidak dikomit. Sediakan `.env.example`:

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://app_user:change-me@localhost:5432/product_api
DATABASE_SSL=false
```

- Gunakan role PostgreSQL khusus aplikasi dengan hak minimum pada schema aplikasi; jangan gunakan superuser.
- Gunakan TLS/`ssl` saat database berada di jaringan nonlokal atau production.
- Connection pool dibatasi melalui `max`, `idleTimeoutMillis`, dan `connectionTimeoutMillis` sesuai kapasitas deployment.
- Tutup pool (`pool.end()`) ketika server menerima `SIGTERM` atau `SIGINT`.
- Jangan memasukkan kredensial, stack trace, atau query SQL mentah ke respons API.

## Seed minimum

```sql
INSERT INTO products (name, price, currency, description)
VALUES (
  'Molecule 01 + Champaca',
  135.00,
  'GBP',
  'Molecule 01 + Champaca memadukan Iso E Super yang hangat dengan champaca yang kaya dan floral.'
)
RETURNING id;
```

Gunakan UUID hasil `RETURNING id` untuk memasukkan satu foto utama dan satu variasi `size` dengan quantity `10` dalam transaksi seed yang sama.
