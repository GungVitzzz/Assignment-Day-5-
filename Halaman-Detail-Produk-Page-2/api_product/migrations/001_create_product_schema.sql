CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL CHECK (length(trim(name)) > 0),
  price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
  currency CHAR(3) NOT NULL DEFAULT 'GBP' CHECK (currency ~ '^[A-Z]{3}$'),
  description TEXT NOT NULL CHECK (length(trim(description)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL CHECK (image_url LIKE '/assets/%' OR image_url ~ '^https://'),
  alt_text VARCHAR(255),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order SMALLINT NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX product_images_one_primary_per_product ON product_images (product_id) WHERE is_primary;
CREATE INDEX product_images_product_sort_idx ON product_images (product_id, sort_order, id);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type VARCHAR(20) NOT NULL CHECK (variant_type IN ('color', 'size', 'color_size')),
  color VARCHAR(80),
  size VARCHAR(80),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity BETWEEN 0 AND 999),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT product_variants_has_value CHECK (
    (variant_type = 'color' AND length(trim(coalesce(color, ''))) > 0 AND size IS NULL)
    OR (variant_type = 'size' AND length(trim(coalesce(size, ''))) > 0 AND color IS NULL)
    OR (variant_type = 'color_size' AND length(trim(coalesce(color, ''))) > 0 AND length(trim(coalesce(size, ''))) > 0)
  )
);
CREATE INDEX product_variants_product_idx ON product_variants (product_id);
CREATE UNIQUE INDEX product_variants_unique_color_size ON product_variants (product_id, coalesce(color, ''), coalesce(size, ''));
