import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ProductFilters } from "@/components/admin/product/ProductFilters";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductList } from "@/components/admin/product/ProductList";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
import { GlobalSaleControls } from "@/components/admin/product/GlobalSaleControls";
import { Download, Upload } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Papa from 'papaparse';
import { useProducts } from "@/hooks/useProducts";

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [showSaleProducts, setShowSaleProducts] = useState(true);
  const [showNonSaleProducts, setShowNonSaleProducts] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  
  const { data: products } = useProducts();

  const { data: systemLimits, isLoading: isLoadingLimits } = useQuery({
    queryKey: ["system-limits"],
    queryFn: async () => {
      const { data: existingLimits, error: fetchError } = await supabase
        .from("system_limits")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (fetchError) {
        console.error("Error fetching limits:", fetchError);
        throw fetchError;
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

  const handleAddProduct = () => {
    if (!systemLimits?.product_limit) {
      toast({
        title: "Error",
        description: "System limits not configured. Please contact super admin.",
        variant: "destructive",
      });
      return;
    }

    if (products && products.length >= systemLimits.product_limit) {
      toast({
        title: "Error",
        description: `Product limit (${systemLimits.product_limit}) reached. Please contact super admin to increase the limit.`,
        variant: "destructive",
      });
      return;
    }

    navigate("/admin/products/new");
  };

  const handleExport = () => {
    if (!products?.length) {
      toast({
        title: "Error",
        description: "No products to export",
        variant: "destructive",
      });
      return;
    }

    const exportData = products.map(product => ({
      name: product.name,
      description: product.description,
      price: product.price,
      sale_price: product.sale_price,
      brand: product.brand,
      custom_label: product.custom_label,
      featured: product.featured,
      status: product.status,
      category_id: product.category_id,
      subcategory_id: product.subcategory_id,
      images: product.images ? product.images.join(';') : '',
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'products.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Products exported successfully",
    });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const products = results.data.map((row: any) => ({
              ...row,
              images: row.images ? row.images.split(';') : [],
              featured: row.featured === 'true',
              price: parseFloat(row.price),
              sale_price: row.sale_price ? parseFloat(row.sale_price) : null,
            }));

            for (const product of products) {
              const { error } = await supabase
                .from("products")
                .insert([product]);
              
              if (error) throw error;
            }

            toast({
              title: "Success",
              description: `${products.length} products imported successfully`,
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'}`}>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your products ({products?.length || 0} of {systemLimits?.product_limit || '...'} allowed)
          </p>
        </div>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-4'}`}>
          <BackToDashboard />
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-2'}`}>
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

      <div className="text-center">
        <GlobalSaleControls />
      </div>

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
      />

      <ProductList 
        search={search}
        showSaleProducts={showSaleProducts}
        showNonSaleProducts={showNonSaleProducts}
        selectedBrand={selectedBrand}
        sortBy={sortBy}
      />
    </div>
  );
};

export default Products;
