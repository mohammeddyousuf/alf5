import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ProductFilters } from "@/components/admin/product/ProductFilters";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
import { GlobalSaleControls } from "@/components/admin/product/GlobalSaleControls";
import { Download, Upload, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProducts } from "@/hooks/useProducts";
import { ImageManagementDialog } from "@/components/admin/product/ImageManagementDialog";
import { LimitExceededDialog } from "@/components/admin/product/LimitExceededDialog";
import { BulkUploadLimitDialog } from "@/components/admin/product/BulkUploadLimitDialog";
import { ProductListContainer } from "@/components/admin/product/ProductListContainer";
import { handleProductImport, exportProducts } from "@/utils/productImportExport";

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
  const { data: systemLimits } = useQuery({
    queryKey: ["system-limits"],
    queryFn: async () => {
      const { data: existingLimits, error } = await supabase
        .from("system_limits")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching limits:", error);
        throw error;
      }
      
      if (!existingLimits || existingLimits.length === 0) {
        console.log("No limits found, creating default");
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
          
        if (insertError) {
          console.error("Error creating default limits:", insertError);
          throw insertError;
        }

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

  const [showImageManager, setShowImageManager] = useState(false);
  const [folderSize, setFolderSize] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [showLimitExceeded, setShowLimitExceeded] = useState(false);
  const [totalImages, setTotalImages] = useState(0);
  const [showBulkUploadLimit, setShowBulkUploadLimit] = useState(false);
  const [bulkUploadLimitMessage, setBulkUploadLimitMessage] = useState("");

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

  const calculateFolderSize = async () => {
    const { data, error } = await supabase.storage
      .from("product-images")
      .list();
    
    if (error) {
      console.error("Error fetching folder size:", error);
      return;
    }

    const totalSize = data.reduce((acc, file) => acc + (file.metadata?.size || 0), 0);
    setFolderSize(totalSize);
  };

  useEffect(() => {
    calculateFolderSize();
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

  const handleStatusChange = async (id: string, currentStatus: string | null) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("products")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (error) throw error;
    fetchTotalImages();
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("images")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      if (product?.images && product.images.length > 0) {
        const fileNames = product.images.map(url => {
          const fileName = decodeURIComponent(url.split("/").pop() || "");
          return fileName;
        });

        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove(fileNames);

        if (storageError) {
          console.error("Error deleting images:", storageError);
        }
      }

      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      
      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "Product and associated images deleted successfully",
      });

      fetchTotalImages();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product: " + error.message,
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'}`}>
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-bold">Products</h1>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-1">
            <li>Total Products: {products?.length || 0}/{systemLimits?.product_limit || '...'}</li>
            <li>Total Images: {totalImages}</li>
            {folderSize > 0 && (
              <li>Images Folder Size: {(folderSize / (1024 * 1024)).toFixed(2)} MB / {systemLimits?.max_folder_size_mb || '...'} MB</li>
            )}
          </ul>
        </div>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-4'}`}>
          <BackToDashboard />
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-2'}`}>
            <Button 
              variant="outline" 
              onClick={() => setShowImageManager(true)}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Images
            </Button>
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file">
              <Button variant="outline" className="cursor-pointer w-full" asChild>
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import CSV
                </div>
              </Button>
            </label>
            <Button variant="outline" onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleAddProduct} className="w-full">Add Product</Button>
          </div>
        </div>
      </div>

      <ImageManagementDialog
        open={showImageManager}
        onOpenChange={setShowImageManager}
        onImageUpload={calculateFolderSize}
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
        onDelete={handleDelete}
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
