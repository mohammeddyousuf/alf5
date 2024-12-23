import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductMedia } from "@/components/product/ProductMedia";
import { ProductInfo } from "@/components/product/ProductInfo";
import { Helmet } from "react-helmet";
import { ProductHead } from "@/components/product/detail/ProductHead";
import { ProductMeta } from "@/components/product/detail/ProductMeta";
import { SimilarProducts } from "@/components/product/SimilarProducts";

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
    if (!settings) return;
    
    if (!product) return;
    
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
  const currentUrl = window.location.href;

  return (
    <>
      <Helmet>
        <ProductMeta
          websiteName={websiteName}
          productName={product.name}
          productDescription={product.description}
          productImage={productImage}
          currentUrl={currentUrl}
          productPrice={productPrice}
          productBrand={product.brand}
        />
      </Helmet>

      <div className="container py-8">
        <ProductHead productName={product.name} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductMedia
            images={product.images}
            videoUrls={product.video_urls}
            productName={product.name}
            getYouTubeVideoId={getYouTubeVideoId}
            salePrice={product.sale_price}
            discountPrice={product.discount_price}
            price={product.price}
            customLabel={product.custom_label}
          />
          <ProductInfo
            name={product.name}
            brand={product.brand}
            description={product.description}
            price={product.price}
            salePrice={product.sale_price}
            discountPrice={product.discount_price}
            productId={product.id}
            onOrderSubmit={handleOrderSubmit}
            whatsappNumber={product.whatsapp_number}
          />
        </div>
      </div>

      <SimilarProducts 
        currentProductId={product.id}
        categoryId={product.category_id}
        brand={product.brand}
      />
    </>
  );
};

export default ProductDetail;