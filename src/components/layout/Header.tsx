import { ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4">
              <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-semibold">
                Home
              </Link>
              <Link to="/shop" onClick={() => setIsOpen(false)} className="text-lg font-semibold">
                Shop
              </Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className="text-lg font-semibold">
                About
              </Link>
              <Link to="/contact" onClick={() => setIsOpen(false)} className="text-lg font-semibold">
                Contact
              </Link>
              <Link to="/faq" onClick={() => setIsOpen(false)} className="text-lg font-semibold">
                FAQ
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        
        <nav className="hidden md:flex items-center gap-6 text-sm mr-8">
          <Link to="/" className="font-medium transition-colors hover:text-whatsapp-primary">
            Home
          </Link>
          <Link to="/shop" className="font-medium transition-colors hover:text-whatsapp-primary">
            Shop
          </Link>
          <Link to="/about" className="font-medium transition-colors hover:text-whatsapp-primary">
            About
          </Link>
          <Link to="/contact" className="font-medium transition-colors hover:text-whatsapp-primary">
            Contact
          </Link>
          <Link to="/faq" className="font-medium transition-colors hover:text-whatsapp-primary">
            FAQ
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 mx-auto md:mx-0"
          >
            {settings?.logo_url && (
              <img 
                src={settings.logo_url} 
                alt="Logo" 
                className="h-8 w-auto"
              />
            )}
            <span className="text-xl md:text-2xl font-bold text-whatsapp-dark truncate max-w-[200px] md:max-w-none">
              {settings?.website_name || "WhatsApp Store"}
            </span>
          </Link>
          
          <div className="flex items-center">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};