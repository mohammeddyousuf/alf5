import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/db";
import { SaleCountdown } from "@/components/product/SaleCountdown";
import { MessageCircle, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OrderDialog } from "@/components/product/OrderDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  discountPrice?: number | null;
  imageUrl?: string;
  brand?: string | null;
  customLabel?: string | null;
  priceNote?: string | null;
  stockStatus?: string | null;
}

export const ProductCard = ({ 
  id, 
  name, 
  price, 
  salePrice,
  discountPrice, 
  imageUrl, 
  brand,
  customLabel,
  priceNote,
  stockStatus,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const shortId = id.split('-')[0];
  const productUrl = `/products/${formatUrlSlug(name)}-${shortId}`;

  const isValidSale = () => {
    try {
      if (!settings?.clearance_sale_active) {
        return true;
      }

      if (!settings?.clearance_sale_end_date) {
        return false;
      }

      const endDate = new Date(settings.clearance_sale_end_date);
      const now = new Date();
      return endDate > now;
    } catch (error) {
      console.error("Error in isSaleValid:", error);
      return false;
    }
  };

  const showSalePrice = salePrice && 
    salePrice < price && 
    (!settings?.clearance_sale_active || isValidSale());

  const showDiscountPrice = !showSalePrice && 
    discountPrice && 
    discountPrice < price;

  const showSaleTimer = settings?.clearance_sale_active && 
    settings?.clearance_sale_end_date && 
    isValidSale() && 
    showSalePrice;

  const effectivePrice = showSalePrice ? salePrice : 
                        showDiscountPrice ? discountPrice :
                        price;

  const formatWhatsAppPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = `${window.location.origin}${productUrl}`;
    const websiteName = settings?.website_name || "Our Store";
    const shareData = {
      title: `${name} | ${websiteName}`,
      text: `${name}${brand ? ` by ${brand}` : ''} - Available at ${websiteName}`,
      url: fullUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(fullUrl);
        toast({ title: "Link copied", description: "Product link copied to clipboard." });
      }
    } catch {
      try {
        await navigator.clipboard.writeText(fullUrl);
        toast({ title: "Link copied", description: "Product link copied to clipboard." });
      } catch {
        // Final fallback: use a temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = fullUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        toast({ title: "Link copied", description: "Product link copied to clipboard." });
      }
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const showForm = settings?.show_order_form !== false;
    
    if (showForm) {
      setOrderDialogOpen(true);
    } else {
      const number = settings?.whatsapp_number;
      if (!number) {
        console.error("No WhatsApp number available");
        return;
      }
      let cleanNumber = number.trim().replace(/[^\d+]/g, '').replace(/^\+/, '');
      const message = encodeURIComponent(
        `Hi,\n\nI'm interested in ${name}${brand ? ` by ${brand}` : ''}.\nPrice: ${formatWhatsAppPrice(effectivePrice)}\n\nPlease share more details.`
      );
      const url = `https://wa.me/${cleanNumber}?text=${message}`;
      window.open(url, '_blank');
    }
  };

  const handleOrderSubmit = (data: any) => {
    const { whatsappUrl: generatedUrl, ...formData } = data;
    if (generatedUrl) {
      window.open(generatedUrl, '_blank', 'noopener,noreferrer');
    }
    toast({
      title: "Order Placed",
      description: "You will be redirected to WhatsApp to complete your order.",
    });
    setOrderDialogOpen(false);
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg h-full flex flex-col">
      <Link to={productUrl} className="flex-none">
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
                  <Badge 
                    style={{ 
                      backgroundColor: showSalePrice 
                        ? settings?.sale_color || '#ea384c'
                        : settings?.discount_color || '#ea384c',
                      color: 'white'
                    }}
                  >
                    {showSalePrice ? 'SALE' : 'DISCOUNT'}
                  </Badge>
                </div>
              )}
              {showSaleTimer && settings?.clearance_sale_end_date && (
                <div className="absolute top-2 right-2">
                  <SaleCountdown endDate={settings.clearance_sale_end_date} />
                </div>
              )}
              <button
                onClick={handleShare}
                className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-background transition-colors"
                aria-label="Share product"
              >
                <Share2 className="h-3.5 w-3.5 text-foreground" />
              </button>
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
        <CardContent className="p-4 text-left flex-none">
          <h3 className="font-semibold line-clamp-2 min-h-[2.5rem]">{name}</h3>
          {brand && (
            <p className="text-sm text-muted-foreground mt-1">{brand}</p>
          )}
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex flex-col gap-3 mt-auto">
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
                {formatPrice(effectivePrice)}*
              </span>
            </>
          ) : (
            <span className="text-lg font-semibold">
              {formatPrice(price)}*
            </span>
          )}
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {stockStatus && (
              <>
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${stockStatus === 'in_stock' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-[10px] text-foreground">
                  {stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                </span>
                {(priceNote || settings?.default_price_note) && <span className="text-[10px] text-muted-foreground">·</span>}
              </>
            )}
            {(priceNote || settings?.default_price_note) && (
              <span className="text-[10px] text-muted-foreground">
                *{priceNote || settings?.default_price_note}
              </span>
            )}
          </div>
        </div>
        <Button 
          className="w-full gap-2" 
          variant="default"
          onClick={handleContactClick}
        >
          <MessageCircle className="h-4 w-4" />
          Contact on WhatsApp
        </Button>
      </CardFooter>

      <OrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        productName={name}
        productBrand={brand || null}
        productPrice={effectivePrice}
        productId={id}
        onSubmit={handleOrderSubmit}
        whatsappNumber={settings?.whatsapp_number}
      />
    </Card>
  );
};
