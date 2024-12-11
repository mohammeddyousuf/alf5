import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  price: z.coerce
    .number()
    .int("Price must be a whole number")
    .min(0, "Price must be a positive number"),
  sale_price: z.coerce
    .number()
    .int("Sale price must be a whole number")
    .min(0, "Sale price must be a positive number")
    .nullable()
    .optional()
    .superRefine((sale_price, ctx) => {
      if (!sale_price) return true;

      const price = (ctx.path[0] === "sale_price" ? ctx.parent : undefined)?.price;
      if (typeof price !== "number") return true;

      if (sale_price >= price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sale price must be less than regular price",
        });
        return false;
      }

      return true;
    }),
  images: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  category_id: z.string().nullable().optional(),
  subcategory_id: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  brand: z.string().nullable().optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;