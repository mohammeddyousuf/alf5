import { cn } from "@/lib/utils";

interface ProductMediaProps {
  images: string[];
  videoUrls?: string[];
  productName: string;
  getYouTubeVideoId: (url: string) => string | null;
  salePrice?: number;
}

export function ProductMedia({
  images,
  videoUrls,
  productName,
  getYouTubeVideoId,
  salePrice,
}: ProductMediaProps) {
  return (
    <div className="relative">
      {salePrice && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium">
            SALE
          </span>
        </div>
      )}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {images && images.length > 0 && (
          <img
            src={images[0]}
            alt={productName}
            className="h-full w-full object-cover object-center"
          />
        )}
      </div>
      {videoUrls && videoUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          {videoUrls.map((url, index) => {
            const videoId = getYouTubeVideoId(url);
            if (!videoId) return null;
            
            return (
              <div key={index} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={`${productName} video ${index + 1}`}
                  className="h-full w-full object-cover"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          })}
        </div>
      )}
      {images && images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          {images.slice(1).map((image, index) => (
            <div key={index} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={image}
                alt={`${productName} ${index + 2}`}
                className="h-full w-full object-cover object-center"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}