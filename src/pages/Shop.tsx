import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Filter } from "lucide-react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SearchBar } from "@/components/shop/SearchBar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useShopUrlParams } from "@/hooks/useShopUrlParams";
import { useFilteredProducts } from "@/hooks/useFilteredProducts";
import { Product } from "@/types/product";

const Shop = () => {
  const location = useLocation();
  const { getUrlParam, updateUrlParams } = useShopUrlParams();
  const { toast } = useToast();

  // Initialize state from URL parameters or location state
  const [searchQuery, setSearchQuery] = useState(getUrlParam("search") || "");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(getUrlParam("minPrice")) || 0,
    Number(getUrlParam("maxPrice")) || 0,
  ]);

  // Initialize filter states from URL parameters
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Update URL when filters change
  useEffect(() => {
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

  const { data: products, isLoading, error } = useQuery({
    queryKey: [
      "shop-products",
      selectedCategory,
      selectedSubcategory,
      showFeaturedOnly,
      showSaleOnly,
      showDiscountOnly,
      showNewArrivalsOnly,
    ],
    queryFn: async () => {
      console.log("Fetching products with filters:", {
        category: selectedCategory,
        subcategory: selectedSubcategory,
        featured: showFeaturedOnly,
        sale: showSaleOnly,
        discount: showDiscountOnly,
        newArrivals: showNewArrivalsOnly,
        priceRange,
      });

      let query = supabase
        .from("products")
        .select(
          "id, name, price, sale_price, discount_price, images, brand, custom_label, description, category_id, subcategory_id, featured, created_at"
        )
        .eq("status", "published");

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      if (selectedSubcategory) {
        query = query.eq("subcategory_id", selectedSubcategory);
      }

      if (showFeaturedOnly) {
        query = query.eq("featured", true);
      }

      if (showNewArrivalsOnly) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte("created_at", thirtyDaysAgo.toISOString());
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

      return data as Product[];
    },
  });

  const { filteredProducts, isProductOnSale } = useFilteredProducts({
    products,
    searchQuery,
    priceRange,
    showSaleOnly,
    showDiscountOnly,
    selectedBrand,
    settings,
  });

  const sortedProducts = [...(filteredProducts || [])].sort((a, b) => {
    if (sortOrder === "default") return 0;
    const priceA = isProductOnSale(a) ? a.sale_price! : a.price;
    const priceB = isProductOnSale(b) ? b.sale_price! : b.price;
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
          />
        </div>

        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <ProductGrid products={sortedProducts} />
        </div>
      </div>
    </div>
  );
};

export default Shop;
