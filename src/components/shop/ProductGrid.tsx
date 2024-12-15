import { ProductCard } from "@/components/home/ProductCard";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  images: string[];
  brand: string | null;
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const navigate = useNavigate();

  if (!products || products.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No products available at the moment.
      </p>
    );
  }

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div 
          key={product.id}
          onClick={() => handleProductClick(product.id)}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <ProductCard
            id={product.id}
            name={product.name}
            price={product.price}
            salePrice={product.sale_price}
            imageUrl={product.images?.[0]}
            brand={product.brand}
          />
        </div>
      ))}
    </div>
  );
}