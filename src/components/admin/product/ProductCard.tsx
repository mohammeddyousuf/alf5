import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductForm } from "./ProductForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { ProductImage } from "./ProductImage";
import { ProductPrice } from "./ProductPrice";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductCardProps {
  product: ProductRow;
  onStatusChange: (id: string, currentStatus: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSuccess: () => void;
}

export function ProductCard({ product, onStatusChange, onDelete, onSuccess }: ProductCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const isSaleValid = () => {
    try {
      if (!settings?.clearance_sale_active) {
        return true;
      }

      if (!settings?.clearance_sale_end_date) {
        return false;
      }

      const endDate = new Date(settings.clearance_sale_end_date);
      const now = new Date();
      return endDate > now;
    } catch (error) {
      console.error("Error in isSaleValid:", error);
      return false;
    }
  };

  const shouldShowSalePrice = () => {
    return product.sale_price && 
      product.sale_price < product.price && 
      (!settings?.clearance_sale_active || isSaleValid());
  };

  const shouldShowDiscountPrice = () => {
    return product.discount_price && 
           product.discount_price < product.price && 
           (!shouldShowSalePrice());
  };

  const shouldShowSaleTimer = () => {
    if (!settings?.clearance_sale_active || !settings?.clearance_sale_end_date) {
      return false;
    }

    if (!product.sale_price || product.sale_price >= product.price) {
      return false;
    }

    return isSaleValid();
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
    <Card key={product.id} className="p-4 flex flex-col h-full">
      <ProductImage 
        images={product.images}
        name={product.name}
        salePrice={shouldShowSalePrice() ? product.sale_price : null}
        discountPrice={shouldShowDiscountPrice() ? product.discount_price : null}
        price={product.price}
        showSaleTimer={shouldShowSaleTimer()}
        saleEndDate={settings?.clearance_sale_end_date || null}
        customLabel={product.custom_label}
      />
      
      <div className="flex-1 flex flex-col min-h-[120px]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold line-clamp-2">{product.name}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStatusChange(product.id, product.status)}
            className="hover:bg-transparent shrink-0 ml-2"
          >
            <Badge
              variant={getStatusBadgeVariant(product.status)}
              className="cursor-pointer"
            >
              {product.status || "draft"}
            </Badge>
          </Button>
        </div>

        <ProductPrice 
          price={product.price}
          discountPrice={shouldShowDiscountPrice() ? product.discount_price : null}
          salePrice={shouldShowSalePrice() ? product.sale_price : null}
        />
      </div>

      <div className="flex gap-2 mt-4">
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
            <ProductForm product={product} onSuccess={onSuccess} />
          </DialogContent>
        </Dialog>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product
                and remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onDelete(product.id);
                  setShowDeleteDialog(false);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}