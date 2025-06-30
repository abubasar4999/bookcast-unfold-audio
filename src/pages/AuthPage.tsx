
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  const from = location.state?.from?.pathname || '/genre-selection';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.name, formData.phone);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Account created! Please check your email to verify your account.');
          navigate('/genre-selection');
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    toast.info('Google authentication coming soon!');
  };

  const handlePhoneLogin = async () => {
    toast.info('Phone authentication coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">BookCast</h1>
          <p className="text-purple-300">Listen Differently</p>
        </div>

        {/* Multi-Auth Options */}
        {!isLogin && (
          <div className="space-y-4 mb-6">
            <Button
              onClick={handleSubmit}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-full"
            >
              <Mail size={20} className="mr-2" />
              Continue with Email
            </Button>
            
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full border-gray-600 bg-gray-800 text-white hover:bg-gray-700 font-semibold py-4 rounded-full"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              onClick={handlePhoneLogin}
              variant="outline"
              className="w-full border-gray-600 bg-gray-800 text-white hover:bg-gray-700 font-semibold py-4 rounded-full"
            >
              <Phone size={20} className="mr-2" />
              Continue with Phone
            </Button>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Login/Signup Form */}
        {isLogin && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white rounded-xl"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white rounded-xl"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-full"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
