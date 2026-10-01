import { useState } from 'react';
import { mockComplianceDeadlines, mockClients } from '@/data/mockCAData';
import { ComplianceDeadline } from '@/types/ca';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/ui/PageTransition';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Filter, 
  Download,
  Building2,
  CalendarCheck
} from 'lucide-react';
import { toast } from 'sonner';

export const CACalendar = () => {
  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>(mockComplianceDeadlines);
  const [selectedMonth, setSelectedMonth] = useState('March 2025');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', 'GST', 'Income Tax', 'MCA', 'EPF / ESI'];

  const filteredDeadlines = deadlines.filter((d) => {
    return categoryFilter === 'all' || d.category === categoryFilter;
  });

  return (
    <PageTransition className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarCheck className="w-7 h-7 text-primary" />
            Statutory Compliance Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cross-client statutory filing dates, due date penalties, and multi-portal filing deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-1.5"
            onClick={() => toast.success('Exported March 2025 Compliance Schedule as iCal / Google Calendar')}
          >
            <Download className="w-3.5 h-3.5" />
            Sync Calendar (iCal)
          </Button>
        </div>
      </div>

      {/* Month Navigation Banner */}
      <Card className="p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => toast.info('Navigating to previous month')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">{selectedMonth}</h3>
          <p className="text-xs text-muted-foreground">FY 2024-25 • Q4 Final Filings</p>
        </div>

        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => toast.info('Navigating to next month')}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 text-xs w-full sm:w-auto overflow-x-auto">
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={categoryFilter === cat ? 'default' : 'ghost'}
            className="h-8 text-xs rounded-lg capitalize"
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Calendar Timeline Grid */}
      <div className="space-y-4">
        {filteredDeadlines.map((dl) => (
          <Card
            key={dl.id}
            className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Date Box */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center flex-shrink-0 text-primary">
                  <span className="text-xs font-bold uppercase">{dl.dueDate.split('-')[1] === '03' ? 'MAR' : 'APR'}</span>
                  <span className="text-2xl font-extrabold leading-none">{dl.dueDate.split('-')[2]}</span>
                </div>

                <div className="space-y-1">
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
                    <span className="text-xs text-muted-foreground font-mono font-medium">Form: {dl.formNumber}</span>
                  </div>

                  <h3 className="text-base font-bold text-foreground">{dl.title}</h3>
                  <p className="text-xs text-muted-foreground">Applicable Period: {dl.period}</p>
                </div>
              </div>

              {/* Action and Penalty Risk */}
              <div className="flex flex-col md:items-end justify-between gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                <div className="text-left md:text-right">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">
                    Statutory Penalty on Delay:
                  </span>
                  <span className="text-[11px] text-muted-foreground block max-w-sm">
                    {dl.penaltyClause}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-foreground">
                    Liable Clients: <strong>{dl.applicableClientsCount} MSMEs</strong>
                  </span>
                  <Button
                    size="sm"
                    className="h-8 text-xs rounded-xl"
                    onClick={() => toast.success(`Automated compliance notice sent to ${dl.applicableClientsCount} clients`)}
                  >
                    Broadcast Alert
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageTransition>
  );
};

export default CACalendar;
