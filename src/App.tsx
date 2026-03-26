import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/react-query";
import Layout from "@/components/layout";
import Home from "@/pages";
import Shop from "@/pages/Shop";
import Page from "@/pages/Page";
import Admin from "@/pages/Admin";
import SuperAdmin from "@/pages/SuperAdmin";
import Collections from "@/pages/admin/Collections";
import Products from "@/pages/admin/Products";
import NewProduct from "@/pages/admin/products/New";
import Sliders from "@/pages/admin/Sliders";
import News from "@/pages/admin/News";
import Pages from "@/pages/admin/Pages";
import NewPage from "@/pages/admin/pages/New";
import EditPage from "@/pages/admin/pages/[id]";
import Categories from "@/pages/admin/Categories";
import ProductDetail from "@/pages/ProductDetail";
import CollectionDetail from "@/pages/CollectionDetail";
import Orders from "@/pages/admin/Orders";
import Enquiries from "@/pages/admin/Enquiries";
import Auth from "@/pages/Auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/db";
import { initializeThemeColors } from "@/utils/themeUtils";
import "./App.css";

// Separate component for theme initialization and tracking codes
function ThemeInitializer() {
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        console.log('Loading initial theme colors');
        initializeThemeColors(data);

        // Inject tracking codes if they exist
        if (data.tracking_codes) {
          console.log('Injecting tracking codes:', data.tracking_codes);
          try {
            // Create a temporary div to validate HTML content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data.tracking_codes;
            
            // Extract only script elements
            const scripts = tempDiv.getElementsByTagName('script');
            
            // Inject each valid script
            Array.from(scripts).forEach(script => {
              const newScript = document.createElement('script');
              // Copy content and attributes
              if (script.src) {
                newScript.src = script.src;
              }
              if (script.textContent) {
                newScript.textContent = script.textContent;
              }
              // Copy other attributes
              Array.from(script.attributes).forEach(attr => {
                if (attr.name !== 'src') { // Skip src as it's already handled
                  newScript.setAttribute(attr.name, attr.value);
                }
              });
              document.head.appendChild(newScript);
            });
            
            console.log('Tracking codes successfully injected');
          } catch (error) {
            console.error('Error injecting tracking codes:', error);
          }
        } else {
          console.log('No tracking codes found in settings');
        }
      }
      
      return data;
    },
  });

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeInitializer />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/collections/:slug" element={<CollectionDetail />} />
            <Route path="/page/:slug" element={<Page />} />
            <Route path="/about" element={<Page />} />
            <Route path="/faq" element={<Page />} />
            <Route path="/contact" element={<Page />} />
            <Route path="/privacy-policy" element={<Page />} />
            <Route path="/terms-of-service" element={<Page />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/collections" element={<Collections />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/products/new" element={<NewProduct />} />
            <Route path="/admin/sliders" element={<Sliders />} />
            <Route path="/admin/news" element={<News />} />
            <Route path="/admin/pages" element={<Pages />} />
            <Route path="/admin/pages/new" element={<NewPage />} />
            <Route path="/admin/pages/:id" element={<EditPage />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/enquiries" element={<Enquiries />} />
            <Route path="/sa83ms" element={<SuperAdmin />} />
          </Routes>
        </Layout>
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;