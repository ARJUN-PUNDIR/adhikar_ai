import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Download, 
  Bell, 
  Filter,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Building2,
  CheckSquare
} from 'lucide-react';
import { mockComplianceDeadlines } from '@/data/mockCAData';
import { ComplianceDeadline } from '@/types/ca';
import { toast } from 'sonner';
import { PageTransition } from '@/components/ui/PageTransition';

interface CustomReminder {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  formNumber: string;
  notes: string;
  status: 'upcoming' | 'completed';
}

export const Compliance = () => {
  const { user } = useAuth();
  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>(mockComplianceDeadlines);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  // New Reminder form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('GST');
  const [dueDate, setDueDate] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [notes, setNotes] = useState('');

  const companyName = user?.user_metadata?.business_name || 'Bharat Robotics & Automation Pvt Ltd';

  const categories = ['all', 'GST', 'Income Tax', 'MCA', 'EPF / ESI', 'Customs'];

  const filteredDeadlines = deadlines.filter(d => {
    if (categoryFilter === 'all') return true;
    return d.category === categoryFilter;
  });

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast.error('Please enter title and due date');
      return;
    }

    const newDl: ComplianceDeadline = {
      id: `dl-custom-${Date.now()}`,
      title: title.trim(),
      category: category as any,
      dueDate: dueDate,
      period: 'FY 2023-24',
      applicableClientsCount: 1,
      status: 'upcoming',
      formNumber: formNumber.trim() || 'Internal Checklist',
      penaltyClause: notes.trim() || 'Statutory compliance milestone.'
    };

    setDeadlines([newDl, ...deadlines]);
    setDialogOpen(false);
    setTitle('');
    setDueDate('');
    setFormNumber('');
    setNotes('');
    toast.success(`Statutory reminder "${newDl.title}" created and added to company timeline!`);
  };

  return (
    <PageTransition className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-teal-600" />
            Statutory Compliance & Tax Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time statutory timeline for <strong className="text-foreground">{companyName}</strong>. Directly monitored by your Chartered Accountant.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-semibold h-9 gap-1.5 border-border hover:border-teal-500/50"
            onClick={() => {
              toast.success('All upcoming statutory deadlines exported as an iCal (.ics) calendar file!');
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Sync with Google / Outlook
          </Button>

          <Button
            size="sm"
            className="rounded-xl text-xs font-semibold h-9 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Statutory Protection & Liability Avoidance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl border-border bg-card">
          <span className="text-[11px] text-muted-foreground font-medium block">Total Filings in FY 24</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-foreground">18</span>
            <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              100% On-Time
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">Zero default notices received</span>
        </Card>

        <Card className="p-4 rounded-2xl border-border bg-card">
          <span className="text-[11px] text-muted-foreground font-medium block">Late Fee Avoidance</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">₹1,20,000</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">Protected via prompt filings</span>
        </Card>

        <Card className="p-4 rounded-2xl border-border bg-card">
          <span className="text-[11px] text-muted-foreground font-medium block">Next Critical Deadline</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-amber-600">15 Mar</span>
            <Badge className="text-[10px] bg-amber-500/10 text-amber-600">
              Advance Tax Q4
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">Form Chn-280 installment</span>
        </Card>

        <Card className="p-4 rounded-2xl border-border bg-card">
          <span className="text-[11px] text-muted-foreground font-medium block">Section 43B(h) Watch</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-teal-600">31 Mar</span>
            <Badge className="text-[10px] bg-teal-500/10 text-teal-600">
              45-Day Rule
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">Clear vendor dues before year end</span>
        </Card>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 text-xs overflow-x-auto w-full sm:w-auto">
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={categoryFilter === cat ? 'default' : 'ghost'}
            className={`h-8 text-xs rounded-lg ${
              categoryFilter === cat ? 'bg-teal-600 text-white font-semibold' : 'text-muted-foreground'
            }`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat === 'all' ? 'All Deadlines' : cat}
          </Button>
        ))}
      </div>

      {/* Interactive Deadlines Cards */}
      <div className="space-y-3">
        {filteredDeadlines.map((dl) => (
          <Card
            key={dl.id}
            className="p-5 rounded-2xl border border-border/80 bg-card hover:border-teal-500/40 hover:shadow-md transition-all overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div className="h-14 w-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold uppercase">{dl.dueDate.split('-')[1] === '03' ? 'MAR' : 'APR'}</span>
                  <span className="text-xl font-black leading-none">{dl.dueDate.split('-')[2]}</span>
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs uppercase font-bold text-teal-700 dark:text-teal-300 border-teal-500/30">
                      {dl.category}
                    </Badge>
                    <Badge className={`text-xs uppercase font-bold ${
                      dl.status === 'due_today'
                        ? 'bg-rose-600 text-white'
                        : dl.status === 'critical'
                          ? 'bg-amber-500 text-white'
                          : 'bg-teal-600 text-white'
                    }`}>
                      {dl.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground font-semibold">Form: {dl.formNumber}</span>
                  </div>

                  <h3 className="text-base font-bold text-foreground truncate">{dl.title}</h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium leading-relaxed">
                    Statutory Penalty: {dl.penaltyClause}
                  </p>
                </div>
              </div>

              <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> CA Audit in Progress
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs rounded-xl gap-1.5"
                  onClick={() => toast.success(`Synced ${dl.title} to your local calendar!`)}
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
                  Sync to Calendar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Custom Reminder Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl border-border bg-card shadow-2xl space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              Add Statutory Compliance Reminder
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Schedule an upcoming tax filing, board approval, or vendor payment deadline.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateReminder} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Reminder Title *</Label>
              <Input
                placeholder="e.g. Advance Tax Q4 Calculation Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs"
                >
                  <option value="GST">GST</option>
                  <option value="Income Tax">Income Tax</option>
                  <option value="MCA">MCA</option>
                  <option value="EPF / ESI">EPF / ESI</option>
                  <option value="Customs">Customs</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Due Date *</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Statutory Form / Number</Label>
              <Input
                placeholder="e.g. Form 3CD / Chn-280"
                value={formNumber}
                onChange={(e) => setFormNumber(e.target.value)}
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Penalty Notes / Action Needed</Label>
              <Textarea
                placeholder="Late fee clause, supplier payment terms, or verification instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="text-xs rounded-xl resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs">
                Create Reminder
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Compliance;
