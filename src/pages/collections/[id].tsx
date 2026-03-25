import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/home/ProductCard";
import { Loader2 } from "lucide-react";

const CollectionDetail = () => {
  const { id } = useParams();

  const { data: collection, isLoading: isLoadingCollection } = useQuery({
    queryKey: ["collection", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["collection-products", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          products_collections!inner(collection_id)
        `)
        .eq("products_collections.collection_id", id)
        .eq("status", "published");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoadingCollection || isLoadingProducts) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold text-center">Collection not found</h1>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">{collection.name}</h1>
        {collection.description && (
          <p className="text-lg text-muted-foreground">{collection.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            salePrice={product.sale_price}
            imageUrl={product.images?.[0]}
            priceNote={(product as any).price_note}
          />
        ))}
      </div>

      {products?.length === 0 && (
        <p className="text-center text-muted-foreground">
          No products found in this collection.
        </p>
      )}
    </div>
  );
};

export default CollectionDetail;