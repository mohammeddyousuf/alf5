import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductMediaProps {
  images?: string[];
  videoUrls?: string[];
  productName: string;
  getYouTubeVideoId: (url: string) => string | null;
}

export function ProductMedia({ images, videoUrls, productName, getYouTubeVideoId }: ProductMediaProps) {
  const mediaItems = [...(images || []), ...(videoUrls || [])];

  if (mediaItems.length === 0) {
    return (
      <div className="w-full rounded-lg bg-muted aspect-square flex items-center justify-center">
        <p className="text-muted-foreground">No media available</p>
      </div>
    );
  }

  return (
    <div className="relative group">
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