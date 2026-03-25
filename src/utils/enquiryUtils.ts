import { supabase } from "@/integrations/supabase/db";

interface LocationData {
  city?: string;
  region?: string;
  country_name?: string;
  ip?: string;
}

export const logEnquiry = async (
  message: string,
  name?: string | null,
  mobile?: string | null,
  email?: string | null
) => {
  try {
    // Fetch location data
    const locationResponse = await fetch('https://ipapi.co/json/');
    const locationData: LocationData = await locationResponse.json();
    
    const { city, region, country_name, ip } = locationData;
    const location = [city, region, country_name].filter(Boolean).join(', ');
    
    // Log the enquiry to Supabase with the new fields
    const { error } = await supabase
      .from('enquiries')
      .insert({
        name,
        email,
        mobile,
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