import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppSettings } from "@/components/admin/WhatsAppSettings";
import { WebsiteSettings } from "@/components/admin/WebsiteSettings";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  const { data: collections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("collections").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: products, ...productsQuery } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: categories, ...categoriesQuery } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: subcategories, ...subcategoriesQuery } = useQuery({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subcategories").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: sliders, ...slidersQuery } = useQuery({
    queryKey: ["sliders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sliders").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: newsTicker, ...newsTickerQuery } = useQuery({
    queryKey: ["news_ticker"],
    queryFn: async () => {
      const { data, error } = await supabase.from("news_ticker").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: pages, ...pagesQuery } = useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: enquiries } = useQuery({
    queryKey: ["enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <AdminHeader />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Orders</h2>
            <p className="text-3xl font-bold mb-4">{orders?.length || 0}</p>
            <Button onClick={() => navigate("/admin/orders")}>View Orders</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Enquiries</h2>
            <p className="text-3xl font-bold mb-4">{enquiries?.length || 0}</p>
            <Button onClick={() => navigate("/admin/enquiries")}>View Enquiries</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Products</h2>
            <p className="text-3xl font-bold mb-4">{products?.length || 0}</p>
            <Button onClick={() => navigate("/admin/products")}>Manage Products</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Categories</h2>
            <p className="text-3xl font-bold mb-4">{categories?.length || 0}</p>
            <Button onClick={() => navigate("/admin/categories")}>Manage Categories</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Subcategories</h2>
            <p className="text-3xl font-bold mb-4">{subcategories?.length || 0}</p>
            <Button onClick={() => navigate("/admin/categories")}>Manage Subcategories</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">News Ticker</h2>
            <p className="text-3xl font-bold mb-4">{newsTicker?.length || 0}</p>
            <Button onClick={() => navigate("/admin/news")}>Manage News</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Sliders</h2>
            <p className="text-3xl font-bold mb-4">{sliders?.length || 0}</p>
            <Button onClick={() => navigate("/admin/sliders")}>Manage Sliders</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Collections</h2>
            <p className="text-3xl font-bold mb-4">{collections?.length || 0}</p>
            <Button onClick={() => navigate("/admin/collections")}>Manage Collections</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Pages</h2>
            <p className="text-3xl font-bold mb-4">{pages?.length || 0}</p>
            <Button onClick={() => navigate("/admin/pages")}>Manage Pages</Button>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <WhatsAppSettings />
          </div>
          <WebsiteSettings />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
