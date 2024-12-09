import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/home/ProductCard";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Shop = () => {
  const { toast } = useToast();
  
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["shop-products"],
    queryFn: async () => {
      console.log("Starting to fetch products...");
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching products:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products. Please try again later.",
        });
        throw error;
      }

      console.log("Raw products data:", data);
      console.log("Number of products found:", data?.length || 0);
      
      if (!data || data.length === 0) {
        console.log("No products found or empty data array returned");
      } else {
        console.log("Products retrieved successfully:", data.map(p => ({ id: p.id, name: p.name })));
      }
      
      return data || [];
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  console.log("Render phase - products:", products);
  console.log("Render phase - isLoading:", isLoading);
  console.log("Render phase - error:", error);

  if (error) {
    console.error("Query error:", error);
    return (
      <div className="container py-12">
        <p className="text-center text-destructive">
          Failed to load products. Please try again later.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Our Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map((product) => {
          console.log("Rendering product:", product);
          return (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              salePrice={product.sale_price}
              imageUrl={product.images?.[0]}
            />
          );
        })}
      </div>

      {(!products || products.length === 0) && (
        <p className="text-center text-muted-foreground">
          No products available at the moment.
        </p>
      )}
    </div>
  );
};

export default Shop;