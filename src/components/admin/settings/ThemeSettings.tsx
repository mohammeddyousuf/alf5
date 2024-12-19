import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { updateThemeColor, initializeThemeColors } from "@/utils/themeUtils";
import { supabase } from "@/integrations/supabase/client";
import { ColorInput } from "./theme/ColorInput";
import { defaultColors } from "./theme/defaultColors";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const ThemeSettings = ({ settings, refetch }: ThemeSettingsProps) => {
  const { toast } = useToast();
  const [colors, setColors] = useState(defaultColors);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (settings) {
      setColors({
        primary: settings.primary_color || defaultColors.primary,
        secondary: settings.secondary_color || defaultColors.secondary,
        accent: settings.accent_color || defaultColors.accent,
        background: settings.background_color || defaultColors.background,
        foreground: settings.foreground_color || defaultColors.foreground,
        sale: settings.sale_color || defaultColors.sale,
        discount: settings.discount_color || defaultColors.discount,
      });
      initializeThemeColors(settings);
    }
  }, [settings]);

  const handleColorChange = async (colorKey: keyof typeof colors, value: string) => {
    if (!settings?.id) {
      console.error('No settings ID found');
      return;
    }

    setColors(prev => ({ ...prev, [colorKey]: value }));
    updateThemeColor(colorKey, value);
    
    try {
      const { error } = await supabase
        .from('settings')
        .update({ [`${colorKey}_color`]: value })
        .eq('id', settings.id);

      if (error) throw error;
      await refetch();
      
      toast({
        title: "Theme Updated",
        description: `${colorKey} color has been updated`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message
      });
    }
  };

  const handleReset = async () => {
    if (!settings?.id) return;
    
    setIsResetting(true);
    try {
      const updates = Object.entries(defaultColors).reduce((acc, [key, value]) => ({
        ...acc,
        [`${key}_color`]: value
      }), {});

      const { error } = await supabase
        .from('settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;

      setColors(defaultColors);
      Object.entries(defaultColors).forEach(([key, value]) => {
        updateThemeColor(key as keyof typeof defaultColors, value);
      });

      await refetch();
      toast({
        title: "Theme Reset",
        description: "Colors have been reset to default values",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={isResetting}
        >
          {isResetting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          Reset to Default Colors
        </Button>
      </div>

      <ColorInput
        label="Primary Color"
        id="primaryColor"
        value={colors.primary}
        onChange={(value) => handleColorChange('primary', value)}
      />

      <ColorInput
        label="Secondary Color"
        id="secondaryColor"
        value={colors.secondary}
        onChange={(value) => handleColorChange('secondary', value)}
      />

      <ColorInput
        label="Accent Color"
        id="accentColor"
        value={colors.accent}
        onChange={(value) => handleColorChange('accent', value)}
      />

      <Separator className="my-4" />

      <ColorInput
        label="Background Color"
        id="backgroundColor"
        value={colors.background}
        onChange={(value) => handleColorChange('background', value)}
      />

      <ColorInput
        label="Text Color"
        id="foregroundColor"
        value={colors.foreground}
        onChange={(value) => handleColorChange('foreground', value)}
      />

      <Separator className="my-4" />

      <ColorInput
        label="Sale Color"
        id="saleColor"
        value={colors.sale}
        onChange={(value) => handleColorChange('sale', value)}
      />

      <ColorInput
        label="Discount Color"
        id="discountColor"
        value={colors.discount}
        onChange={(value) => handleColorChange('discount', value)}
      />
    </div>
  );
};

interface ThemeSettingsProps {
  settings: any;
  refetch: () => Promise<any>;
}