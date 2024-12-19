import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductMediaProps {
  images: string[] | null;
  videoUrls?: string[];
  productName: string;
  getYouTubeVideoId: (url: string) => string | null;
  salePrice: number | null;
  discountPrice: number | null;
  price: number;
  customLabel?: string | null;
}

export const ProductMedia = ({
  images,
  videoUrls,
  productName,
  getYouTubeVideoId,
  salePrice,
  discountPrice,
  price,
  customLabel
}: ProductMediaProps) => {
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

  const isValidSale = () => {
    if (!settings?.clearance_sale_active || !settings?.clearance_sale_end_date) {
      return false;
    }
    const endDate = new Date(settings.clearance_sale_end_date);
    const now = new Date();
    return endDate > now;
  };

  const showSalePrice = salePrice !== null && 
    salePrice < price && 
    (!settings?.clearance_sale_active || isValidSale());
    
  const showDiscountPrice = !showSalePrice && 
    discountPrice !== null && 
    discountPrice < price;

  return (
    <div className="relative">
      {images && images.length > 0 && (
        <div className="relative">
          <img
            src={images[0]}
            alt={productName}
            className="w-full rounded-lg"
          />
          {(showSalePrice || showDiscountPrice) && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive">
                {showSalePrice ? 'SALE' : 'DISCOUNT'}
              </Badge>
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
        </div>
      )}
      
      {videoUrls?.map((url, index) => {
        const videoId = getYouTubeVideoId(url);
        if (!videoId) return null;
        
        return (
          <div key={index} className="mt-4">
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`${productName} video ${index + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            />
          </div>
        );
      })}
      
      {images && images.length > 1 && (
        <div className="grid grid-cols-4 gap-4 mt-4">
          {images.slice(1).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${productName} ${index + 2}`}
              className="w-full rounded-lg"
            />
          ))}
        </div>
      )}
    </div>
  );
};