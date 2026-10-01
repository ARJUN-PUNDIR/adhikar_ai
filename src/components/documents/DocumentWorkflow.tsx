import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { GitBranch, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentWorkflowProps {
  documentId: string;
}

export const DocumentWorkflow = ({ documentId }: DocumentWorkflowProps) => {
  const { user } = useAuth();
  const [approvers, setApprovers] = useState(['']);
  const [approvalComment, setApprovalComment] = useState('');
  const queryClient = useQueryClient();

  const { data: workflow } = useQuery({
    queryKey: ['document-workflow', documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_workflows')
        .select('*, document_approvals(*)')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  const createWorkflow = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const validApprovers = approvers.filter(email => email.trim());
      if (validApprovers.length === 0) throw new Error('Add at least one approver');

      const { data: workflowData, error: workflowError } = await supabase
        .from('document_workflows')
        .insert({
          document_id: documentId,
          created_by: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (workflowError) throw workflowError;

      const approvalInserts = validApprovers.map((email, index) => ({
        workflow_id: workflowData.id,
        step_number: index + 1,
        approver_email: email.trim(),
        status: 'pending' as const
      }));

      const { error: approvalsError } = await supabase
        .from('document_approvals')
        .insert(approvalInserts);

      if (approvalsError) throw approvalsError;

      // Track analytics
      await supabase.from('document_analytics').insert({
        document_id: documentId,
        user_id: user.id,
        action: 'workflow_created'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-workflow', documentId] });
      toast.success('Workflow created successfully');
      setApprovers(['']);
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const updateApproval = useMutation({
    mutationFn: async ({ approvalId, status }: { approvalId: string; status: 'approved' | 'rejected' | 'pending' | 'in_progress' | 'completed' }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('document_approvals')
        .update({
          status,
          comments: approvalComment,
          approved_at: new Date().toISOString()
        })
        .eq('id', approvalId);

      if (error) throw error;

      // Track analytics
      await supabase.from('document_analytics').insert({
        document_id: documentId,
        user_id: user.id,
        action: `approval_${status}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-workflow', documentId] });
      toast.success('Approval updated');
      setApprovalComment('');
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Approval Workflow</h3>
        </div>

        {!workflow && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Approval Workflow</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add approvers in order. Each person will receive the document after the previous approver.
                </p>
                {approvers.map((email, index) => (
                  <div key={index}>
                    <Label>Approver {index + 1} Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const newApprovers = [...approvers];
                        newApprovers[index] = e.target.value;
                        setApprovers(newApprovers);
                      }}
                      placeholder="approver@example.com"
                      className="rounded-xl mt-1.5"
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setApprovers([...approvers, ''])}
                  className="rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Approver
                </Button>
                <Button
                  onClick={() => createWorkflow.mutate()}
                  disabled={createWorkflow.isPending}
                  className="w-full rounded-xl"
                >
                  Create Workflow
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {workflow ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={workflow.status === 'approved' ? 'default' : 'secondary'}>
              {workflow.status}
            </Badge>
          </div>

          <div className="space-y-3">
            {workflow.document_approvals?.map((approval: any, index: number) => (
              <div key={approval.id} className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(approval.status)}
                    <span className="font-medium">Step {index + 1}</span>
                  </div>
                  <Badge variant="outline">{approval.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{approval.approver_email}</p>
                
                {approval.comments && (
                  <p className="text-sm bg-secondary p-2 rounded-lg mt-2">{approval.comments}</p>
                )}

                {approval.status === 'pending' && approval.approver_email === user?.email && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="mt-3 rounded-xl">
                        Review Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve or Reject</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Comments (optional)</Label>
                          <Textarea
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                            placeholder="Add your comments..."
                            className="rounded-xl mt-1.5"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => updateApproval.mutate({ approvalId: approval.id, status: 'approved' })}
                            className="flex-1 rounded-xl"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => updateApproval.mutate({ approvalId: approval.id, status: 'rejected' })}
                            variant="destructive"
                            className="flex-1 rounded-xl"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          No workflow created yet. Click "Create Workflow" to start the approval process.
        </p>
      )}
    </Card>
  );
};
