import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/services/settingsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COMMON_CURRENCIES = [
  { code: "INR", locale: "en-IN", label: "₹ INR (Indian Rupee)" },
  { code: "AED", locale: "en-AE", label: "AED (UAE Dirham)" },
  { code: "USD", locale: "en-US", label: "$ USD (US Dollar)" },
  { code: "EUR", locale: "en-DE", label: "€ EUR (Euro)" },
  { code: "GBP", locale: "en-GB", label: "£ GBP (British Pound)" },
  { code: "SAR", locale: "ar-SA", label: "SAR (Saudi Riyal)" },
];

interface CurrencySectionProps {
  initialCode: string;
  initialLocale: string;
  refetch: () => Promise<any>;
}

export const CurrencySection = ({ initialCode, initialLocale, refetch }: CurrencySectionProps) => {
  const { toast } = useToast();
  const [code, setCode] = useState(initialCode || "INR");
  const [locale, setLocale] = useState(initialLocale || "en-IN");
  const [saving, setSaving] = useState(false);

  const handlePreset = (preset: typeof COMMON_CURRENCIES[0]) => {
    setCode(preset.code);
    setLocale(preset.locale);
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Currency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {COMMON_CURRENCIES.map((c) => (
            <Button
              key={c.code}
              variant={code === c.code ? "default" : "outline"}
              size="sm"
              onClick={() => handlePreset(c)}
            >
              {c.label}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Currency Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="INR" />
          </div>
          <div>
            <Label>Locale</Label>
            <Input value={locale} onChange={(e) => setLocale(e.target.value)} placeholder="en-IN" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Preview: {new Intl.NumberFormat(locale, { style: "currency", currency: code || "INR", maximumFractionDigits: 0 }).format(1999)}
        </p>
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Currency"}</Button>
      </CardContent>
    </Card>
  );
};
