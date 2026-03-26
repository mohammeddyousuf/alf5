import { useQuery } from "@tanstack/react-query";
import { loadCurrencySettings, formatPrice as fp, getCurrencySymbol as gs } from "@/utils/currencyUtils";

export const useCurrency = () => {
  const { data: currency } = useQuery({
    queryKey: ["currency-settings"],
    queryFn: loadCurrencySettings,
    staleTime: 1000 * 60 * 10,
  });

  const formatPrice = (amount: number) => fp(amount, currency);
  const currencySymbol = gs(currency);
  const currencyCode = currency?.code || "INR";

  return { formatPrice, currencySymbol, currencyCode };
};
