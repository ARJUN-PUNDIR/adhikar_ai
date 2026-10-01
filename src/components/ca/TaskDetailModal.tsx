import { useState } from 'react';
import { ClientTask } from '@/types/ca';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Download, 
  Send, 
  CheckCircle2, 
  Building2, 
  Tag, 
  CheckSquare, 
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface TaskDetailModalProps {
  task: ClientTask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: ClientTask['status']) => void;
}

export const TaskDetailModal = ({
  task,
  isOpen,
  onClose,
  onUpdateTaskStatus
}: TaskDetailModalProps) => {
  if (!task) return null;

  const [currentTask, setCurrentTask] = useState<ClientTask>(task);
  const [newComment, setNewComment] = useState('');

  // Keep local task in sync when prop changes
  if (task.id !== currentTask.id) {
    setCurrentTask(task);
  }

  const handleToggleChecklist = (checkId: string) => {
    const updated = {
      ...currentTask,
      checklist: currentTask.checklist.map((item) =>
        item.id === checkId ? { ...item, completed: !item.completed } : item
      )
    };
    setCurrentTask(updated);
    toast.success('Checklist updated');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: `c-${Date.now()}`,
      author: 'CA Rajesh Agrawal',
      role: 'Chartered Accountant',
      text: newComment.trim(),
      time: 'Just now'
    };

    setCurrentTask({
      ...currentTask,
      comments: [...currentTask.comments, commentObj]
    });
    setNewComment('');
    toast.success('Note / Client Query posted');
  };

  const handleStatusChange = (status: ClientTask['status']) => {
    setCurrentTask({ ...currentTask, status });
    onUpdateTaskStatus?.(currentTask.id, status);
    toast.success(`Task status updated to ${status.replace('_', ' ').toUpperCase()}`);
  };

  const getPriorityBadge = (priority: ClientTask['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="uppercase text-[10px] tracking-wide">Urgent Deadline</Badge>;
      case 'high':
        return <Badge className="bg-amber-500 hover:bg-amber-600 uppercase text-[10px] tracking-wide">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="uppercase text-[10px] tracking-wide">Medium</Badge>;
      default:
        return <Badge variant="outline" className="uppercase text-[10px] tracking-wide">Normal</Badge>;
    }
  };

  const getStatusBadge = (status: ClientTask['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">In Progress</Badge>;
      case 'in_review':
        return <Badge className="bg-purple-600 hover:bg-purple-700 text-white">Under CA Review</Badge>;
      default:
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Pending Action</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl border-border bg-card">
        {/* Header Banner */}
        <div className="p-6 pb-4 border-b border-border bg-muted/40">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                {currentTask.category}
              </span>
              {getPriorityBadge(currentTask.priority)}
              {getStatusBadge(currentTask.status)}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Due: <strong className="text-foreground">{currentTask.dueDate}</strong></span>
            </div>
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {currentTask.title}
          </DialogTitle>

          <DialogDescription className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>Client: <strong className="text-foreground font-medium">{currentTask.clientName}</strong></span>
            {currentTask.penaltyRiskAmount && (
              <span className="ml-auto text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Statutory Exposure: {currentTask.penaltyRiskAmount}
              </span>
            )}
          </DialogDescription>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Quick Status Control Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-accent/40 border border-border/80 text-xs">
            <span className="font-semibold text-muted-foreground">Update Task Workflow Status:</span>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant={currentTask.status === 'pending' ? 'default' : 'outline'}
                className="h-7 text-xs rounded-lg"
                onClick={() => handleStatusChange('pending')}
              >
                Pending
              </Button>
              <Button
                size="sm"
                variant={currentTask.status === 'in_progress' ? 'default' : 'outline'}
                className="h-7 text-xs rounded-lg"
                onClick={() => handleStatusChange('in_progress')}
              >
                In Progress
              </Button>
              <Button
                size="sm"
                variant={currentTask.status === 'in_review' ? 'default' : 'outline'}
                className="h-7 text-xs rounded-lg"
                onClick={() => handleStatusChange('in_review')}
              >
                In Review
              </Button>
              <Button
                size="sm"
                variant={currentTask.status === 'completed' ? 'default' : 'outline'}
                className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleStatusChange('completed')}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Mark Completed
              </Button>
            </div>
          </div>

          {/* Description & Requirements */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Task Scope & Statutory Brief
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed bg-background p-4 rounded-xl border border-border">
              {currentTask.description}
            </p>

            {currentTask.detailedRequirements && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
                <h5 className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
                  Audit Guidelines & Requirement Protocol:
                </h5>
                <pre className="text-xs text-foreground font-sans whitespace-pre-line leading-relaxed">
                  {currentTask.detailedRequirements}
                </pre>
              </div>
            )}
          </div>

          {/* Verification Checklist */}
          {currentTask.checklist && currentTask.checklist.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  Compliance Verification Checklist
                </h4>
                <span className="text-xs text-muted-foreground">
                  {currentTask.checklist.filter(c => c.completed).length} / {currentTask.checklist.length} Verified
                </span>
              </div>

              <div className="space-y-2">
                {currentTask.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      item.completed 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200' 
                        : 'bg-background hover:bg-muted/50 border-border'
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center border ${
                      item.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-muted-foreground'
                    }`}>
                      {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs sm:text-sm font-medium ${item.completed ? 'line-through opacity-80' : ''}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attached Client Documents */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              Client Provided Documents & Ledgers ({currentTask.documents.length})
            </h4>

            {currentTask.documents.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No client documents uploaded yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {currentTask.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-background hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-foreground truncate">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground">{doc.size} • {doc.uploadDate}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-primary hover:bg-primary/10 rounded-lg flex-shrink-0"
                      onClick={() => toast.success(`Downloaded: ${doc.name}`)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments & Queries Chain */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              Direct Communication & Audit Trail
            </h4>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {currentTask.comments.map((comment) => (
                <div key={comment.id} className="p-3 rounded-xl bg-muted/60 border border-border/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{comment.author} ({comment.role})</span>
                    <span className="text-[10px] text-muted-foreground">{comment.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{comment.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <Textarea
                placeholder="Ask client for clarifications, missing ledgers, or add audit note..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="text-xs rounded-xl resize-none"
              />
              <Button type="submit" size="icon" className="h-full min-h-[48px] rounded-xl px-4 flex-shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
