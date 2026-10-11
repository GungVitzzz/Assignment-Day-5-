WITH new_product AS (
  INSERT INTO products (name, price, currency, description)
  SELECT 'Molecule 01 + Champaca', 135.00, 'GBP', 'Molecule 01 + Champaca memadukan Iso E Super yang hangat, woody, dan velvety dengan champaca yang kaya, floral, serta lembut.'
  WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Molecule 01 + Champaca')
  RETURNING id
), product_ref AS (
  SELECT id FROM new_product
  UNION ALL
  SELECT id FROM products WHERE name = 'Molecule 01 + Champaca' LIMIT 1
)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, '/assets/molecule-01-champaca-bottle.jpg', 'Botol parfum Molecule 01 + Champaca 100 ml', TRUE, 0
FROM product_ref
WHERE NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = product_ref.id);

INSERT INTO product_variants (product_id, variant_type, size, stock_quantity)
SELECT id, 'size', '100 ml', 10
FROM products
WHERE name = 'Molecule 01 + Champaca'
  AND NOT EXISTS (SELECT 1 FROM product_variants WHERE product_id = products.id AND size = '100 ml');
