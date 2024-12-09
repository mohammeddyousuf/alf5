import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { updateThemeColor } from "@/utils/themeUtils";
import { supabase } from "@/integrations/supabase/client";

interface ThemeSettingsProps {
  settings: any;
  refetch: () => Promise<any>;
}

export const ThemeSettings = ({ settings, refetch }: ThemeSettingsProps) => {
  const { toast } = useToast();
  const [colors, setColors] = useState({
    primary: "#9b87f5",
    secondary: "#7E69AB",
    accent: "#6E59A5",
    background: "#FFFFFF",
    foreground: "#000000",
  });

  const handleColorChange = async (colorKey: keyof typeof colors, value: string) => {
    setColors(prev => ({ ...prev, [colorKey]: value }));
    updateThemeColor(colorKey, value);
    
    try {
      const { error } = await supabase
        .from('settings')
        .update({ [`${colorKey}_color`]: value })
        .eq('id', settings?.id);

      if (error) throw error;
      await refetch();
      
      toast({
        title: "Theme Updated",
        description: `${colorKey} color has been updated`,
      });
    } catch (error) {
      console.error('Error updating theme color:', error);
      toast({
        title: "Error",
        description: "Failed to update theme color",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="primaryColor">Primary Color</Label>
        <div className="flex gap-2">
          <Input
            id="primaryColor"
            type="color"
            value={colors.primary}
            onChange={(e) => handleColorChange('primary', e.target.value)}
            className="h-10 w-20"
          />
          <Input 
            value={colors.primary}
            onChange={(e) => handleColorChange('primary', e.target.value)}
            placeholder="#000000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="secondaryColor">Secondary Color</Label>
        <div className="flex gap-2">
          <Input
            id="secondaryColor"
            type="color"
            value={colors.secondary}
            onChange={(e) => handleColorChange('secondary', e.target.value)}
            className="h-10 w-20"
          />
          <Input 
            value={colors.secondary}
            onChange={(e) => handleColorChange('secondary', e.target.value)}
            placeholder="#000000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accentColor">Accent Color</Label>
        <div className="flex gap-2">
          <Input
            id="accentColor"
            type="color"
            value={colors.accent}
            onChange={(e) => handleColorChange('accent', e.target.value)}
            className="h-10 w-20"
          />
          <Input 
            value={colors.accent}
            onChange={(e) => handleColorChange('accent', e.target.value)}
            placeholder="#000000"
          />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <Label htmlFor="backgroundColor">Background Color</Label>
        <div className="flex gap-2">
          <Input
            id="backgroundColor"
            type="color"
            value={colors.background}
            onChange={(e) => handleColorChange('background', e.target.value)}
            className="h-10 w-20"
          />
          <Input 
            value={colors.background}
            onChange={(e) => handleColorChange('background', e.target.value)}
            placeholder="#FFFFFF"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="foregroundColor">Text Color</Label>
        <div className="flex gap-2">
          <Input
            id="foregroundColor"
            type="color"
            value={colors.foreground}
            onChange={(e) => handleColorChange('foreground', e.target.value)}
            className="h-10 w-20"
          />
          <Input 
            value={colors.foreground}
            onChange={(e) => handleColorChange('foreground', e.target.value)}
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
};