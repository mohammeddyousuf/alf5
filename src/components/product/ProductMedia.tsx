import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SaleCountdown } from "./SaleCountdown";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductMediaProps {
  images?: string[];
  videoUrls?: string[];
  productName: string;
  getYouTubeVideoId: (url: string) => string | null;
  salePrice?: number | null;
  price: number;
}

export function ProductMedia({ images, videoUrls, productName, getYouTubeVideoId, salePrice, price }: ProductMediaProps) {
  const { toast } = useToast();
  const mediaItems = [...(images || []), ...(videoUrls || [])];

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
      return true; // If no global sale timer, individual sale prices are valid
    }
    const endDate = new Date(settings.clearance_sale_end_date);
    const now = new Date();
    return endDate > now;
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      toast({
        title: "Link Copied!",
        description: "Product link has been copied to clipboard",
      });
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link",
      });
    });
  };

  if (mediaItems.length === 0) {
    return (
      <div className="w-full rounded-lg bg-muted aspect-square flex items-center justify-center">
        <p className="text-muted-foreground">No media available</p>
      </div>
    );
  }

  // Show sale price if it exists, is less than regular price, and either:
  // 1. There's no global sale timer (regular product discount)
  // 2. There's a global sale timer and it hasn't expired
  const showSaleLabel = salePrice && 
    salePrice < price && 
    (!settings?.clearance_sale_active || isValidSale());

  // Only show timer if global sale is active and not expired
  const showSaleTimer = settings?.clearance_sale_active && 
    settings?.clearance_sale_end_date && 
    isValidSale() && 
    showSaleLabel;

  return (
    <div className="relative group">
      {showSaleLabel && (
        <div className="absolute top-4 left-4 z-10 bg-destructive text-destructive-foreground px-3 py-1 rounded-md">
          <span className="font-semibold text-sm">SALE</span>
        </div>
      )}
      {showSaleTimer && settings?.clearance_sale_end_date && (
        <div className="absolute top-4 right-4 z-10">
          <SaleCountdown 
            endDate={settings.clearance_sale_end_date}
          />
        </div>
      )}
      <Carousel className="w-full">
        <CarouselContent>
          {mediaItems.map((item, index) => (
            <CarouselItem key={index}>
              {images?.includes(item) ? (
                <img
                  src={item}
                  alt={`${productName} - ${index + 1}`}
                  className="w-full rounded-lg object-cover aspect-square"
                />
              ) : (
                <div className="aspect-square w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(item)}`}
                    title={`${productName} - Video ${index + 1}`}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        {mediaItems.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-4 left-4 z-10 bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all hover:scale-105 text-white"
        onClick={handleCopyLink}
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
}