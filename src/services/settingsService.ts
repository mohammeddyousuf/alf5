import { supabase } from "@/integrations/supabase/client";

export const getLatestSettings = async () => {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const updateSettings = async (updates: Partial<any>) => {
  const existingSettings = await getLatestSettings();
  
  const { error } = await supabase
    .from("settings")
    .upsert({
      ...existingSettings,
      ...updates,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
};