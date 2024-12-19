import { useQuery } from "@tanstack/react-query";
import { ProductFilters } from "@/components/admin/product/ProductFilters";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
import { GlobalSaleControls } from "@/components/admin/product/GlobalSaleControls";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProducts } from "@/hooks/useProducts";
import { useDeleteProduct } from "@/hooks/useDeleteProduct";
import { ProductListContainer } from "@/components/admin/product/ProductListContainer";
import { ProductActions } from "@/components/admin/product/ProductActions";
import { ProductStats } from "@/components/admin/product/ProductStats";

const Products = () => {
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
  const [folderSize, setFolderSize] = useState<number>(0);
  const [totalImages, setTotalImages] = useState(0);
  
  const { data: products } = useProducts();
  const deleteProduct = useDeleteProduct();

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

  const handleStatusChange = async (id: string, currentStatus: string | null): Promise<void> => {
    try {
      const newStatus = currentStatus === "published" ? "draft" : "published";
      const { error } = await supabase
        .from("products")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;
      
      // Explicitly return the Promise from fetchTotalImages
      return fetchTotalImages();
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'}`}>
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-bold">Products</h1>
          <ProductStats 
            products={products}
            systemLimits={systemLimits}
            totalImages={totalImages}
            folderSize={folderSize}
          />
        </div>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-4'}`}>
          <BackToDashboard />
          <ProductActions 
            products={products}
            categories={categories || []}
            subcategories={subcategories || []}
            systemLimits={systemLimits}
            folderSize={folderSize}
            setFolderSize={setFolderSize}
            fetchTotalImages={fetchTotalImages}
          />
        </div>
      </div>

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
    </div>
  );
};

export default Products;