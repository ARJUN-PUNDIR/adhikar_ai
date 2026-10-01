-- Create document comments table for collaboration
CREATE TABLE public.document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Users can view comments on documents they have access to"
ON public.document_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_comments.document_id 
    AND documents.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.document_shares
    WHERE document_shares.document_id = document_comments.document_id
    AND document_shares.shared_with_email = auth.email()
  )
);

CREATE POLICY "Users can create comments on shared documents"
ON public.document_comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_comments.document_id 
    AND documents.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.document_shares
    WHERE document_shares.document_id = document_comments.document_id
    AND document_shares.shared_with_email = auth.email()
  )
);

-- Create workflow status enum
CREATE TYPE public.workflow_status AS ENUM ('pending', 'in_progress', 'approved', 'rejected', 'completed');

-- Create document workflows table
CREATE TABLE public.document_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  status workflow_status NOT NULL DEFAULT 'pending',
  current_step INTEGER NOT NULL DEFAULT 1,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_workflows ENABLE ROW LEVEL SECURITY;

-- Workflow policies
CREATE POLICY "Users can view workflows for their documents"
ON public.document_workflows FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_workflows.document_id 
    AND documents.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create workflows for their documents"
ON public.document_workflows FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_workflows.document_id 
    AND documents.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update workflows for their documents"
ON public.document_workflows FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_workflows.document_id 
    AND documents.user_id = auth.uid()
  )
);

-- Create document approvals table
CREATE TABLE public.document_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.document_workflows(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  approver_email TEXT NOT NULL,
  status workflow_status NOT NULL DEFAULT 'pending',
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_approvals ENABLE ROW LEVEL SECURITY;

-- Approval policies
CREATE POLICY "Users can view approvals for workflows they have access to"
ON public.document_approvals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.document_workflows dw
    JOIN public.documents d ON d.id = dw.document_id
    WHERE dw.id = document_approvals.workflow_id
    AND d.user_id = auth.uid()
  )
  OR approver_email = auth.email()
);

CREATE POLICY "Approvers can update their approvals"
ON public.document_approvals FOR UPDATE
USING (approver_email = auth.email());

-- Create document analytics table
CREATE TABLE public.document_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_analytics ENABLE ROW LEVEL SECURITY;

-- Analytics policies
CREATE POLICY "Users can view analytics for their documents"
ON public.document_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_analytics.document_id 
    AND documents.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create analytics entries"
ON public.document_analytics FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_document_comments_document_id ON public.document_comments(document_id);
CREATE INDEX idx_document_workflows_document_id ON public.document_workflows(document_id);
CREATE INDEX idx_document_approvals_workflow_id ON public.document_approvals(workflow_id);
CREATE INDEX idx_document_analytics_document_id ON public.document_analytics(document_id);
CREATE INDEX idx_document_analytics_created_at ON public.document_analytics(created_at);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_comments;

-- Create trigger for updated_at
CREATE TRIGGER update_document_comments_updated_at
BEFORE UPDATE ON public.document_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_workflows_updated_at
BEFORE UPDATE ON public.document_workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();