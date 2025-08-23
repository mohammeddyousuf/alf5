import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formSchema, type OrderFormData, type ExtendedOrderFormData } from "./order-dialog/types";
import { DialogHeader } from "./order-dialog/DialogHeader";
import { ProductInfo } from "./order-dialog/ProductInfo";
import { CustomerForm } from "./order-dialog/CustomerForm";
import { useOrderSubmission } from "./order-dialog/useOrderSubmission";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productBrand: string | null;
  productPrice: number;
  productId: string;
  onSubmit: (data: ExtendedOrderFormData) => void;
  whatsappNumber?: string | null;
}

export function OrderDialog({
  open,
  onOpenChange,
  productName,
  productBrand,
  productPrice,
  productId,
  onSubmit,
  whatsappNumber,
}: OrderDialogProps) {
  const form = useForm<OrderFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      address: "",
      paymentMode: "upi",
      howDidYouKnow: "",
      comments: "",
    },
  });

  console.log("OrderDialog - Using WhatsApp number:", whatsappNumber);

  const { handleSubmit } = useOrderSubmission({
    productId,
    productName,
    productBrand,
    productPrice,
    onSubmit: async (data) => {
      console.log("OrderDialog - Submitting with WhatsApp number:", whatsappNumber);
      if (data.whatsappUrl) {
        // First submit the form data
        onSubmit(data);
        
        // Then close dialog
        onOpenChange(false);
        
        // Try to open WhatsApp with error handling
        try {
          const newWindow = window.open(data.whatsappUrl, '_blank');
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            // Fallback: copy URL to clipboard and show message
            navigator.clipboard.writeText(data.whatsappUrl).then(() => {
              alert('WhatsApp could not be opened automatically. The WhatsApp link has been copied to your clipboard. Please paste it in your browser to continue with your order.');
            }).catch(() => {
              // If clipboard fails, show the URL
              alert(`WhatsApp could not be opened automatically. Please copy this link and paste it in your browser: ${data.whatsappUrl}`);
            });
          }
        } catch (error) {
          console.error('Error opening WhatsApp:', error);
          // Fallback: copy URL to clipboard and show message
          navigator.clipboard.writeText(data.whatsappUrl).then(() => {
            alert('WhatsApp could not be opened automatically. The WhatsApp link has been copied to your clipboard. Please paste it in your browser to continue with your order.');
          }).catch(() => {
            // If clipboard fails, show the URL
            alert(`WhatsApp could not be opened automatically. Please copy this link and paste it in your browser: ${data.whatsappUrl}`);
          });
        }
      } else {
        onOpenChange(false);
        onSubmit(data);
      }
    },
    whatsappNumber,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader />
        <ProductInfo
          productName={productName}
          productBrand={productBrand}
          productPrice={productPrice}
        />
        <CustomerForm 
          form={form} 
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}