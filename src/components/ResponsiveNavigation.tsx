
import { Home, Search, Book, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResponsiveNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Book, label: 'Library', path: '/library' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      {/* Desktop Top Navigation */}
      <div className="hidden md:block fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 px-6 py-4 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="text-2xl font-bold text-gradient">AudioBooks</div>
          <div className="flex gap-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'text-purple-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Higher z-index than mini player */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 px-4 py-2 z-[60] safe-area-padding-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-purple-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs font-medium mt-1">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-purple-400 rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ResponsiveNavigation;
