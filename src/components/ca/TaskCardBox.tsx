import { ClientTask } from '@/types/ca';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Paperclip, MessageSquare, AlertCircle, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskCardBoxProps {
  task: ClientTask;
  onClick: () => void;
}

export const TaskCardBox = ({ task, onClick }: TaskCardBoxProps) => {
  const getPriorityStyle = (priority: ClientTask['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-rose-500/40 bg-rose-500/5 hover:border-rose-500 text-rose-700 dark:text-rose-400';
      case 'high':
        return 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500 text-amber-700 dark:text-amber-400';
      case 'medium':
        return 'border-blue-500/40 bg-blue-500/5 hover:border-blue-500 text-blue-700 dark:text-blue-400';
      default:
        return 'border-slate-300 dark:border-slate-800 hover:border-primary text-slate-700 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status: ClientTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'in_progress':
        return <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  const completedCount = task.checklist.filter(c => c.completed).length;
  const totalCount = task.checklist.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="h-full p-4 rounded-xl border border-border/90 bg-card hover:border-primary/60 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">
        {/* Top bar */}
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground tracking-wider truncate">
              {task.category}
            </span>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getPriorityStyle(task.priority)}`}>
                {task.priority}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </div>

          <h4 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug break-words">
            {task.title}
          </h4>

          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed break-words">
            {task.description}
          </p>
        </div>

        {/* Progress bar if checklist exists */}
        {totalCount > 0 && (
          <div className="my-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
              <span>Audit Checks</span>
              <span>{completedCount}/{totalCount} ({progressPct}%)</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  progressPct === 100 ? 'bg-emerald-500' : 'bg-primary'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Bottom meta */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            {getStatusIcon(task.status)}
            <span className="capitalize font-medium">{task.status.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center gap-2.5">
            {task.documents.length > 0 && (
              <span className="flex items-center gap-0.5" title={`${task.documents.length} files attached`}>
                <Paperclip className="w-3 h-3" />
                {task.documents.length}
              </span>
            )}
            {task.comments.length > 0 && (
              <span className="flex items-center gap-0.5" title={`${task.comments.length} comments`}>
                <MessageSquare className="w-3 h-3" />
                {task.comments.length}
              </span>
            )}
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Calendar className="w-3 h-3 text-primary" />
              {task.dueDate.split('-').slice(1).join('/')}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
