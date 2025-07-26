-- Create privacy policy content table
CREATE TABLE public.privacy_policy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.privacy_policy ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view privacy policy" 
ON public.privacy_policy 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage privacy policy" 
ON public.privacy_policy 
FOR ALL 
USING (has_admin_access(auth.uid()));

-- Insert default privacy policy content
INSERT INTO public.privacy_policy (content, updated_by) 
VALUES (
  '# Privacy Policy

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

## 7. Children''s Privacy
Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

## 8. Changes to This Policy
We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date.

## 9. Contact Us
If you have any questions about this privacy policy or our data practices, please contact us at privacy@audiobook-app.com.',
  NULL
);

-- Create trigger for updating timestamp
CREATE OR REPLACE FUNCTION public.update_privacy_policy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_privacy_policy_updated_at
  BEFORE UPDATE ON public.privacy_policy
  FOR EACH ROW
  EXECUTE FUNCTION public.update_privacy_policy_updated_at();