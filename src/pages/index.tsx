import { HeroSlider } from "@/components/home/HeroSlider";
import { NewsTickerBanner } from "@/components/home/NewsTickerBanner";
import { CollectionCard } from "@/components/home/CollectionCard";
import { ProductCard } from "@/components/home/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: collections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("collections").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-8">
      <HeroSlider />
      <NewsTickerBanner />
      
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections?.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;