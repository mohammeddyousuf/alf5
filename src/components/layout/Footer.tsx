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
      return data;
    },
  });

  const createWhatsAppUrl = () => {
    const websiteName = settings?.website_name || "your website";
    const message = encodeURIComponent(`Hi, Just visited ${websiteName}.`);
    const phoneNumber = settings?.whatsapp_number;
    return `https://wa.me/${phoneNumber}?text=${message}`;
  };

  return (
    <footer className="bg-background text-foreground py-12 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={createWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={settings?.whatsapp_group_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Join WhatsApp Group
                </a>
              </li>
              <li>
                <a
                  href={settings?.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={settings?.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Us</h3>
            <p className="text-muted-foreground">
              We are committed to providing the best service to our customers.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <p className="text-muted-foreground">Email: support@example.com</p>
            <p className="text-muted-foreground">Phone: +1234567890</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={settings?.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href={settings?.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
