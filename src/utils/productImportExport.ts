import Papa from 'papaparse';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const handleProductImport = async (
  file: File, 
  currentProducts: any[], 
  systemLimits: any
) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const newProducts = results.data;
          const totalProducts = (currentProducts?.length || 0) + newProducts.length;
          
          if (totalProducts > (systemLimits?.product_limit || 100)) {
            reject(new Error(`Cannot import ${newProducts.length} products. This would exceed your limit of ${systemLimits?.product_limit} products.`));
            return;
          }

          for (const product of newProducts) {
            // Convert string array back to proper array format
            if (typeof product.images === 'string') {
              try {
                // Handle both comma-separated strings and JSON strings
                product.images = product.images.includes('[') 
                  ? JSON.parse(product.images)
                  : product.images.split(',').map(img => img.trim());
              } catch (e) {
                product.images = [];
              }
            }

            // If product has an ID, update it, otherwise insert new
            if (product.id) {
              const { error: updateError } = await supabase
                .from("products")
                .update({
                  name: product.name,
                  description: product.description,
                  price: Number(product.price),
                  sale_price: product.sale_price ? Number(product.sale_price) : null,
                  discount_price: product.discount_price ? Number(product.discount_price) : null,
                  images: product.images,
                  status: product.status || 'draft',
                  featured: product.featured === 'true',
                  brand: product.brand || null,
                  custom_label: product.custom_label || null,
                })
                .eq('id', product.id);
              
              if (updateError) throw updateError;
            } else {
              const { error: insertError } = await supabase
                .from("products")
                .insert([{
                  name: product.name,
                  description: product.description,
                  price: Number(product.price),
                  sale_price: product.sale_price ? Number(product.sale_price) : null,
                  discount_price: product.discount_price ? Number(product.discount_price) : null,
                  images: product.images,
                  status: product.status || 'draft',
                  featured: product.featured === 'true',
                  brand: product.brand || null,
                  custom_label: product.custom_label || null,
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

export const exportProducts = async (products: any[], categories: any[], subcategories: any[]) => {
  if (!products) return;
  
  const exportProducts = products.map(product => {
    const category = categories?.find(cat => cat.id === product.category_id);
    const subcategory = subcategories?.find(subcat => subcat.id === product.subcategory_id);
    
    return {
      id: product.id,
      featured: product.featured,
      status: product.status,
      custom_label: product.custom_label,
      name: product.name,
      brand: product.brand,
      description: product.description,
      category: category?.name || '',
      subcategory: subcategory?.name || '',
      price: product.price,
      sale_price: product.sale_price,
      discount_price: product.discount_price,
      images: product.images?.map(imageUrl => 
        imageUrl.includes('/') ? decodeURIComponent(imageUrl.split('/').pop() || '') : imageUrl
      ),
      video_urls: product.video_urls,
      created_at: product.created_at,
      updated_at: product.updated_at,
      added_date: product.added_date
    };
  });
  
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