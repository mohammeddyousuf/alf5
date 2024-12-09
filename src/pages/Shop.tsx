import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/home/ProductCard";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Shop = () => {
  const { toast } = useToast();
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  
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

  const filteredProducts = products?.filter((product) => {
    const price = product.sale_price || product.price;
    const meetsPrice = price >= priceRange[0] && price <= priceRange[1];
    const meetsSale = showSaleOnly ? product.sale_price !== null : true;
    return meetsPrice && meetsSale;
  });

  const sortedProducts = [...(filteredProducts || [])].sort((a, b) => {
    if (!sortOrder) return 0;
    const priceA = a.sale_price || a.price;
    const priceB = b.sale_price || b.price;
    return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
  });

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

      <div className="mb-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 space-y-2">
            <Label>Price Range (${priceRange[0]} - ${priceRange[1]})</Label>
            <Slider
              defaultValue={[0, 1000]}
              max={1000}
              step={10}
              value={priceRange}
              onValueChange={setPriceRange}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="sale-mode"
              checked={showSaleOnly}
              onCheckedChange={setShowSaleOnly}
            />
            <Label htmlFor="sale-mode">Show Sale Items Only</Label>
          </div>

          <Select
            value={sortOrder || ""}
            onValueChange={(value: "asc" | "desc" | "") => setSortOrder(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default</SelectItem>
              <SelectItem value="asc">Price: Low to High</SelectItem>
              <SelectItem value="desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedProducts.map((product) => {
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

      {(!sortedProducts || sortedProducts.length === 0) && (
        <p className="text-center text-muted-foreground">
          No products available at the moment.
        </p>
      )}
    </div>
  );
};

export default Shop;