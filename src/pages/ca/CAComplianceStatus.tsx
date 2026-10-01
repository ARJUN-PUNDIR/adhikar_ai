import { useState } from 'react';
import { mockClients, mockComplianceDeadlines } from '@/data/mockCAData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/ui/PageTransition';
import { 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  FileCheck, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const CAComplianceStatus = () => {
  const navigate = useNavigate();
  const [clients] = useState(mockClients);

  const avgScore = Math.round(clients.reduce((acc, c) => acc + c.complianceScore, 0) / clients.length);
  const fullyCompliant = clients.filter(c => c.complianceScore >= 90).length;
  const underReview = clients.filter(c => c.complianceScore >= 75 && c.complianceScore < 90).length;
  const highRisk = clients.filter(c => c.complianceScore < 75).length;

  return (
    <PageTransition className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            Compliance Status & Risk Exposure
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Holistic audit rating across your MSME client practice for GST, Direct Tax, MCA, and Labor Laws.
          </p>
        </div>

        <Button
          size="sm"
          className="rounded-xl text-xs gap-1.5"
          onClick={() => toast.success('Generated Practice Compliance Health Audit Report')}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate Practice Audit Report
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 rounded-2xl border border-border/80 bg-card">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Average Health</span>
          <div className="text-3xl font-extrabold text-foreground mt-1">{avgScore}%</div>
          <span className="text-xs text-emerald-600 font-medium">Practice-wide benchmark</span>
        </Card>

        <Card className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Fully Compliant</span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">{fullyCompliant} Clients</div>
          <span className="text-xs text-muted-foreground">Score &gt; 90%</span>
        </Card>

        <Card className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase">Review Pending</span>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">{underReview} Clients</div>
          <span className="text-xs text-muted-foreground">Action required before month-end</span>
        </Card>

        <Card className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5">
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase">Critical Risk</span>
          <div className="text-3xl font-extrabold text-rose-600 mt-1">{highRisk} Client</div>
          <span className="text-xs text-rose-600 font-medium">Notice under Sec 73 pending</span>
        </Card>
      </div>

      {/* Client-by-Client Compliance Table */}
      <Card className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">Client Compliance Health Matrix</h3>
          <p className="text-xs text-muted-foreground">Live statutory standings across all government portals.</p>
        </div>

        <div className="divide-y divide-border">
          {clients.map((client) => (
            <div
              key={client.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${client.avatarColor} text-white font-bold text-base flex items-center justify-center flex-shrink-0`}>
                  {client.companyName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{client.companyName}</h4>
                  <p className="text-xs text-muted-foreground font-mono">GSTIN: {client.gstin} • {client.businessType}</p>
                </div>
              </div>

              {/* Progress and status */}
              <div className="flex items-center gap-6">
                <div className="w-36 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Score</span>
                    <span className={client.complianceScore > 80 ? 'text-emerald-600' : 'text-rose-600'}>
                      {client.complianceScore}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        client.complianceScore > 80 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${client.complianceScore}%` }}
                    />
                  </div>
                </div>

                <Badge className={client.status === 'Active' ? 'bg-emerald-600' : 'bg-amber-500'}>
                  {client.status}
                </Badge>

                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs"
                  onClick={() => navigate('/dashboard/clients')}
                >
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageTransition>
  );
};

export default CAComplianceStatus;
