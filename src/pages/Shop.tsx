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
import { Separator } from "@/components/ui/separator";

const Shop = () => {
  const { toast } = useToast();
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "default">("default");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: subcategories } = useQuery({
    queryKey: ["subcategories", selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", selectedCategory)
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCategory,
  });
  
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["shop-products", selectedCategory, selectedSubcategory],
    queryFn: async () => {
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

  const handleCategoryChange = (value: string | null) => {
    setSelectedCategory(value);
    setSelectedSubcategory(null); // Reset subcategory when category changes
  };

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
        {/* Filters Sidebar */}
        <div className="w-64 shrink-0 space-y-6">
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Filters</h2>
            <Separator />

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={selectedCategory || "all"}
                onValueChange={(value) => handleCategoryChange(value === "all" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && (
              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Select
                  value={selectedSubcategory || "all"}
                  onValueChange={(value) => setSelectedSubcategory(value === "all" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subcategories</SelectItem>
                    {subcategories?.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />
            
            <div className="space-y-2">
              <Label>Price Range</Label>
              <div className="text-sm text-muted-foreground mb-2">
                ${priceRange[0]} - ${priceRange[1]}
              </div>
              <Slider
                defaultValue={[0, 1000]}
                max={1000}
                step={10}
                value={priceRange}
                onValueChange={setPriceRange}
                className="w-full"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={sortOrder}
                onValueChange={(value: "asc" | "desc" | "default") => setSortOrder(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="asc">Price: Low to High</SelectItem>
                  <SelectItem value="desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Switch
                id="sale-mode"
                checked={showSaleOnly}
                onCheckedChange={setShowSaleOnly}
              />
              <Label htmlFor="sale-mode">Show Sale Items Only</Label>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
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

          {(!sortedProducts || sortedProducts.length === 0) && (
            <p className="text-center text-muted-foreground">
              No products available at the moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;