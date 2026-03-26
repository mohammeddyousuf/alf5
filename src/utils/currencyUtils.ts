import { supabase } from "@/integrations/supabase/db";

let cachedCurrency: { code: string; locale: string } | null = null;

export const getCurrencySettings = () => cachedCurrency || { code: "INR", locale: "en-IN" };

export const loadCurrencySettings = async () => {
  const { data } = await supabase
    .from("settings")
    .select("currency_code, currency_locale")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  cachedCurrency = {
    code: (data as any)?.currency_code || "INR",
    locale: (data as any)?.currency_locale || "en-IN",
  };
  return cachedCurrency;
};

export const formatPrice = (amount: number, settings?: { code: string; locale: string }) => {
  const { code, locale } = settings || getCurrencySettings();
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getCurrencySymbol = (settings?: { code: string; locale: string }) => {
  const { code, locale } = settings || getCurrencySettings();
  const parts = new Intl.NumberFormat(locale, { style: "currency", currency: code }).formatToParts(0);
  return parts.find(p => p.type === "currency")?.value || code;
};
