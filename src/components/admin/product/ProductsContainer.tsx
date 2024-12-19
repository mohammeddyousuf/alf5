import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductListContainer } from "./ProductListContainer";
import { ProductFilters } from "./ProductFilters";
import { useDeleteProduct } from "@/hooks/useDeleteProduct";
import { useProductManagement } from "@/hooks/useProductManagement";

export const ProductsContainer = ({ 
  onSuccess 
}: { 
  onSuccess: () => Promise<void> 
}) => {
  const [search, setSearch] = useState("");
  const [showSaleProducts, setShowSaleProducts] = useState(true);
  const [showNonSaleProducts, setShowNonSaleProducts] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [showFeatured, setShowFeatured] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCustomLabel, setSelectedCustomLabel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const deleteProduct = useDeleteProduct();
  const { handleStatusChange } = useProductManagement(onSuccess);

  const handleSuccess = async () => {
    await onSuccess();
  };

  return (
    <>
      <ProductFilters
        search={search}
        setSearch={setSearch}
        showSaleProducts={showSaleProducts}
        setShowSaleProducts={setShowSaleProducts}
        showNonSaleProducts={showNonSaleProducts}
        setShowNonSaleProducts={setShowNonSaleProducts}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showFeatured={showFeatured}
        setShowFeatured={setShowFeatured}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedCustomLabel={selectedCustomLabel}
        setSelectedCustomLabel={setSelectedCustomLabel}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubcategory={selectedSubcategory}
        setSelectedSubcategory={setSelectedSubcategory}
      />

      <ProductListContainer 
        products={products}
        search={search}
        showSaleProducts={showSaleProducts}
        showNonSaleProducts={showNonSaleProducts}
        selectedBrand={selectedBrand}
        sortBy={sortBy}
        showFeatured={showFeatured}
        selectedStatus={selectedStatus}
        selectedCustomLabel={selectedCustomLabel}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onStatusChange={handleStatusChange}
        onDelete={(id) => deleteProduct.mutate(id)}
        onSuccess={handleSuccess}
      />
    </>
  );
};