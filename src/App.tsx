import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Layout from "@/components/layout";
import Home from "@/pages/index";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/products/[id]";
import CollectionDetail from "@/pages/collections/[id]";
import Page from "@/pages/Page";
import Admin from "@/pages/Admin";
import Products from "@/pages/admin/Products";
import NewProduct from "@/pages/admin/products/New";
import EditProduct from "@/pages/admin/products/[id]";
import Categories from "@/pages/admin/Categories";
import NewCategory from "@/pages/admin/categories/New";
import EditCategory from "@/pages/admin/categories/[id]";
import Collections from "@/pages/admin/Collections";
import NewCollection from "@/pages/admin/collections/New";
import EditCollection from "@/pages/admin/collections/[id]";
import Pages from "@/pages/admin/Pages";
import NewPage from "@/pages/admin/pages/New";
import EditPage from "@/pages/admin/pages/[id]";
import Sliders from "@/pages/admin/Sliders";
import NewSlider from "@/pages/admin/sliders/New";
import EditSlider from "@/pages/admin/sliders/[id]";
import News from "@/pages/admin/News";
import NewNews from "@/pages/admin/news/New";
import EditNews from "@/pages/admin/news/[id]";
import Settings from "@/pages/admin/Settings";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Toaster />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="collections/:id" element={<CollectionDetail />} />
          <Route path="pages/:slug" element={<Page />} />
          <Route path="admin" element={<Admin />}>
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<NewProduct />} />
            <Route path="products/:id" element={<EditProduct />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/new" element={<NewCategory />} />
            <Route path="categories/:id" element={<EditCategory />} />
            <Route path="collections" element={<Collections />} />
            <Route path="collections/new" element={<NewCollection />} />
            <Route path="collections/:id" element={<EditCollection />} />
            <Route path="pages" element={<Pages />} />
            <Route path="pages/new" element={<NewPage />} />
            <Route path="pages/:id" element={<EditPage />} />
            <Route path="sliders" element={<Sliders />} />
            <Route path="sliders/new" element={<NewSlider />} />
            <Route path="sliders/:id" element={<EditSlider />} />
            <Route path="news" element={<News />} />
            <Route path="news/new" element={<NewNews />} />
            <Route path="news/:id" element={<EditNews />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;