import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  sale_price: z.coerce.number().min(0, "Sale price must be a positive number").nullable().optional(),
  images: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  category_id: z.string().nullable().optional(),
  subcategory_id: z.string().nullable().optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;