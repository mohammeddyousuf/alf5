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
  topNotes?: string | null;
  heartNotes?: string | null;
  baseNotes?: string | null;
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
  whatsappNumber,
  topNotes,
  heartNotes,
  baseNotes,
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
    console.log("Product WhatsApp Override:", whatsappNumber);
    console.log("Default WhatsApp Number:", settings?.whatsapp_number);
    
    const showForm = settings?.show_order_form !== false;
    
    if (showForm) {
      setOrderDialogOpen(true);
    } else {
      // Skip form, go directly to WhatsApp with product info
      const number = effectiveWhatsAppNumber;
      if (!number) {
        console.error("No WhatsApp number available");
        return;
      }
      let cleanNumber = number.trim().replace(/[^\d+]/g, '').replace(/^\+/, '');
      const message = encodeURIComponent(
        `Hi,\n\nI'm interested in ${name}${brand ? ` by ${brand}` : ''}.\nPrice: ${formatPrice(displayPrice)}\n\nPlease share more details.`
      );
      const url = `https://wa.me/${cleanNumber}?text=${message}`;
      try {
        const newWindow = window.open(url, '_blank');
        if (!newWindow || newWindow.closed) {
          navigator.clipboard.writeText(url).catch(() => {});
        }
      } catch {
        navigator.clipboard.writeText(url).catch(() => {});
      }
    }
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
            {formatPrice(displayPrice)}*
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
        <p className="text-xs text-muted-foreground">
          *Price fluctuates per batch. Please contact for latest price.
        </p>
      </div>

      {(topNotes || heartNotes || baseNotes) && (
        <div className="space-y-2 border-t border-b border-border py-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Scent Profile</p>
          {topNotes && (
            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground min-w-[70px]">Opening</span>
              <span className="text-sm text-foreground">{topNotes}</span>
            </div>
          )}
          {heartNotes && (
            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground min-w-[70px]">Heart</span>
              <span className="text-sm text-foreground">{heartNotes}</span>
            </div>
          )}
          {baseNotes && (
            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground min-w-[70px]">Base</span>
              <span className="text-sm text-foreground">{baseNotes}</span>
            </div>
          )}
        </div>
      )}

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