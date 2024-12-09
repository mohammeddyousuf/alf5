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
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();
      
      if (error) throw error;
      
      // Initialize theme colors when settings are loaded
      if (data) {
        initializeThemeColors(data);
      }
      
      return data;
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