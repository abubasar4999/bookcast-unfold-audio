
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Plus, 
  Bell, 
  BarChart3, 
  Menu,
  X,
  BookOpen,
  UserPlus,
  Upload,
  Settings,
  Shield,
  Image
} from 'lucide-react';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: BookOpen, label: 'Manage Books', path: '/admin/manage-books' },
  { icon: Plus, label: 'Add New Book', path: '/admin/add-book' },
  { icon: Image, label: 'Hero Carousel', path: '/admin/hero-carousel' },
  { icon: Upload, label: 'Bulk Upload', path: '/admin/bulk-upload' },
  { icon: Users, label: 'User Data', path: '/admin/users' },
  { icon: UserPlus, label: 'Invite Admins', path: '/admin/invite-admins' },
  { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
  { icon: BarChart3, label: 'Insights', path: '/admin/insights' },
  { icon: Shield, label: 'Privacy Policy', path: '/admin/privacy-policy' },
  { icon: Shield, label: 'Terms of Service', path: '/admin/terms-of-service' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0 transition-all duration-300 z-50 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarOpen || !sidebarOpen ? 'w-64 lg:w-64' : 'lg:w-16'}
        bg-card shadow-lg h-full
      `}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">BookCast Admin</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <li key={item.path}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      // Close sidebar on mobile after navigation
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    title={!sidebarOpen && window.innerWidth >= 1024 ? item.label : undefined}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <header className="bg-card shadow-sm border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
              <h2 className="text-lg lg:text-2xl font-semibold text-foreground truncate">
                {sidebarItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <button className="p-2 hover:bg-muted rounded-lg relative">
                <Bell size={20} className="text-muted-foreground" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
