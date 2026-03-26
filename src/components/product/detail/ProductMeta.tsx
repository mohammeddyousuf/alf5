import { useCurrency } from "@/hooks/useCurrency";

interface ProductMetaProps {
  websiteName: string;
  productName: string;
  productDescription: string | null;
  productImage: string | null;
  currentUrl: string;
  productPrice: number;
  productBrand: string | null;
}

export function ProductMeta({
  websiteName,
  productName,
  productDescription,
  productImage,
  currentUrl,
  productPrice,
  productBrand,
}: ProductMetaProps) {
  const { currencyCode } = useCurrency();
  // Convert relative image URLs to absolute URLs
  const getAbsoluteUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Ensure we use the full domain for the image URL
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const absoluteProductImage = productImage ? getAbsoluteUrl(productImage) : null;

  return (
    <>
      <title>{`${productName} | ${websiteName}`}</title>
      <meta name="description" content={productDescription || `${productName} - Available at ${websiteName}`} />
      
      {/* WhatsApp and Facebook Open Graph */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={`${productName} | ${websiteName}`} />
      <meta property="og:description" content={productDescription || `${productName} - Available at ${websiteName}`} />
      {absoluteProductImage && <meta property="og:image" content={absoluteProductImage} />}
      {absoluteProductImage && <meta property="og:image:secure_url" content={absoluteProductImage} />}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="product:price:amount" content={String(productPrice)} />
      <meta property="product:price:currency" content={currencyCode} />
      {productBrand && <meta property="product:brand" content={productBrand} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${productName} | ${websiteName}`} />
      <meta name="twitter:description" content={productDescription || `${productName} - Available at ${websiteName}`} />
      {absoluteProductImage && <meta name="twitter:image" content={absoluteProductImage} />}
    </>
  );
}