import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  imageUrl?: string;
}

export const ProductCard = ({ id, name, price, salePrice, imageUrl }: ProductCardProps) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Link to={`/products/${id}`}>
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
        <div className="aspect-square overflow-hidden relative">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              {salePrice && (
                <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground rounded-md px-2 py-1">
                  <span className="text-xs font-bold">SALE</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2">{name}</h3>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex flex-col">
            {salePrice ? (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(price)}
                </span>
                <span className="text-lg font-bold text-destructive">
                  {formatPrice(salePrice)}
                </span>
              </>
            ) : (
              <span className="text-lg font-semibold">
                {formatPrice(price)}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};