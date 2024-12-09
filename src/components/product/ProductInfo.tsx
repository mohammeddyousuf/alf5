import { WhatsAppButton } from "@/components/product/WhatsAppButton";
import { OrderDialog } from "@/components/product/OrderDialog";
import { useState } from "react";
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

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol'
    }).format(amount).replace('$', settings?.currency_symbol || '$');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{name}</h1>
      
      {brand && (
        <p className="text-lg text-muted-foreground">{brand}</p>
      )}
      
      <div className="space-y-2">
        <p className="text-2xl font-bold text-foreground">
          {formatPrice(salePrice || price)}
        </p>
        {salePrice && (
          <p className="text-lg text-muted-foreground line-through">
            {formatPrice(price)}
          </p>
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
        productPrice={salePrice || price}
        productId={productId}
        onSubmit={onOrderSubmit}
      />
    </div>
  );
}