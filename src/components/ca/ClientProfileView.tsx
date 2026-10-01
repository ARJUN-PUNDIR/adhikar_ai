import { useState } from 'react';
import { Client, ClientTask } from '@/types/ca';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskCardBox } from './TaskCardBox';
import { TaskDetailModal } from './TaskDetailModal';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  FileSpreadsheet, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Search, 
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  UserCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface ClientProfileViewProps {
  client: Client;
  tasks: ClientTask[];
  onBack: () => void;
}

export const ClientProfileView = ({ client, tasks: initialTasks, onBack }: ClientProfileViewProps) => {
  const [tasks, setTasks] = useState<ClientTask[]>(initialTasks.filter(t => t.clientId === client.id));
  const [selectedTask, setSelectedTask] = useState<ClientTask | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New task dialog state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<ClientTask['category']>('GST');
  const [newTaskPriority, setNewTaskPriority] = useState<ClientTask['priority']>('high');
  const [newTaskDueDate, setNewTaskDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const filteredTasks = tasks.filter((t) => {
    const matchesFilter = taskFilter === 'all' || t.status === taskFilter;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpdateTaskStatus = (taskId: string, newStatus: ClientTask['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const newTask: ClientTask = {
      id: `task-${Date.now()}`,
      clientId: client.id,
      clientName: client.companyName,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      description: newTaskDescription.trim() || `Statutory compliance work order for ${client.companyName}.`,
      status: 'pending',
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      assignedDate: new Date().toISOString().split('T')[0],
      documents: [],
      comments: [
        { id: `c-${Date.now()}`, author: 'CA Agrawal', role: 'Chartered Accountant', text: 'Task initiated by CA office.', time: 'Just now' }
      ],
      checklist: [
        { id: 'c-1', text: 'Obtain books of accounts & ledger files', completed: false },
        { id: 'c-2', text: 'Audit verification and portal sign-off', completed: false }
      ]
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsNewTaskOpen(false);
    toast.success(`Created task "${newTask.title}" for ${client.companyName}!`);
  };

  return (
    <div className="space-y-6">
      {/* Back Button and Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="gap-2 rounded-xl text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Clients
        </Button>

        <div className="flex items-center gap-2">
          <Badge className={`uppercase text-[10px] ${
            client.status === 'Active' ? 'bg-emerald-600' : 'bg-amber-500'
          }`}>
            {client.status}
          </Badge>
          <span className="text-xs text-muted-foreground">Active in CA Office</span>
        </div>
      </div>

      {/* Main Client Profile Header Card - Unified crisp contrast */}
      <Card className="rounded-2xl border-border/80 shadow-md overflow-hidden bg-card/70 backdrop-blur-xl">
        {/* Top Banner: Dark gradient with crisp white text */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0">
              <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${client.avatarColor} text-white font-bold text-2xl flex items-center justify-center border-2 border-white/20 shadow-lg flex-shrink-0`}>
                {client.companyName.substring(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                    {client.companyName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur border border-white/20">
                    {client.businessType}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white">{client.contactPerson}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>{client.city}, {client.state}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 self-start sm:self-auto">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/15 text-white">
                <div className="text-right">
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Compliance</span>
                  <span className="font-bold text-base text-emerald-400">{client.complianceScore}%</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="h-9 text-xs rounded-xl bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur font-semibold"
                onClick={() => toast.success(`Exported complete audit report for ${client.companyName}`)}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                Export Dossier
              </Button>
            </div>
          </div>
        </div>

        {/* Key Identifiers Grid below banner */}
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/40 border border-border/60 text-xs">
            <div className="min-w-0">
              <span className="text-muted-foreground block text-[11px]">GSTIN Number</span>
              <span className="font-mono font-semibold text-foreground flex items-center gap-1 truncate" title={client.gstin}>
                <span className="truncate">{client.gstin}</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-primary flex-shrink-0" onClick={() => toast.info('Navigating to GST Portal Search Taxpayer')} />
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-muted-foreground block text-[11px]">PAN Card</span>
              <span className="font-mono font-semibold text-foreground truncate block">{client.pan}</span>
            </div>
            <div className="min-w-0">
              <span className="text-muted-foreground block text-[11px]">Turnover Tier</span>
              <span className="font-semibold text-foreground truncate block" title={client.turnoverBracket}>{client.turnoverBracket}</span>
            </div>
            <div className="min-w-0">
              <span className="text-muted-foreground block text-[11px]">Contact & Email</span>
              <span className="font-medium text-foreground truncate block" title={client.email}>{client.email}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Task Section Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Tasks Given by {client.companyName}
            </h2>
            <p className="text-xs text-muted-foreground">
              Click on any task box below to inspect client requirements, documents, audit checklist, and direct queries.
            </p>
          </div>

          <Button 
            onClick={() => setIsNewTaskOpen(true)}
            className="rounded-xl gap-2 shadow-sm text-xs font-semibold h-9"
          >
            <Plus className="w-4 h-4" />
            Add New Task
          </Button>
        </div>

        {/* Task Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 text-xs w-full sm:w-auto overflow-x-auto">
            <Button
              size="sm"
              variant={taskFilter === 'all' ? 'default' : 'ghost'}
              className="h-8 text-xs rounded-lg"
              onClick={() => setTaskFilter('all')}
            >
              All ({tasks.length})
            </Button>
            <Button
              size="sm"
              variant={taskFilter === 'pending' ? 'default' : 'ghost'}
              className="h-8 text-xs rounded-lg"
              onClick={() => setTaskFilter('pending')}
            >
              Pending ({tasks.filter(t => t.status === 'pending').length})
            </Button>
            <Button
              size="sm"
              variant={taskFilter === 'in_progress' ? 'default' : 'ghost'}
              className="h-8 text-xs rounded-lg"
              onClick={() => setTaskFilter('in_progress')}
            >
              In Progress ({tasks.filter(t => t.status === 'in_progress').length})
            </Button>
            <Button
              size="sm"
              variant={taskFilter === 'completed' ? 'default' : 'ghost'}
              className="h-8 text-xs rounded-lg"
              onClick={() => setTaskFilter('completed')}
            >
              Completed ({tasks.filter(t => t.status === 'completed').length})
            </Button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* The Small Small Boxes Grid */}
        {filteredTasks.length === 0 ? (
          <Card className="p-8 text-center rounded-2xl border-dashed border-2">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
            <h3 className="font-semibold text-sm text-foreground">No tasks found</h3>
            <p className="text-xs text-muted-foreground mt-1">There are no tasks matching the selected filter for this client.</p>
            <Button 
              size="sm"
              variant="outline"
              className="mt-3 text-xs rounded-xl gap-1.5"
              onClick={() => setIsNewTaskOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Task Box
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCardBox
                key={task.id}
                task={task}
                onClick={() => setSelectedTask(task)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add New Task Modal Dialog - Opens centered in front of user */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="max-w-lg p-6 rounded-2xl border-border bg-card shadow-2xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Create New Task for {client.companyName}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Add a new statutory filing, audit, or verification task card to this client's workspace.
            </p>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Task Title *</label>
              <Input
                placeholder="e.g. FY 2024-25 Tax Audit Form 3CD Preparation"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                className="h-10 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Category</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs"
                >
                  <option value="GST">GST & Indirect Tax</option>
                  <option value="Income Tax">Income Tax & TDS</option>
                  <option value="Audit">Statutory Audit</option>
                  <option value="MSME">Section 43B(h) / MSME</option>
                  <option value="MCA Compliance">MCA & Corporate Law</option>
                  <option value="Payroll & EPF">Payroll & EPF</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Due Date</label>
              <Input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                required
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Task Scope / Description</label>
              <Textarea
                placeholder="Details of ledgers to verify, specific forms to submit, or instructions for client..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
                className="text-xs rounded-xl resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="rounded-xl text-xs"
                onClick={() => setIsNewTaskOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                className="rounded-xl text-xs font-semibold h-9 px-4"
              >
                Create Task Box
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Detail Modal - Opened when clicking on any small task box */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTaskStatus={handleUpdateTaskStatus}
      />
    </div>
  );
};
