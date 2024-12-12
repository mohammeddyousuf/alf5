interface ProductPriceProps {
  price: number;
  salePrice: number | null;
}

export function ProductPrice({ price, salePrice }: ProductPriceProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDiscount = (originalPrice: number, discountedPrice: number) => {
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  return (
    <p className="text-sm text-muted-foreground mb-4">
      {salePrice && salePrice < price ? (
        <>
          <span className="text-destructive font-semibold">
            {formatPrice(salePrice)}
          </span>
          <span className="ml-2 line-through">
            {formatPrice(price)}
          </span>
          <span className="ml-2 text-destructive">
            ({calculateDiscount(price, salePrice)}%)
          </span>
        </>
      ) : (
        formatPrice(price)
      )}
    </p>
  );
}