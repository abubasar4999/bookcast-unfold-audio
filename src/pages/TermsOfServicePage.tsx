import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const TermsOfServicePage = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTermsOfService();
  }, []);

  const fetchTermsOfService = async () => {
    try {
      const { data, error } = await supabase
        .from('terms_of_service')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching terms of service:', error);
        setContent(getDefaultContent());
      } else if (data) {
        setContent(data.content);
      } else {
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
    return `# Terms of Service

## 1. Acceptance of Terms
By accessing and using this audiobook platform, you accept and agree to be bound by the terms and provision of this agreement.

## 2. Use License
Permission is granted to temporarily download one copy of the materials on our audiobook platform for personal, non-commercial transitory viewing only.

## 3. Disclaimer
The materials on our audiobook platform are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

## 4. Limitations
In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our audiobook platform.

## 5. Accuracy of Materials
The materials appearing on our audiobook platform could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete, or current.

## 6. Links
We have not reviewed all of the sites linked to our audiobook platform and are not responsible for the contents of any such linked site.

## 7. Modifications
We may revise these terms of service at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms of service.

## 8. Governing Law
These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.

---

**Last Updated:** ${new Date().toLocaleDateString()}`;
  };

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return `<h1 key="${index}" class="text-3xl font-bold text-white mb-6">${line.substring(2)}</h1>`;
        } else if (line.startsWith('## ')) {
          return `<h2 key="${index}" class="text-2xl font-semibold text-white mb-4 mt-8">${line.substring(3)}</h2>`;
        } else if (line.startsWith('### ')) {
          return `<h3 key="${index}" class="text-xl font-medium text-white mb-3 mt-6">${line.substring(4)}</h3>`;
        } else if (line.includes('**') && line.includes('**')) {
          const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
          return `<p key="${index}" class="text-gray-300 mb-4 leading-relaxed">${boldText}</p>`;
        } else if (line.includes('*') && line.includes('*')) {
          const italicText = line.replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>');
          return `<p key="${index}" class="text-gray-300 mb-4 leading-relaxed">${italicText}</p>`;
        } else if (line.trim() === '') {
          return `<br key="${index}" />`;
        } else if (line.trim() === '---') {
          return `<hr key="${index}" class="border-gray-700 my-8" />`;
        } else {
          return `<p key="${index}" class="text-gray-300 mb-4 leading-relaxed">${line}</p>`;
        }
      })
      .join('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-12 pb-20">
      <div className="px-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-gray-800 mr-4"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        </div>

        {/* Content */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8">
          <div 
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            className="prose prose-invert max-w-none"
          />
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;