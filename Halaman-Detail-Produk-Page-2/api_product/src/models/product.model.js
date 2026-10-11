export function toProductResource(row) {
  const variants = row.variants ?? [];
  return {
    id: Number(row.id),
    name: row.name,
    price: Number(row.price),
    currency: row.currency,
    image: row.image,
    variants: {
      colorOrSize: variants.map((variant) => variant.color ?? variant.size).filter(Boolean),
      quantity: variants[0]?.quantity ?? 0,
    },
    description: row.description,
  };
}
