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
  // Convert relative image URLs to absolute URLs
  const getAbsoluteUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const absoluteProductImage = productImage ? getAbsoluteUrl(productImage) : null;

  return (
    <>
      <title>{`${productName} | ${websiteName}`}</title>
      <meta name="description" content={productDescription || `${productName} - Available at ${websiteName}`} />
      
      {/* Facebook Open Graph */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={`${productName} | ${websiteName}`} />
      <meta property="og:description" content={productDescription || `${productName} - Available at ${websiteName}`} />
      {absoluteProductImage && <meta property="og:image" content={absoluteProductImage} />}
      <meta property="product:price:amount" content={String(productPrice)} />
      <meta property="product:price:currency" content="USD" />
      {productBrand && <meta property="product:brand" content={productBrand} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${productName} | ${websiteName}`} />
      <meta name="twitter:description" content={productDescription || `${productName} - Available at ${websiteName}`} />
      {absoluteProductImage && <meta name="twitter:image" content={absoluteProductImage} />}
    </>
  );
}