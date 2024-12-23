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
  discountPrice: number | null;
  productId: string;
  onOrderSubmit: (formData: any) => void;
  whatsappNumber?: string | null;
}

export function ProductInfo({ 
  name, 
  brand,
  description, 
  price, 
  salePrice,
  discountPrice,
  productId,
  onOrderSubmit,
  whatsappNumber
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
    if (!settings?.clearance_sale_active || !settings?.clearance_sale_end_date) {
      return false;
    }
    const endDate = new Date(settings.clearance_sale_end_date);
    const now = new Date();
    return endDate > now;
  };

  const showSalePrice = salePrice && 
    salePrice < price && 
    (!settings?.clearance_sale_active || isValidSale());

  const showDiscountPrice = !showSalePrice && 
    discountPrice && 
    discountPrice < price;

  const handleWhatsAppClick = () => {
    // Log both numbers to debug
    console.log("Product WhatsApp Override:", whatsappNumber);
    console.log("Default WhatsApp Number:", settings?.whatsapp_number);
    setOrderDialogOpen(true);
  };

  const handleOrderSubmit = (data: any) => {
    const { whatsappUrl: generatedUrl, ...formData } = data;
    if (generatedUrl) {
      window.open(generatedUrl, '_blank', 'noopener,noreferrer');
    }
    onOrderSubmit(formData);
    setOrderDialogOpen(false);
  };

  const displayPrice = showSalePrice ? salePrice! : 
                      showDiscountPrice ? discountPrice! : 
                      price;

  // Prioritize product override number
  const effectiveWhatsAppNumber = whatsappNumber || settings?.whatsapp_number;
  console.log("Effective WhatsApp number being used:", effectiveWhatsAppNumber);

  return (
    <div className="space-y-6 text-left">
      <h1 className="text-3xl font-bold text-foreground text-center">{name}</h1>
      
      {brand && (
        <p className="text-lg text-muted-foreground text-center">{brand}</p>
      )}
      
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-4">
          <p className={`text-2xl font-bold ${(showSalePrice || showDiscountPrice) ? 'text-destructive' : 'text-foreground'}`}>
            {formatPrice(displayPrice)}
          </p>
        </div>
        {(showSalePrice || showDiscountPrice) && (
          <div className="flex items-center justify-center gap-2">
            <p className="text-lg text-muted-foreground line-through">
              {formatPrice(price)}
            </p>
            <p className="text-destructive">
              ({calculateDiscount(price, displayPrice)}%)
            </p>
          </div>
        )}
      </div>

      {description && (
        <p className="text-muted-foreground text-left">{description}</p>
      )}

      <div className="flex justify-center">
        <WhatsAppButton 
          onClick={handleWhatsAppClick} 
          whatsappUrl={undefined}
        />
      </div>

      <OrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        productName={name}
        productBrand={brand}
        productPrice={displayPrice}
        productId={productId}
        onSubmit={handleOrderSubmit}
        whatsappNumber={effectiveWhatsAppNumber}
      />
    </div>
  );
}