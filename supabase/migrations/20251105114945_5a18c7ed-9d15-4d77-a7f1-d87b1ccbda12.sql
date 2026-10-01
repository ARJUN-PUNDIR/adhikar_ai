-- Add document versions table for revision history
CREATE TABLE public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Add document sharing table
CREATE TABLE public.document_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  shared_by UUID NOT NULL,
  permissions TEXT NOT NULL DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_permissions CHECK (permissions IN ('view', 'edit', 'sign'))
);

-- Add document signatures table
CREATE TABLE public.document_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  signature_data TEXT NOT NULL,
  signed_by UUID NOT NULL,
  signer_email TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_versions
CREATE POLICY "Users can view versions of their documents"
ON public.document_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_versions.document_id 
    AND documents.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create versions of their documents"
ON public.document_versions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_versions.document_id 
    AND documents.user_id = auth.uid()
  )
);

-- RLS Policies for document_shares
CREATE POLICY "Users can view shares of their documents"
ON public.document_shares FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_shares.document_id 
    AND documents.user_id = auth.uid()
  ) OR shared_with_email = auth.email()
);

CREATE POLICY "Users can create shares for their documents"
ON public.document_shares FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_shares.document_id 
    AND documents.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete shares of their documents"
ON public.document_shares FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_shares.document_id 
    AND documents.user_id = auth.uid()
  )
);

-- RLS Policies for document_signatures
CREATE POLICY "Users can view signatures on their documents"
ON public.document_signatures FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_signatures.document_id 
    AND documents.user_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.document_shares 
    WHERE document_shares.document_id = document_signatures.document_id 
    AND document_shares.shared_with_email = auth.email()
  )
);

CREATE POLICY "Users can sign shared documents"
ON public.document_signatures FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.document_shares 
    WHERE document_shares.document_id = document_signatures.document_id 
    AND document_shares.shared_with_email = auth.email()
    AND document_shares.permissions = 'sign'
  ) OR
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_signatures.document_id 
    AND documents.user_id = auth.uid()
  )
);

-- Add indexes for performance
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_shares_document_id ON public.document_shares(document_id);
CREATE INDEX idx_document_shares_email ON public.document_shares(shared_with_email);
CREATE INDEX idx_document_signatures_document_id ON public.document_signatures(document_id);