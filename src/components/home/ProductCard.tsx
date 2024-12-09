import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  imageUrl?: string;
  brand?: string | null;
}

export const ProductCard = ({ id, name, price, salePrice, imageUrl, brand }: ProductCardProps) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatUrlSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  // Only use the first 8 characters of the UUID
  const shortId = id.split('-')[0];
  const productUrl = `/products/${formatUrlSlug(name)}-${shortId}`;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
      <Link to={productUrl}>
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
        <CardContent className="p-4 text-left">
          <h3 className="font-semibold line-clamp-2">{name}</h3>
          {brand && (
            <p className="text-sm text-muted-foreground mt-1">{brand}</p>
          )}
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
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
        <Link to={productUrl} className="w-full">
          <Button className="w-full" variant="default">
            Order Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};