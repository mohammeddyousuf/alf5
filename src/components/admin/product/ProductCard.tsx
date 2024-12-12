import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";
import { ProductImage } from "./ProductImage";
import { ProductPrice } from "./ProductPrice";
import { useSettings } from "@/hooks/useSettings";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { Edit, Trash } from "lucide-react";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductCardProps {
  product: Product;
  onStatusChange: (id: string, status: string | null) => void;
  onDelete: (id: string) => void;
  onSuccess: () => void;
}

export function ProductCard({ product, onStatusChange, onDelete }: ProductCardProps) {
  const { data: settings } = useSettings();

  // Check if sale is still valid
  const isSaleValid = () => {
    if (!settings?.clearance_sale_active || !settings?.clearance_sale_end_date) {
      return false;
    }
    const endDate = new Date(settings.clearance_sale_end_date);
    const now = new Date();
    return endDate > now;
  };

  // Show sale price if it exists, is less than regular price, and either:
  // 1. There's no global sale timer (regular product discount)
  // 2. There's a global sale timer and it hasn't expired
  const showSalePrice = product.sale_price && 
    product.sale_price < product.price && 
    (!settings?.clearance_sale_active || isSaleValid());

  // Only show timer if global sale is active and not expired
  const showSaleTimer = settings?.clearance_sale_active && 
    settings?.clearance_sale_end_date && 
    isSaleValid() && 
    showSalePrice;

  return (
    <Card className="overflow-hidden">
      <ProductImage 
        images={product.images} 
        name={product.name}
        salePrice={showSalePrice ? product.sale_price : null}
        price={product.price}
        showSaleTimer={showSaleTimer}
        saleEndDate={settings?.clearance_sale_end_date || null}
      />
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold">{product.name}</h3>
          <Badge variant={product.status === "published" ? "default" : "secondary"}>
            {product.status}
          </Badge>
        </div>

        {product.brand && (
          <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
        )}

        <ProductPrice 
          price={product.price} 
          salePrice={showSalePrice ? product.sale_price : null} 
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(product.id, product.status)}
          >
            {product.status === "published" ? "Unpublish" : "Publish"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={`/admin/products/${product.id}`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product
                  and all associated images.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(product.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}