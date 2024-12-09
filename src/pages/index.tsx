import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/home/ProductCard";
import { CollectionCard } from "@/components/home/CollectionCard";
import { HeroSlider } from "@/components/home/HeroSlider";
import { NewsTickerBanner } from "@/components/home/NewsTickerBanner";

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
      console.log("Fetching collections");
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching collections:", error);
        throw error;
      }
      
      console.log("Fetched collections:", data);
      return data;
    },
  });

  return (
    <div className="w-full">
      <NewsTickerBanner />
      <HeroSlider />
      
      {collections && collections.length > 0 && (
        <div className="container mx-auto py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Collections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                id={collection.id}
                name={collection.name}
                imageUrl={collection.image_url}
                description={collection.description}
                linkUrl={collection.link_url}
              />
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Latest Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>
    </div>
  );
};

export default Index;