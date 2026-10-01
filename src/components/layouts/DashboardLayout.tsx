import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, AccountType } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Calendar,
  User,
  LogOut,
  Scale,
  Menu,
  X,
  BarChart3,
  Users,
  CheckSquare,
  Landmark,
  ShieldCheck,
  Briefcase,
  Building2,
  Key,
  Copy
} from 'lucide-react';
import { useState } from 'react';
import { NotificationCenter } from '@/components/common/NotificationCenter';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user, accountType } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isCA = accountType === 'ca';

  // Navigation menu items tailored specifically for CA vs Company Member
  const caMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'CA Dashboard' },
    { path: '/dashboard/clients', icon: Users, label: 'Client Directory' },
    { path: '/dashboard/tasks', icon: CheckSquare, label: 'Pending Tasks' },
    { path: '/dashboard/reforms', icon: Landmark, label: 'Policy Reforms' },
    { path: '/dashboard/compliance', icon: ShieldCheck, label: 'Compliance Status' },
    { path: '/dashboard/calendar', icon: Calendar, label: 'Statutory Calendar' },
    { path: '/dashboard/chatbot', icon: MessageSquare, label: 'Legal AI Assistant' },
    { path: '/dashboard/documents', icon: FileText, label: 'Document Library' },
    { path: '/dashboard/account', icon: User, label: 'Practice Profile' },
  ];

  const memberMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Company Dashboard' },
    { path: '/dashboard/tasks', icon: CheckSquare, label: 'Compliance Tasks' },
    { path: '/dashboard/compliance', icon: Calendar, label: 'Statutory Calendar' },
    { path: '/dashboard/chatbot', icon: MessageSquare, label: 'Legal AI Assistant' },
    { path: '/dashboard/documents', icon: FileText, label: 'Documents & E-Sign' },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Compliance Analytics' },
    { path: '/dashboard/account', icon: User, label: 'Company Profile' },
  ];

  const menuItems = isCA ? caMenuItems : memberMenuItems;

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo and Brand */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-md ${
                isCA 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white' 
                  : 'bg-gradient-to-br from-teal-600 to-emerald-700 text-white'
              }`}>
                {isCA ? <Briefcase className="h-5 w-5" /> : <Scale className="h-5 w-5" />}
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">AdhikarAI</h1>
                <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0 border ${
                  isCA 
                    ? 'border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10' 
                    : 'border-teal-500/40 text-teal-600 dark:text-teal-400 bg-teal-500/10'
                }`}>
                  {isCA ? 'CA Practice Portal' : 'MSME Enterprise'}
                </Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Button
                key={item.path}
                variant={active ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start h-10 rounded-xl text-xs font-medium transition-all',
                  active
                    ? isCA 
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'bg-teal-600 text-white font-semibold shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/70'
                )}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* User Info and Logout */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/20">
          <div className="mb-2">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">
              {user?.user_metadata?.full_name || (isCA ? 'CA Rajesh Agrawal' : 'Rajesh Sharma')}
            </p>
            <p className="text-[11px] text-sidebar-foreground/70 truncate">
              {user?.email || (isCA ? 'ca.agrawal@adhikar.ai' : 'rajesh@bharatrobotics.in')}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar for both Desktop & Mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 border-b border-border/80 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2 lg:hidden">
              <Scale className="h-5 w-5 text-primary" />
              <span className="font-bold text-base">AdhikarAI</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 border ${
                isCA 
                  ? 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5' 
                  : 'border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500/5'
              }`}>
                {isCA ? 'Chartered Accountant Workspace' : 'MSME Enterprise Workspace'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* CA Connect ID Pill for CAs or Company ID for Members */}
            {isCA ? (
              <button
                onClick={() => {
                  const caId = user?.user_metadata?.ca_connect_id || 'CA-AGR-8492';
                  navigator.clipboard.writeText(caId);
                  toast.success(`Copied CA Connect ID (${caId}) to clipboard! Share with your clients.`);
                }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/15 border border-primary/20 text-xs font-semibold text-primary transition-all shadow-xs"
                title="Click to copy CA Connect ID for client linking"
              >
                <Key className="w-3.5 h-3.5" />
                <span>ID: <strong className="font-mono">{user?.user_metadata?.ca_connect_id || 'CA-AGR-8492'}</strong></span>
                <Copy className="w-3 h-3 ml-0.5 opacity-70" />
              </button>
            ) : (
              <button
                onClick={() => {
                  const cmpId = user?.user_metadata?.company_id || 'CMP-BHR-1092';
                  navigator.clipboard.writeText(cmpId);
                  toast.success(`Copied Company ID (${cmpId}) to clipboard! Share with your team members.`);
                }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-500/10 hover:bg-teal-500/15 border border-teal-500/20 text-xs font-semibold text-teal-700 dark:text-teal-400 transition-all shadow-xs"
                title="Click to copy Company ID for team approvals"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Company ID: <strong className="font-mono">{user?.user_metadata?.company_id || 'CMP-BHR-1092'}</strong></span>
                <Copy className="w-3 h-3 ml-0.5 opacity-70" />
              </button>
            )}

            {/* Notification Center Popover */}
            <NotificationCenter />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
