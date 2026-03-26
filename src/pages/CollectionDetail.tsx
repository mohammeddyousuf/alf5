import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/db";
import { ProductCard } from "@/components/home/ProductCard";
import { ProductPagination } from "@/components/shop/ProductPagination";
import { Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { useState } from "react";

const PRODUCTS_PER_PAGE = 12;

const CollectionDetail = () => {
  const { slug } = useParams();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: collection, isLoading: isLoadingCollection } = useQuery({
    queryKey: ["collection", slug],
    queryFn: async () => {
      // Try slug first, then fall back to ID lookup
      const { data: bySlug } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      
      if (bySlug) return bySlug;

      const { data: byId, error } = await supabase
        .from("collections")
        .select("*")
        .eq("id", slug)
        .maybeSingle();
      
      if (error) throw error;
      return byId;
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("website_name")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return data;
    },
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["collection-products", slug, collection],
    queryFn: async () => {
      if (!collection) return [];

      // If manual product selection exists, use that exclusively
      if (collection.selected_product_ids?.length > 0) {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("status", "published")
          .in("id", collection.selected_product_ids);
        if (error) throw error;
        return data;
      }

      let query = supabase
        .from("products")
        .select("*")
        .eq("status", "published");

      if (collection.filter_category) query = query.eq("category_id", collection.filter_category);
      if (collection.filter_subcategory) query = query.eq("subcategory_id", collection.filter_subcategory);
      if (collection.filter_brand) query = query.eq("brand", collection.filter_brand);
      if (collection.filter_custom_label) query = query.eq("custom_label", collection.filter_custom_label);
      if (collection.filter_gender_profile) query = query.eq("gender_profile", collection.filter_gender_profile);
      if (collection.filter_occasion) query = query.eq("occasion", collection.filter_occasion);
      if (collection.filter_scent_family) query = query.eq("scent_family", collection.filter_scent_family);
      if (collection.filter_featured) query = query.eq("featured", true);
      if (collection.filter_sale_only) query = query.not("sale_price", "is", null);
      if (collection.filter_price_min != null) query = query.gte("price", collection.filter_price_min);
      if (collection.filter_price_max != null) query = query.lte("price", collection.filter_price_max);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!collection,
  });

  if (isLoadingCollection || isLoadingProducts) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold text-center">Collection not found</h1>
      </div>
    );
  }

  const totalPages = Math.ceil((products?.length || 0) / PRODUCTS_PER_PAGE);
  const paginatedProducts = products?.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const siteName = settings?.website_name || "Our Store";
  const seoTitle = collection.seo_title || collection.name;
  const pageTitle = `${seoTitle} | ${siteName}`;
  const pageDescription = collection.description || `${seoTitle} - Browse our curated collection at ${siteName}`;
  const currentUrl = window.location.href;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={currentUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:site_name" content={siteName} />
        {collection.image_url && <meta property="og:image" content={collection.image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {collection.image_url && <meta name="twitter:image" content={collection.image_url} />}
      </Helmet>

      <div className="container py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{seoTitle}</h1>
          {collection.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{collection.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedProducts?.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              salePrice={product.sale_price}
              discountPrice={product.discount_price}
              imageUrl={product.images?.[0]}
              brand={product.brand}
              customLabel={product.custom_label}
              priceNote={(product as any).price_note}
              stockStatus={(product as any).stock_status}
            />
          ))}
        </div>

        {paginatedProducts?.length === 0 && (
          <p className="text-center text-muted-foreground">
            No products found in this collection.
          </p>
        )}

        {totalPages > 1 && (
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </>
  );
};

export default CollectionDetail;
