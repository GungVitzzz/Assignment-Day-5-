import { z } from "zod";

const imageSchema = z.string().trim().min(1).max(2048).refine((image) => {
  if (image.startsWith("/assets/")) return true;
  try {
    return new URL(image).protocol === "https:" && Boolean(new URL(image).hostname);
  } catch {
    return false;
  }
}, "Image must be an /assets/ path or HTTPS URL.");

export const productCreateSchema = z.object({
  name: z.string().trim().min(1).max(150),
  price: z.number().finite().positive().max(9999999999.99)
    .refine((value) => value === Math.round(value * 100) / 100, "Price may have at most two decimal places."),
  currency: z.string().regex(/^[A-Z]{3}$/, "Currency must be a 3-letter uppercase code."),
  image: imageSchema,
  variants: z.object({
    colorOrSize: z.array(z.string().trim().min(1).max(80)).min(1).max(20),
    quantity: z.number().int().min(0).max(999),
  }).strict().superRefine((variants, ctx) => {
    if (new Set(variants.colorOrSize).size !== variants.colorOrSize.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["colorOrSize"], message: "Variant values must be unique." });
    }
  }),
  description: z.string().trim().min(1).max(2000),
}).strict();
