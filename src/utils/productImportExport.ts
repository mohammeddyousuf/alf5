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
  category_id?: string | null;
  subcategory_id?: string | null;
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
    if (images.includes('[')) {
      try {
        return JSON.parse(images);
      } catch (e) {
        return [];
      }
    }
    return images.split(',').map(img => img.trim());
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
          // Filter out rows without names and validate data
          const newProducts = results.data.filter(product => 
            product && typeof product === 'object' && product.name && product.name.trim()
          );

          const totalProducts = (currentProducts?.length || 0) + newProducts.length;

          if (totalProducts > (systemLimits?.product_limit || 100)) {
            reject(new Error(`Cannot import ${newProducts.length} products. This would exceed your limit of ${systemLimits?.product_limit} products.`));
            return;
          }

          for (const product of newProducts) {
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
              category_id: product.category_id || null,
              subcategory_id: product.subcategory_id || null,
            };

            if (product.id) {
              const { error: updateError } = await supabase
                .from("products")
                .update(processedProduct)
                .eq('id', product.id);

              if (updateError) throw updateError;
            } else {
              const { error: insertError } = await supabase
                .from("products")
                .insert([processedProduct]);

              if (insertError) throw insertError;
            }
          }

          resolve(newProducts.length);
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

export const exportProducts = (
  products: ProductsRow[] | undefined,
  categories: any[] | undefined,
  subcategories: any[] | undefined
) => {
  if (!products) return;

  const exportProducts = products.map(product => ({
    id: product.id,
    featured: product.featured,
    status: product.status,
    custom_label: product.custom_label,
    name: product.name,
    brand: product.brand,
    description: product.description,
    category_id: product.category_id,
    subcategory_id: product.subcategory_id,
    price: product.price,
    sale_price: product.sale_price,
    discount_price: product.discount_price,
    images: product.images?.map(imageUrl =>
      imageUrl.includes('/') ? decodeURIComponent(imageUrl.split('/').pop() || '') : imageUrl
    ),
    created_at: product.created_at,
    updated_at: product.updated_at
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