import Papa from 'papaparse';
import { supabase } from "@/integrations/supabase/client";
import { ProductsRow, ProductsInsert } from "@/integrations/supabase/types/products";

interface CSVProduct {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  sale_price?: number | null;
  discount_price?: number | null;
  images?: string[] | null;
  status?: "draft" | "published" | "archived" | null;
  featured?: boolean | null;
  brand?: string | null;
  custom_label?: string | null;
  category_id?: string | null;
  subcategory_id?: string | null;
}

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
          const newProducts = results.data.filter(product => product.name); // Filter out rows without names
          const totalProducts = (currentProducts?.length || 0) + newProducts.length;

          if (totalProducts > (systemLimits?.product_limit || 100)) {
            reject(new Error(`Cannot import ${newProducts.length} products. This would exceed your limit of ${systemLimits?.product_limit} products.`));
            return;
          }

          for (const product of newProducts) {
            // Handle images array conversion
            if (typeof product.images === 'string') {
              try {
                product.images = product.images.includes('[')
                  ? JSON.parse(product.images)
                  : product.images.split(',').map(img => img.trim());
              } catch (e) {
                product.images = [];
              }
            }

            // Convert string boolean to actual boolean
            product.featured = product.featured === 'true';

            // Convert string numbers to actual numbers
            product.price = Number(product.price);
            if (product.sale_price) product.sale_price = Number(product.sale_price);
            if (product.discount_price) product.discount_price = Number(product.discount_price);

            // If product has an ID, update it, otherwise insert new
            if (product.id) {
              const { error: updateError } = await supabase
                .from("products")
                .update({
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  sale_price: product.sale_price,
                  discount_price: product.discount_price,
                  images: product.images,
                  status: product.status || 'draft',
                  featured: product.featured,
                  brand: product.brand,
                  custom_label: product.custom_label,
                  category_id: product.category_id,
                  subcategory_id: product.subcategory_id,
                })
                .eq('id', product.id);

              if (updateError) throw updateError;
            } else {
              const { error: insertError } = await supabase
                .from("products")
                .insert([{
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  sale_price: product.sale_price,
                  discount_price: product.discount_price,
                  images: product.images,
                  status: product.status || 'draft',
                  featured: product.featured,
                  brand: product.brand,
                  custom_label: product.custom_label,
                  category_id: product.category_id,
                  subcategory_id: product.subcategory_id,
                }]);

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