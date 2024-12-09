import { useQuery } from "@tanstack/react-query";
import { HeroSlider } from "@/components/home/HeroSlider";
import { CollectionCard } from "@/components/home/CollectionCard";
import { NewsTickerBanner } from "@/components/home/NewsTickerBanner";
import { ProductCard } from "@/components/home/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Temporary data for collections
const collections = [
  {
    id: 1,
    title: "Summer Fashion",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
    link: "/shop?collection=summer",
  },
  {
    id: 2,
    title: "Accessories",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050",
    link: "/shop?collection=accessories",
  },
  {
    id: 3,
    title: "New Arrivals",
    image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc",
    link: "/shop?collection=new",
  },
];

const Index = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(8);
      
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              title={collection.title}
              image={collection.image}
              link={collection.link}
            />
          ))}
        </div>
      </section>

      <section className="container py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Latest Products</h2>
        {isLoading ? (
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