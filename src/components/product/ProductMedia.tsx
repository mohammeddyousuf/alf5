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

interface ProductMediaProps {
  images?: string[];
  videoUrls?: string[];
  productName: string;
  getYouTubeVideoId: (url: string) => string | null;
}

export function ProductMedia({ images, videoUrls, productName, getYouTubeVideoId }: ProductMediaProps) {
  const { toast } = useToast();
  const mediaItems = [...(images || []), ...(videoUrls || [])];

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

  return (
    <div className="relative group">
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all hover:scale-105 text-white"
        onClick={handleCopyLink}
      >
        <Share2 className="h-4 w-4" />
      </Button>
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
    </div>
  );
}