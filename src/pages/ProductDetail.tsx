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
import { Helmet } from "react-helmet";

const ProductDetail = () => {
  const { slug } = useParams();
  const { toast } = useToast();

  // Extract the short ID from the slug (last part after the last dash)
  const shortId = slug?.split('-').pop()?.substring(0, 8);

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
    queryKey: ["product", shortId],
    queryFn: async () => {
      if (!shortId) throw new Error("Product ID not found");
      
      const { data, error } = await supabase
        .from("products")
        .select("*");
      
      if (error) throw error;
      
      const matchingProduct = data?.find(p => p.id.startsWith(shortId));
      if (!matchingProduct) throw new Error("Product not found");
      
      return matchingProduct;
    },
    enabled: !!shortId,
  });

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleOrderSubmit = (formData: any) => {
    const whatsappNumber = settings?.whatsapp_number || "+1234567890";
    const websiteName = settings?.website_name || "Our Store";
    
    if (!product) return;
    
    const message = `*${websiteName}*

*Order Details:*
Product: ${formData.productName}
${formData.productBrand ? `Brand: ${formData.productBrand}\n` : ''}Price: $${formData.productPrice}

*Customer Details:*
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

  const websiteName = settings?.website_name || "Our Store";
  const productImage = product.images && product.images.length > 0 ? product.images[0] : null;
  const productPrice = product.sale_price || product.price;

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{`${product?.name} | ${settings?.website_name || 'Our Store'}`}</title>
        <meta name="description" content={product?.description || `${product?.name} - ${settings?.website_name || 'Our Store'}`} />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={`${product?.name} | ${settings?.website_name || 'Our Store'}`} />
        <meta property="og:description" content={product?.description || `${product?.name} - ${settings?.website_name || 'Our Store'}`} />
        {product?.images?.[0] && <meta property="og:image" content={product.images[0]} />}
        <meta property="og:type" content="product" />
        <meta property="og:price:amount" content={String(product?.sale_price || product?.price)} />
        <meta property="og:price:currency" content="USD" />
        {product?.brand && <meta property="og:brand" content={product.brand} />}

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product?.name} | ${settings?.website_name || 'Our Store'}`} />
        <meta name="twitter:description" content={product?.description || `${product?.name} - ${settings?.website_name || 'Our Store'}`} />
        {product?.images?.[0] && <meta name="twitter:image" content={product.images[0]} />}
      </Helmet>

      <div className="container py-8">
        <div className="mb-6">
          <Breadcrumb>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductMedia
            images={product?.images}
            videoUrls={product?.video_urls}
            productName={product?.name}
            getYouTubeVideoId={getYouTubeVideoId}
            salePrice={product?.sale_price}
          />
          <ProductInfo
            name={product?.name || ''}
            brand={product?.brand}
            description={product?.description}
            price={product?.price || 0}
            salePrice={product?.sale_price}
            onOrderSubmit={handleOrderSubmit}
          />
        </div>
      </div>
    </>
  );
};

export default ProductDetail;