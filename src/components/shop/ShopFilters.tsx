import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceRangeFilter } from "./filters/PriceRangeFilter";
import { BrandFilter } from "./filters/BrandFilter";

interface ShopFiltersProps {
  priceRange: [number, number];
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  showSaleOnly: boolean;
  setShowSaleOnly: (show: boolean) => void;
  sortOrder: "asc" | "desc" | "default";
  setSortOrder: (order: "asc" | "desc" | "default") => void;
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (id: string | null) => void;
  showFeaturedOnly: boolean;
  setShowFeaturedOnly: (show: boolean) => void;
  showNewArrivalsOnly: boolean;
  setShowNewArrivalsOnly: (show: boolean) => void;
  selectedBrand: string | null;
  setSelectedBrand: (brand: string | null) => void;
  showDiscountOnly: boolean;
  setShowDiscountOnly: (show: boolean) => void;
}

export function ShopFilters({
  priceRange,
  setPriceRange,
  showSaleOnly,
  setShowSaleOnly,
  sortOrder,
  setSortOrder,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  showFeaturedOnly,
  setShowFeaturedOnly,
  showNewArrivalsOnly,
  setShowNewArrivalsOnly,
  selectedBrand,
  setSelectedBrand,
  showDiscountOnly,
  setShowDiscountOnly,
}: ShopFiltersProps) {
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

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("brand")
        .not("brand", "is", null)
        .order("brand");
      
      if (error) throw error;
      
      const uniqueBrands = Array.from(new Set(data.map(p => p.brand))).filter(Boolean);
      return uniqueBrands;
    },
  });

  const handleCategoryChange = (value: string | null) => {
    setSelectedCategory(value);
    setSelectedSubcategory(null);
  };

  return (
    <div className="w-64 shrink-0 space-y-6">
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Filters</h2>
        <Separator />

        <BrandFilter
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          brands={brands}
        />

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
        
        <PriceRangeFilter priceRange={priceRange} setPriceRange={setPriceRange} />

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

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="sale-mode"
              checked={showSaleOnly}
              onCheckedChange={setShowSaleOnly}
            />
            <Label htmlFor="sale-mode">Show Sale Only</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="discount-mode"
              checked={showDiscountOnly}
              onCheckedChange={setShowDiscountOnly}
            />
            <Label htmlFor="discount-mode">Show Discount Only</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured-mode"
              checked={showFeaturedOnly}
              onCheckedChange={setShowFeaturedOnly}
            />
            <Label htmlFor="featured-mode">Show Featured Only</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="new-arrivals-mode"
              checked={showNewArrivalsOnly}
              onCheckedChange={setShowNewArrivalsOnly}
            />
            <Label htmlFor="new-arrivals-mode">Show New Arrivals Only</Label>
          </div>
        </div>
      </div>
    </div>
  );
}