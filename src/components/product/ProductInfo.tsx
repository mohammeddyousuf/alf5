import { WhatsAppButton } from "@/components/product/WhatsAppButton";
import { OrderDialog } from "@/components/product/OrderDialog";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SaleCountdown } from "./SaleCountdown";

interface ProductInfoProps {
  name: string;
  brand: string | null;
  description: string | null;
  price: number;
  salePrice: number | null;
  productId: string;
  onOrderSubmit: (formData: any) => void;
}

export function ProductInfo({ 
  name, 
  brand,
  description, 
  price, 
  salePrice,
  productId,
  onOrderSubmit 
}: ProductInfoProps) {
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isValidSale = () => {
    if (!settings?.clearance_sale_active || !settings?.clearance_sale_end_date) {
      return true;
    }
    const endDate = new Date(settings.clearance_sale_end_date);
    const now = new Date();
    return endDate > now;
  };

  const showSalePrice = salePrice && isValidSale();

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-3xl font-bold text-foreground">{name}</h1>
      
      {brand && (
        <p className="text-lg text-muted-foreground">{brand}</p>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-4">
          <p className="text-2xl font-bold text-foreground">
            {formatPrice(showSalePrice ? salePrice! : price)}
          </p>
          {showSalePrice && settings?.clearance_sale_end_date && (
            <SaleCountdown 
              endDate={settings.clearance_sale_end_date} 
              className="ml-2"
            />
          )}
        </div>
        {showSalePrice && (
          <p className="text-lg text-muted-foreground line-through">
            {formatPrice(price)}
          </p>
        )}
      </div>

      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}

      <div className="flex justify-center">
        <WhatsAppButton onClick={() => setOrderDialogOpen(true)} />
      </div>

      <OrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        productName={name}
        productBrand={brand}
        productPrice={showSalePrice ? salePrice! : price}
        productId={productId}
        onSubmit={onOrderSubmit}
      />
    </div>
  );
}