import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockClientTasks } from '@/data/mockCAData';
import { ClientTask } from '@/types/ca';
import { TaskCardBox } from '@/components/ca/TaskCardBox';
import { TaskDetailModal } from '@/components/ca/TaskDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PageTransition } from '@/components/ui/PageTransition';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  Plus,
  Building2,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

export const CATasks = () => {
  const { user, accountType } = useAuth();
  const isCA = accountType === 'ca';
  const companyName = user?.user_metadata?.business_name || 'Bharat Robotics & Automation Pvt Ltd';

  const [tasks, setTasks] = useState<ClientTask[]>(() => {
    if (isCA) return mockClientTasks;
    // For Company Member, show tasks relevant to their business
    const relevant = mockClientTasks.filter(t => t.clientId === 'cli-1');
    return relevant.length > 0 ? relevant : mockClientTasks.slice(0, 5);
  });

  const [selectedTask, setSelectedTask] = useState<ClientTask | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'in_review' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New Work Order dialog state
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

  const categories = ['all', 'GST', 'Income Tax', 'Audit', 'MCA Compliance', 'MSME', 'Payroll & EPF'];

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
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
      id: `task-custom-${Date.now()}`,
      clientId: 'cli-1',
      clientName: isCA ? 'Bharat Robotics & Automation Pvt Ltd' : companyName,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      description: newTaskDescription.trim() || 'Statutory compliance and filing work order.',
      status: 'pending',
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      assignedDate: new Date().toISOString().split('T')[0],
      documents: [],
      comments: [
        { id: `c-${Date.now()}`, author: isCA ? 'CA Practice' : 'Company Admin', role: isCA ? 'Chartered Accountant' : 'Client Admin', text: 'Task initialized.', time: 'Just now' }
      ],
      checklist: [
        { id: 'chk-1', text: 'Review purchase & sales registers', completed: false },
        { id: 'chk-2', text: 'Verify statutory calculations & challans', completed: false }
      ]
    };

    setTasks([newTask, ...tasks]);
    setIsNewTaskOpen(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
    toast.success(`Task "${newTask.title}" created successfully!`);
  };

  return (
    <PageTransition className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CheckSquare className={`w-7 h-7 ${isCA ? 'text-primary' : 'text-teal-600'}`} />
            {isCA ? 'Client Tasks & Statutory Filings' : 'Compliance Tasks & Work Orders'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isCA 
              ? 'Interactive task management across all clients. Click any box to inspect audit requirements and client documents.'
              : `All statutory filing tasks for ${companyName}, monitored directly with your appointed Chartered Accountant.`
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className={`rounded-xl text-xs font-semibold h-9 gap-1.5 ${
              isCA ? 'bg-primary hover:bg-primary/90' : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
            onClick={() => setIsNewTaskOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            {isCA ? 'Add New Task' : 'Dispatch Work Order to CA'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs"
            onClick={() => toast.success('Tasks synced with GST and Income Tax e-filing portals')}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
            Sync Portals
          </Button>
        </div>
      </div>

      {/* Task Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setStatusFilter('all')} 
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'all' ? (isCA ? 'border-primary bg-primary/5 shadow-sm' : 'border-teal-500 bg-teal-500/5 shadow-sm') : 'border-border bg-card'
          }`}
        >
          <span className="text-[11px] text-muted-foreground font-medium block">Total Tasks</span>
          <span className="text-2xl font-bold text-foreground">{tasks.length}</span>
        </div>

        <div 
          onClick={() => setStatusFilter('pending')} 
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'pending' ? 'border-amber-500 bg-amber-500/5 shadow-sm' : 'border-border bg-card'
          }`}
        >
          <span className="text-[11px] text-amber-600 font-medium block">Pending Action</span>
          <span className="text-2xl font-bold text-amber-600">
            {tasks.filter(t => t.status === 'pending').length}
          </span>
        </div>

        <div 
          onClick={() => setStatusFilter('in_progress')} 
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'in_progress' ? 'border-blue-500 bg-blue-500/5 shadow-sm' : 'border-border bg-card'
          }`}
        >
          <span className="text-[11px] text-blue-600 font-medium block">In Progress</span>
          <span className="text-2xl font-bold text-blue-600">
            {tasks.filter(t => t.status === 'in_progress' || t.status === 'in_review').length}
          </span>
        </div>

        <div 
          onClick={() => setStatusFilter('completed')} 
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'completed' ? 'border-emerald-500 bg-emerald-500/5 shadow-sm' : 'border-border bg-card'
          }`}
        >
          <span className="text-[11px] text-emerald-600 font-medium block">Completed</span>
          <span className="text-2xl font-bold text-emerald-600">
            {tasks.filter(t => t.status === 'completed').length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 text-xs w-full sm:w-auto overflow-x-auto">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={categoryFilter === cat ? 'default' : 'ghost'}
                className={`h-8 text-xs rounded-lg capitalize flex-shrink-0 ${
                  categoryFilter === cat && !isCA ? 'bg-teal-600 text-white font-semibold' : ''
                }`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by task title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Task Boxes Grid */}
      {filteredTasks.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border-dashed border-2">
          <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground/60 mb-3" />
          <h3 className="font-bold text-base text-foreground">No tasks match your filter</h3>
          <p className="text-xs text-muted-foreground mt-1">Try resetting the status or category filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTasks.map((task) => (
            <TaskCardBox
              key={task.id}
              task={task}
              onClick={() => setSelectedTask(task)}
            />
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTaskStatus={handleUpdateTaskStatus}
      />

      {/* Create New Task / Work Order Dialog */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="max-w-lg p-6 rounded-2xl border-border bg-card shadow-2xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Plus className={`w-4 h-4 ${isCA ? 'text-primary' : 'text-teal-600'}`} />
              {isCA ? 'Create Compliance Task' : 'Dispatch Statutory Work Order to CA'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isCA 
                ? 'Create a new audit or verification task.' 
                : 'Dispatch a new compliance task directly to your appointed Chartered Accountant.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Task Title *</label>
              <Input
                placeholder="e.g. FY 2023-24 GSTR-9 Annual Reconciliation"
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
              <label className="text-xs font-semibold text-foreground">Instructions & Scope</label>
              <Textarea
                placeholder="Details of verification required or instructions..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
                className="text-xs rounded-xl resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsNewTaskOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                className={`text-xs font-semibold h-9 px-4 text-white ${
                  isCA ? 'bg-primary hover:bg-primary/90' : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {isCA ? 'Create Task Box' : 'Dispatch to CA'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default CATasks;
