import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryClient } from "@/lib/react-query";
import { logEnquiry } from "@/utils/enquiryUtils";
import { WhatsAppEnquiryDialog } from "./WhatsAppEnquiryDialog";

export const Footer = () => {
  const navigate = useNavigate();
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      console.log("Footer settings:", data);
      return data;
    },
  });

  const handleWhatsAppClick = () => {
    setIsWhatsAppDialogOpen(true);
  };

  const handleWhatsAppSubmit = async (name: string, mobile: string, email: string) => {
    if (!settings?.whatsapp_number) return;
    
    const message = `Hi am ${name}, just visited ${settings.website_name || 'your website'}. Have few queries. please reply back on ${mobile}, ${email}`;
    
    // Log the enquiry with the new fields
    await logEnquiry(message, name, mobile, email);
    
    // Open WhatsApp with the message
    window.open(
      `https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const formatSocialLink = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  const handleShopClick = (filter: 'all' | 'new' | 'featured') => {
    queryClient.setQueryData(["shop-filters"], {
      showSaleOnly: false,
      showFeaturedOnly: filter === 'featured',
      showNewArrivalsOnly: filter === 'new',
      selectedCategory: null,
      selectedSubcategory: null,
      selectedBrand: null,
      priceRange: [0, 1000],
      sortOrder: "default"
    });

    navigate('/shop', { 
      state: { 
        filter,
        showFeaturedOnly: filter === 'featured',
        showNewArrivalsOnly: filter === 'new' 
      } 
    });
  };

  return (
    <footer className="border-t bg-background">
      <WhatsAppEnquiryDialog
        isOpen={isWhatsAppDialogOpen}
        onClose={() => setIsWhatsAppDialogOpen(false)}
        onSubmit={handleWhatsAppSubmit}
      />
      
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col items-start gap-2">
            <h3 className="text-lg font-semibold">Shop</h3>
            <button 
              onClick={() => handleShopClick('all')}
              className="text-left text-sm text-muted-foreground hover:text-foreground"
            >
              All Products
            </button>
            <button 
              onClick={() => handleShopClick('new')}
              className="text-left text-sm text-muted-foreground hover:text-foreground"
            >
              New Arrivals
            </button>
            <button 
              onClick={() => handleShopClick('featured')}
              className="text-left text-sm text-muted-foreground hover:text-foreground"
            >
              Featured
            </button>
          </div>
          <div className="flex flex-col items-start gap-2">
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
          <div className="flex flex-col items-start gap-2">
            <h3 className="text-lg font-semibold">Legal</h3>
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
          <div className="flex flex-col items-start gap-2">
            <h3 className="text-lg font-semibold">Connect</h3>
            <button 
              onClick={handleWhatsAppClick}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              WhatsApp
            </button>
            {settings?.whatsapp_group_url && (
              <a 
                href={settings.whatsapp_group_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Join WhatsApp Group
              </a>
            )}
            {settings?.social_media_links?.map((link, index) => (
              <a
                key={index}
                href={formatSocialLink(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {settings?.website_name || "WhatsApp Store"}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
