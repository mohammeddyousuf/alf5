import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GlobalSaleControls } from "@/components/admin/product/GlobalSaleControls";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImageManagementDialog } from "@/components/admin/product/ImageManagementDialog";
import { LimitExceededDialog } from "@/components/admin/product/LimitExceededDialog";
import { BulkUploadLimitDialog } from "@/components/admin/product/BulkUploadLimitDialog";
import { handleProductImport, exportProducts } from "@/utils/productImportExport";
import { ProductHeader } from "@/components/admin/product/ProductHeader";
import { useImageManagement } from "@/hooks/useImageManagement";
import { ProductsContainer } from "@/components/admin/product/ProductsContainer";
import { useProducts } from "@/hooks/useProducts";
import { ProductFilters } from "@/components/admin/product/ProductFilters";
import { useQuery } from "@tanstack/react-query";

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { totalImages, folderSize, fetchTotalImages } = useImageManagement();
  const { data: productsData } = useProducts();

  // State for filters
  const [search, setSearch] = useState("");
  const [showSaleProducts, setShowSaleProducts] = useState(true);
  const [showNonSaleProducts, setShowNonSaleProducts] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [showFeatured, setShowFeatured] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCustomLabel, setSelectedCustomLabel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");

  const [showImageManager, setShowImageManager] = useState(false);
  const [showLimitExceeded, setShowLimitExceeded] = useState(false);
  const [showBulkUploadLimit, setShowBulkUploadLimit] = useState(false);
  const [bulkUploadLimitMessage, setBulkUploadLimitMessage] = useState("");

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

  const handleStatusChange = async (id: string, currentStatus: string | null) => {
    const { error } = await supabase
      .from("products")
      .update({ status: currentStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Product status updated successfully",
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Product deleted successfully",
    });
  };

  const handleAddProduct = () => {
    const currentCount = productsData?.length || 0;
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
      const importedCount = await handleProductImport(file, productsData, systemLimits);
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
    exportProducts(productsData);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ProductHeader 
        productsCount={productsData?.length || 0}
        totalImages={totalImages}
        folderSize={folderSize}
        systemLimits={systemLimits}
        onAddProduct={handleAddProduct}
        onImport={handleImport}
        onExport={handleExport}
        onShowImageManager={() => setShowImageManager(true)}
        isMobile={isMobile}
      />

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

      <GlobalSaleControls />

      <ProductsContainer 
        products={productsData}
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
        onDelete={handleDelete}
        onSuccess={async () => {
          await fetchTotalImages();
        }}
      />

      <ImageManagementDialog
        open={showImageManager}
        onOpenChange={setShowImageManager}
        onImageUpload={fetchTotalImages}
        folderSize={folderSize}
      />

      <LimitExceededDialog
        open={showLimitExceeded}
        onOpenChange={setShowLimitExceeded}
        currentCount={productsData?.length || 0}
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
