import { WhatsAppButton } from "@/components/product/WhatsAppButton";
import { OrderDialog } from "@/components/product/OrderDialog";
import { useState } from "react";

interface ProductInfoProps {
  name: string;
  brand: string | null;
  description: string | null;
  price: number;
  salePrice: number | null;
  onOrderSubmit: (formData: any) => void;
}

export function ProductInfo({ 
  name, 
  brand,
  description, 
  price, 
  salePrice,
  onOrderSubmit 
}: ProductInfoProps) {
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{name}</h1>
      
      {brand && (
        <p className="text-lg text-muted-foreground">{brand}</p>
      )}
      
      <div className="space-y-2">
        <p className="text-2xl font-bold text-foreground">
          ${salePrice || price}
        </p>
        {salePrice && (
          <p className="text-lg text-muted-foreground line-through">
            ${price}
          </p>
        )}
      </div>

      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}

      <WhatsAppButton onClick={() => setOrderDialogOpen(true)} />

      <OrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        productName={name}
        productBrand={brand}
        productPrice={salePrice || price}
        onSubmit={onOrderSubmit}
      />
    </div>
  );
}