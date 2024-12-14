import { supabase } from "@/integrations/supabase/client";

export const getLatestSettings = async () => {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
  return data;
};

export const updateSettings = async (updates: Partial<any>) => {
  const existingSettings = await getLatestSettings();
  
  if (!existingSettings) {
    throw new Error('No existing settings found');
  }

  // Remove lock_check_interval from updates if it's not supported in the database yet
  const { lock_check_interval, ...otherUpdates } = updates;
  
  const { data, error } = await supabase
    .from("settings")
    .upsert({
      ...existingSettings,
      ...otherUpdates,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error updating settings:', error);
    throw error;
  }

  return data;
};