import { useQuery } from "@tanstack/react-query";
import { HeroSlider } from "@/components/home/HeroSlider";
import { CollectionCard } from "@/components/home/CollectionCard";
import { NewsTickerBanner } from "@/components/home/NewsTickerBanner";
import { ProductCard } from "@/components/home/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      console.log("Fetching latest products");
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(8);
      
      if (error) {
        console.error("Error fetching latest products:", error);
        throw error;
      }
      
      console.log("Fetched latest products:", data);
      return data;
    },
  });

  const { data: collections, isLoading: isLoadingCollections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <NewsTickerBanner />
      <HeroSlider />
      
      <section className="container py-12 md:py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Shop Collections</h2>
        {isLoadingCollections ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections?.map((collection) => (
              <CollectionCard
                key={collection.id}
                id={collection.id}
                name={collection.name}
                imageUrl={collection.image_url}
                description={collection.description}
              />
            ))}
          </div>
        )}
      </section>

      <section className="container py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Latest Products</h2>
        {isLoadingProducts ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                salePrice={product.sale_price}
                imageUrl={product.images?.[0]}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;