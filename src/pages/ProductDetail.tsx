import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();
      
      if (error) {
        console.error("Error fetching settings:", error);
        return null;
      }
      return data;
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
    // Default WhatsApp number if settings are not available
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

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full rounded-lg object-cover aspect-square"
            />
          ) : (
            <div className="w-full rounded-lg bg-gray-100 aspect-square flex items-center justify-center">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} - Image ${index + 2}`}
                  className="w-full rounded-lg object-cover aspect-square"
                />
              ))}
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

          {product.video_urls && product.video_urls.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Product Videos</h2>
              <div className="grid gap-4">
                {product.video_urls.map((url, index) => (
                  <div key={index} className="aspect-video">
                    <iframe
                      src={url}
                      title={`${product.name} - Video ${index + 1}`}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;