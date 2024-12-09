import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1);
      
      if (error) {
        console.error("Error fetching settings:", error);
        return null;
      }
      
      return data && data.length > 0 ? data[0] : null;
    },
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleWhatsAppClick = () => {
    const whatsappNumber = settings?.whatsapp_number || "+1234567890";
    
    if (!product) return;
    
    const message = `Hi! I'm interested in ${product.name}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    
    toast({
      title: "Opening WhatsApp",
      description: "You will be redirected to WhatsApp to continue the conversation.",
    });
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold text-center">Product not found</h1>
      </div>
    );
  }

  const mediaItems = [
    ...(product.images || []),
    ...(product.video_urls || [])
  ];

  return (
    <div className="container py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link to="/shop" className="transition-colors hover:text-foreground">
              Shop
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {mediaItems.length > 0 ? (
            <div className="relative group">
              <Carousel className="w-full">
                <CarouselContent>
                  {mediaItems.map((item, index) => (
                    <CarouselItem key={index}>
                      {product.images?.includes(item) ? (
                        <img
                          src={item}
                          alt={`${product.name} - ${index + 1}`}
                          className="w-full rounded-lg object-cover aspect-square"
                        />
                      ) : (
                        <div className="aspect-square w-full">
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(item)}`}
                            title={`${product.name} - Video ${index + 1}`}
                            className="w-full h-full rounded-lg"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {mediaItems.length > 1 && (
                  <>
                    <CarouselPrevious className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CarouselNext className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </Carousel>
            </div>
          ) : (
            <div className="w-full rounded-lg bg-gray-100 aspect-square flex items-center justify-center">
              <p className="text-gray-500">No media available</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          
          <div className="space-y-2">
            <p className="text-2xl font-bold text-whatsapp-dark">
              ${product.sale_price || product.price}
            </p>
            {product.sale_price && (
              <p className="text-lg text-gray-500 line-through">
                ${product.price}
              </p>
            )}
          </div>

          {product.description && (
            <p className="text-gray-600">{product.description}</p>
          )}

          <Button
            size="lg"
            className="w-full md:w-auto bg-whatsapp-primary hover:bg-whatsapp-secondary"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Contact on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;