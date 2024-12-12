import { WhatsAppButton } from "@/components/product/WhatsAppButton";
import { OrderDialog } from "@/components/product/OrderDialog";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SaleCountdown } from "@/components/product/SaleCountdown";

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

  // Fetch settings for global sale timer
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

  // Check if sale is still valid
  const isSaleValid = () => {
    if (!settings?.clearance_sale_active || !settings?.clearance_sale_end_date) {
      return false;
    }
    const endDate = new Date(settings.clearance_sale_end_date);
    const now = new Date();
    return endDate > now;
  };

  // Show sale price if it exists, is less than regular price, and either:
  // 1. There's no global sale timer (regular product discount)
  // 2. There's a global sale timer and it hasn't expired
  const showSalePrice = salePrice && 
    salePrice < price && 
    (!settings?.clearance_sale_active || isSaleValid());

  // Only show timer if global sale is active and not expired
  const showSaleTimer = settings?.clearance_sale_active && 
    settings?.clearance_sale_end_date && 
    isSaleValid() && 
    showSalePrice;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{name}</h1>
      
      {brand && (
        <p className="text-lg text-muted-foreground">{brand}</p>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <p className="text-2xl font-bold text-foreground">
            {formatPrice(showSalePrice ? salePrice! : price)}
          </p>
          {showSalePrice && (
            <p className="text-lg text-muted-foreground line-through">
              {formatPrice(price)}
            </p>
          )}
        </div>
        {showSaleTimer && settings?.clearance_sale_end_date && (
          <div>
            <SaleCountdown endDate={settings.clearance_sale_end_date} />
          </div>
        )}
      </div>

      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}

      <WhatsAppButton onClick={() => setOrderDialogOpen(true)} />

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