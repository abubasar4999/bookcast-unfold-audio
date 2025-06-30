
import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import SplashScreen from "./components/SplashScreen";
import ResponsiveNavigation from "./components/ResponsiveNavigation";
import HomePage from "./pages/HomePage";
import BookDetailPage from "./pages/BookDetailPage";
import PlayerPage from "./pages/PlayerPage";
import LibraryPage from "./pages/LibraryPage";
import SearchPage from "./pages/SearchPage";
import AuthorPage from "./pages/AuthorPage";
import GenrePage from "./pages/GenrePage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import GenreSelectionPage from "./pages/GenreSelectionPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageBooks from "./pages/admin/ManageBooks";
import BulkUpload from "./pages/admin/BulkUpload";
import InviteAdmins from "./pages/admin/InviteAdmins";
import UserDataPage from "./pages/admin/UserDataPage";
import AddBookPage from "./pages/admin/AddBookPage";
import NotificationPage from "./pages/admin/NotificationPage";
import InsightsPage from "./pages/admin/InsightsPage";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-gray-950">
              <ResponsiveNavigation />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/book/:id" element={<BookDetailPage />} />
                <Route path="/player/:id" element={<PlayerPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/author/:id" element={<AuthorPage />} />
                <Route path="/genre/:genre" element={<GenrePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/genre-selection" element={<GenreSelectionPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="manage-books" element={<ManageBooks />} />
                  <Route path="bulk-upload" element={<BulkUpload />} />
                  <Route path="users" element={<UserDataPage />} />
                  <Route path="invite-admins" element={<InviteAdmins />} />
                  <Route path="add-book" element={<AddBookPage />} />
                  <Route path="notifications" element={<NotificationPage />} />
                  <Route path="insights" element={<InsightsPage />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
