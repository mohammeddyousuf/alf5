import { Product } from "@/types/product";

interface FilterParams {
  products: Product[] | undefined;
  searchQuery: string;
  priceRange: [number, number];
  showSaleOnly: boolean;
  showDiscountOnly: boolean;
  selectedBrand: string | null;
  selectedLabel: string | null;
  selectedTopNotes: string[];
  selectedHeartNotes: string[];
  selectedBaseNotes: string[];
  settings: any;
}

export const useFilteredProducts = ({
  products,
  searchQuery,
  priceRange,
  showSaleOnly,
  showDiscountOnly,
  selectedBrand,
  selectedLabel,
  selectedTopNotes,
  selectedHeartNotes,
  selectedBaseNotes,
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

  const hasDiscount = (product: Product) => {
    return product.discount_price && product.discount_price < product.price;
  };

  const noteContainsAny = (field: string | null | undefined, searches: string[]) => {
    if (!field || searches.length === 0) return true;
    const fieldNotes = field.toLowerCase().split(',').map(n => n.trim());
    return searches.some(s => fieldNotes.some(fn => fn.includes(s.toLowerCase())));
  };

  const filteredProducts = products?.filter((product) => {
    const normalizedQuery = searchQuery.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(normalizedQuery) ||
      (product.description?.toLowerCase().includes(normalizedQuery)) ||
      (product.brand?.toLowerCase().includes(normalizedQuery)) ||
      (product.custom_label?.toLowerCase().includes(normalizedQuery)) ||
      (product.top_notes?.toLowerCase().includes(normalizedQuery)) ||
      (product.heart_notes?.toLowerCase().includes(normalizedQuery)) ||
      (product.base_notes?.toLowerCase().includes(normalizedQuery));

    const price = isProductOnSale(product) ? product.sale_price! : product.price;
    const meetsPrice =
      priceRange[0] === 0 && priceRange[1] === 0
        ? true
        : price >= priceRange[0] &&
          (priceRange[1] === 0 ? true : price <= priceRange[1]);

    const meetsSale = showSaleOnly ? isProductOnSale(product) : true;
    const meetsDiscount = showDiscountOnly ? hasDiscount(product) : true;
    const meetsBrand = selectedBrand ? product.brand === selectedBrand : true;
    const meetsLabel = selectedLabel ? product.custom_label === selectedLabel : true;
    const meetsTopNote = noteContainsAny(product.top_notes, selectedTopNotes);
    const meetsHeartNote = noteContainsAny(product.heart_notes, selectedHeartNotes);
    const meetsBaseNote = noteContainsAny(product.base_notes, selectedBaseNotes);

    return matchesSearch && meetsPrice && meetsSale && meetsDiscount && meetsBrand && meetsLabel && meetsTopNote && meetsHeartNote && meetsBaseNote;
  });

  return { filteredProducts, isProductOnSale };
};