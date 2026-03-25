import { ProductCard } from "@/components/home/ProductCard";
import { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No products available at the moment.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          salePrice={product.sale_price}
          discountPrice={product.discount_price}
          imageUrl={product.images?.[0]}
          brand={product.brand}
          customLabel={product.custom_label}
          priceNote={(product as any).price_note}
        />
      ))}
    </div>
  );
}