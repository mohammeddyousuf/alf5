import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Shop = () => {
  const { toast } = useToast();
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "default">("default");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["shop-products", selectedCategory, selectedSubcategory],
    queryFn: async () => {
      console.log("Fetching products with filters:", {
        selectedCategory,
        selectedSubcategory,
      });

      let query = supabase
        .from("products")
        .select("*")
        .eq("status", "published");

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      if (selectedSubcategory) {
        query = query.eq("subcategory_id", selectedSubcategory);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching products:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products. Please try again later.",
        });
        throw error;
      }
      
      console.log("Fetched products:", data);
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

      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="py-4">
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
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:block">
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
        </div>

        <div className="flex-1">
          <ProductGrid products={sortedProducts} />
        </div>
      </div>
    </div>
  );
};

export default Shop;