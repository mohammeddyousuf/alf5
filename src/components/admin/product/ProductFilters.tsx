import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  showSaleProducts: boolean;
  setShowSaleProducts: (value: boolean) => void;
  showNonSaleProducts: boolean;
  setShowNonSaleProducts: (value: boolean) => void;
  selectedBrand: string;
  setSelectedBrand: (value: string) => void;
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
}: ProductFiltersProps) {
  const { data: brands } = useQuery({
    queryKey: ["product-brands"],
    queryFn: async () => {
      const { data: products } = await supabase
        .from("products")
        .select("brand")
        .not("brand", "is", null);
      
      if (!products) return [];
      
      // Get unique brands
      const uniqueBrands = Array.from(new Set(products.map(p => p.brand)));
      return uniqueBrands.filter(Boolean).sort();
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

      <div className="flex items-center space-x-4">
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

        <div className="flex items-center space-x-2">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Brands</SelectItem>
              {brands?.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}