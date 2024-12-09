import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  imageUrl?: string;
  brand?: string | null;
}

export const ProductCard = ({ id, name, price, salePrice, imageUrl, brand }: ProductCardProps) => {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol'
    }).format(amount).replace('$', settings?.currency_symbol || '$');
  };

  const formatUrlSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  // Only use the first 8 characters of the UUID
  const shortId = id.split('-')[0];

  return (
    <Link to={`/products/${formatUrlSlug(name)}-${shortId}`}>
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
        <CardContent className="p-4 text-left">
          <h3 className="font-semibold line-clamp-2">{name}</h3>
          {brand && (
            <p className="text-sm text-muted-foreground mt-1">{brand}</p>
          )}
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