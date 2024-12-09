import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
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
import { OrderDialog } from "@/components/product/OrderDialog";
import { WhatsAppButton } from "@/components/product/WhatsAppButton";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

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

  const handleOrderSubmit = (formData: any) => {
    const whatsappNumber = settings?.whatsapp_number || "+1234567890";
    
    if (!product) return;
    
    const message = `Product Name: ${formData.productName}
Price: $${formData.productPrice}
Name: ${formData.name}
Email: ${formData.email}
Mobile: ${formData.mobile}
Address: ${formData.address}
Payment Mode: ${formData.paymentMode}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    setOrderDialogOpen(false);
    
    toast({
      title: "Order Placed",
      description: "You will be redirected to WhatsApp to complete your order.",
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
            <BreadcrumbPage>{product?.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {mediaItems?.length > 0 ? (
            <div className="relative group">
              <Carousel className="w-full">
                <CarouselContent>
                  {mediaItems.map((item, index) => (
                    <CarouselItem key={index}>
                      {product?.images?.includes(item) ? (
                        <img
                          src={item}
                          alt={`${product.name} - ${index + 1}`}
                          className="w-full rounded-lg object-cover aspect-square"
                        />
                      ) : (
                        <div className="aspect-square w-full">
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(item)}`}
                            title={`${product?.name} - Video ${index + 1}`}
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
                    <CarouselPrevious />
                    <CarouselNext />
                  </>
                )}
              </Carousel>
            </div>
          ) : (
            <div className="w-full rounded-lg bg-muted aspect-square flex items-center justify-center">
              <p className="text-muted-foreground">No media available</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">{product?.name}</h1>
          
          <div className="space-y-2">
            <p className="text-2xl font-bold text-foreground">
              ${product?.sale_price || product?.price}
            </p>
            {product?.sale_price && (
              <p className="text-lg text-muted-foreground line-through">
                ${product?.price}
              </p>
            )}
          </div>

          {product?.description && (
            <p className="text-muted-foreground">{product.description}</p>
          )}

          <WhatsAppButton onClick={() => setOrderDialogOpen(true)} />

          <OrderDialog
            open={orderDialogOpen}
            onOpenChange={setOrderDialogOpen}
            productName={product?.name || ""}
            productPrice={product?.sale_price || product?.price || 0}
            onSubmit={handleOrderSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
