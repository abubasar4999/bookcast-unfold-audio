import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingRedirectProps {
  children: React.ReactNode;
}

const OnboardingRedirect = ({ children }: OnboardingRedirectProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        // If user doesn't have a profile or hasn't completed onboarding, redirect to genre selection
        if (!profile || !profile.onboarding_completed) {
          navigate('/genre-selection');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // If there's an error (like no profile exists), redirect to genre selection
        navigate('/genre-selection');
      }
    };

    checkOnboardingStatus();
  }, [user, navigate]);

  return <>{children}</>;
};

export default OnboardingRedirect;