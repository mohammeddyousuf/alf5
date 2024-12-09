import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ProductGrid } from "@/components/shop/ProductGrid";

const Shop = () => {
  const { toast } = useToast();
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "default">("default");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["shop-products", selectedCategory, selectedSubcategory],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("status", "published");

      // Only apply category filter if one is selected
      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      // Only apply subcategory filter if one is selected
      if (selectedSubcategory) {
        query = query.eq("subcategory_id", selectedSubcategory);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching products:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products. Please try again later.",
        });
        throw error;
      }
      
      console.log("Fetched products:", data); // Debug log
      return data || [];
    },
  });

  const filteredProducts = products?.filter((product) => {
    const price = product.sale_price || product.price;
    const meetsPrice = price >= priceRange[0] && price <= priceRange[1];
    const meetsSale = showSaleOnly ? product.sale_price !== null : true;
    return meetsPrice && meetsSale;
  });

  const sortedProducts = [...(filteredProducts || [])].sort((a, b) => {
    if (sortOrder === "default") return 0;
    const priceA = a.sale_price || a.price;
    const priceB = b.sale_price || b.price;
    return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
  });

  if (error) {
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

      <div className="flex gap-8">
        <ShopFilters
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          showSaleOnly={showSaleOnly}
          setShowSaleOnly={setShowSaleOnly}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSubcategory={selectedSubcategory}
          setSelectedSubcategory={setSelectedSubcategory}
        />

        <div className="flex-1">
          <ProductGrid products={sortedProducts} />
        </div>
      </div>
    </div>
  );
};

export default Shop;