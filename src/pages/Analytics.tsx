import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileText, TrendingUp, Users, Clock } from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f97316', '#06b6d4'];

const Analytics = () => {
  const { user } = useAuth();

  const { data: analytics } = useQuery({
    queryKey: ['document-analytics', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get all documents for the user
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id);

      // Get analytics data
      const { data: analyticsData } = await supabase
        .from('document_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      // Calculate template usage
      const templateUsage = documents?.reduce((acc: any, doc: any) => {
        acc[doc.doc_type] = (acc[doc.doc_type] || 0) + 1;
        return acc;
      }, {});

      const templateData = Object.entries(templateUsage || {}).map(([name, value]) => ({
        name: name.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        value
      })).sort((a, b) => (b.value as number) - (a.value as number)).slice(0, 5);

      // Calculate completion rates
      const totalDocs = documents?.length || 0;
      const signedDocs = await supabase
        .from('document_signatures')
        .select('document_id', { count: 'exact' })
        .in('document_id', documents?.map(d => d.id) || []);

      const completionRate = totalDocs > 0 ? Math.round((signedDocs.count || 0) / totalDocs * 100) : 0;

      // Activity over time (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const activityByDay = last7Days.map(date => {
        const count = analyticsData?.filter(a => 
          a.created_at.startsWith(date)
        ).length || 0;
        return {
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          count
        };
      });

      return {
        totalDocuments: totalDocs,
        completionRate,
        templateData,
        activityByDay,
        recentActions: analyticsData?.slice(-10).reverse() || []
      };
    },
    enabled: !!user
  });

  return (
    <PageTransition className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-semibold mb-2 tracking-tight">Document Analytics</h1>
        <p className="text-muted-foreground">Track usage patterns and document performance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-0 shadow-medium bg-card/50 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Documents</p>
              <p className="text-3xl font-bold">{analytics?.totalDocuments || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-medium bg-card/50 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
              <p className="text-3xl font-bold">{analytics?.completionRate || 0}%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-medium bg-card/50 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Templates</p>
              <p className="text-3xl font-bold">{analytics?.templateData?.length || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-medium bg-card/50 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Recent Actions</p>
              <p className="text-3xl font-bold">{analytics?.recentActions?.length || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Most Used Templates */}
        <Card className="p-6 border-0 shadow-medium bg-card/50 backdrop-blur">
          <h3 className="font-semibold text-lg mb-6">Most Used Templates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics?.templateData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics?.templateData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Activity Over Time */}
        <Card className="p-6 border-0 shadow-medium bg-card/50 backdrop-blur">
          <h3 className="font-semibold text-lg mb-6">Activity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.activityByDay || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Template Usage Bar Chart */}
      <Card className="p-6 border-0 shadow-medium bg-card/50 backdrop-blur">
        <h3 className="font-semibold text-lg mb-6">Template Usage Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics?.templateData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </PageTransition>
  );
};

export default Analytics;
