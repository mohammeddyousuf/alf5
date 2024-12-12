import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  address: z.string().optional(),
  paymentMode: z.enum(["bank_transfer", "cash_on_delivery"]).default("bank_transfer"),
  comments: z.string().optional(),
});

export type OrderFormData = z.infer<typeof formSchema>;

export interface ExtendedOrderFormData extends OrderFormData {
  productName: string;
  productBrand: string | null;
  productPrice: string;
  whatsappUrl?: string;
}