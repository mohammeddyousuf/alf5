import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ProductFilters } from "@/components/admin/product/ProductFilters";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductList } from "@/components/admin/product/ProductList";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
import { GlobalSaleControls } from "@/components/admin/product/GlobalSaleControls";
import { Download, Upload, FolderOpen, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Papa from 'papaparse';
import { useProducts } from "@/hooks/useProducts";
import { ImageManagementDialog } from "@/components/admin/product/ImageManagementDialog";
import { LimitExceededDialog } from "@/components/admin/product/LimitExceededDialog";

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
          product_limit: 100
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

  const [showImageManager, setShowImageManager] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLimitExceeded, setShowLimitExceeded] = useState(false);

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
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const newProducts = results.data;
            const totalProducts = (products?.length || 0) + newProducts.length;
            
            if (totalProducts > (systemLimits?.product_limit || 100)) {
              toast({
                variant: "destructive",
                title: "Product Limit Exceeded",
                description: `Cannot import ${newProducts.length} products. This would exceed your limit of ${systemLimits?.product_limit} products. Please contact your administrator.`
              });
              return;
            }

            for (const product of newProducts) {
              const { error } = await supabase
                .from("products")
                .insert([product]);
              
              if (error) throw error;
            }

            toast({
              title: "Success",
              description: `${newProducts.length} products imported successfully`,
            });

            window.location.reload();
          } catch (error: any) {
            toast({
              title: "Error",
              description: `Failed to import products: ${error.message}`,
              variant: "destructive",
            });
          }
        },
        error: (error) => {
          toast({
            title: "Error",
            description: `Failed to parse CSV: ${error.message}`,
            variant: "destructive",
          });
        }
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to read file: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const currentCount = products?.length || 0;
      const limit = systemLimits?.product_limit || 100;
      if (currentCount + files.length > limit) {
        setShowLimitExceeded(true);
        return;
      }

      await Promise.all(
        Array.from(files).map(async (file) => {
          const fileName = `product_${Date.now()}_${file.name}`;
          const { error } = await supabase.storage
            .from("product-images")
            .upload(fileName, file, {
              upsert: false
            });

          if (error) throw error;
        })
      );

      toast({
        title: "Success",
        description: "Images uploaded successfully"
      });
      
      await calculateFolderSize();
      setShowImageManager(true); // Keep the dialog open after upload
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleExport = () => {
    if (!products) return;
    
    const csv = Papa.unparse(products);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'products.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'}`}>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Total Products: {products?.length || 0}/{systemLimits?.product_limit || '...'}
          </p>
        </div>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-4'}`}>
          <BackToDashboard />
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-2'}`}>
            <Button 
              variant="outline" 
              onClick={() => setShowImageManager(true)}
              className="w-full"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Images
            </Button>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleBulkUpload}
              className="hidden"
              id="bulk-upload"
            />
            <label htmlFor="bulk-upload">
              <Button variant="outline" className="cursor-pointer w-full" asChild disabled={isUploading}>
                <div className="flex items-center gap-2">
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Bulk Upload
                </div>
              </Button>
            </label>
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
        onImageUpload={() => {}}
        folderSize={0}
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

      <ProductList 
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
      />

      <LimitExceededDialog
        open={showLimitExceeded}
        onOpenChange={setShowLimitExceeded}
        currentCount={products?.length || 0}
        limit={systemLimits?.product_limit || 100}
      />
    </div>
  );
};

export default Products;
