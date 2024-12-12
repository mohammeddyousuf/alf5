import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FormFields } from "./order-dialog/FormFields";
import { ProductInfo } from "./order-dialog/ProductInfo";
import { formSchema, type OrderFormData, type ExtendedOrderFormData } from "./order-dialog/types";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productBrand: string | null;
  productPrice: number;
  productId: string;
  onSubmit: (data: ExtendedOrderFormData) => void;
}

export function OrderDialog({
  open,
  onOpenChange,
  productName,
  productBrand,
  productPrice,
  productId,
  onSubmit,
}: OrderDialogProps) {
  const { toast } = useToast();
  const form = useForm<OrderFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      address: "",
      paymentMode: "cash", // Set default value to "cash"
    },
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (data: OrderFormData) => {
    try {
      console.log("Attempting to save order:", {
        product_id: productId,
        product_name: productName,
        product_brand: productBrand,
        product_price: productPrice,
        ...data
      });

      const { error } = await supabase
        .from("orders")
        .insert({
          product_id: productId,
          product_name: productName,
          product_brand: productBrand,
          product_price: productPrice,
          customer_name: data.name,
          customer_email: data.email,
          customer_mobile: data.mobile,
          customer_address: data.address || "", // Ensure empty string if undefined
          payment_mode: data.paymentMode || "cash", // Ensure default value if undefined
        })
        .single();

      if (error) {
        console.error("Error saving order:", error);
        let errorMessage = "Failed to save order. Please try again.";
        
        if (error.code === '42501') {
          errorMessage = "Authorization error. Please try again or contact support.";
        }
        
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
        return;
      }

      console.log("Order saved successfully");
      
      onSubmit({
        ...data,
        productName,
        productBrand,
        productPrice: formatPrice(productPrice)
      });
      
      toast({
        title: "Order Saved",
        description: "Your order has been saved successfully",
      });
    } catch (error) {
      console.error("Failed to save order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save order. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Contact on WhatsApp</DialogTitle>
          <DialogDescription>
            Fill in your details
          </DialogDescription>
        </DialogHeader>

        <ProductInfo
          productName={productName}
          productBrand={productBrand}
          productPrice={productPrice}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormFields form={form} />
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Contact on WhatsApp
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}