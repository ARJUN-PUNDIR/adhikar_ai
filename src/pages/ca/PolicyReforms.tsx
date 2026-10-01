import { useState } from 'react';
import { mockPolicyReforms } from '@/data/mockCAData';
import { PolicyReform } from '@/types/ca';
import { PolicyReformModal } from '@/components/ca/PolicyReformModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/ui/PageTransition';
import { 
  Landmark, 
  Search, 
  Calendar, 
  FileText, 
  AlertCircle, 
  Share2, 
  Download, 
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export const PolicyReforms = () => {
  const [reforms, setReforms] = useState<PolicyReform[]>(mockPolicyReforms);
  const [selectedReform, setSelectedReform] = useState<PolicyReform | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', 'MSME Act', 'GST', 'Direct Tax', 'MCA / Companies Act'];

  const filteredReforms = reforms.filter((r) => {
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.notificationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageTransition className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Landmark className="w-7 h-7 text-primary" />
            Government Policy Reforms & Circulars
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time notifications, gazetted amendments, and statutory advisories from MCA, CBDT, CBIC, and MSME Ministry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs"
            onClick={() => toast.success('Reforms refreshed from official gazette feeds')}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
            Check for New Gazette Circulars
          </Button>
        </div>
      </div>

      {/* Highlights Banner: Section 43B(h) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-600 text-white text-[10px] uppercase font-bold">Priority Advisory</Badge>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Fiscal Year-End Rule</span>
          </div>
          <h3 className="text-base font-bold text-foreground">
            Section 43B(h) MSME 45-Day Payment Rule Compliance
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            Ensure all your MSME corporate clients clear invoices payable to registered Micro and Small suppliers within agreed contract limits (max 45 days) to avoid complete disallowance under taxable business income.
          </p>
        </div>

        <Button
          size="sm"
          className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex-shrink-0"
          onClick={() => {
            const sec43 = mockPolicyReforms.find(r => r.category === 'MSME Act');
            if (sec43) setSelectedReform(sec43);
          }}
        >
          Read Full Clarification
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 text-xs w-full sm:w-auto overflow-x-auto">
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={categoryFilter === cat ? 'default' : 'ghost'}
              className="h-8 text-xs rounded-lg capitalize flex-shrink-0"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notifications & circulars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Reforms List */}
      <div className="space-y-4">
        {filteredReforms.map((reform) => (
          <Card
            key={reform.id}
            onClick={() => setSelectedReform(reform)}
            className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card hover:border-primary/60 hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs uppercase font-bold text-primary border-primary/30">
                    {reform.category}
                  </Badge>
                  <Badge className={`text-xs uppercase font-bold ${
                    reform.impactLevel === 'Critical' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {reform.impactLevel} Impact
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">{reform.ministry}</span>
                  <span className="text-xs text-muted-foreground">• Circular: <strong className="font-mono text-foreground font-medium">{reform.notificationNumber}</strong></span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug break-words">
                  {reform.title}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                  {reform.summary}
                </p>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                  <span className="font-semibold text-foreground block">Action Required for Clients:</span>
                  <p className="text-muted-foreground leading-relaxed break-words line-clamp-2">
                    {reform.actionRequired}
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/60">
                <span className="text-xs font-semibold text-muted-foreground">{reform.date}</span>
                <Button size="sm" variant="ghost" className="rounded-xl text-xs gap-1 text-primary group-hover:translate-x-1 transition-transform">
                  Read Analysis
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Policy Reform Detail Modal */}
      <PolicyReformModal
        reform={selectedReform}
        isOpen={!!selectedReform}
        onClose={() => setSelectedReform(null)}
      />
    </PageTransition>
  );
};

export default PolicyReforms;
