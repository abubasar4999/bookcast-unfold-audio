
import { supabase } from '@/integrations/supabase/client';

export const generateAudioUrl = (path: string, isMobile: boolean): string => {
  if (!path) {
    console.error('Audio path is empty');
    return '';
  }

  console.log('Generating audio URL for path:', path, 'mobile:', isMobile);
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    console.log('Audio path is already a full URL:', path);
    return path;
  }
  
  try {
    // Generate public URL from Supabase storage
    const { data } = supabase.storage
      .from('book-audios')
      .getPublicUrl(path);
    
    let finalUrl = data.publicUrl;
    
    console.log('Generated audio URL:', finalUrl);
    return finalUrl;
  } catch (error) {
    console.error('Error generating public URL:', error);
    return '';
  }
};

export const testAudioUrl = async (url: string): Promise<boolean> => {
  try {
    console.log('Testing audio URL accessibility:', url);
    
    // Try HEAD request first (lighter)
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'cors',
      cache: 'no-cache'
    });
    
    console.log('Audio URL test response:', response.status, response.statusText);
    
    // Check if response is successful
    if (response.ok) {
      return true;
    }
    
    // If HEAD fails, try GET request
    const getResponse = await fetch(url, { 
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    
    console.log('Audio URL GET test response:', getResponse.status, getResponse.statusText);
    return getResponse.ok;
    
  } catch (error) {
    console.error('Audio URL test failed:', error);
    return false;
  }
};

// Add a function to get demo audio URL as fallback
export const getDemoAudioUrl = (): string => {
  // Use a reliable demo audio file from a CDN
  return 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3';
};
