import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GlobalSaleControls } from "@/components/admin/product/GlobalSaleControls";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProducts } from "@/hooks/useProducts";
import { ImageManagementDialog } from "@/components/admin/product/ImageManagementDialog";
import { LimitExceededDialog } from "@/components/admin/product/LimitExceededDialog";
import { BulkUploadLimitDialog } from "@/components/admin/product/BulkUploadLimitDialog";
import { ProductListContainer } from "@/components/admin/product/ProductListContainer";
import { handleProductImport, exportProducts } from "@/utils/productImportExport";
import { useDeleteProduct } from "@/hooks/useDeleteProduct";
import { ProductFilters } from "@/components/admin/product/ProductFilters";
import { ProductHeader } from "@/components/admin/product/ProductHeader";
import { useProductManagement } from "@/hooks/useProductManagement";

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
  
  const { data: products } = useProducts();
  const deleteProduct = useDeleteProduct();

  const [showImageManager, setShowImageManager] = useState(false);
  const [folderSize, setFolderSize] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [showLimitExceeded, setShowLimitExceeded] = useState(false);
  const [totalImages, setTotalImages] = useState(0);
  const [showBulkUploadLimit, setShowBulkUploadLimit] = useState(false);
  const [bulkUploadLimitMessage, setBulkUploadLimitMessage] = useState("");

  const { handleStatusChange } = useProductManagement(fetchTotalImages);

  const { data: systemLimits } = useQuery({
    queryKey: ["system-limits"],
    queryFn: async () => {
      const { data: existingLimits, error } = await supabase
        .from("system_limits")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (!existingLimits || existingLimits.length === 0) {
        const defaultLimit = {
          product_limit: 100,
          max_image_size_mb: 5,
          max_folder_size_mb: 500
        };
        
        const { data: insertedData, error: insertError } = await supabase
          .from("system_limits")
          .insert([defaultLimit])
          .select()
          .single();
          
        if (insertError) throw insertError;
        return insertedData;
      }
      
      return existingLimits[0];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
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
    queryKey: ["admin-subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const fetchTotalImages = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("product-images")
        .list();
      
      if (error) {
        console.error("Error fetching images:", error);
        return;
      }

      setTotalImages(data.length);
      
      const totalSize = data.reduce((acc, file) => acc + (file.metadata?.size || 0), 0);
      setFolderSize(totalSize);
    } catch (error) {
      console.error("Error in fetchTotalImages:", error);
    }
  };

  useEffect(() => {
    fetchTotalImages();
  }, []);

  const handleAddProduct = () => {
    const currentCount = products?.length || 0;
    const limit = systemLimits?.product_limit || 100;
    if (currentCount >= limit) {
      setShowLimitExceeded(true);
      return;
    }
    navigate("/admin/products/new");
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedCount = await handleProductImport(file, products, systemLimits);
      toast({
        title: "Success",
        description: `${importedCount} products imported/updated successfully`,
      });
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    exportProducts(products, categories, subcategories);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ProductHeader 
        productsCount={products?.length || 0}
        totalImages={totalImages}
        folderSize={folderSize}
        systemLimits={systemLimits}
        onAddProduct={handleAddProduct}
        onImport={handleImport}
        onExport={handleExport}
        onShowImageManager={() => setShowImageManager(true)}
        isMobile={isMobile}
      />

      <ImageManagementDialog
        open={showImageManager}
        onOpenChange={setShowImageManager}
        onImageUpload={fetchTotalImages}
        folderSize={folderSize}
      />

      <GlobalSaleControls />

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
        onSuccess={fetchTotalImages}
      />

      <LimitExceededDialog
        open={showLimitExceeded}
        onOpenChange={setShowLimitExceeded}
        currentCount={products?.length || 0}
        limit={systemLimits?.product_limit || 100}
      />

      <BulkUploadLimitDialog
        open={showBulkUploadLimit}
        onOpenChange={setShowBulkUploadLimit}
        message={bulkUploadLimitMessage}
      />
    </div>
  );
};

export default Products;