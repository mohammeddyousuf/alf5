import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  showSaleProducts: boolean;
  setShowSaleProducts: (value: boolean) => void;
  showNonSaleProducts: boolean;
  setShowNonSaleProducts: (value: boolean) => void;
  selectedBrand: string;
  setSelectedBrand: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  showFeatured: boolean;
  setShowFeatured: (value: boolean) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedCustomLabel: string;
  setSelectedCustomLabel: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (value: string) => void;
}

export function ProductFilters({
  search,
  setSearch,
  showSaleProducts,
  setShowSaleProducts,
  showNonSaleProducts,
  setShowNonSaleProducts,
  selectedBrand,
  setSelectedBrand,
  sortBy,
  setSortBy,
  showFeatured,
  setShowFeatured,
  selectedStatus,
  setSelectedStatus,
  selectedCustomLabel,
  setSelectedCustomLabel,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
}: ProductFiltersProps) {
  const isMobile = useIsMobile();
  
  const { data: brands } = useQuery({
    queryKey: ["product-brands"],
    queryFn: async () => {
      const { data: products } = await supabase
        .from("products")
        .select("brand")
        .not("brand", "is", null);
      
      if (!products) return [];
      
      const uniqueBrands = Array.from(new Set(products.map(p => p.brand)));
      return uniqueBrands.filter(Boolean).sort();
    },
  });

  const { data: customLabels } = useQuery({
    queryKey: ["product-custom-labels"],
    queryFn: async () => {
      const { data: products } = await supabase
        .from("products")
        .select("custom_label")
        .not("custom_label", "is", null);
      
      if (!products) return [];
      
      const uniqueLabels = Array.from(new Set(products.map(p => p.custom_label)));
      return uniqueLabels.filter(Boolean).sort();
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: subcategories } = useQuery({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by name, brand, description, or custom label..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={`${isMobile ? 'flex flex-col space-y-4' : 'grid grid-cols-4 gap-4'}`}>
        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-asc">Price (Low-High)</SelectItem>
              <SelectItem value="price-desc">Price (High-Low)</SelectItem>
              <SelectItem value="sale-price-asc">Sale Price (Low-High)</SelectItem>
              <SelectItem value="sale-price-desc">Sale Price (High-Low)</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="date-desc">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="sale-products"
            checked={showSaleProducts}
            onCheckedChange={setShowSaleProducts}
          />
          <Label htmlFor="sale-products">Show Sale Products</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="non-sale-products"
            checked={showNonSaleProducts}
            onCheckedChange={setShowNonSaleProducts}
          />
          <Label htmlFor="non-sale-products">Show Non-Sale Products</Label>
        </div>
      </div>

      <div className={`${isMobile ? 'flex flex-col space-y-4' : 'grid grid-cols-4 gap-4'}`}>
        <div className="flex items-center space-x-2">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands?.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={selectedCustomLabel} onValueChange={setSelectedCustomLabel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Labels</SelectItem>
              {customLabels?.map((label) => (
                <SelectItem key={label} value={label}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by category" />
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

        <div className="flex items-center space-x-2">
          <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by subcategory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {subcategories?.filter(sub => 
                selectedCategory === 'all' || sub.category_id === selectedCategory
              )?.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={`${isMobile ? 'flex flex-col space-y-4' : 'grid grid-cols-4 gap-4'}`}>
        <div className="flex items-center space-x-2">
          <Switch
            id="featured-products"
            checked={showFeatured}
            onCheckedChange={setShowFeatured}
          />
          <Label htmlFor="featured-products">Show Featured Products</Label>
        </div>
      </div>
    </div>
  );
}