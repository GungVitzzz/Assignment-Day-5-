ALTER TABLE products
  ADD COLUMN public_id BIGINT GENERATED ALWAYS AS IDENTITY;

ALTER TABLE products
  ADD CONSTRAINT products_public_id_unique UNIQUE (public_id);
