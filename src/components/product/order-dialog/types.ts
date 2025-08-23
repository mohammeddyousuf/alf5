import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  address: z.string().optional(),
  paymentMode: z.enum(["upi", "bank_transfer", "cash"]).default("upi"),
  howDidYouKnow: z.string().optional(),
  comments: z.string().optional(),
});

export type OrderFormData = z.infer<typeof formSchema>;

export interface ExtendedOrderFormData extends OrderFormData {
  productName: string;
  productBrand: string | null;
  productPrice: string;
  whatsappUrl?: string;
}