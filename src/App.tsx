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
import Orders from "@/pages/admin/Orders";
import Auth from "@/pages/Auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { initializeThemeColors } from "@/utils/themeUtils";
import "./App.css";

// Separate component for theme initialization
function ThemeInitializer() {
  useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();
      
      if (error) throw error;
      
      if (data) {
        console.log('Loading initial theme colors');
        initializeThemeColors(data);
      }
      
      return data;
    },
  });

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
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
            <Route path="/sa83ms" element={<SuperAdmin />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;