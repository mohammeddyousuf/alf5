import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  paymentMode: z.enum(["cash", "upi", "bank_transfer"], {
    required_error: "Please select a payment mode",
  }),
});

type OrderFormData = z.infer<typeof formSchema>;

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productBrand: string | null;
  productPrice: number;
  productId: string;
  onSubmit: (data: OrderFormData) => void;
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
      paymentMode: undefined,
    },
  });

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
          customer_address: data.address,
          payment_mode: data.paymentMode,
        })
        .single();

      if (error) {
        console.error("Error saving order:", error);
        let errorMessage = "Failed to save order. Please try again.";
        
        // Handle specific error cases
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
      
      // Call the original onSubmit to handle WhatsApp redirection
      onSubmit(data);
      
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
            Fill in your details to place the order
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 space-y-1">
          <p className="text-sm font-medium text-foreground">Product: {productName}</p>
          {productBrand && (
            <p className="text-sm text-muted-foreground">Brand: {productBrand}</p>
          )}
          <p className="text-sm font-medium text-foreground">Price: ${productPrice}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background text-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} className="bg-background text-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Mobile</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} className="bg-background text-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-background text-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Payment Mode</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background text-foreground">
                        <SelectValue placeholder="Select payment mode" className="text-foreground" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash" className="bg-background text-foreground hover:bg-accent hover:text-white">Cash</SelectItem>
                      <SelectItem value="upi" className="bg-background text-foreground hover:bg-accent hover:text-white">UPI</SelectItem>
                      <SelectItem value="bank_transfer" className="bg-background text-foreground hover:bg-accent hover:text-white">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Contact on WhatsApp
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}