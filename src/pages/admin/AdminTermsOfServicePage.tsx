import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AdminTermsOfServicePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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
        toast({
          title: "Error",
          description: "Failed to load terms of service content.",
          variant: "destructive"
        });
      } else if (data) {
        setContent(data.content);
        setLastUpdated(new Date(data.updated_at).toLocaleString());
      } else {
        // Set default content if no terms exist
        setContent(getDefaultContent());
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
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
These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.`;
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save changes.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Check if terms already exist
      const { data: existingTerms } = await supabase
        .from('terms_of_service')
        .select('id')
        .limit(1)
        .maybeSingle();

      let result;
      if (existingTerms) {
        // Update existing terms
        result = await supabase
          .from('terms_of_service')
          .update({
            content: content,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingTerms.id);
      } else {
        // Insert new terms
        result = await supabase
          .from('terms_of_service')
          .insert({
            content: content,
            updated_by: user.id
          });
      }

      if (result.error) {
        throw result.error;
      }

      setLastUpdated(new Date().toLocaleString());
      toast({
        title: "Success",
        description: "Terms of service updated successfully.",
      });
    } catch (error) {
      console.error('Error saving terms of service:', error);
      toast({
        title: "Error",
        description: "Failed to save terms of service.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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
      <div className="px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="text-white hover:bg-gray-800 mr-4"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-3xl font-bold text-white">Manage Terms of Service</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Save size={20} className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Last Updated Info */}
        {lastUpdated && (
          <div className="mb-6 text-gray-400 text-sm">
            Last updated: {lastUpdated}
          </div>
        )}

        {/* Editor */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Terms of Service Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[600px] bg-gray-800 border-gray-700 text-white font-mono text-sm"
              placeholder="Enter terms of service content (Markdown supported)..."
            />
            
            {/* Help Section */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Markdown Help</h3>
              <div className="text-gray-300 text-sm space-y-1">
                <p><code className="bg-gray-700 px-1 rounded"># Heading 1</code> for main titles</p>
                <p><code className="bg-gray-700 px-1 rounded">## Heading 2</code> for sections</p>
                <p><code className="bg-gray-700 px-1 rounded">**Bold text**</code> for emphasis</p>
                <p><code className="bg-gray-700 px-1 rounded">*Italic text*</code> for emphasis</p>
                <p><code className="bg-gray-700 px-1 rounded">---</code> for horizontal rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTermsOfServicePage;