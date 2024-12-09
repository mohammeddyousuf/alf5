import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/react-query";
import Layout from "@/components/layout";
import Home from "@/pages";
import Shop from "@/pages/Shop";
import Page from "@/pages/Page";
import Admin from "@/pages/Admin";
import Collections from "@/pages/admin/Collections";
import Products from "@/pages/admin/Products";
import Sliders from "@/pages/admin/Sliders";
import News from "@/pages/admin/News";
import Pages from "@/pages/admin/Pages";
import Categories from "@/pages/admin/Categories";
import ProductDetail from "@/pages/ProductDetail";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { initializeThemeColors } from "@/utils/themeUtils";
import "./App.css";

function App() {
  // Initialize theme colors when the app loads
  useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();
      
      if (error) throw error;
      
      // Initialize theme colors when settings are loaded
      if (data) {
        console.log('Loading initial theme colors');
        initializeThemeColors(data);
      }
      
      return data;
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/page/:slug" element={<Page />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/collections" element={<Collections />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/sliders" element={<Sliders />} />
            <Route path="/admin/news" element={<News />} />
            <Route path="/admin/pages" element={<Pages />} />
            <Route path="/admin/categories" element={<Categories />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;