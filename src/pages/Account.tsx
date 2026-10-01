import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User, Building2, Briefcase, Key, Copy, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { toast } from 'sonner';

const Account = () => {
  const { user, signOut, accountType } = useAuth();
  const isCA = accountType === 'ca';

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      return data;
    },
    enabled: !!user
  });

  const fullName = user?.user_metadata?.full_name || profile?.full_name || (isCA ? 'CA Rajesh K. Agrawal, FCA' : 'Rajesh Sharma');
  const orgName = user?.user_metadata?.firm_name || profile?.business_name || (isCA ? 'R. K. Agrawal & Co.' : 'Bharat Robotics & Automation Pvt Ltd');
  const caId = user?.user_metadata?.ca_connect_id || 'CA-AGR-8492';
  const roleDisplay = isCA ? (user?.user_metadata?.specialization || 'Audit & Direct Tax Practice') : (profile?.role || 'Managing Director');

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Account & Practice Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your credentials, CA Connect ID, and workspace integration.</p>
        </div>

        <Badge className={`text-xs px-3 py-1 ${isCA ? 'bg-blue-600' : 'bg-teal-600'}`}>
          {isCA ? 'Chartered Accountant' : 'MSME Member'}
        </Badge>
      </div>

      {/* CA Connect ID Banner for CAs */}
      {isCA && (
        <Card className="p-6 rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-card via-primary/5 to-teal-500/5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">Your Official CA Connect ID</h3>
              </div>
              <p className="text-xs text-muted-foreground max-w-lg">
                Share this unique practice code with your MSME clients. When they enter this ID upon sign up or in their settings, their business connects directly to your practice dashboard.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-background p-2 rounded-xl border border-border shadow-xs flex-shrink-0">
              <span className="font-mono text-lg font-black text-primary px-2">{caId}</span>
              <Button
                size="sm"
                className="rounded-lg text-xs gap-1"
                onClick={() => {
                  navigator.clipboard.writeText(caId);
                  toast.success(`Copied CA Connect ID (${caId}) to clipboard!`);
                }}
              >
                <Copy className="w-3.5 h-3.5" />
                Copy ID
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Profile Details */}
      <Card className="rounded-2xl border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Profile Information</CardTitle>
          <CardDescription>Verified practitioner and enterprise identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3.5 bg-muted/50 rounded-xl border border-border/70">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Full Name</p>
                <p className="text-sm font-semibold text-foreground truncate">{fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-muted/50 rounded-xl border border-border/70">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Official Email</p>
                <p className="text-sm font-semibold text-foreground truncate">{user?.email || 'ca.agrawal@adhikar.ai'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-muted/50 rounded-xl border border-border/70">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">{isCA ? 'Firm / Practice Name' : 'Company Name'}</p>
                <p className="text-sm font-semibold text-foreground truncate">{orgName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-muted/50 rounded-xl border border-border/70">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">{isCA ? 'Practice Focus' : 'Role & Sector'}</p>
                <p className="text-sm font-semibold text-foreground truncate">{roleDisplay}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out Card */}
      <Card className="rounded-2xl border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Session Management</CardTitle>
          <CardDescription>Sign out of this portal workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={signOut} variant="destructive" className="rounded-xl">
            Sign Out of Portal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
