import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Product } from "@/types/product";
import { Loader2 } from "lucide-react";

interface SimilarProductsProps {
  currentProductId: string;
  categoryId?: string | null;
  brand?: string | null;
}

export const SimilarProducts = ({ currentProductId, categoryId, brand }: SimilarProductsProps) => {
  const { data: similarProducts, isLoading } = useQuery({
    queryKey: ["similar-products", currentProductId, categoryId, brand],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("status", "published")
        .neq("id", currentProductId)
        .limit(3);

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      } else if (brand) {
        query = query.eq("brand", brand);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!currentProductId && (!!categoryId || !!brand),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!similarProducts?.length) {
    return null;
  }

  return (
    <div className="py-12 border-t">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
        <ProductGrid products={similarProducts} />
      </div>
    </div>
  );
};