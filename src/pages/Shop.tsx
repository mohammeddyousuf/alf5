import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { SearchBar } from "@/components/shop/SearchBar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useShopUrlParams } from "@/hooks/useShopUrlParams";
import { InfiniteProductGrid } from "@/components/shop/InfiniteProductGrid";

const Shop = () => {
  const { getUrlParam, updateUrlParams } = useShopUrlParams();

  // Initialize state from URL parameters
  const [searchQuery, setSearchQuery] = useState(getUrlParam("search") || "");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(getUrlParam("minPrice")) || 0,
    Number(getUrlParam("maxPrice")) || 0,
  ]);
  const [showSaleOnly, setShowSaleOnly] = useState(getUrlParam("sale") === "true");
  const [showDiscountOnly, setShowDiscountOnly] = useState(getUrlParam("discount") === "true");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(getUrlParam("featured") === "true");
  const [showNewArrivalsOnly, setShowNewArrivalsOnly] = useState(getUrlParam("newArrivals") === "true");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "default">(
    (getUrlParam("sort") as "asc" | "desc" | "default") || "default"
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    getUrlParam("category")
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    getUrlParam("subcategory")
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    getUrlParam("brand")
  );
  const [selectedLabel, setSelectedLabel] = useState<string | null>(
    getUrlParam("label")
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Update URL when filters change
  useState(() => {
    updateUrlParams({
      search: searchQuery || null,
      minPrice: priceRange[0] > 0 ? priceRange[0].toString() : null,
      maxPrice: priceRange[1] > 0 ? priceRange[1].toString() : null,
      sale: showSaleOnly ? "true" : null,
      discount: showDiscountOnly ? "true" : null,
      featured: showFeaturedOnly ? "true" : null,
      newArrivals: showNewArrivalsOnly ? "true" : null,
      sort: sortOrder !== "default" ? sortOrder : null,
      category: selectedCategory,
      subcategory: selectedSubcategory,
      brand: selectedBrand,
      label: selectedLabel,
    });
  }, [
    searchQuery,
    priceRange,
    showSaleOnly,
    showDiscountOnly,
    showFeaturedOnly,
    showNewArrivalsOnly,
    sortOrder,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    selectedLabel,
  ]);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

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
                  showDiscountOnly={showDiscountOnly}
                  setShowDiscountOnly={setShowDiscountOnly}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  setSelectedSubcategory={setSelectedSubcategory}
                  showFeaturedOnly={showFeaturedOnly}
                  setShowFeaturedOnly={setShowFeaturedOnly}
                  showNewArrivalsOnly={showNewArrivalsOnly}
                  setShowNewArrivalsOnly={setShowNewArrivalsOnly}
                  selectedBrand={selectedBrand}
                  setSelectedBrand={setSelectedBrand}
                  selectedLabel={selectedLabel}
                  setSelectedLabel={setSelectedLabel}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:block w-64">
          <ShopFilters
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            showSaleOnly={showSaleOnly}
            setShowSaleOnly={setShowSaleOnly}
            showDiscountOnly={showDiscountOnly}
            setShowDiscountOnly={setShowDiscountOnly}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
            showFeaturedOnly={showFeaturedOnly}
            setShowFeaturedOnly={setShowFeaturedOnly}
            showNewArrivalsOnly={showNewArrivalsOnly}
            setShowNewArrivalsOnly={setShowNewArrivalsOnly}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            selectedLabel={selectedLabel}
            setSelectedLabel={setSelectedLabel}
          />
        </div>

        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <InfiniteProductGrid
            searchQuery={searchQuery}
            priceRange={priceRange}
            showSaleOnly={showSaleOnly}
            showDiscountOnly={showDiscountOnly}
            selectedBrand={selectedBrand}
            selectedLabel={selectedLabel}
            settings={settings}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            showFeaturedOnly={showFeaturedOnly}
            showNewArrivalsOnly={showNewArrivalsOnly}
            sortOrder={sortOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default Shop;