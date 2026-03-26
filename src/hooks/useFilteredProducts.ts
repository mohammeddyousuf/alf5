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
  selectedGenderProfiles: string[];
  selectedOccasions: string[];
  selectedScentFamilies: string[];
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
  selectedGenderProfiles,
  selectedOccasions,
  selectedScentFamilies,
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
    if (searches.length === 0) return true;
    if (!field) return false;
    const fieldNotes = field.toLowerCase().split(',').map(n => n.trim());
    return searches.some(s => fieldNotes.some(fn => fn.includes(s.toLowerCase())));
  };

  const fieldMatchesAny = (field: string | null | undefined, searches: string[]) => {
    if (searches.length === 0) return true;
    if (!field) return false;
    return searches.some(s => field.toLowerCase().trim() === s.toLowerCase().trim());
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
      (product.base_notes?.toLowerCase().includes(normalizedQuery)) ||
      (product.gender_profile?.toLowerCase().includes(normalizedQuery)) ||
      (product.occasion?.toLowerCase().includes(normalizedQuery)) ||
      (product.scent_family?.toLowerCase().includes(normalizedQuery));

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
    const meetsGender = fieldMatchesAny(product.gender_profile, selectedGenderProfiles);
    const meetsOccasion = fieldMatchesAny(product.occasion, selectedOccasions);
    const meetsScentFamily = fieldMatchesAny(product.scent_family, selectedScentFamilies);

    return matchesSearch && meetsPrice && meetsSale && meetsDiscount && meetsBrand && meetsLabel && meetsTopNote && meetsHeartNote && meetsBaseNote && meetsGender && meetsOccasion && meetsScentFamily;
  });

  return { filteredProducts, isProductOnSale };
};
