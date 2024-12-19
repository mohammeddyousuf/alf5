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

export const ProductMedia: React.FC<ProductMediaProps> = ({
  images,
  videoUrls,
  productName,
  getYouTubeVideoId,
  salePrice,
  discountPrice,
  price,
  customLabel
}) => {
  return (
    <div className="relative">
      {images && images.length > 0 && (
        <div className="relative">
          <img
            src={images[0]}
            alt={productName}
            className="w-full rounded-lg"
          />
          {salePrice !== null && salePrice < price && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded">
              SALE
            </div>
          )}
          {discountPrice !== null && discountPrice < price && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded">
              DISCOUNT
            </div>
          )}
          {customLabel && (
            <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded">
              {customLabel}
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