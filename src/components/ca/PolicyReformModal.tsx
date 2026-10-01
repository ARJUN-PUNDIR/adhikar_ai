import { useState } from 'react';
import { PolicyReform } from '@/types/ca';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Landmark, Calendar, AlertCircle, FileCheck, ArrowRight, Share2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface PolicyReformModalProps {
  reform: PolicyReform | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyReformModal = ({ reform, isOpen, onClose }: PolicyReformModalProps) => {
  if (!reform) return null;

  const getImpactBadge = (impact: PolicyReform['impactLevel']) => {
    switch (impact) {
      case 'Critical':
        return <Badge variant="destructive" className="uppercase font-bold text-[10px]">Critical Action Required</Badge>;
      case 'High':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white uppercase font-bold text-[10px]">High Impact</Badge>;
      default:
        return <Badge variant="secondary" className="uppercase font-bold text-[10px]">{impact}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-border bg-card">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 via-indigo-500/5 to-teal-500/10">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
              {reform.category}
            </span>
            {getImpactBadge(reform.impactLevel)}
            <span className="text-xs text-muted-foreground ml-auto">{reform.readTime}</span>
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-foreground mt-1">
            {reform.title}
          </DialogTitle>

          <DialogDescription className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Landmark className="w-3.5 h-3.5 text-primary" />
              {reform.ministry}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Circular: {reform.notificationNumber}
            </span>
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-accent/40 border border-border space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-primary" />
              Statutory Summary
            </h4>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {reform.summary}
            </p>
          </div>

          {/* Key Provisions */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Detailed Legal Analysis:</h4>
            <p className="text-sm text-muted-foreground leading-relaxed bg-background p-4 rounded-xl border border-border">
              {reform.details}
            </p>
          </div>

          {/* Action Required for CA Clients */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" />
              Mandatory Action For Your MSME Clients
            </h4>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed">
              {reform.actionRequired}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-muted/50 border border-border/80">
            <div>
              <span className="text-muted-foreground block">Effective Date:</span>
              <span className="font-semibold text-foreground">{reform.effectiveDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Applicable Entity:</span>
              <span className="font-semibold text-foreground">{reform.applicableTo}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5 text-xs"
              onClick={() => toast.success('Circular advisory link copied for sharing with clients')}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Advisory
            </Button>
            <Button
              size="sm"
              className="rounded-xl gap-1.5 text-xs"
              onClick={() => toast.success('Official Ministry Notification PDF downloaded')}
            >
              <Download className="w-3.5 h-3.5" />
              Download Official Gazetted Circular
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
