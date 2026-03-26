import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Filter } from "lucide-react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/db";
import { useToast } from "@/components/ui/use-toast";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SearchBar } from "@/components/shop/SearchBar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useShopUrlParams } from "@/hooks/useShopUrlParams";
import { useFilteredProducts } from "@/hooks/useFilteredProducts";
import { ProductPagination } from "@/components/shop/ProductPagination";
import { Product } from "@/types/product";

const PRODUCTS_PER_PAGE = 12;

const Shop = () => {
  const location = useLocation();
  const { getUrlParam, updateUrlParams } = useShopUrlParams();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(Number(getUrlParam("page")) || 1);

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(getUrlParam("category"));
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(getUrlParam("subcategory"));
  const [selectedBrand, setSelectedBrand] = useState<string | null>(getUrlParam("brand"));
  const [selectedLabel, setSelectedLabel] = useState<string | null>(getUrlParam("label"));
  const [selectedTopNotes, setSelectedTopNotes] = useState<string[]>(
    getUrlParam("topNote")?.split(",").filter(Boolean) || []
  );
  const [selectedHeartNotes, setSelectedHeartNotes] = useState<string[]>(
    getUrlParam("heartNote")?.split(",").filter(Boolean) || []
  );
  const [selectedBaseNotes, setSelectedBaseNotes] = useState<string[]>(
    getUrlParam("baseNote")?.split(",").filter(Boolean) || []
  );
  const [selectedGenderProfiles, setSelectedGenderProfiles] = useState<string[]>(
    getUrlParam("genderProfile")?.split(",").filter(Boolean) || []
  );
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(
    getUrlParam("occasion")?.split(",").filter(Boolean) || []
  );
  const [selectedScentFamilies, setSelectedScentFamilies] = useState<string[]>(
    getUrlParam("scentFamily")?.split(",").filter(Boolean) || []
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    updateUrlParams({
      page: currentPage.toString(),
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
      topNote: selectedTopNotes.length > 0 ? selectedTopNotes.join(",") : null,
      heartNote: selectedHeartNotes.length > 0 ? selectedHeartNotes.join(",") : null,
      baseNote: selectedBaseNotes.length > 0 ? selectedBaseNotes.join(",") : null,
      genderProfile: selectedGenderProfiles.length > 0 ? selectedGenderProfiles.join(",") : null,
      occasion: selectedOccasions.length > 0 ? selectedOccasions.join(",") : null,
      scentFamily: selectedScentFamilies.length > 0 ? selectedScentFamilies.join(",") : null,
    });
  }, [
    currentPage, searchQuery, priceRange, showSaleOnly, showDiscountOnly,
    showFeaturedOnly, showNewArrivalsOnly, sortOrder, selectedCategory,
    selectedSubcategory, selectedBrand, selectedLabel, selectedTopNotes,
    selectedHeartNotes, selectedBaseNotes, selectedGenderProfiles,
    selectedOccasions, selectedScentFamilies,
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
      selectedCategory, selectedSubcategory,
      showFeaturedOnly, showSaleOnly, showDiscountOnly,
      showNewArrivalsOnly, selectedLabel,
    ],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(
          "id, name, price, sale_price, discount_price, images, brand, custom_label, description, category_id, subcategory_id, featured, created_at, status, stock_status, price_note, top_notes, heart_notes, base_notes, gender_profile, occasion, scent_family"
        )
        .eq("status", "published");

      if (selectedCategory) query = query.eq("category_id", selectedCategory);
      if (selectedSubcategory) query = query.eq("subcategory_id", selectedSubcategory);
      if (showFeaturedOnly) query = query.eq("featured", true);
      if (selectedLabel) query = query.eq("custom_label", selectedLabel);

      if (showNewArrivalsOnly) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte("created_at", thirtyDaysAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) {
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
    selectedLabel,
    selectedTopNotes,
    selectedHeartNotes,
    selectedBaseNotes,
    selectedGenderProfiles,
    selectedOccasions,
    selectedScentFamilies,
    settings,
  });

  const sortedProducts = [...(filteredProducts || [])].sort((a, b) => {
    if (sortOrder === "default") return 0;
    const priceA = isProductOnSale(a) ? a.sale_price! : a.price;
    const priceB = isProductOnSale(b) ? b.sale_price! : b.price;
    return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
  });

  const totalPages = Math.ceil((sortedProducts?.length || 0) / PRODUCTS_PER_PAGE);
  const paginatedProducts = sortedProducts?.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery, priceRange, showSaleOnly, showDiscountOnly,
    showFeaturedOnly, showNewArrivalsOnly, sortOrder, selectedCategory,
    selectedSubcategory, selectedBrand, selectedLabel, selectedTopNotes,
    selectedHeartNotes, selectedBaseNotes, selectedGenderProfiles,
    selectedOccasions, selectedScentFamilies,
  ]);

  if (error) {
    return (
      <div className="container py-12">
        <p className="text-center text-destructive">Failed to load products. Please try again later.</p>
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

  const filterProps = {
    priceRange, setPriceRange, showSaleOnly, setShowSaleOnly,
    showDiscountOnly, setShowDiscountOnly, sortOrder, setSortOrder,
    selectedCategory, setSelectedCategory, selectedSubcategory, setSelectedSubcategory,
    showFeaturedOnly, setShowFeaturedOnly, showNewArrivalsOnly, setShowNewArrivalsOnly,
    selectedBrand, setSelectedBrand, selectedLabel, setSelectedLabel,
    selectedTopNotes, setSelectedTopNotes, selectedHeartNotes, setSelectedHeartNotes,
    selectedBaseNotes, setSelectedBaseNotes, selectedGenderProfiles, setSelectedGenderProfiles,
    selectedOccasions, setSelectedOccasions, selectedScentFamilies, setSelectedScentFamilies,
  };

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Our Products</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:hidden mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="py-4">
                <ShopFilters {...filterProps} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden md:block w-64">
          <ShopFilters {...filterProps} />
        </div>

        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <ProductGrid products={paginatedProducts} />
          {totalPages > 1 && (
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
