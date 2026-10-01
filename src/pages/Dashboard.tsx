import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockClientTasks, mockComplianceDeadlines, mockClients } from '@/data/mockCAData';
import { ClientTask, ComplianceDeadline } from '@/types/ca';
import { TaskCardBox } from '@/components/ca/TaskCardBox';
import { TaskDetailModal } from '@/components/ca/TaskDetailModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PageTransition } from '@/components/ui/PageTransition';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Sparkles, 
  Briefcase, 
  Plus, 
  Copy, 
  ShieldCheck, 
  Key, 
  Users, 
  ArrowUpRight, 
  FileText, 
  Send, 
  UserCheck, 
  MessageSquare, 
  ExternalLink, 
  ChevronRight, 
  UserPlus,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending';
  joinedDate: string;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Company identity details
  const companyName = user?.user_metadata?.business_name || 'Bharat Robotics & Automation Pvt Ltd';
  const companyId = user?.user_metadata?.company_id || 'CMP-BHR-1092';
  const userName = user?.user_metadata?.full_name || 'Rajesh Sharma';
  const userRole = user?.user_metadata?.role || user?.user_metadata?.owner_role || 'Managing Director';
  const sector = user?.user_metadata?.business_type || 'Manufacturing';
  const city = user?.user_metadata?.city || 'Pune, Maharashtra';

  // Tasks for this company
  const [tasks, setTasks] = useState<ClientTask[]>(() => {
    // Filter tasks for this business or default to Bharat Robotics tasks
    const relevant = mockClientTasks.filter(t => t.clientId === 'cli-1');
    return relevant.length > 0 ? relevant : mockClientTasks.slice(0, 5);
  });

  const [selectedTask, setSelectedTask] = useState<ClientTask | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in_review' | 'completed'>('all');

  // New Work Order / Task Modal to dispatch to CA
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

  // Team Approvals State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 'tm-1', name: userName, email: user?.email || 'rajesh@bharatrobotics.in', role: userRole, status: 'active', joinedDate: 'Founding Member' },
    { id: 'tm-2', name: 'Priya Verma', email: 'priya.finance@bharatrobotics.in', role: 'CFO / Finance Lead', status: 'active', joinedDate: '12 Jan 2024' },
    { id: 'tm-3', name: 'Sunil Deshpande', email: 'sunil.ops@bharatrobotics.in', role: 'Operations Manager', status: 'active', joinedDate: '02 Feb 2024' }
  ]);

  const [pendingApprovals, setPendingApprovals] = useState<Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    time: string;
  }>>([
    {
      id: 'appr-1',
      name: 'Aditya Nair',
      email: 'aditya.nair@bharatrobotics.in',
      role: 'Operations Lead',
      department: 'Shop Floor & Inventory',
      time: '15 mins ago'
    }
  ]);

  // Connected CA details
  const [assignedCA, setAssignedCA] = useState({
    firmName: 'CA R. K. Agrawal & Co.',
    partnerName: 'CA Rajesh K. Agrawal, FCA',
    caId: 'CA-AGR-8492',
    icaiNumber: '084920',
    email: 'ca.agrawal@adhikar.ai',
    phone: '+91 98201 11200',
    status: 'Active Audit & Tax Practice'
  });

  const [isCAModalOpen, setIsCAModalOpen] = useState(false);
  const [enteredNewCaId, setEnteredNewCaId] = useState('');

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'all') return true;
    if (taskFilter === 'pending') return t.status === 'pending' || t.status === 'in_progress';
    if (taskFilter === 'in_review') return t.status === 'in_review';
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const handleUpdateTaskStatus = (taskId: string, newStatus: ClientTask['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleCreateTaskForCA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const newTask: ClientTask = {
      id: `task-cmp-${Date.now()}`,
      clientId: 'cli-1',
      clientName: companyName,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      description: newTaskDescription.trim() || `Statutory work order dispatched to ${assignedCA.firmName}.`,
      status: 'pending',
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      assignedDate: new Date().toISOString().split('T')[0],
      documents: [],
      comments: [
        { id: `c-${Date.now()}`, author: userName, role: userRole, text: `Work order dispatched to ${assignedCA.firmName}. Awaiting initial review.`, time: 'Just now' }
      ],
      checklist: [
        { id: 'chk-1', text: 'Share source invoices & books of accounts', completed: true },
        { id: 'chk-2', text: 'Reconcile 2B ledger with supplier filings', completed: false },
        { id: 'chk-3', text: 'Final CA sign-off & portal filing', completed: false }
      ]
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsNewTaskOpen(false);
    toast.success(`Work order "${newTask.title}" dispatched directly to ${assignedCA.firmName}!`);
  };

  const handleApproveMember = (apprId: string) => {
    const appr = pendingApprovals.find(a => a.id === apprId);
    if (!appr) return;

    setTeamMembers(prev => [
      ...prev,
      {
        id: `tm-${Date.now()}`,
        name: appr.name,
        email: appr.email,
        role: appr.role,
        status: 'active',
        joinedDate: 'Today'
      }
    ]);
    setPendingApprovals(prev => prev.filter(a => a.id !== apprId));
    toast.success(`Approved access for ${appr.name} (${appr.role}) to join ${companyName}!`);
  };

  const handleRejectMember = (apprId: string) => {
    const appr = pendingApprovals.find(a => a.id === apprId);
    setPendingApprovals(prev => prev.filter(a => a.id !== apprId));
    toast.info(`Request from ${appr?.name} declined.`);
  };

  return (
    <PageTransition className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* SECTION 1: Executive Enterprise Header */}
      <div className="rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 min-w-0">
              <div className="h-16 w-16 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-2xl">
                <Building2 className="w-8 h-8 text-teal-400" />
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                    {companyName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    MSME {sector}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
                  <span>Welcome back, <strong className="text-white font-semibold">{userName}</strong> ({userRole})</span>
                  <span>•</span>
                  <span>{city}</span>
                </p>

                <div className="flex items-center gap-3 pt-1 text-xs text-slate-300 flex-wrap">
                  <span className="font-mono bg-white/10 px-2 py-0.5 rounded border border-white/10">GSTIN: 27AABCB1234D1Z2</span>
                  <span className="font-mono bg-white/10 px-2 py-0.5 rounded border border-white/10">PAN: AABCB1234D</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              {/* 1-Click Copy Company ID Pill */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(companyId);
                  toast.success(`Copied Company ID (${companyId}) to clipboard! Share with team members.`);
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition-all shadow-sm group"
                title="Click to copy Company ID for team approvals"
              >
                <Key className="w-4 h-4 text-teal-300" />
                <span>Company ID: <strong className="font-mono text-teal-200">{companyId}</strong></span>
                <Copy className="w-3.5 h-3.5 ml-1 opacity-70 group-hover:opacity-100" />
              </button>

              <Button
                variant="secondary"
                size="sm"
                className="rounded-xl text-xs font-semibold h-9 gap-1.5 bg-white text-slate-900 hover:bg-white/90 shadow-sm"
                onClick={() => toast.success(`Exported complete FY 2023-24 Compliance Dossier for ${companyName}`)}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                Export Dossier
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-6 bg-card border-t border-border/70">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium block">Overall Compliance Rating</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-600">88%</span>
              <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Good Standing
              </Badge>
            </div>
            <span className="text-[10px] text-muted-foreground block">GST 95% • Advance Tax 80%</span>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium block">Active Work Orders</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-foreground">{tasks.filter(t => t.status !== 'completed').length}</span>
              <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20">
                1 Urgent Task
              </Badge>
            </div>
            <span className="text-[10px] text-muted-foreground block">Monitored in CA workspace</span>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium block">Connected CA Firm</span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="font-bold text-sm text-foreground truncate">{assignedCA.firmName}</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Direct Channel Active
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium block">Statutory Penalty Watch</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-600">₹0</span>
              <span className="text-[10px] text-muted-foreground font-medium">Levied</span>
            </div>
            <span className="text-[10px] text-muted-foreground block">₹50,000 risk avoided via prompt filings</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Connected CA Firm Hub & Direct Work Order Dispatch */}
      <div className="p-6 rounded-3xl border-2 border-teal-500/30 bg-gradient-to-br from-card via-teal-500/5 to-primary/5 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-600 text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Assigned Chartered Accountant Practice
              </span>
              <span className="font-mono text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded border">
                Connect ID: {assignedCA.caId}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                {assignedCA.firmName}
                <Badge variant="outline" className="text-[10px] border-teal-500/30 text-teal-600">
                  ICAI: {assignedCA.icaiNumber}
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Lead Partner: <strong className="text-foreground">{assignedCA.partnerName}</strong> • {assignedCA.email} • {assignedCA.phone}
              </p>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              Your books of accounts, GST returns, and Advance Tax liabilities are directly audited and synchronized with this CA practice. You can dispatch work orders, upload purchase ledgers, and resolve statutory notices here.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <Button
              className="h-10 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm gap-2"
              onClick={() => setIsNewTaskOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Dispatch Work Order to CA
            </Button>

            <Button
              variant="outline"
              className="h-10 rounded-xl text-xs font-medium border-border hover:border-primary/50 gap-1.5"
              onClick={() => {
                navigator.clipboard.writeText(`Hi CA Rajesh Agrawal, this is ${userName} from ${companyName}. We have a query regarding our statutory compliance.`);
                toast.success('Draft message copied! Ready to send to CA via WhatsApp / Email.');
              }}
            >
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              Consult CA
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-10 rounded-xl text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setIsCAModalOpen(true)}
            >
              Change CA
            </Button>
          </div>
        </div>
      </div>

      {/* SECTION 3: Statutory Compliance Work Orders in Small Interactive Boxes */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Compliance Tasks & Statutory Work Orders
            </h2>
            <p className="text-xs text-muted-foreground">
              Click on any task box below to inspect client requirements, documents, audit checklist, and direct queries with your CA.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs font-semibold h-9 gap-1.5"
              onClick={() => setIsNewTaskOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 text-teal-600" />
              New Work Order
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 text-xs w-full sm:w-auto overflow-x-auto">
          <Button
            size="sm"
            variant={taskFilter === 'all' ? 'default' : 'ghost'}
            className="h-8 text-xs rounded-lg"
            onClick={() => setTaskFilter('all')}
          >
            All Tasks ({tasks.length})
          </Button>
          <Button
            size="sm"
            variant={taskFilter === 'pending' ? 'default' : 'ghost'}
            className="h-8 text-xs rounded-lg"
            onClick={() => setTaskFilter('pending')}
          >
            Pending Action ({tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length})
          </Button>
          <Button
            size="sm"
            variant={taskFilter === 'in_review' ? 'default' : 'ghost'}
            className="h-8 text-xs rounded-lg"
            onClick={() => setTaskFilter('in_review')}
          >
            Under CA Review ({tasks.filter(t => t.status === 'in_review').length})
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

        {/* Small Task Boxes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCardBox
              key={task.id}
              task={task}
              onClick={() => setSelectedTask(task)}
            />
          ))}
        </div>
      </div>

      {/* SECTION 4 & 5: Team Approvals & Upcoming Deadlines (2 Columns) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Statutory Filing Deadlines & Risk Watch */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Statutory Filing Deadlines & Penalties Watch
              </h2>
              <p className="text-xs text-muted-foreground">
                Crucial statutory filing cut-offs for MSMEs and late fee avoidance.
              </p>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-primary hover:text-primary/90"
              onClick={() => navigate('/dashboard/compliance')}
            >
              Open Statutory Calendar →
            </Button>
          </div>

          <div className="space-y-3">
            {mockComplianceDeadlines.slice(0, 4).map((dl) => (
              <Card
                key={dl.id}
                className="p-4 rounded-2xl border border-border/80 bg-card hover:border-teal-500/40 transition-all overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-12 w-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold uppercase">{dl.dueDate.split('-')[1] === '03' ? 'MAR' : 'APR'}</span>
                      <span className="text-lg font-black leading-none">{dl.dueDate.split('-')[2]}</span>
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase text-teal-700 dark:text-teal-400 border-teal-500/30">
                          {dl.category}
                        </Badge>
                        <Badge className={`text-[10px] uppercase font-bold ${
                          dl.status === 'due_today' 
                            ? 'bg-rose-600 text-white' 
                            : dl.status === 'critical' 
                              ? 'bg-amber-500 text-white' 
                              : 'bg-blue-600 text-white'
                        }`}>
                          {dl.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-[11px] font-mono text-muted-foreground font-semibold">Form: {dl.formNumber}</span>
                      </div>

                      <h3 className="text-sm font-bold text-foreground truncate">{dl.title}</h3>
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium truncate">
                        Penalty: {dl.penaltyClause}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                    <span className="text-xs font-semibold text-emerald-600">
                      CA Audit in Progress
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs rounded-lg gap-1"
                      onClick={() => toast.success(`Synced ${dl.title} to your Google Calendar!`)}
                    >
                      Sync to Calendar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Team Approvals & Organization Access Hub */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Team Access Approvals
            </h2>
            <p className="text-xs text-muted-foreground">
              Employees requesting to join via Company ID.
            </p>
          </div>

          <Card className="p-5 rounded-2xl border border-border/80 bg-card space-y-4 shadow-sm">
            {/* Pending Requests */}
            {pendingApprovals.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Pending Requests ({pendingApprovals.length})
                  </span>
                </div>

                {pendingApprovals.map((req) => (
                  <div key={req.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{req.name}</h4>
                        <span className="text-[11px] text-muted-foreground block">{req.email}</span>
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          {req.role} {req.department && `• ${req.department}`}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{req.time}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        className="h-7 px-3 text-xs rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium flex-1"
                        onClick={() => handleApproveMember(req.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs rounded-lg text-rose-600 hover:bg-rose-50"
                        onClick={() => handleRejectMember(req.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted/40 text-center text-xs text-muted-foreground">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                All pending member access requests are resolved.
              </div>
            )}

            {/* Active Team Roster */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Active Team Roster ({teamMembers.length})
              </span>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {teamMembers.map((tm) => (
                  <div key={tm.id} className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/50 text-xs">
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground truncate block">{tm.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate block">{tm.role}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/20">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Share Company ID Button */}
            <Button
              variant="outline"
              className="w-full h-9 rounded-xl text-xs font-semibold gap-1.5 border-dashed border-teal-500/50 text-teal-700 dark:text-teal-400"
              onClick={() => {
                navigator.clipboard.writeText(`Hi, please join our AdhikarAI enterprise workspace for ${companyName} using our Company ID: ${companyId}`);
                toast.success('Invitation text with Company ID copied to clipboard!');
              }}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Team Member (Copy ID)
            </Button>
          </Card>
        </div>
      </div>

      {/* MODAL 1: Dispatch New Work Order to CA */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="max-w-lg p-6 rounded-2xl border-border bg-card shadow-2xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              Dispatch Statutory Work Order to CA
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create an official compliance task to be audited and executed by {assignedCA.firmName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTaskForCA} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Task / Work Order Title *</label>
              <Input
                placeholder="e.g. FY 2023-24 GSTR-9 Annual Return Reconciliation"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                className="h-10 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Statutory Category</label>
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
                  <option value="urgent">Urgent (Due this week)</option>
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
              <label className="text-xs font-semibold text-foreground">Instructions & Scope for CA</label>
              <Textarea
                placeholder="Details of books attached, transactions to verify, or specific questions for CA Rajesh Agrawal..."
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
                className="rounded-xl text-xs font-semibold h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white"
              >
                Dispatch to CA Practice
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Manage / Change CA Practice */}
      <Dialog open={isCAModalOpen} onOpenChange={setIsCAModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl border-border bg-card shadow-2xl space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              Manage Chartered Accountant Pairing
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Link your business workspace to your appointed CA's Practice Connect ID.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-xl bg-muted/50 border border-border/80 space-y-1 text-xs">
            <span className="text-muted-foreground block">Currently Connected:</span>
            <p className="font-bold text-foreground text-sm">{assignedCA.firmName}</p>
            <span className="font-mono text-teal-600 font-medium">CA Connect ID: {assignedCA.caId}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Enter New CA Connect ID</label>
            <Input
              placeholder="e.g. CA-AGR-8492"
              value={enteredNewCaId}
              onChange={(e) => setEnteredNewCaId(e.target.value.toUpperCase())}
              className="h-10 rounded-xl text-xs font-mono uppercase"
            />
            <p className="text-[10px] text-muted-foreground">Obtain this code from your appointed Chartered Accountant.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCAModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
              onClick={() => {
                if (!enteredNewCaId.trim()) {
                  toast.error('Please enter a CA Connect ID');
                  return;
                }
                setAssignedCA(prev => ({ ...prev, caId: enteredNewCaId.trim() }));
                setIsCAModalOpen(false);
                setEnteredNewCaId('');
                toast.success(`Successfully connected workspace to CA ID (${enteredNewCaId.trim()})!`);
              }}
            >
              Update CA Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Detail Modal - Opened when clicking on any small task box */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTaskStatus={handleUpdateTaskStatus}
      />
    </PageTransition>
  );
};

export default Dashboard;
