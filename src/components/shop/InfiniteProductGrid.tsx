import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductGrid } from "./ProductGrid";
import { LoadingLogo } from "./LoadingLogo";
import { Product } from "@/types/product";
import { useFilteredProducts } from "@/hooks/useFilteredProducts";

interface InfiniteProductGridProps {
  searchQuery: string;
  priceRange: [number, number];
  showSaleOnly: boolean;
  showDiscountOnly: boolean;
  selectedBrand: string | null;
  selectedLabel: string | null;
  settings: any;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  showFeaturedOnly: boolean;
  showNewArrivalsOnly: boolean;
  sortOrder: "asc" | "desc" | "default";
}

const PRODUCTS_PER_PAGE = 12;

export function InfiniteProductGrid({
  searchQuery,
  priceRange,
  showSaleOnly,
  showDiscountOnly,
  selectedBrand,
  selectedLabel,
  settings,
  selectedCategory,
  selectedSubcategory,
  showFeaturedOnly,
  showNewArrivalsOnly,
  sortOrder,
}: InfiniteProductGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async ({ pageParam = 0 }) => {
    let query = supabase
      .from("products")
      .select(
        "id, name, price, sale_price, discount_price, images, brand, custom_label, description, category_id, subcategory_id, featured, created_at"
      )
      .eq("status", "published")
      .range(pageParam * PRODUCTS_PER_PAGE, (pageParam + 1) * PRODUCTS_PER_PAGE - 1);

    if (selectedCategory) {
      query = query.eq("category_id", selectedCategory);
    }

    if (selectedSubcategory) {
      query = query.eq("subcategory_id", selectedSubcategory);
    }

    if (showFeaturedOnly) {
      query = query.eq("featured", true);
    }

    if (selectedLabel) {
      query = query.eq("custom_label", selectedLabel);
    }

    if (showNewArrivalsOnly) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.gte("created_at", thirtyDaysAgo.toISOString());
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      products: data as Product[],
      nextPage: data.length === PRODUCTS_PER_PAGE ? pageParam + 1 : undefined,
      totalCount: count || 0,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: [
      "infinite-products",
      selectedCategory,
      selectedSubcategory,
      showFeaturedOnly,
      showDiscountOnly,
      showNewArrivalsOnly,
      selectedLabel,
    ],
    queryFn: fetchProducts,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts = data?.pages.flatMap((page) => page.products) || [];

  const { filteredProducts, isProductOnSale } = useFilteredProducts({
    products: allProducts,
    searchQuery,
    priceRange,
    showSaleOnly,
    showDiscountOnly,
    selectedBrand,
    selectedLabel,
    settings,
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "default") return 0;
    const priceA = isProductOnSale(a) ? a.sale_price! : a.price;
    const priceB = isProductOnSale(b) ? b.sale_price! : b.price;
    return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
  });

  if (isError) {
    return (
      <p className="text-center text-destructive">
        Failed to load products. Please try again later.
      </p>
    );
  }

  return (
    <div>
      <ProductGrid products={sortedProducts} />
      
      <div ref={loadMoreRef} className="mt-8">
        {(isLoading || isFetchingNextPage) && <LoadingLogo />}
      </div>
    </div>
  );
}