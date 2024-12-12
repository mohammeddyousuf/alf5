import { WhatsAppButton } from "@/components/product/WhatsAppButton";
import { OrderDialog } from "@/components/product/OrderDialog";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  const { data: settings, refetch } = useQuery({
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

  useEffect(() => {
    if (settings?.clearance_sale_active && settings?.clearance_sale_end_date) {
      const endTime = new Date(settings.clearance_sale_end_date).getTime();
      const now = new Date().getTime();
      const timeUntilEnd = endTime - now;

      if (timeUntilEnd > 0) {
        const timer = setTimeout(() => {
          refetch();
        }, timeUntilEnd);

        return () => clearTimeout(timer);
      } else {
        refetch();
      }
    }
  }, [settings?.clearance_sale_end_date, settings?.clearance_sale_active, refetch]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDiscount = (originalPrice: number, discountedPrice: number) => {
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  const isValidSale = () => {
    // If there's no global sale settings, show product-specific sale price
    if (!settings?.clearance_sale_active || !settings?.clearance_sale_end_date) {
      return true;
    }
    // If there is a global sale, check if it's still valid
    const endDate = new Date(settings.clearance_sale_end_date);
    const now = new Date();
    return endDate > now;
  };

  const showSalePrice = salePrice && salePrice < price && isValidSale();

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-3xl font-bold text-foreground">{name}</h1>
      
      {brand && (
        <p className="text-lg text-muted-foreground">{brand}</p>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-4">
          <p className={`text-2xl font-bold ${showSalePrice ? 'text-destructive' : 'text-foreground'}`}>
            {formatPrice(showSalePrice ? salePrice! : price)}
          </p>
        </div>
        {showSalePrice && (
          <div className="flex items-center justify-center gap-2">
            <p className="text-lg text-muted-foreground line-through">
              {formatPrice(price)}
            </p>
            <p className="text-destructive">
              ({calculateDiscount(price, salePrice!)}%)
            </p>
          </div>
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