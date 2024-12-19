import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SaleCountdown } from "@/components/product/SaleCountdown";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  discountPrice?: number | null;
  imageUrl?: string;
  brand?: string | null;
  customLabel?: string | null;
}

export const ProductCard = ({ 
  id, 
  name, 
  price, 
  salePrice,
  discountPrice, 
  imageUrl, 
  brand,
  customLabel 
}: ProductCardProps) => {
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

  const formatUrlSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const getImageUrl = (fileName: string | undefined) => {
    if (!fileName) return '';
    if (fileName.startsWith('http')) {
      return fileName;
    }
    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);
    return publicUrl;
  };

  // Only use the first 8 characters of the UUID
  const shortId = id.split('-')[0];
  const productUrl = `/products/${formatUrlSlug(name)}-${shortId}`;

  const isValidSale = () => {
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
    (!settings?.clearance_sale_active || isValidSale());

  // Only show discount price if there's no sale price active
  const showDiscountPrice = !showSalePrice && 
    discountPrice && 
    discountPrice < price;

  // Only show timer if global sale is active and not expired
  const showSaleTimer = settings?.clearance_sale_active && 
    settings?.clearance_sale_end_date && 
    isValidSale() && 
    showSalePrice;

  const effectivePrice = showSalePrice ? salePrice : 
                        showDiscountPrice ? discountPrice :
                        price;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
      <Link to={productUrl}>
        <div className="aspect-square overflow-hidden relative">
          {imageUrl ? (
            <>
              <img
                src={getImageUrl(imageUrl)}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              {(showSalePrice || showDiscountPrice) && (
                <div className="absolute top-2 left-2">
                  <Badge variant="destructive">
                    {showSalePrice ? 'SALE' : 'DISCOUNT'}
                  </Badge>
                </div>
              )}
              {showSaleTimer && settings?.clearance_sale_end_date && (
                <div className="absolute top-2 right-2">
                  <SaleCountdown endDate={settings.clearance_sale_end_date} />
                </div>
              )}
              {customLabel && (
                <div className="absolute bottom-2 right-2">
                  <Badge 
                    style={{ 
                      backgroundColor: settings?.primary_color || '#9b87f5',
                      color: 'white'
                    }}
                  >
                    {customLabel}
                  </Badge>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>
        <CardContent className="p-4 text-left">
          <h3 className="font-semibold line-clamp-2">{name}</h3>
          {brand && (
            <p className="text-sm text-muted-foreground mt-1">{brand}</p>
          )}
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex flex-col">
          {(showSalePrice || showDiscountPrice) ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(price)}
                </span>
                <span className="text-sm text-destructive">
                  ({calculateDiscount(price, effectivePrice)}%)
                </span>
              </div>
              <span className="text-lg font-bold text-destructive">
                {formatPrice(effectivePrice)}
              </span>
            </>
          ) : (
            <span className="text-lg font-semibold">
              {formatPrice(price)}
            </span>
          )}
        </div>
        <Link to={productUrl} className="w-full">
          <Button className="w-full gap-2" variant="default">
            <MessageCircle className="h-4 w-4" />
            Contact Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};