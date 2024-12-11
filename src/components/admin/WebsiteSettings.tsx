import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GeneralSettings } from "./settings/GeneralSettings";
import { ThemeSettings } from "./settings/ThemeSettings";
import { initializeThemeColors } from "@/utils/themeUtils";

export const WebsiteSettings = () => {
  const { data: settings, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      try {
        // First try to get existing settings
        const { data: existingSettings } = await supabase
          .from("settings")
          .select("*")
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(); // Use maybeSingle instead of single to handle no results case
        
        // If settings exist, return them
        if (existingSettings) {
          initializeThemeColors(existingSettings);
          return existingSettings;
        }

        // If no settings exist, create default settings
        const defaultSettings = {
          website_name: "My Website",
          primary_color: "#9b87f5",
          secondary_color: "#7E69AB",
          accent_color: "#6E59A5",
          background_color: "#FFFFFF",
          foreground_color: "#000000",
          clearance_sale_active: false,
          clearance_sale_end_date: null,
          tracking_codes: "",
          whatsapp_number: "" // Required field
        };

        const { data: newSettings, error: insertError } = await supabase
          .from("settings")
          .insert([defaultSettings])
          .select()
          .single();

        if (insertError) throw insertError;

        // Initialize theme colors with new settings
        if (newSettings) {
          initializeThemeColors(newSettings);
        }

        return newSettings;
      } catch (error) {
        console.error("Error in settings query:", error);
        throw error;
      }
    },
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Website Settings</h2>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings settings={settings} refetch={refetch} />
        </TabsContent>

        <TabsContent value="theme">
          <ThemeSettings settings={settings} refetch={refetch} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};