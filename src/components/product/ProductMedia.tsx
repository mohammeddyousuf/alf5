import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";

interface ProductMediaProps {
  images?: string[];
  videoUrls?: string[];
  productName: string;
  getYouTubeVideoId: (url: string) => string | null;
  salePrice?: number | null;
  price: number;
  customLabel?: string | null;
}

export function ProductMedia({ 
  images, 
  videoUrls, 
  productName, 
  getYouTubeVideoId,
  salePrice,
  price,
  customLabel
}: ProductMediaProps) {
  const { toast } = useToast();
  const mediaItems = [...(images || []), ...(videoUrls || [])];

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

  const isValidSale = () => {
    if (!settings?.clearance_sale_active || !settings?.clearance_sale_end_date) {
      return true;
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

  const showSaleLabel = salePrice && salePrice < price && isValidSale();

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
      {customLabel && (
        <div className="absolute bottom-4 right-4 z-10">
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