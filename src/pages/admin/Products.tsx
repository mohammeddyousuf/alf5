import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Download } from "lucide-react";
import ProductCard from "@/components/admin/product/ProductCard";
import ProductFilters from "@/components/admin/product/ProductFilters";

const Products = () => {
  const navigate = useNavigate();

  const { data: products, ...productsQuery } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleDownload = () => {
    // Get the current URL
    const currentUrl = window.location.href;
    
    // Extract the project URL (everything before /admin/products)
    const projectUrl = currentUrl.split('/admin/products')[0];
    
    // Open the project URL in a new tab
    window.open(projectUrl, '_blank');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-4">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Project
          </Button>
          <Button onClick={() => navigate("/admin/products/new")}>
            Add Product
          </Button>
        </div>
      </div>

      <ProductFilters />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Products;