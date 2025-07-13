import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import SplashScreen from '@/components/SplashScreen';
import HomePage from '@/pages/HomePage';
import SearchPage from '@/pages/SearchPage';
import LibraryPage from '@/pages/LibraryPage';
import ProfilePage from '@/pages/ProfilePage';
import AuthPage from '@/pages/AuthPage';
import PlayerPage from '@/pages/PlayerPage';
import BookDetailPage from '@/pages/BookDetailPage';
import ResponsiveNavigation from '@/components/ResponsiveNavigation';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import MiniPlayer from '@/components/MiniPlayer';

// Admin imports
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ManageBooks from '@/pages/admin/ManageBooks';
import AddBookPage from '@/pages/admin/AddBookPage';
import BulkUpload from '@/pages/admin/BulkUpload';
import UserDataPage from '@/pages/admin/UserDataPage';
import InviteAdmins from '@/pages/admin/InviteAdmins';
import NotificationPage from '@/pages/admin/NotificationPage';
import InsightsPage from '@/pages/admin/InsightsPage';

const queryClient = new QueryClient();

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AudioPlayerProvider>
          <Router>
            <div className="min-h-screen bg-solid-dark-gradient">
              <Toaster />
              {showSplash ? (
                <SplashScreen onComplete={() => setShowSplash(false)} />
              ) : (
                <>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/player/:id" element={<PlayerPage />} />
                    <Route path="/book/:id" element={<BookDetailPage />} />
                    
                    {/* Admin routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/*" element={
                      <AdminProtectedRoute>
                        <AdminLayout />
                      </AdminProtectedRoute>
                    }>
                      <Route index element={<AdminDashboard />} />
                      <Route path="manage-books" element={<ManageBooks />} />
                      <Route path="add-book" element={<AddBookPage />} />
                      <Route path="bulk-upload" element={<BulkUpload />} />
                      <Route path="users" element={<UserDataPage />} />
                      <Route path="invite-admins" element={<InviteAdmins />} />
                      <Route path="notifications" element={<NotificationPage />} />
                      <Route path="insights" element={<InsightsPage />} />
                    </Route>
                  </Routes>
                  
                  {/* Navigation and Mini Player - only show on non-admin routes */}
                  <Routes>
                    <Route path="/admin/*" element={null} />
                    <Route path="*" element={
                      <>
                        <ResponsiveNavigation />
                        <MiniPlayer />
                      </>
                    } />
                  </Routes>
                </>
              )}
            </div>
          </Router>
        </AudioPlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
