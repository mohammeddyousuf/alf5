import { supabase } from "@/integrations/supabase/client";

interface LocationData {
  city?: string;
  region?: string;
  country_name?: string;
  ip?: string;
}

export const logEnquiry = async (message: string) => {
  try {
    // Fetch location data
    const locationResponse = await fetch('https://ipapi.co/json/');
    const locationData: LocationData = await locationResponse.json();
    
    const { city, region, country_name, ip } = locationData;
    const location = [city, region, country_name].filter(Boolean).join(', ');
    
    // Log the enquiry to Supabase
    const { error } = await supabase
      .from('enquiries')
      .insert({
        message,
        location,
        ip_address: ip,
        source: 'whatsapp_footer',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    
    console.log('Enquiry logged successfully');
  } catch (error) {
    console.error('Error logging enquiry:', error);
  }
};