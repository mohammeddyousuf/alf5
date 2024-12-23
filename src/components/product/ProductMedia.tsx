import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

  const getImageUrl = (fileName: string) => {
    if (fileName.startsWith('http')) {
      return fileName;
    }
    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);
    return publicUrl;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="space-y-4">
      {images && images.length > 0 && (
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-square">
                    <img
                      src={getImageUrl(image)}
                      alt={`${productName} ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg cursor-pointer"
                      onClick={scrollToTop}
                    />
                    {index === 0 && (showSalePrice || showDiscountPrice) && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="destructive">
                          {showSalePrice ? 'SALE' : 'DISCOUNT'}
                        </Badge>
                      </div>
                    )}
                    {index === 0 && customLabel && (
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
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      )}
      
      {videoUrls?.map((url, index) => {
        const videoId = getYouTubeVideoId(url);
        if (!videoId) return null;
        
        return (
          <div key={index} className="aspect-video">
            <iframe
              width="100%"
              height="100%"
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
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <img
              key={index}
              src={getImageUrl(image)}
              alt={`${productName} ${index + 1}`}
              className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={scrollToTop}
            />
          ))}
        </div>
      )}
    </div>
  );
};