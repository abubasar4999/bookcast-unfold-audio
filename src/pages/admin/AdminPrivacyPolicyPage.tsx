import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminPrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      const { data, error } = await supabase
        .from('privacy_policy')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching privacy policy:', error);
        toast({
          title: "Error",
          description: "Failed to load privacy policy content.",
          variant: "destructive"
        });
      } else if (data) {
        setContent(data.content);
        setLastUpdated(data.updated_at);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update privacy policy.",
          variant: "destructive"
        });
        return;
      }

      // Check if privacy policy exists
      const { data: existing } = await supabase
        .from('privacy_policy')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        // Update existing privacy policy
        const { error } = await supabase
          .from('privacy_policy')
          .update({
            content,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) {
          throw error;
        }
      } else {
        // Create new privacy policy
        const { error } = await supabase
          .from('privacy_policy')
          .insert({
            content,
            updated_by: user.id
          });

        if (error) {
          throw error;
        }
      }

      toast({
        title: "Success",
        description: "Privacy policy updated successfully.",
      });
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Error saving privacy policy:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy policy.",
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
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="mr-4 text-white hover:bg-gray-800"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-white">Privacy Policy Management</h1>
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
          <Alert className="mb-6 bg-gray-900 border-gray-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-gray-300">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </AlertDescription>
          </Alert>
        )}

        {/* Content Editor */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Privacy Policy Content</CardTitle>
            <p className="text-gray-400 text-sm">
              Use Markdown syntax to format the privacy policy content. This will be displayed to users on the privacy policy page.
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[600px] bg-gray-800 border-gray-600 text-white font-mono text-sm"
              placeholder="Enter privacy policy content using Markdown syntax..."
            />
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-white font-semibold mb-2">Markdown Formatting Help:</h3>
          <div className="text-gray-400 text-sm space-y-1">
            <p><code className="bg-gray-800 px-1 rounded"># Heading 1</code> - Creates a large heading</p>
            <p><code className="bg-gray-800 px-1 rounded">## Heading 2</code> - Creates a medium heading</p>
            <p><code className="bg-gray-800 px-1 rounded">**Bold text**</code> - Makes text bold</p>
            <p><code className="bg-gray-800 px-1 rounded">*Italic text*</code> - Makes text italic</p>
            <p><code className="bg-gray-800 px-1 rounded">- List item</code> - Creates a bullet point</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPrivacyPolicyPage;