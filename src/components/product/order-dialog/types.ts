import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  address: z.string().optional(),
  paymentMode: z.enum(["cash", "upi", "bank_transfer"]).optional(),
  message: z.string().optional(),
});

export type OrderFormData = z.infer<typeof formSchema>;

export interface ExtendedOrderFormData extends OrderFormData {
  productName: string;
  productBrand?: string | null;
  productPrice: string;
}