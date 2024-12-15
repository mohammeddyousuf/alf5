import { Badge } from "@/components/ui/badge";
import { SaleCountdown } from "@/components/product/SaleCountdown";

interface ProductImageProps {
  images: string[] | null;
  name: string;
  salePrice: number | null;
  price: number;
  showSaleTimer: boolean;
  saleEndDate: string | null;
}

export function ProductImage({ 
  images, 
  name, 
  salePrice, 
  price,
  showSaleTimer,
  saleEndDate
}: ProductImageProps) {
  const showSaleBadge = salePrice && salePrice < price;
  
  return (
    <div className="aspect-square mb-4 overflow-hidden rounded-lg relative">
      {images?.[0] ? (
        <>
          <img
            src={images[0]}
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
        </>
      ) : (
        <div className="h-full w-full bg-muted flex items-center justify-center">
          No image
        </div>
      )}
    </div>
  );
}