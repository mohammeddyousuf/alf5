import { Product } from "@/types/product";

interface FilterParams {
  products: Product[] | undefined;
  searchQuery: string;
  priceRange: [number, number];
  showSaleOnly: boolean;
  selectedBrand: string | null;
  settings: any;
}

export const useFilteredProducts = ({
  products,
  searchQuery,
  priceRange,
  showSaleOnly,
  selectedBrand,
  settings,
}: FilterParams) => {
  const isSaleValid = () => {
    if (!settings?.clearance_sale_active || !settings?.clearance_sale_end_date) {
      return true;
    }
    const endDate = new Date(settings.clearance_sale_end_date);
    const now = new Date();
    return endDate > now;
  };

  const isProductOnSale = (product: Product) => {
    return (
      product.sale_price &&
      product.sale_price < product.price &&
      (!settings?.clearance_sale_active || isSaleValid())
    );
  };

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.brand?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.custom_label?.toLowerCase().includes(searchQuery.toLowerCase()));

    const price = isProductOnSale(product) ? product.sale_price! : product.price;
    const meetsPrice =
      priceRange[0] === 0 && priceRange[1] === 0
        ? true
        : price >= priceRange[0] &&
          (priceRange[1] === 0 ? true : price <= priceRange[1]);

    const meetsSale = showSaleOnly ? isProductOnSale(product) : true;
    const meetsBrand = selectedBrand ? product.brand === selectedBrand : true;

    return matchesSearch && meetsPrice && meetsSale && meetsBrand;
  });

  return { filteredProducts, isProductOnSale };
};