
import { supabase } from '@/integrations/supabase/client';

export const generateAudioUrl = (path: string, isMobile: boolean): string => {
  if (!path) {
    console.error('Audio path is empty');
    return '';
  }

  console.log('Generating audio URL for mobile:', isMobile, 'path:', path);
  
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
    
    // Add mobile-specific URL parameters for better compatibility
    if (isMobile) {
      const urlObj = new URL(finalUrl);
      urlObj.searchParams.set('t', Date.now().toString()); // Cache busting
      urlObj.searchParams.set('mobile', '1'); // Mobile indicator
      finalUrl = urlObj.toString();
    }
    
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
    
    // For mobile, try a simpler approach
    const response = await fetch(url, { 
      method: 'HEAD',
      cache: 'no-cache'
    });
    
    console.log('Audio URL test response:', response.status, response.statusText);
    return response.ok;
  } catch (error) {
    console.error('Audio URL test failed:', error);
    return false;
  }
};
