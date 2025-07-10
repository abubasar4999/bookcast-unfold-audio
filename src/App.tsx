import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import SplashScreen from '@/components/SplashScreen';
import HomePage from '@/pages/HomePage';
import SearchPage from '@/pages/SearchPage';
import LibraryPage from '@/pages/LibraryPage';
import ProfilePage from '@/pages/ProfilePage';
import AuthPage from '@/pages/AuthPage';
import PlayerPage from '@/pages/PlayerPage';
import ResponsiveNavigation from '@/components/ResponsiveNavigation';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import MiniPlayer from '@/components/MiniPlayer';

const queryClient = new QueryClient();

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AudioPlayerProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Toaster />
              {showSplash ? (
                <SplashScreen onComplete={() => setShowSplash(false)} />
              ) : (
                <>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/player/:id" element={<PlayerPage />} />
                  </Routes>
                  <ResponsiveNavigation />
                  <MiniPlayer />
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
