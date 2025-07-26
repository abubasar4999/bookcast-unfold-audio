-- Create terms_of_service table
CREATE TABLE public.terms_of_service (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.terms_of_service ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view terms of service" 
ON public.terms_of_service 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage terms of service" 
ON public.terms_of_service 
FOR ALL 
USING (has_admin_access(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_terms_of_service_updated_at
BEFORE UPDATE ON public.terms_of_service
FOR EACH ROW
EXECUTE FUNCTION public.update_privacy_policy_updated_at();