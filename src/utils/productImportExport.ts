import Papa from 'papaparse';
import { supabase } from "@/integrations/supabase/client";
import { ProductsRow, ProductsInsert } from "@/integrations/supabase/types/products";

interface CSVProduct {
  id?: string;
  name: string;
  description?: string | null;
  price: string | number;
  sale_price?: string | number | null;
  discount_price?: string | number | null;
  images?: string | string[] | null;
  status?: "draft" | "published" | "archived" | null;
  featured?: boolean | string | null;
  brand?: string | null;
  custom_label?: string | null;
  category?: string | null;
  subcategory?: string | null;
}

const convertToBoolean = (value: string | boolean | null | undefined): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
};

const convertToNumber = (value: string | number | null | undefined): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim()) {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
  return null;
};

const processImages = (images: string | string[] | null | undefined): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    try {
      if (images.startsWith('[')) {
        return JSON.parse(images);
      }
      return images.split(',').map(img => img.trim()).filter(Boolean);
    } catch (e) {
      console.error('Error processing images:', e);
      return [];
    }
  }
  return [];
};

export const handleProductImport = async (
  file: File,
  currentProducts: ProductsRow[] | undefined,
  systemLimits: any
) => {
  return new Promise<number>((resolve, reject) => {
    Papa.parse<CSVProduct>(file, {
      header: true,
      complete: async (results) => {
        try {
          const validProducts = results.data.filter(product => 
            product && 
            typeof product === 'object' && 
            product.name && 
            product.name.trim()
          );

          const totalProducts = (currentProducts?.length || 0) + validProducts.length;

          if (totalProducts > (systemLimits?.product_limit || 100)) {
            reject(new Error(`Cannot import ${validProducts.length} products. This would exceed your limit of ${systemLimits?.product_limit} products.`));
            return;
          }

          // Fetch categories and subcategories for mapping
          const { data: categories } = await supabase
            .from('categories')
            .select('id, name');
          
          const { data: subcategories } = await supabase
            .from('subcategories')
            .select('id, name');

          const categoryMap = new Map(categories?.map(cat => [cat.name, cat.id]));
          const subcategoryMap = new Map(subcategories?.map(subcat => [subcat.name, subcat.id]));

          let updatedCount = 0;

          for (const product of validProducts) {
            const processedProduct = {
              name: product.name.trim(),
              description: product.description || null,
              price: convertToNumber(product.price) || 0,
              sale_price: convertToNumber(product.sale_price),
              discount_price: convertToNumber(product.discount_price),
              images: processImages(product.images),
              status: product.status || 'draft',
              featured: convertToBoolean(product.featured),
              brand: product.brand || null,
              custom_label: product.custom_label || null,
              category_id: product.category ? categoryMap.get(product.category) : null,
              subcategory_id: product.subcategory ? subcategoryMap.get(product.subcategory) : null,
            };

            if (product.id) {
              const { error: updateError } = await supabase
                .from("products")
                .update(processedProduct)
                .eq('id', product.id);

              if (updateError) {
                console.error('Error updating product:', updateError);
                continue;
              }
            } else {
              const { error: insertError } = await supabase
                .from("products")
                .insert([processedProduct]);

              if (insertError) {
                console.error('Error inserting product:', insertError);
                continue;
              }
            }
            updatedCount++;
          }

          resolve(updatedCount);
        } catch (error: any) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const exportProducts = async (
  products: ProductsRow[] | undefined, 
  categories: any[] | undefined, 
  subcategories: any[] | undefined
) => {
  if (!products) return;

  // Create maps for category and subcategory lookups
  const categoryMap = new Map(categories?.map(cat => [cat.id, cat.name]));
  const subcategoryMap = new Map(subcategories?.map(subcat => [subcat.id, subcat.name]));

  const exportProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    sale_price: product.sale_price,
    discount_price: product.discount_price,
    images: product.images?.map(imageUrl =>
      imageUrl.includes('/') ? decodeURIComponent(imageUrl.split('/').pop() || '') : imageUrl
    ),
    status: product.status,
    featured: product.featured,
    brand: product.brand,
    custom_label: product.custom_label,
    category: product.category_id ? categoryMap.get(product.category_id) : null,
    subcategory: product.subcategory_id ? subcategoryMap.get(product.subcategory_id) : null
  }));

  const csv = Papa.unparse(exportProducts);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'products.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};