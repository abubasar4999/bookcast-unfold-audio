
import { useState, useEffect } from 'react';
import { Headphones } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-gray-950 flex items-center justify-center z-50 transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="text-center">
        <div className="mb-6">
          <Headphones size={64} className="text-purple-500 mx-auto mb-4" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">BookCast</h1>
        <p className="text-purple-300 text-lg">Listen Differently</p>
      </div>
    </div>
  );
};

export default SplashScreen;
