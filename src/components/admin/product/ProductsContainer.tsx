import { useState } from "react";
import { ProductList } from "./ProductList";
import { ProductPagination } from "@/components/shop/ProductPagination";
import { Database } from "@/integrations/supabase/types";
import { useDeleteProduct } from "@/hooks/useDeleteProduct";
import { useProductManagement } from "@/hooks/useProductManagement";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductsContainerProps {
  products: ProductRow[] | undefined;
  search: string;
  showSaleProducts: boolean;
  showNonSaleProducts: boolean;
  selectedBrand: string;
  sortBy: string;
  showFeatured: boolean;
  selectedStatus: string;
  selectedCustomLabel: string;
  selectedCategory: string;
  selectedSubcategory: string;
  onStatusChange: (id: string, currentStatus: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSuccess: () => Promise<void>;
}

export const ProductsContainer = ({
  products,
  search,
  showSaleProducts,
  showNonSaleProducts,
  selectedBrand,
  sortBy,
  showFeatured,
  selectedStatus,
  selectedCustomLabel,
  selectedCategory,
  selectedSubcategory,
  onStatusChange,
  onDelete,
  onSuccess
}: ProductsContainerProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const filteredProducts = products?.filter((product: ProductRow) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.description?.toLowerCase().includes(search.toLowerCase())) ||
      (product.brand?.toLowerCase().includes(search.toLowerCase())) ||
      (product.custom_label?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
    const matchesCustomLabel = selectedCustomLabel === 'all' || product.custom_label === selectedCustomLabel;
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSubcategory = selectedSubcategory === 'all' || product.subcategory_id === selectedSubcategory;
    const matchesFeatured = !showFeatured || product.featured;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;

    return matchesSearch && 
           matchesBrand && 
           matchesCustomLabel && 
           matchesCategory && 
           matchesSubcategory && 
           matchesFeatured && 
           matchesStatus;
  });

  const sortProducts = (products: ProductRow[]) => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'sale-price-asc':
          return (a.sale_price || a.price) - (b.sale_price || b.price);
        case 'sale-price-desc':
          return (b.sale_price || b.price) - (a.sale_price || a.price);
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  };

  const sortedProducts = sortProducts(filteredProducts || []);
  
  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const deleteProduct = useDeleteProduct();
  const { handleStatusChange } = useProductManagement(onSuccess);

  return (
    <div className="space-y-6">
      <ProductList
        products={currentProducts}
        showSaleProducts={showSaleProducts}
        showNonSaleProducts={showNonSaleProducts}
        onStatusChange={handleStatusChange}
        onDelete={onDelete}
        onSuccess={onSuccess}
      />
      
      {totalPages > 1 && (
        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};