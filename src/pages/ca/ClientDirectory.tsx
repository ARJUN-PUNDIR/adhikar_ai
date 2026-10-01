import { useState } from 'react';
import { mockClients, mockClientTasks } from '@/data/mockCAData';
import { Client, ClientTask } from '@/types/ca';
import { ClientProfileView } from '@/components/ca/ClientProfileView';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/ui/PageTransition';
import { 
  Users, 
  Search, 
  Plus, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export const ClientDirectory = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  // New client form state
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newGstin, setNewGstin] = useState('');
  const [newSector, setNewSector] = useState<Client['businessType']>('Manufacturing');
  const [newCity, setNewCity] = useState('');

  const filteredClients = clients.filter((c) => {
    const matchesSearch = c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === 'all' || c.businessType === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      companyName: newCompanyName.trim(),
      contactPerson: newContactPerson.trim() || 'Managing Director',
      email: `finance@${newCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`,
      phone: '+91 98000 00000',
      gstin: newGstin.toUpperCase() || '27AABCT9999Z1Z5',
      pan: newGstin ? newGstin.substring(2, 12) : 'AABCT9999Z',
      businessType: newSector,
      turnoverBracket: '₹5 - 10 Cr (MSME)',
      city: newCity || 'Mumbai',
      state: 'Maharashtra',
      complianceScore: 100,
      status: 'Active',
      assignedCA: 'CA R. K. Agrawal & Co.',
      totalTasks: 0,
      pendingTasksCount: 0,
      urgentTasksCount: 0,
      avatarColor: 'from-blue-600 to-indigo-600',
      lastActive: 'Just registered'
    };

    setClients([newClient, ...clients]);
    setNewCompanyName('');
    setNewContactPerson('');
    setNewGstin('');
    setIsAddClientOpen(false);
    toast.success(`${newClient.companyName} added to CA Client Directory!`);
  };

  // If a client is selected, show interactive client profile with their small task boxes
  if (selectedClient) {
    return (
      <PageTransition className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <ClientProfileView
          client={selectedClient}
          tasks={mockClientTasks}
          onBack={() => setSelectedClient(null)}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="w-7 h-7 text-primary" />
            Client Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your MSME corporate and individual tax clients. Click any client to view their interactive profile and task boxes.
          </p>
        </div>

        <Button 
          onClick={() => setIsAddClientOpen(true)}
          className="rounded-xl shadow-md gap-2 font-semibold"
        >
          <Plus className="w-4 h-4" />
          Onboard New Client
        </Button>
      </div>

      {/* Inline Onboarding Card */}
      {isAddClientOpen && (
        <Card className="p-6 rounded-2xl border-2 border-primary/40 bg-card shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Onboard MSME Client to Practice
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setIsAddClientOpen(false)}>Cancel</Button>
          </div>

          <form onSubmit={handleAddClient} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Company / Enterprise Name</label>
                <Input
                  placeholder="e.g. Apex Biotech India Pvt Ltd"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  required
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Contact Person / MD</label>
                <Input
                  placeholder="e.g. Sunil Narang (Director)"
                  value={newContactPerson}
                  onChange={(e) => setNewContactPerson(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">GSTIN</label>
                <Input
                  placeholder="27AABCA1234F1Z9"
                  value={newGstin}
                  onChange={(e) => setNewGstin(e.target.value)}
                  className="h-10 rounded-xl font-mono text-xs uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">MSME Sector</label>
                <select
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs"
                >
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Trading">Trading</option>
                  <option value="Services">Services</option>
                  <option value="Retail">Retail</option>
                  <option value="Tech/Startup">Tech / Startup</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">City, State</label>
                <Input
                  placeholder="e.g. Ahmedabad, Gujarat"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-10 rounded-xl font-semibold">
              Save & Create Client Workspace
            </Button>
          </form>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 text-xs w-full sm:w-auto overflow-x-auto">
          {['all', 'Manufacturing', 'Trading', 'Services', 'Retail', 'Tech/Startup'].map((sec) => (
            <Button
              key={sec}
              size="sm"
              variant={sectorFilter === sec ? 'default' : 'ghost'}
              className="h-8 text-xs rounded-lg capitalize"
              onClick={() => setSectorFilter(sec)}
            >
              {sec}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by company, GSTIN, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => (
          <Card
            key={client.id}
            onClick={() => setSelectedClient(client)}
            className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${client.avatarColor} text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                    {client.companyName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base text-foreground truncate group-hover:text-primary transition-colors">
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

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/40 border border-border/60 text-xs my-3">
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block">GSTIN</span>
                  <span className="font-mono font-medium text-foreground text-[11px] truncate block" title={client.gstin}>{client.gstin}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block">Compliance Score</span>
                  <span className="font-bold text-emerald-600">{client.complianceScore}%</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block">City</span>
                  <span className="font-medium text-foreground truncate block">{client.city}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block">Pending Tasks</span>
                  <span className="font-bold text-amber-600 truncate block">{client.pendingTasksCount} Work Orders</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-1 italic break-words">
                {client.notes || 'Routine monthly compliance & audit.'}
              </p>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-primary font-semibold mt-3">
              <span>Inspect Profile & Task Boxes</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Card>
        ))}
      </div>
    </PageTransition>
  );
};

export default ClientDirectory;
