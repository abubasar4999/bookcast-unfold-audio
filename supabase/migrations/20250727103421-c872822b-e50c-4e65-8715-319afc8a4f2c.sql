-- Allow admins to manage authors
CREATE POLICY "Admins can insert authors" 
ON public.authors 
FOR INSERT 
WITH CHECK (has_admin_access(auth.uid()));

CREATE POLICY "Admins can update authors" 
ON public.authors 
FOR UPDATE 
USING (has_admin_access(auth.uid()));

CREATE POLICY "Admins can delete authors" 
ON public.authors 
FOR DELETE 
USING (has_admin_access(auth.uid()));

-- Allow admins to manage guests
CREATE POLICY "Admins can insert guests" 
ON public.guests 
FOR INSERT 
WITH CHECK (has_admin_access(auth.uid()));

CREATE POLICY "Admins can update guests" 
ON public.guests 
FOR UPDATE 
USING (has_admin_access(auth.uid()));

CREATE POLICY "Admins can delete guests" 
ON public.guests 
FOR DELETE 
USING (has_admin_access(auth.uid()));

-- Allow admins to manage genres
CREATE POLICY "Admins can insert genres" 
ON public.genres 
FOR INSERT 
WITH CHECK (has_admin_access(auth.uid()));

CREATE POLICY "Admins can update genres" 
ON public.genres 
FOR UPDATE 
USING (has_admin_access(auth.uid()));

CREATE POLICY "Admins can delete genres" 
ON public.genres 
FOR DELETE 
USING (has_admin_access(auth.uid()));