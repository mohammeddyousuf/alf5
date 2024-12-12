interface ProductInfoProps {
  productName: string;
  productBrand: string | null;
  productPrice: number;
}

export function ProductInfo({ productName, productBrand, productPrice }: ProductInfoProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="mb-4 space-y-1">
      <p className="text-sm font-medium text-foreground">Product: {productName}</p>
      {productBrand && (
        <p className="text-sm text-muted-foreground">Brand: {productBrand}</p>
      )}
      <p className="text-sm font-medium text-foreground">Price: {formatPrice(productPrice)}</p>
    </div>
  );
}