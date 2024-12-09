import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/home/ProductCard";
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

  return (
    <div className="container mx-auto">
      <NewsTickerBanner />
      <HeroSlider />
      
      <div className="py-12">
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