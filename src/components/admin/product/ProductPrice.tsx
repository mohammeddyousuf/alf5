interface ProductPriceProps {
  price: number;
  discountPrice: number | null;
  salePrice: number | null;
}

export function ProductPrice({ price, discountPrice, salePrice }: ProductPriceProps) {
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

  // First check for sale price, then discount price
  const effectivePrice = salePrice && salePrice < price ? salePrice : 
                        discountPrice && discountPrice < price ? discountPrice : 
                        price;
  
  const showDiscountedPrice = (salePrice && salePrice < price) || (discountPrice && discountPrice < price);

  return (
    <p className="text-sm text-muted-foreground mb-4">
      {showDiscountedPrice ? (
        <>
          <span className="text-destructive font-semibold">
            {formatPrice(effectivePrice)}
          </span>
          <span className="ml-2 line-through">
            {formatPrice(price)}
          </span>
          <span className="ml-2 text-destructive">
            ({calculateDiscount(price, effectivePrice)}%)
          </span>
        </>
      ) : (
        formatPrice(price)
      )}
    </p>
  );
}