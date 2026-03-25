import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/home/ProductCard";
import { CollectionCard } from "@/components/home/CollectionCard";
import { HeroSlider } from "@/components/home/HeroSlider";
import { NewsTickerBanner } from "@/components/home/NewsTickerBanner";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";

const Index = () => {
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      console.log("Fetching latest products");
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, sale_price, discount_price, images, brand, custom_label, status")
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

  const { data: featuredProducts, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      console.log("Fetching featured products");
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, sale_price, discount_price, images, brand, custom_label, status")
        .eq("status", "published")
        .eq("featured", true)
        .limit(8);
      
      if (error) {
        console.error("Error fetching featured products:", error);
        throw error;
      }
      
      console.log("Fetched featured products:", data);
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
        .order("created_at", { ascending: true });
      
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
                buttonText={collection.button_text}
              />
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Latest</h2>
        <Carousel className="w-full max-w-screen-xl mx-auto">
          <CarouselContent className="-ml-2 md:-ml-4">
            {products?.map((product) => (
              <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  salePrice={product.sale_price}
                  discountPrice={product.discount_price}
                  imageUrl={product.images?.[0]}
                  brand={product.brand}
                  customLabel={product.custom_label}
                  priceNote={(product as any).price_note}
                  stockStatus={(product as any).stock_status}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4 lg:-left-12" />
          <CarouselNext className="hidden sm:flex -right-4 lg:-right-12" />
        </Carousel>
      </div>

      {featuredProducts && featuredProducts.length > 0 && (
        <div className="container mx-auto py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Featured</h2>
          <Carousel className="w-full max-w-screen-xl mx-auto">
            <CarouselContent className="-ml-2 md:-ml-4">
              {featuredProducts.map((product) => (
                <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    salePrice={product.sale_price}
                    discountPrice={product.discount_price}
                    imageUrl={product.images?.[0]}
                    brand={product.brand}
                    customLabel={product.custom_label}
                    priceNote={(product as any).price_note}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-4 lg:-left-12" />
            <CarouselNext className="hidden sm:flex -right-4 lg:-right-12" />
          </Carousel>
        </div>
      )}
    </div>
  );
};

export default Index;
