import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Footer = () => {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();
      if (error) throw error;
      console.log("Footer settings:", data);
      return data;
    },
  });

  const getWhatsAppLink = () => {
    if (!settings?.whatsapp_number) return "#";
    const cleanNumber = settings.whatsapp_number.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}`;
  };

  const formatSocialLink = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Shop</h3>
            <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">
              All Products
            </Link>
            <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">
              New Arrivals
            </Link>
            <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">
              Featured
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Company</h3>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
              About Us
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">
              FAQ
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Legal</h3>
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Connect</h3>
            <a 
              href={getWhatsAppLink()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              WhatsApp
            </a>
            {settings?.instagram_url && (
              <a 
                href={formatSocialLink(settings.instagram_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Instagram
              </a>
            )}
            {settings?.facebook_url && (
              <a 
                href={formatSocialLink(settings.facebook_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Facebook
              </a>
            )}
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {settings?.website_name || "WhatsApp Store"}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};