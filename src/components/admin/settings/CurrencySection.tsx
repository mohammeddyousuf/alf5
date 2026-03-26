import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/services/settingsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CURRENCIES = [
  { code: "INR", locale: "en-IN", label: "₹ INR – Indian Rupee" },
  { code: "AED", locale: "en-AE", label: "د.إ AED – UAE Dirham" },
  { code: "USD", locale: "en-US", label: "$ USD – US Dollar" },
  { code: "EUR", locale: "en-DE", label: "€ EUR – Euro" },
  { code: "GBP", locale: "en-GB", label: "£ GBP – British Pound" },
  { code: "SAR", locale: "ar-SA", label: "﷼ SAR – Saudi Riyal" },
  { code: "QAR", locale: "en-QA", label: "﷼ QAR – Qatari Riyal" },
  { code: "OMR", locale: "en-OM", label: "﷼ OMR – Omani Rial" },
  { code: "BHD", locale: "en-BH", label: "BD BHD – Bahraini Dinar" },
  { code: "KWD", locale: "en-KW", label: "KD KWD – Kuwaiti Dinar" },
  { code: "PKR", locale: "en-PK", label: "₨ PKR – Pakistani Rupee" },
  { code: "BDT", locale: "en-BD", label: "৳ BDT – Bangladeshi Taka" },
  { code: "LKR", locale: "en-LK", label: "₨ LKR – Sri Lankan Rupee" },
  { code: "NPR", locale: "en-NP", label: "₨ NPR – Nepalese Rupee" },
  { code: "MYR", locale: "en-MY", label: "RM MYR – Malaysian Ringgit" },
  { code: "SGD", locale: "en-SG", label: "$ SGD – Singapore Dollar" },
  { code: "THB", locale: "th-TH", label: "฿ THB – Thai Baht" },
  { code: "IDR", locale: "id-ID", label: "Rp IDR – Indonesian Rupiah" },
  { code: "PHP", locale: "en-PH", label: "₱ PHP – Philippine Peso" },
  { code: "JPY", locale: "ja-JP", label: "¥ JPY – Japanese Yen" },
  { code: "CNY", locale: "zh-CN", label: "¥ CNY – Chinese Yuan" },
  { code: "KRW", locale: "ko-KR", label: "₩ KRW – South Korean Won" },
  { code: "HKD", locale: "en-HK", label: "$ HKD – Hong Kong Dollar" },
  { code: "TWD", locale: "zh-TW", label: "$ TWD – Taiwan Dollar" },
  { code: "AUD", locale: "en-AU", label: "$ AUD – Australian Dollar" },
  { code: "NZD", locale: "en-NZ", label: "$ NZD – New Zealand Dollar" },
  { code: "CAD", locale: "en-CA", label: "$ CAD – Canadian Dollar" },
  { code: "CHF", locale: "de-CH", label: "CHF – Swiss Franc" },
  { code: "SEK", locale: "sv-SE", label: "kr SEK – Swedish Krona" },
  { code: "NOK", locale: "nb-NO", label: "kr NOK – Norwegian Krone" },
  { code: "DKK", locale: "da-DK", label: "kr DKK – Danish Krone" },
  { code: "PLN", locale: "pl-PL", label: "zł PLN – Polish Zloty" },
  { code: "CZK", locale: "cs-CZ", label: "Kč CZK – Czech Koruna" },
  { code: "HUF", locale: "hu-HU", label: "Ft HUF – Hungarian Forint" },
  { code: "RON", locale: "ro-RO", label: "lei RON – Romanian Leu" },
  { code: "TRY", locale: "tr-TR", label: "₺ TRY – Turkish Lira" },
  { code: "ZAR", locale: "en-ZA", label: "R ZAR – South African Rand" },
  { code: "EGP", locale: "en-EG", label: "E£ EGP – Egyptian Pound" },
  { code: "NGN", locale: "en-NG", label: "₦ NGN – Nigerian Naira" },
  { code: "KES", locale: "en-KE", label: "KSh KES – Kenyan Shilling" },
  { code: "GHS", locale: "en-GH", label: "₵ GHS – Ghanaian Cedi" },
  { code: "BRL", locale: "pt-BR", label: "R$ BRL – Brazilian Real" },
  { code: "MXN", locale: "es-MX", label: "$ MXN – Mexican Peso" },
  { code: "ARS", locale: "es-AR", label: "$ ARS – Argentine Peso" },
  { code: "CLP", locale: "es-CL", label: "$ CLP – Chilean Peso" },
  { code: "COP", locale: "es-CO", label: "$ COP – Colombian Peso" },
  { code: "PEN", locale: "es-PE", label: "S/ PEN – Peruvian Sol" },
  { code: "ILS", locale: "he-IL", label: "₪ ILS – Israeli Shekel" },
  { code: "JOD", locale: "en-JO", label: "JD JOD – Jordanian Dinar" },
  { code: "RUB", locale: "ru-RU", label: "₽ RUB – Russian Ruble" },
  { code: "UAH", locale: "uk-UA", label: "₴ UAH – Ukrainian Hryvnia" },
  { code: "VND", locale: "vi-VN", label: "₫ VND – Vietnamese Dong" },
  { code: "MMK", locale: "my-MM", label: "K MMK – Myanmar Kyat" },
];

interface CurrencySectionProps {
  initialCode: string;
  initialLocale: string;
  refetch: () => Promise<any>;
}

export const CurrencySection = ({ initialCode, initialLocale, refetch }: CurrencySectionProps) => {
  const { toast } = useToast();
  const [code, setCode] = useState(initialCode || "INR");
  const [saving, setSaving] = useState(false);

  const selected = CURRENCIES.find((c) => c.code === code);
  const locale = selected?.locale || "en-US";

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ currency_code: code, currency_locale: locale });
      toast({ title: "Success", description: "Currency updated" });
      await refetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
    setSaving(false);
  };

  let preview = "";
  try {
    preview = new Intl.NumberFormat(locale, { style: "currency", currency: code, maximumFractionDigits: 0 }).format(1999);
  } catch { preview = `${code} 1,999`; }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Currency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={code} onValueChange={setCode}>
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {CURRENCIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">Preview: <span className="font-medium text-foreground">{preview}</span></p>
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Currency"}</Button>
      </CardContent>
    </Card>
  );
};
