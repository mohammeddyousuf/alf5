import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout";
import Index from "@/pages/index";
import Shop from "@/pages/Shop";
import CollectionDetail from "@/pages/collections/[id]";
import ProductDetail from "@/pages/products/[id]";
import Admin from "@/pages/Admin";
import Collections from "@/pages/admin/Collections";
import Products from "@/pages/admin/Products";
import Sliders from "@/pages/admin/Sliders";
import News from "@/pages/admin/News";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="shop" element={<Shop />} />
              <Route path="collections/:id" element={<CollectionDetail />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="admin" element={<Admin />} />
              <Route path="admin/collections" element={<Collections />} />
              <Route path="admin/products" element={<Products />} />
              <Route path="admin/sliders" element={<Sliders />} />
              <Route path="admin/news" element={<News />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;