import { ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

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
        
        <div className="flex flex-1 items-center justify-between md:justify-end">
          <Link to="/" className="md:mr-6 text-2xl font-bold text-whatsapp-dark">
            WhatsApp Store
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm">
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
          
          <div className="ml-4">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};