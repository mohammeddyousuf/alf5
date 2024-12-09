import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  sale_price: z.coerce.number().min(0, "Sale price must be a positive number").optional().nullable(),
  images: z.array(z.string()).default([]),
  video_urls: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export type ProductFormData = z.infer<typeof productFormSchema>;