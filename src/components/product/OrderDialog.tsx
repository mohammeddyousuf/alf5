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
import { useEffect, useState } from "react";

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
  const [ipAddress, setIpAddress] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  
  const form = useForm<OrderFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      address: "",
      paymentMode: "bank_transfer",
      message: "Enquiry",
    },
  });

  useEffect(() => {
    const fetchLocationAndIP = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.error) {
          console.error('Error fetching location:', data.error);
          return;
        }

        const locationStr = `${data.city}${data.region ? `, ${data.region}` : ''}, ${data.country_name}`;
        setLocation(locationStr);
        setIpAddress(data.ip);
        
        const address = `${data.city}${data.region ? `, ${data.region}` : ''}, ${data.country_name}`;
        form.setValue('address', address);
      } catch (error) {
        console.error('Failed to fetch location:', error);
      }
    };

    if (open) {
      fetchLocationAndIP();
    }
  }, [open, form]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (data: OrderFormData) => {
    try {
      const messageText = data.message ? `\nMessage: ${data.message}` : '';
      const whatsappMessage = `*ALFragrance*\n\n*Order Details:*\nProduct: ${productName}\nBrand: ${productBrand}\nPrice: ${formatPrice(productPrice)}\n\n*Customer Details:*\nName: ${data.name}\nEmail: ${data.email}\nMobile: ${data.mobile}\nAddress: ${data.address || ""}\n${data.message ? `Message: ${data.message}\n` : ''}Payment Mode: ${data.paymentMode}\n\nPlease reply back.`;
      
      console.log("WhatsApp message:", whatsappMessage);

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
          customer_address: data.address || "",
          payment_mode: data.paymentMode || "cash",
          message: data.message || "",
          location: location || "",
          ip_address: ipAddress || "",
          source: window.location.href || "",
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
      
      const encodedMessage = encodeURIComponent(whatsappMessage);
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
      
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
            Fill in your details and ensure you keep your WhatsApp open to start a conversation
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
