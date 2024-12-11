import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductForm } from "./ProductForm";
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

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductCardProps {
  product: ProductRow;
  onStatusChange: (id: string, currentStatus: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSuccess: () => void;
}

export function ProductCard({ product, onStatusChange, onDelete, onSuccess }: ProductCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDiscount = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
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
                <Badge variant="destructive">SALE</Badge>
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
          onClick={() => onStatusChange(product.id, product.status)}
          className="hover:bg-transparent"
        >
          <Badge
            variant={getStatusBadgeVariant(product.status)}
            className="cursor-pointer"
          >
            {product.status || "draft"}
          </Badge>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {product.sale_price && product.sale_price < product.price ? (
          <>
            <span className="text-destructive font-semibold">
              {formatPrice(product.sale_price)}
            </span>
            <span className="ml-2 line-through">
              {formatPrice(product.price)}
            </span>
            <span className="ml-2 text-destructive">
              (-{calculateDiscount(product.price, product.sale_price)}%)
            </span>
          </>
        ) : (
          formatPrice(product.price)
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
