import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductPriceProps {
  price: number;
  discountPrice: number | null;
  salePrice: number | null;
}

export function ProductPrice({ price, discountPrice, salePrice }: ProductPriceProps) {
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

  const calculateDiscount = (originalPrice: number, discountedPrice: number) => {
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  // First check for sale price, then discount price
  const effectivePrice = salePrice && salePrice < price ? salePrice : 
                        discountPrice && discountPrice < price ? discountPrice : 
                        price;
  
  const showDiscountedPrice = (salePrice && salePrice < price) || (discountPrice && discountPrice < price);
  const showSalePrice = salePrice && salePrice < price;

  const priceColor = showSalePrice 
    ? settings?.sale_color || '#ea384c'
    : settings?.discount_color || '#ea384c';

  return (
    <p className="text-sm text-muted-foreground mb-4">
      {showDiscountedPrice ? (
        <>
          <span style={{ color: priceColor, fontWeight: 600 }}>
            {formatPrice(effectivePrice)}
          </span>
          <span className="ml-2 line-through">
            {formatPrice(price)}
          </span>
          <span style={{ color: priceColor, marginLeft: '0.5rem' }}>
            ({calculateDiscount(price, effectivePrice)}%)
          </span>
        </>
      ) : (
        formatPrice(price)
      )}
    </p>
  );
}