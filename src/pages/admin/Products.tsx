import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { ProductForm } from "@/components/admin/product/ProductForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Pencil } from "lucide-react";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export default function Products() {
  const [search, setSearch] = useState("");
  const [showSaleProducts, setShowSaleProducts] = useState(true);
  const [showNonSaleProducts, setShowNonSaleProducts] = useState(true);
  const { toast } = useToast();
  
  const { data: products, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductRow[];
    },
  });

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const isSaleProduct = product.sale_price && product.sale_price < product.price;
    
    if (!showSaleProducts && !showNonSaleProducts) return false;
    if (!showSaleProducts && isSaleProduct) return false;
    if (!showNonSaleProducts && !isSaleProduct) return false;
    
    return matchesSearch;
  });

  const handleDelete = async (id: string) => {
    try {
      // First, get the product's images
      const { data: product } = await supabase
        .from("products")
        .select("images")
        .eq("id", id)
        .single();

      if (product?.images?.length) {
        // Delete images from storage
        const fileNames = product.images.map(url => decodeURIComponent(url.split("/").pop() || ""));
        console.log("Attempting to delete files:", fileNames);
        
        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove(fileNames);

        if (storageError) {
          console.error("Error deleting images from storage:", storageError);
          // Continue with product deletion even if image deletion fails
        }
      }

      // Delete the product from the database
      const { error } = await supabase.from("products").delete().eq("id", id);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Success",
          description: "Product and associated images deleted successfully",
        });
        refetch();
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string | null) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    
    const { error } = await supabase
      .from("products")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Success",
        description: `Product ${newStatus === "published" ? "published" : "moved to draft"}`,
      });
      refetch();
    }
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "archived":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm onSuccess={() => refetch()} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-6">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="sale-filter"
              checked={showSaleProducts}
              onCheckedChange={(checked) => setShowSaleProducts(checked as boolean)}
            />
            <Label htmlFor="sale-filter">Sale Products</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="non-sale-filter"
              checked={showNonSaleProducts}
              onCheckedChange={(checked) => setShowNonSaleProducts(checked as boolean)}
            />
            <Label htmlFor="non-sale-filter">Non-Sale Products</Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts?.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="aspect-square mb-4 overflow-hidden rounded-lg relative">
              {product.images?.[0] ? (
                <>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                  {product.sale_price && product.sale_price < product.price && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="destructive">Sale</Badge>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                  No image
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{product.name}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleStatusChange(product.id, product.status)}
                className="hover:bg-transparent"
              >
                <Badge 
                  variant={getStatusBadgeVariant(product.status)}
                  className="cursor-pointer"
                >
                  {product.status || 'draft'}
                </Badge>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              ${product.price}
              {product.sale_price && product.sale_price < product.price && (
                <span className="ml-2 text-destructive line-through">
                  ${product.sale_price}
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" className="flex-1">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                  </DialogHeader>
                  <ProductForm product={product} onSuccess={() => refetch()} />
                </DialogContent>
              </Dialog>
              <Button 
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(product.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
