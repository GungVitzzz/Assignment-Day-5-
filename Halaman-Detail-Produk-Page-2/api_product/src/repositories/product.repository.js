import { pool } from "../config/database.js";

const productQuery = `
  SELECT p.public_id AS id, p.name, p.price, p.currency, p.description,
    COALESCE(
      (SELECT i.image_url FROM product_images i WHERE i.product_id = p.id AND i.is_primary ORDER BY i.sort_order, i.id LIMIT 1),
      (SELECT i.image_url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order, i.id LIMIT 1)
    ) AS image,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('color', v.color, 'size', v.size, 'quantity', v.stock_quantity) ORDER BY v.created_at, v.id)
      FROM product_variants v WHERE v.product_id = p.id), '[]'::jsonb) AS variants
  FROM products p`;

export const productRepository = {
  async list() {
    const { rows } = await pool.query(`${productQuery} ORDER BY p.public_id`);
    return rows;
  },
  async findById(id) {
    const { rows } = await pool.query(`${productQuery} WHERE p.public_id = $1`, [id]);
    return rows[0] ?? null;
  },
  async create(input) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        "INSERT INTO products (name, price, currency, description) VALUES ($1, $2, $3, $4) RETURNING public_id",
        [input.name, input.price, input.currency, input.description],
      );
      const productId = rows[0].public_id;
      await client.query(
        "INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES ((SELECT id FROM products WHERE public_id = $1), $2, TRUE, 0)",
        [productId, input.image],
      );
      for (const variant of input.variants) {
        await client.query(
          "INSERT INTO product_variants (product_id, variant_type, size, stock_quantity) VALUES ((SELECT id FROM products WHERE public_id = $1), 'size', $2, $3)",
          [productId, variant.size, variant.quantity],
        );
      }
      await client.query("COMMIT");
      return productId;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};
