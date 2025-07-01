
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
    
    // First try a simple fetch with GET method
    const response = await fetch(url, { 
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    
    console.log('Audio URL test response:', response.status, response.statusText);
    
    // If it's a 400, the file likely doesn't exist
    if (response.status === 400) {
      console.error('File not found or access denied (400)');
      return false;
    }
    
    return response.ok;
  } catch (error) {
    console.error('Audio URL test failed:', error);
    return false;
  }
};

// Add a function to get demo audio URL as fallback
export const getDemoAudioUrl = (): string => {
  // Use a reliable demo audio file
  return 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3';
};
