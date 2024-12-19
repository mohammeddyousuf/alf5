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
import { useQuery } from "@tanstack/react-query";

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { totalImages, folderSize, fetchTotalImages } = useImageManagement();

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

      <ProductsContainer onSuccess={async () => {
        await fetchTotalImages();
      }} />

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