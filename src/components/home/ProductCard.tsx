import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  imageUrl?: string;
  brand?: string | null;
  saleTimerEnabled?: boolean;
  saleEndDate?: string | null;
}

export const ProductCard = ({ 
  id, 
  name, 
  price, 
  salePrice, 
  imageUrl, 
  brand,
  saleTimerEnabled,
  saleEndDate 
}: ProductCardProps) => {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState(salePrice || price);

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

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!saleTimerEnabled || !saleEndDate) {
        setTimeLeft(null);
        return;
      }

      const endDate = new Date(saleEndDate).getTime();
      const now = new Date().getTime();
      const difference = endDate - now;

      if (difference <= 0) {
        setTimeLeft(null);
        setCurrentPrice(price); // Reset to original price when timer ends
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d:${hours}h:${minutes}m:${seconds}s`);
      setCurrentPrice(salePrice || price);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Initial calculation

    return () => clearInterval(timer);
  }, [saleTimerEnabled, saleEndDate, price, salePrice]);

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
              {currentPrice < price && (
                <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground rounded-md px-2 py-1">
                  <span className="text-xs font-bold">SALE</span>
                </div>
              )}
              {timeLeft && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="font-mono">
                    {timeLeft}
                  </Badge>
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
          {currentPrice < price ? (
            <>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(price)}
              </span>
              <span className="text-lg font-bold text-destructive">
                {formatPrice(currentPrice)}
              </span>
            </>
          ) : (
            <span className="text-lg font-semibold">
              {formatPrice(currentPrice)}
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