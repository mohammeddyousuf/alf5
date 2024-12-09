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
import { ProductMedia } from "@/components/product/ProductMedia";
import { ProductInfo } from "@/components/product/ProductInfo";

const ProductDetail = () => {
  const { slug } = useParams();
  const { toast } = useToast();

  // Extract the UUID from the slug (matches the full UUID pattern)
  const id = slug?.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0];

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
      if (!id) throw new Error("Product ID not found");
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleOrderSubmit = (formData: any) => {
    const whatsappNumber = settings?.whatsapp_number || "+1234567890";
    
    if (!product) return;
    
    const message = `Product Name: ${formData.productName}
${formData.productBrand ? `Brand: ${formData.productBrand}\n` : ''}Price: $${formData.productPrice}
Name: ${formData.name}
Email: ${formData.email}
Mobile: ${formData.mobile}
Address: ${formData.address}
Payment Mode: ${formData.paymentMode}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    
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
        <ProductMedia
          images={product.images}
          videoUrls={product.video_urls}
          productName={product.name}
          getYouTubeVideoId={getYouTubeVideoId}
        />
        <ProductInfo
          name={product.name}
          brand={product.brand}
          description={product.description}
          price={product.price}
          salePrice={product.sale_price}
          onOrderSubmit={handleOrderSubmit}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
