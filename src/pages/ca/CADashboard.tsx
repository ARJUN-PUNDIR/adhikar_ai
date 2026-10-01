import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockClients, mockClientTasks, mockPolicyReforms, mockComplianceDeadlines } from '@/data/mockCAData';
import { Client, ClientTask, PolicyReform } from '@/types/ca';
import { TaskCardBox } from '@/components/ca/TaskCardBox';
import { TaskDetailModal } from '@/components/ca/TaskDetailModal';
import { PolicyReformModal } from '@/components/ca/PolicyReformModal';
import { ClientProfileView } from '@/components/ca/ClientProfileView';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/ui/PageTransition';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Landmark, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  FileText, 
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Search,
  Key,
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const CADashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [tasks, setTasks] = useState<ClientTask[]>(mockClientTasks);
  const [selectedTask, setSelectedTask] = useState<ClientTask | null>(null);
  const [selectedReform, setSelectedReform] = useState<PolicyReform | null>(null);
  const [activeClientProfile, setActiveClientProfile] = useState<Client | null>(null);

  // Filtered task state
  const [taskFilter, setTaskFilter] = useState<'pending' | 'urgent' | 'all'>('pending');

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');
  const displayedTasks = taskFilter === 'urgent' 
    ? urgentTasks 
    : taskFilter === 'pending' 
      ? pendingTasks 
      : tasks;

  // Stats
  const totalClients = clients.length;
  const clientsAtRisk = clients.filter(c => c.status === 'Action Needed' || c.complianceScore < 80).length;
  const avgComplianceScore = Math.round(clients.reduce((acc, c) => acc + c.complianceScore, 0) / totalClients);

  const handleUpdateTaskStatus = (taskId: string, newStatus: ClientTask['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  // If viewing a specific client's interactive profile
  if (activeClientProfile) {
    return (
      <PageTransition className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <ClientProfileView
          client={activeClientProfile}
          tasks={tasks}
          onBack={() => setActiveClientProfile(null)}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur border border-white/10 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Chartered Accountant Executive Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome, {user?.user_metadata?.full_name || 'CA Rajesh K. Agrawal, FCA'}
          </h1>
          <p className="text-sm text-slate-300">
            {user?.user_metadata?.firm_name || 'R. K. Agrawal & Co., Chartered Accountants'} • ICAI Portal Active
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Button 
            variant="outline" 
            className="rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs h-10 backdrop-blur"
            onClick={() => navigate('/dashboard/reforms')}
          >
            <Landmark className="w-3.5 h-3.5 mr-1.5" />
            Govt Reforms
          </Button>
          <Button 
            className="rounded-xl bg-primary hover:bg-primary/90 text-white text-xs h-10 shadow-lg shadow-primary/30"
            onClick={() => navigate('/dashboard/clients')}
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Client Directory
          </Button>
        </div>
      </div>

      {/* Top Interactive Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending Tasks */}
        <Card className="p-5 rounded-2xl border-border/80 bg-card/60 backdrop-blur hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Tasks</span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-foreground tracking-tight">{pendingTasks.length}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <span className="text-rose-600 font-semibold">{urgentTasks.length} urgent</span>
            <span>across {totalClients} MSME clients</span>
          </p>
        </Card>

        {/* Metric 2: Compliance Score */}
        <Card className="p-5 rounded-2xl border-border/80 bg-card/60 backdrop-blur hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compliance Index</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-foreground tracking-tight">{avgComplianceScore}%</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold">Healthy rating</span>
            <span>All statutory filings</span>
          </p>
        </Card>

        {/* Metric 3: Upcoming Deadlines */}
        <Card className="p-5 rounded-2xl border-border/80 bg-card/60 backdrop-blur hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upcoming Reminders</span>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-foreground tracking-tight">{mockComplianceDeadlines.length}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <span className="text-blue-600 font-semibold">2 due this week</span>
            <span>GST & Advance Tax</span>
          </p>
        </Card>

        {/* Metric 4: Clients At Risk */}
        <Card className="p-5 rounded-2xl border-border/80 bg-card/60 backdrop-blur hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action Needed</span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 tracking-tight">{clientsAtRisk} Clients</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <span className="text-rose-600 font-semibold">Sec 43B(h) & GST notice</span>
          </p>
        </Card>
      </div>

      {/* SECTION 1: Pending Tasks Grid (Small Boxes) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Pending Client Tasks & Work Orders
            </h2>
            <p className="text-xs text-muted-foreground">
              Click on any task box to inspect requirements, client files, audit checklist, and update status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/70 text-xs border border-border/80">
              <Button
                size="sm"
                variant={taskFilter === 'pending' ? 'default' : 'ghost'}
                className="h-7 text-xs rounded-lg"
                onClick={() => setTaskFilter('pending')}
              >
                Pending ({pendingTasks.length})
              </Button>
              <Button
                size="sm"
                variant={taskFilter === 'urgent' ? 'default' : 'ghost'}
                className="h-7 text-xs rounded-lg"
                onClick={() => setTaskFilter('urgent')}
              >
                Urgent ({urgentTasks.length})
              </Button>
              <Button
                size="sm"
                variant={taskFilter === 'all' ? 'default' : 'ghost'}
                className="h-7 text-xs rounded-lg"
                onClick={() => setTaskFilter('all')}
              >
                All ({tasks.length})
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs rounded-xl gap-1"
              onClick={() => navigate('/dashboard/tasks')}
            >
              Task Board
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Small Task Boxes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedTasks.map((task) => (
            <TaskCardBox
              key={task.id}
              task={task}
              onClick={() => setSelectedTask(task)}
            />
          ))}
        </div>
      </div>

      {/* SECTION 2: Upcoming Statutory Reminders & CA Connect ID (2 Columns) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Statutory Deadlines & Risk Watch */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Upcoming Statutory Deadlines & Penalties Watch
              </h2>
              <p className="text-xs text-muted-foreground">
                Critical cross-client tax filings, GST returns, and late fee clauses.
              </p>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-primary hover:text-primary/90"
              onClick={() => navigate('/dashboard/calendar')}
            >
              Open Full Calendar ({mockComplianceDeadlines.length}) →
            </Button>
          </div>

          <div className="space-y-3">
            {mockComplianceDeadlines.map((dl) => (
              <Card
                key={dl.id}
                className="p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition-all overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold uppercase">{dl.dueDate.split('-')[1] === '03' ? 'MAR' : 'APR'}</span>
                      <span className="text-lg font-black leading-none">{dl.dueDate.split('-')[2]}</span>
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase text-primary border-primary/30">
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
                    <span className="text-xs font-semibold text-foreground">
                      {dl.applicableClientsCount} Clients Liable
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs rounded-lg"
                      onClick={() => toast.success(`Statutory reminder broadcast to ${dl.applicableClientsCount} MSME clients`)}
                    >
                      Broadcast Alert
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right 1 Col: CA Connect ID & Practice Link Hub */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Key className="w-5 h-5 text-teal-600" />
              CA Connect ID
            </h2>
            <p className="text-xs text-muted-foreground">
              Direct connection code for MSME clients.
            </p>
          </div>

          <Card className="p-6 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-primary/5 to-teal-500/5 shadow-md space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Practice Connect ID</span>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-primary/30 shadow-xs">
                <span className="font-mono text-lg font-black tracking-wider text-primary">
                  {user?.user_metadata?.ca_connect_id || 'CA-AGR-8492'}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 text-xs font-semibold rounded-lg gap-1.5"
                  onClick={() => {
                    const id = user?.user_metadata?.ca_connect_id || 'CA-AGR-8492';
                    navigator.clipboard.writeText(id);
                    toast.success(`Copied CA Connect ID (${id}) to clipboard! Share with your clients.`);
                  }}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong>How it works:</strong> Provide this Connect ID to your MSME clients. When they sign up or enter it in their portal settings, their workspace automatically links to your CA dashboard.
              </p>
              <div className="p-2.5 rounded-lg bg-muted/60 text-[11px] space-y-1 border border-border/80">
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Real-time Ledger & Document Access</span>
                </div>
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Direct Task Orders & Verification</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-10 rounded-xl text-xs font-semibold shadow-sm"
              onClick={() => {
                const id = user?.user_metadata?.ca_connect_id || 'CA-AGR-8492';
                navigator.clipboard.writeText(`Hi, please connect your AdhikarAI business workspace to our CA practice using our Connect ID: ${id}`);
                toast.success('Invitation text with CA Connect ID copied! Ready to paste into WhatsApp / Email.');
              }}
            >
              Share Invitation with Client
            </Button>
          </Card>
        </div>
      </div>

      {/* SECTION 4: Client List Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Client Directory ({clients.length} MSMEs)
            </h2>
            <p className="text-xs text-muted-foreground">
              Click on any client to open their full interactive profile and small task cards.
            </p>
          </div>

          <Button
            size="sm"
            className="rounded-xl text-xs font-semibold h-9"
            onClick={() => navigate('/dashboard/clients')}
          >
            Manage All Clients
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Card
              key={client.id}
              onClick={() => setActiveClientProfile(client)}
              className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${client.avatarColor} text-white font-bold text-base flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    {client.companyName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {client.companyName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{client.contactPerson}</p>
                  </div>
                </div>

                <Badge className={`text-[10px] flex-shrink-0 ${
                  client.status === 'Active' ? 'bg-emerald-600' : 'bg-amber-500'
                }`}>
                  {client.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 py-2 px-3 rounded-xl bg-muted/40 border border-border/60 text-xs my-3">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Sector</span>
                  <span className="font-medium text-foreground">{client.businessType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Compliance Rating</span>
                  <span className="font-bold text-emerald-600">{client.complianceScore}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{client.pendingTasksCount}</strong> pending tasks
                </span>
                <span className="text-primary font-semibold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Profile →
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTaskStatus={handleUpdateTaskStatus}
      />

      {/* Policy Reform Modal */}
      <PolicyReformModal
        reform={selectedReform}
        isOpen={!!selectedReform}
        onClose={() => setSelectedReform(null)}
      />
    </PageTransition>
  );
};

export default CADashboard;
