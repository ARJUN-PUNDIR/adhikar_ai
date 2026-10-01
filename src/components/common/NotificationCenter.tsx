import { useState } from 'react';
import { 
  Bell, 
  Landmark, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  X, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockPolicyReforms } from '@/data/mockCAData';
import { PolicyReformModal } from '@/components/ca/PolicyReformModal';
import { PolicyReform } from '@/types/ca';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface AppNotification {
  id: string;
  type: 'reform' | 'task' | 'deadline' | 'system';
  title: string;
  description: string;
  time: string;
  read: boolean;
  reformId?: string;
  taskId?: string;
  priority?: 'critical' | 'high' | 'normal';
}

const initialNotifications: AppNotification[] = [
  {
    id: 'n-1',
    type: 'reform',
    title: 'New Reform: Section 43B(h) MSME 45-Day Payment Rule',
    description: 'Finance Act enforcement: Sums payable beyond 45 days disallowed under taxable profits.',
    time: '15 mins ago',
    read: false,
    reformId: 'ref-1',
    priority: 'critical'
  },
  {
    id: 'n-2',
    type: 'deadline',
    title: 'Upcoming Deadline: Advance Tax 4th Installment',
    description: '100% cumulative tax payable before March 15 to avoid Sec 234B/C interest.',
    time: '1 hour ago',
    read: false,
    priority: 'high'
  },
  {
    id: 'n-3',
    type: 'reform',
    title: 'GST Council Reform: E-Invoicing Threshold lowered to ₹5 Cr',
    description: 'Mandatory IRN generation for B2B supplies expanded to businesses with turnover > ₹5 Crores.',
    time: '3 hours ago',
    read: false,
    reformId: 'ref-3',
    priority: 'critical'
  },
  {
    id: 'n-4',
    type: 'task',
    title: 'Client Action: Bharat Robotics uploaded 2 new ledgers',
    description: 'Creditors ageing analysis ready for Sec 43B(h) audit review.',
    time: '5 hours ago',
    read: false,
    taskId: 'task-101',
    priority: 'normal'
  },
  {
    id: 'n-5',
    type: 'reform',
    title: 'MCA V3 Portal Update: Form CSR-2 Standalone Filing',
    description: 'Mandatory two-factor authentication and strict DSC validation implemented.',
    time: '1 day ago',
    read: true,
    reformId: 'ref-4',
    priority: 'normal'
  }
];

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'reforms' | 'tasks'>('all');
  const [selectedReform, setSelectedReform] = useState<PolicyReform | null>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'reforms') return n.type === 'reform';
    if (activeTab === 'tasks') return n.type === 'task' || n.type === 'deadline';
    return true;
  });

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleNotificationClick = (n: AppNotification) => {
    // Mark as read
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));

    if (n.type === 'reform' && n.reformId) {
      const foundReform = mockPolicyReforms.find(r => r.id === n.reformId);
      if (foundReform) {
        setSelectedReform(foundReform);
        setIsOpen(false);
        return;
      }
      navigate('/dashboard/reforms');
      setIsOpen(false);
    } else if (n.type === 'task') {
      navigate('/dashboard/tasks');
      setIsOpen(false);
    } else if (n.type === 'deadline') {
      navigate('/dashboard/calendar');
      setIsOpen(false);
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-xl hover:bg-muted/80 text-foreground"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent 
          align="end" 
          sideOffset={8}
          className="w-80 sm:w-96 p-0 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden z-50"
        >
          {/* Header */}
          <div className="p-4 pb-3 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-primary" />
                  Notifications & Reform Alerts
                </h3>
                {unreadCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4">
                    {unreadCount} new
                  </Badge>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 p-0.5 rounded-lg bg-muted/60 text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  activeTab === 'all' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('reforms')}
                className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  activeTab === 'reforms' ? 'bg-card text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Govt Reforms
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  activeTab === 'tasks' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tasks & Dates
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No notifications in this category.
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 hover:bg-muted/40 transition-colors cursor-pointer flex gap-3 items-start group ${
                    !n.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {n.type === 'reform' ? (
                      <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                        <Landmark className="w-3.5 h-3.5" />
                      </div>
                    ) : n.type === 'deadline' ? (
                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs font-bold truncate ${
                        !n.read ? 'text-foreground font-semibold' : 'text-foreground/80'
                      }`}>
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed break-words">
                      {n.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                      <span>{n.time}</span>
                      <span className="text-primary font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        {n.type === 'reform' ? 'Read circular →' : 'View →'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-border bg-muted/20 text-center">
            <button
              onClick={() => {
                navigate('/dashboard/reforms');
                setIsOpen(false);
              }}
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Browse all Government Gazettes & Policy Circulars
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Policy Reform Modal opened if user clicks a reform notification */}
      <PolicyReformModal
        reform={selectedReform}
        isOpen={!!selectedReform}
        onClose={() => setSelectedReform(null)}
      />
    </>
  );
};
