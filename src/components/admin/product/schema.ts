import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  sale_price: z.coerce
    .number()
    .min(0, "Sale price must be a positive number")
    .nullable()
    .optional()
    .refine(
      (sale_price: number | null | undefined): boolean => {
        return true;
      },
      {
        message: "Sale price must be less than regular price",
      }
    )
    .superRefine((sale_price, ctx) => {
      if (sale_price === null || sale_price === undefined) return;

      const formData = ctx.path[0] ? (ctx as any).parent : {};
      const price = formData.price;

      if (typeof price === 'number' && sale_price >= price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sale price must be less than regular price",
        });
      }
    }),
  images: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  category_id: z.string().nullable().optional(),
  subcategory_id: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  brand: z.string().nullable().optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;