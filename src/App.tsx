import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import Layout from '@/components/layout/Layout';
import { Toaster } from 'react-hot-toast';
import SuperAdmin from '@/pages/SuperAdmin';
import AdminManagement from '@/pages/admin/AdminManagement';
import Home from '@/pages/index';
import AuthPage from '@/pages/Auth';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/sa83ms" element={<SuperAdmin />} />
              <Route path="/sa83ms/admin-management" element={<AdminManagement />} />
            </Routes>
          </Layout>
          <Toaster />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;