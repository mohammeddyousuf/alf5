import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Products from "./pages/admin/Products";
import Collections from "./pages/admin/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import ProductDetail from "./pages/ProductDetail";

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/auth"
            element={
              !isAuthenticated ? (
                <Auth />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin"
            element={
              isAuthenticated ? (
                <Admin />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/admin/products"
            element={
              isAuthenticated ? (
                <Products />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/admin/collections"
            element={
              isAuthenticated ? (
                <Collections />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/collection/:id"
            element={<CollectionDetail />}
          />
          <Route
            path="/product/:id"
            element={<ProductDetail />}
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;