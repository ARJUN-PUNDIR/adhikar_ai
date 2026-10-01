import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Share2, FileSignature, Clock, Users, FileDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SignatureCanvas } from './SignatureCanvas';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentCollaboration } from './DocumentCollaboration';
import { DocumentWorkflow } from './DocumentWorkflow';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';

interface DocumentViewerProps {
  document: any;
}

export const DocumentViewer = ({ document }: DocumentViewerProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('view');

  const { data: versions = [] } = useQuery({
    queryKey: ['document-versions', document.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', document.id)
        .order('version_number', { ascending: false });
      return data || [];
    }
  });

  const { data: shares = [] } = useQuery({
    queryKey: ['document-shares', document.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('document_shares')
        .select('*')
        .eq('document_id', document.id);
      return data || [];
    }
  });

  const { data: signatures = [] } = useQuery({
    queryKey: ['document-signatures', document.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('document_signatures')
        .select('*')
        .eq('document_id', document.id);
      return data || [];
    }
  });

  const shareDocument = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from('document_shares').insert({
        document_id: document.id,
        shared_with_email: shareEmail,
        shared_by: user.id,
        permissions: sharePermission
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-shares', document.id] });
      toast.success('Document shared successfully');
      setShowShareDialog(false);
      setShareEmail('');
    },
    onError: () => toast.error('Failed to share document')
  });

  const signDocument = useMutation({
    mutationFn: async (signature: string) => {
      if (!user) return;
      const { error } = await supabase.from('document_signatures').insert({
        document_id: document.id,
        signature_data: signature,
        signed_by: user.id,
        signer_email: user.email || ''
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-signatures', document.id] });
      toast.success('Document signed successfully');
      setShowSignDialog(false);
    },
    onError: () => toast.error('Failed to sign document')
  });

  const downloadDocument = () => {
    const content = typeof document.content === 'string' 
      ? document.content 
      : JSON.stringify(document.content, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Track analytics
      await supabase.from('document_analytics').insert({
        document_id: document.id,
        user_id: user.id,
        action: 'pdf_exported'
      });

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;

      // Add company branding header
      pdf.setFillColor(99, 102, 241); // Primary color
      pdf.rect(0, 0, pageWidth, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.text('AdhikarAI', margin, 20);

      // Add document title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.text(document.title, margin, 45);

      // Add metadata
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Created: ${new Date(document.created_at).toLocaleDateString()}`, margin, 55);
      pdf.text(`Document Type: ${document.doc_type}`, margin, 60);

      // Add content
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      const content = typeof document.content === 'string' 
        ? document.content 
        : JSON.stringify(document.content, null, 2);
      
      const lines = pdf.splitTextToSize(content, maxWidth);
      let yPosition = 75;
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 7;
      });

      // Add signatures if present
      if (signatures.length > 0) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }
        
        yPosition += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Signatures', margin, yPosition);
        yPosition += 10;

        for (const sig of signatures) {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.setFontSize(10);
          pdf.text(`Signed by: ${sig.signer_email}`, margin, yPosition);
          pdf.text(`Date: ${new Date(sig.signed_at).toLocaleString()}`, margin, yPosition + 5);
          yPosition += 20;
        }
      }

      // Add footer with timestamp
      const timestamp = new Date().toLocaleString();
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${timestamp} by AdhikarAI`, margin, pageHeight - 10);

      pdf.save(`${document.title}.pdf`);
    },
    onSuccess: () => {
      toast.success('PDF exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to export PDF');
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-medium bg-card/50 backdrop-blur">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">{document.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Created {new Date(document.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => exportToPDF.mutate()} disabled={exportToPDF.isPending}>
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSignDialog(true)}>
              <FileSignature className="h-4 w-4 mr-2" />
              Sign
            </Button>
            <Button variant="outline" size="sm" onClick={downloadDocument}>
              <Download className="h-4 w-4 mr-2" />
              Download TXT
            </Button>
          </div>
        </div>

        <div className="prose prose-sm lg:prose-base max-w-none bg-background p-6 rounded-xl border border-border dark:prose-invert prose-headings:font-semibold prose-headings:mb-3 prose-p:my-3 prose-ul:my-3 prose-li:my-1.5">
          <ReactMarkdown>
            {typeof document.content === 'string' 
              ? document.content 
              : JSON.stringify(document.content, null, 2)}
          </ReactMarkdown>
        </div>

        {signatures.length > 0 && (
          <div className="mt-6 p-4 bg-accent/10 rounded-xl border border-accent">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileSignature className="h-4 w-4" />
              Signatures
            </h3>
            <div className="space-y-3">
              {signatures.map((sig: any) => (
                <div key={sig.id} className="flex items-center gap-4 p-3 bg-background rounded-lg">
                  <img src={sig.signature_data} alt="Signature" className="h-12 border rounded" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{sig.signer_email}</p>
                    <p className="text-xs text-muted-foreground">
                      Signed {new Date(sig.signed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {shares.length > 0 && (
          <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Shared With
            </h3>
            <div className="space-y-2">
              {shares.map((share: any) => (
                <div key={share.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <p className="text-sm">{share.shared_with_email}</p>
                  <span className="text-xs px-2 py-1 bg-accent rounded-full">
                    {share.permissions}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Collaboration Section */}
      <DocumentCollaboration documentId={document.id} />

      {/* Workflow Section */}
      <DocumentWorkflow documentId={document.id} />

      {showVersions && versions.length > 0 && (
        <Card className="p-6 border-0 shadow-medium bg-card/50 backdrop-blur">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Version History
          </h3>
          <div className="space-y-3">
            {versions.map((version: any) => (
              <div key={version.id} className="p-4 bg-background rounded-xl border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Version {version.version_number}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(version.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Permission</Label>
              <Select value={sharePermission} onValueChange={setSharePermission}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                  <SelectItem value="sign">Can Sign</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => shareDocument.mutate()} className="w-full">
              Share Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sign Document</DialogTitle>
          </DialogHeader>
          <SignatureCanvas
            onSave={(sig) => signDocument.mutate(sig)}
            onCancel={() => setShowSignDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};