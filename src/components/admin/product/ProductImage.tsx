import { Badge } from "@/components/ui/badge";
import { SaleCountdown } from "@/components/product/SaleCountdown";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductImageProps {
  images: string[] | null;
  name: string;
  salePrice: number | null;
  price: number;
  showSaleTimer: boolean;
  saleEndDate: string | null;
  customLabel?: string | null;
}

export function ProductImage({ 
  images, 
  name, 
  salePrice, 
  price,
  showSaleTimer,
  saleEndDate,
  customLabel
}: ProductImageProps) {
  const showSaleBadge = salePrice && salePrice < price;

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

  const getImageUrl = (fileName: string) => {
    // If the fileName is already a full URL, return it as is
    if (fileName.startsWith('http')) {
      return fileName;
    }
    // Otherwise, construct the URL using Supabase storage
    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);
    return publicUrl;
  };
  
  return (
    <div className="aspect-square mb-4 overflow-hidden rounded-lg relative">
      {images?.[0] ? (
        <>
          <img
            src={getImageUrl(images[0])}
            alt={name}
            className="h-full w-full object-cover"
          />
          {showSaleBadge && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive">SALE</Badge>
            </div>
          )}
          {showSaleTimer && saleEndDate && (
            <div className="absolute top-2 right-2">
              <SaleCountdown endDate={saleEndDate} />
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
        <div className="h-full w-full bg-muted flex items-center justify-center">
          No image
        </div>
      )}
    </div>
  );
}
