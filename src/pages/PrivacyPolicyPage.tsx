import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      const { data, error } = await supabase
        .from('privacy_policy')
        .select('content')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching privacy policy:', error);
        // Use default content if fetch fails
        setContent(getDefaultContent());
      } else if (data) {
        setContent(data.content);
      } else {
        // No data found, use default content
        setContent(getDefaultContent());
      }
    } catch (error) {
      console.error('Error:', error);
      setContent(getDefaultContent());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = () => {
    return `# Privacy Policy

## 1. Information We Collect
We collect information you provide directly to us, such as when you create an account, update your profile, or contact us. This includes your name, email address, phone number, and listening preferences.

## 2. How We Use Your Information
We use the information we collect to provide, maintain, and improve our audiobook service, personalize your experience, communicate with you, and ensure the security of our platform.

## 3. Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or as required by law.

## 4. Data Security
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## 5. Cookies and Tracking
We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and personalize content recommendations.

## 6. Your Rights
You have the right to access, update, or delete your personal information. You may also opt out of certain communications and data processing activities.

## 7. Children's Privacy
Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

## 8. Changes to This Policy
We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date.

## 9. Contact Us
If you have any questions about this privacy policy or our data practices, please contact us at privacy@audiobook-app.com.`;
  };

  // Simple markdown renderer for basic formatting
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-white mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-white mb-3">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n\n/g, '</p><p class="text-gray-300 leading-relaxed mb-4">')
      .replace(/^(?!<h[12]|<\/p>|<p)/gm, '<p class="text-gray-300 leading-relaxed mb-4">')
      .replace(/<p class="text-gray-300 leading-relaxed mb-4">(<h[12])/g, '$1')
      .replace(/(<\/h[12]>)<\/p>/g, '$1');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-4 pb-20">
      <div className="px-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-4 text-white hover:bg-gray-800"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
        </div>

        {/* Privacy Policy Content */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div 
            className="space-y-6"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
          
          <div className="border-t border-gray-700 pt-4 mt-8">
            <p className="text-sm text-gray-400">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;