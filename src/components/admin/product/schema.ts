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
    .refine(
      (sale_price) => {
        if (!sale_price) return true;
        return true;
      },
      {
        message: "Sale price must be less than regular price"
      }
    ),
  discount_price: z.coerce
    .number()
    .int("Discount price must be a whole number")
    .min(0, "Discount price must be a positive number")
    .nullable()
    .optional(),
  images: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  stock_status: z.enum(["in_stock", "out_of_stock"]).default("in_stock"),
  price_note: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  subcategory_id: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  brand: z.string().nullable().optional(),
  custom_label: z.string().nullable().optional(),
  whatsapp_number: z.string().nullable().optional(),
  top_notes: z.string().nullable().optional(),
  heart_notes: z.string().nullable().optional(),
  base_notes: z.string().nullable().optional(),
  gender_profile: z.string().nullable().optional(),
  occasion: z.string().nullable().optional(),
  scent_family: z.string().nullable().optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
