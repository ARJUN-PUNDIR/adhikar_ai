import { useState, useEffect } from 'react';
import { useAuth, AccountType } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Scale, 
  Briefcase, 
  Building2, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Lock,
  ArrowRight,
  FileCheck2,
  Users2,
  CalendarCheck,
  Search,
  Check,
  UserCheck,
  BadgeCheck,
  AlertCircle,
  Building
} from 'lucide-react';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  searchRegisteredCompanies, 
  registerNewCompany, 
  submitMemberApprovalRequest, 
  RegisteredCompany 
} from '@/data/registeredCompanies';

const caSignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  firm_name: z.string().min(2, 'Firm name must be at least 2 characters'),
  ca_reg_number: z.string().min(3, 'Membership number is required'),
  specialization: z.string().min(1, 'Specialization is required')
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const Auth = () => {
  const { signIn, signUp, signInWithGoogle, loginAsDemoCA, loginAsDemoMember } = useAuth();
  const [selectedRole, setSelectedRole] = useState<AccountType | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);

  // Common credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // CA specific
  const [firmName, setFirmName] = useState('');
  const [caRegNumber, setCaRegNumber] = useState('');
  const [specialization, setSpecialization] = useState('Audit & Direct Tax');

  // Company Member specific
  const [businessName, setBusinessName] = useState('');
  const [matchedCompany, setMatchedCompany] = useState<RegisteredCompany | null>(null);
  const [searchResults, setSearchResults] = useState<RegisteredCompany[]>([]);
  const [forceNewCompany, setForceNewCompany] = useState(false);

  // Existing company member profile
  const [memberJobProfile, setMemberJobProfile] = useState('manager');
  const [departmentNotes, setDepartmentNotes] = useState('');

  // New company registration fields
  const [ownerRole, setOwnerRole] = useState('Founder / Managing Director');
  const [businessType, setBusinessType] = useState('manufacturing');
  const [constitution, setConstitution] = useState('Private Limited Company');
  const [companyCity, setCompanyCity] = useState('');
  const [companyGstin, setCompanyGstin] = useState('');

  // Approval request modal state
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [submittedApprovalData, setSubmittedApprovalData] = useState<{
    companyName: string;
    companyId: string;
    adminName: string;
    role: string;
  } | null>(null);

  // Real-time dynamic search when user types business name
  useEffect(() => {
    if (selectedRole === 'company_member' && authMode === 'signup') {
      if (businessName.trim().length >= 2 && !forceNewCompany) {
        const results = searchRegisteredCompanies(businessName);
        setSearchResults(results);
        // If an exact or very close match is found
        const exactMatch = results.find(
          c => c.name.toLowerCase() === businessName.trim().toLowerCase()
        );
        if (exactMatch) {
          setMatchedCompany(exactMatch);
        }
      } else {
        setSearchResults([]);
        if (!forceNewCompany) {
          setMatchedCompany(null);
        }
      }
    }
  }, [businessName, selectedRole, authMode, forceNewCompany]);

  const handleSelectMatchedCompany = (company: RegisteredCompany) => {
    setMatchedCompany(company);
    setBusinessName(company.name);
    setSearchResults([]);
    setForceNewCompany(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      signInSchema.parse({ email, password });
      setLoading(true);
      await signIn(email, password);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  // CA Sign Up
  const handleCASignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const initials = (fullName || 'CA').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'AGR';
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generatedCaId = `CA-${initials}-${randomNum}`;

      const payload = {
        email,
        password,
        full_name: fullName,
        firm_name: firmName,
        ca_reg_number: caRegNumber,
        ca_connect_id: generatedCaId,
        specialization
      };
      caSignUpSchema.parse(payload);
      await signUp(email, password, {
        ...payload,
        account_type: 'ca',
        role: 'ca'
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Company Member: Request Approval for Existing Registered Company
  const handleRequestApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedCompany) return;

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all personal details.');
      return;
    }

    setLoading(true);
    try {
      submitMemberApprovalRequest({
        companyId: matchedCompany.id,
        companyName: matchedCompany.name,
        memberName: fullName,
        memberEmail: email,
        role: memberJobProfile,
        department: departmentNotes
      });

      setSubmittedApprovalData({
        companyName: matchedCompany.name,
        companyId: matchedCompany.id,
        adminName: matchedCompany.ownerName,
        role: memberJobProfile === 'manager' 
          ? 'Operations Manager' 
          : memberJobProfile === 'employee' 
            ? 'Associate / Staff Employee' 
            : memberJobProfile === 'finance'
              ? 'Finance Executive'
              : memberJobProfile === 'legal'
                ? 'Legal Officer'
                : 'Other Profile'
      });

      setApprovalModalOpen(true);
    } catch (error: any) {
      console.error('Approval submission error:', error);
      toast.error('Failed to submit approval request');
    } finally {
      setLoading(false);
    }
  };

  // Company Member: Register New Company & Generate Company ID
  const handleRegisterNewCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error('Please enter a company name.');
      return;
    }
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in owner details.');
      return;
    }

    setLoading(true);
    try {
      const newCompany = registerNewCompany({
        name: businessName,
        sector: businessType,
        city: companyCity || 'India',
        ownerName: `${fullName} (${ownerRole})`,
        adminEmail: email,
        constitution: constitution,
        gstin: companyGstin
      });

      await signUp(email, password, {
        email,
        password,
        full_name: fullName,
        business_name: newCompany.name,
        company_id: newCompany.id,
        role: 'owner',
        owner_role: ownerRole,
        business_type: businessType,
        city: companyCity,
        account_type: 'company_member'
      });

      toast.success(`Registered company! Official ID: ${newCompany.id}. Your team members can now request access with this ID.`);
    } catch (error: any) {
      console.error('Company registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
      {/* Brand Header */}
      <div className="text-center mb-8 max-w-xl">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-teal-500 flex items-center justify-center shadow-lg shadow-primary/20">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-primary to-teal-600 dark:from-white dark:via-blue-300 dark:to-teal-300 bg-clip-text text-transparent">
            AdhikarAI
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">
          India's Legal & Tax Compliance OS
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Tailored workspaces for Chartered Accountants and MSME business teams.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!selectedRole ? (
          /* Step 1: Role Selection Screen */
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-4xl"
          >
            <div className="text-center mb-6">
              <h2 className="text-lg font-medium text-foreground">Select Your Professional Role</h2>
              <p className="text-xs text-muted-foreground">Choose your portal to sign in or create an account</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Card 1: Chartered Accountant (CA) */}
              <Card 
                onClick={() => setSelectedRole('ca')}
                className="p-6 rounded-3xl border-2 border-border/80 hover:border-primary hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden bg-card/70 backdrop-blur-xl"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Briefcase className="w-32 h-32 text-primary -mr-8 -mt-8" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                    <Briefcase className="h-7 w-7" />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Practice Portal</span>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      Chartered Accountant (CA)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      For practicing CAs, audit firms, and tax practitioners. Manage multiple MSME clients, verify tasks in small interactive boxes, track government reforms, and statutory calendars.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Multi-Client Dashboard & Work Orders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Unique CA Connect ID for instant client pairing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Gazette policy reforms & circulars tracking</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4 rounded-xl group-hover:bg-primary text-xs font-semibold h-10 shadow-sm">
                    Enter CA Portal
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>

              {/* Card 2: Company Member (MSME) */}
              <Card 
                onClick={() => setSelectedRole('company_member')}
                className="p-6 rounded-3xl border-2 border-border/80 hover:border-teal-500 hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden bg-card/70 backdrop-blur-xl"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Building2 className="w-32 h-32 text-teal-600 -mr-8 -mt-8" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                    <Building2 className="h-7 w-7" />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">Enterprise Portal</span>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-teal-600 transition-colors">
                      Company Member
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      For MSME business owners, directors, managers, and team employees. Search your company, get approval to join, or register a new business organization with a dedicated Company ID.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      <span>Automatic company detection & Company ID generation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      <span>Job profile selection (Manager, Employee, Other)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      <span>Direct approval workflow from company admin</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-10 shadow-sm">
                    Enter Company Portal
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            </div>
          </motion.div>
        ) : (
          /* Step 2: Sign In or Sign Up Screen */
          <motion.div
            key="auth-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-xl"
          >
            <Card className="rounded-3xl border-border/80 shadow-2xl overflow-hidden bg-card/85 backdrop-blur-2xl">
              {/* Header Bar */}
              <div className={`p-5 text-white flex items-center justify-between transition-colors ${
                selectedRole === 'ca' 
                  ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-primary' 
                  : 'bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800'
              }`}>
                <div className="flex items-center gap-3">
                  {selectedRole === 'ca' ? (
                    <Briefcase className="h-5 w-5" />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                  <div>
                    <h3 className="font-semibold text-sm">
                      {selectedRole === 'ca' ? 'Chartered Accountant Portal' : 'Company Member Portal'}
                    </h3>
                    <p className="text-[11px] text-white/80">
                      {authMode === 'signin' ? 'Sign in to existing account' : 'Sign up & verified registration'}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRole(null)}
                  className="text-white hover:bg-white/20 hover:text-white text-xs h-8 px-2.5 rounded-lg"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Change
                </Button>
              </div>

              <CardContent className="p-6">
                <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'signin' | 'signup')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-5 rounded-xl h-11 p-1 bg-muted/70">
                    <TabsTrigger value="signin" className="rounded-lg text-xs sm:text-sm font-medium">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-lg text-xs sm:text-sm font-medium">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  {/* Sign In Tab Content */}
                  <TabsContent value="signin" className="space-y-4">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="signin-email" className="text-xs font-medium">Email Address</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder={selectedRole === 'ca' ? 'ca.partner@firm.com' : 'you@company.com'}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="signin-password" className="text-xs font-medium">Password</Label>
                          <span className="text-[11px] text-muted-foreground cursor-pointer hover:underline">
                            Forgot password?
                          </span>
                        </div>
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-10 rounded-xl"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className={`w-full h-11 rounded-xl font-medium shadow-md ${
                          selectedRole === 'ca' 
                            ? 'bg-primary hover:bg-primary/90' 
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                        disabled={loading}
                      >
                        {loading ? 'Authenticating...' : `Sign In to ${selectedRole === 'ca' ? 'CA Portal' : 'Company Dashboard'}`}
                      </Button>
                    </form>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-card px-2 text-muted-foreground font-semibold">Or instant access</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      type="button"
                      onClick={selectedRole === 'ca' ? loginAsDemoCA : loginAsDemoMember}
                      className="w-full h-10 rounded-xl text-xs font-medium border-dashed border-primary/40 text-primary hover:bg-primary/5"
                    >
                      <Sparkles className="mr-2 h-3.5 w-3.5" />
                      ⚡ Instant Demo Login ({selectedRole === 'ca' ? 'CA Rajesh Agrawal' : 'MSME Rajesh Sharma'})
                    </Button>
                  </TabsContent>

                  {/* Sign Up Tab Content */}
                  <TabsContent value="signup" className="space-y-4">
                    {selectedRole === 'ca' ? (
                      /* CA SIGN UP FORM */
                      <form onSubmit={handleCASignUp} className="space-y-3.5">
                        <div className="space-y-1">
                          <Label htmlFor="signup-name" className="text-xs font-medium">Full Name (CA)</Label>
                          <Input
                            id="signup-name"
                            placeholder="CA Rajesh K. Agrawal"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="h-9 rounded-xl text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <Label htmlFor="ca-reg" className="text-xs font-medium">ICAI Membership No.</Label>
                            <Input
                              id="ca-reg"
                              placeholder="ICAI-084920"
                              value={caRegNumber}
                              onChange={(e) => setCaRegNumber(e.target.value)}
                              required
                              className="h-9 rounded-xl text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="ca-spec" className="text-xs font-medium">Primary Focus</Label>
                            <Select value={specialization} onValueChange={setSpecialization}>
                              <SelectTrigger id="ca-spec" className="h-9 rounded-xl text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Audit & Direct Tax">Audit & Direct Tax</SelectItem>
                                <SelectItem value="GST & Indirect Taxes">GST & Indirect Taxes</SelectItem>
                                <SelectItem value="Corporate & MCA Law">Corporate & MCA Law</SelectItem>
                                <SelectItem value="MSME Virtual CFO">MSME Virtual CFO</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="ca-firm" className="text-xs font-medium">Firm / Practice Name</Label>
                          <Input
                            id="ca-firm"
                            placeholder="Agrawal & Associates, Chartered Accountants"
                            value={firmName}
                            onChange={(e) => setFirmName(e.target.value)}
                            required
                            className="h-9 rounded-xl text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="signup-email" className="text-xs font-medium">Official Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="ca.name@firm.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-9 rounded-xl text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="signup-password" className="text-xs font-medium">Create Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-9 rounded-xl text-sm"
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-11 rounded-xl font-medium shadow-md mt-2 bg-primary hover:bg-primary/90"
                          disabled={loading}
                        >
                          {loading ? 'Generating CA Profile...' : 'Sign Up as Chartered Accountant'}
                        </Button>
                      </form>
                    ) : (
                      /* COMPANY MEMBER SIGN UP FLOW */
                      <div className="space-y-4">
                        {/* Company Name Input with Real-time Search */}
                        <div className="space-y-1.5">
                          <Label htmlFor="company-search-name" className="text-xs font-semibold text-foreground flex items-center justify-between">
                            <span>Company / Business Name *</span>
                            <span className="text-[10px] text-muted-foreground font-normal">Searches registered MSME database</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="company-search-name"
                              placeholder="Type company name (e.g. Bharat Robotics, Vedic Agro...)"
                              value={businessName}
                              onChange={(e) => {
                                setBusinessName(e.target.value);
                                if (matchedCompany && e.target.value !== matchedCompany.name) {
                                  setMatchedCompany(null);
                                }
                              }}
                              required
                              className="h-10 rounded-xl text-sm pr-9"
                            />
                            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          </div>

                          {/* Search Suggestions Dropdown */}
                          {searchResults.length > 0 && !matchedCompany && (
                            <div className="p-2 rounded-xl bg-card border border-border shadow-lg space-y-1.5 mt-1">
                              <p className="text-[10px] font-semibold text-muted-foreground px-2 py-0.5">
                                Registered Organizations Found in Database:
                              </p>
                              {searchResults.map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => handleSelectMatchedCompany(c)}
                                  className="w-full text-left p-2 rounded-lg hover:bg-muted/70 flex items-center justify-between text-xs transition-colors group"
                                >
                                  <div>
                                    <span className="font-bold text-foreground group-hover:text-teal-600">{c.name}</span>
                                    <span className="block text-[10px] text-muted-foreground">{c.sector} • {c.city}</span>
                                  </div>
                                  <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                                    {c.id}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* CASE A: COMPANY IS ALREADY REGISTERED */}
                        {matchedCompany ? (
                          <div className="space-y-4 pt-1">
                            {/* Verified Company Banner with Company ID */}
                            <div className="p-4 rounded-2xl border-2 border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-background to-teal-500/5 shadow-xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-600 text-white">
                                  <BadgeCheck className="w-3.5 h-3.5" /> Registered Organization Found
                                </span>
                                <div className="text-right">
                                  <span className="text-[10px] text-muted-foreground block">Company ID</span>
                                  <span className="font-mono text-sm font-black text-teal-700 dark:text-teal-400">
                                    {matchedCompany.id}
                                  </span>
                                </div>
                              </div>

                              <div className="pt-1">
                                <h4 className="text-base font-bold text-foreground">{matchedCompany.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {matchedCompany.sector} • {matchedCompany.city} • {matchedCompany.constitution}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-1 pt-1 border-t border-border/60">
                                  Company Administrator: <strong className="text-foreground">{matchedCompany.ownerName}</strong>
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[11px] text-teal-700 dark:text-teal-300 font-medium">
                                  Select your job profile below to request approval to join.
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMatchedCompany(null);
                                    setForceNewCompany(true);
                                  }}
                                  className="text-[11px] text-muted-foreground hover:text-foreground underline"
                                >
                                  Register new company instead
                                </button>
                              </div>
                            </div>

                            {/* Team Member Details Form */}
                            <form onSubmit={handleRequestApproval} className="space-y-3">
                              <div className="space-y-1">
                                <Label htmlFor="member-fullname" className="text-xs font-medium">Your Full Name *</Label>
                                <Input
                                  id="member-fullname"
                                  placeholder="e.g. Sunil Deshpande"
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                  required
                                  className="h-9 rounded-xl text-sm"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                  <Label htmlFor="member-job-profile" className="text-xs font-medium">Job Profile *</Label>
                                  <Select value={memberJobProfile} onValueChange={setMemberJobProfile}>
                                    <SelectTrigger id="member-job-profile" className="h-9 rounded-xl text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="manager">Manager / Operations Lead</SelectItem>
                                      <SelectItem value="employee">Employee / Staff Associate</SelectItem>
                                      <SelectItem value="finance">Finance & Accounts Lead</SelectItem>
                                      <SelectItem value="legal">Legal & Compliance Officer</SelectItem>
                                      <SelectItem value="other">Other Job Profile</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-1">
                                  <Label htmlFor="member-dept" className="text-xs font-medium">Department / Emp ID</Label>
                                  <Input
                                    id="member-dept"
                                    placeholder="e.g. Accounts / EMP-204"
                                    value={departmentNotes}
                                    onChange={(e) => setDepartmentNotes(e.target.value)}
                                    className="h-9 rounded-xl text-xs"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label htmlFor="member-email" className="text-xs font-medium">Work / Official Email *</Label>
                                <Input
                                  id="member-email"
                                  type="email"
                                  placeholder="sunil@bharatrobotics.in"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  required
                                  className="h-9 rounded-xl text-sm"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label htmlFor="member-password" className="text-xs font-medium">Create Password *</Label>
                                <Input
                                  id="member-password"
                                  type="password"
                                  placeholder="Min. 6 characters"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  required
                                  className="h-9 rounded-xl text-sm"
                                />
                              </div>

                              {/* The "Get Approval" Button */}
                              <Button
                                type="submit"
                                className="w-full h-11 rounded-xl font-semibold shadow-md mt-3 bg-teal-600 hover:bg-teal-700 text-white gap-2"
                                disabled={loading}
                              >
                                <UserCheck className="w-4 h-4" />
                                {loading ? 'Submitting Request...' : 'Get Approval to Join Organization'}
                              </Button>
                            </form>
                          </div>
                        ) : (
                          /* CASE B: COMPANY IS NOT REGISTERED (REGISTER AS NEW ENTITY) */
                          <div className="space-y-4 pt-1">
                            <div className="p-3.5 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                                <Building className="w-4 h-4" /> New Business Organization Setup
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                No existing organization found for "{businessName || 'this business'}". You will register as the <strong>Company Owner / Primary Administrator</strong> and an official <strong>Company ID</strong> will be generated.
                              </p>
                            </div>

                            <form onSubmit={handleRegisterNewCompany} className="space-y-3">
                              {/* Owner Details */}
                              <div className="p-3 rounded-xl bg-muted/40 border border-border/70 space-y-2.5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                                  Owner & Administrator Credentials
                                </span>

                                <div className="space-y-1">
                                  <Label htmlFor="owner-name" className="text-xs font-medium">Owner Full Name *</Label>
                                  <Input
                                    id="owner-name"
                                    placeholder="e.g. Rajesh Sharma"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="h-9 rounded-xl text-sm"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                  <div className="space-y-1">
                                    <Label htmlFor="owner-role" className="text-xs font-medium">Owner Designation</Label>
                                    <Select value={ownerRole} onValueChange={setOwnerRole}>
                                      <SelectTrigger id="owner-role" className="h-9 rounded-xl text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Founder / Managing Director">Founder / Managing Director</SelectItem>
                                        <SelectItem value="CEO / Director">CEO / Director</SelectItem>
                                        <SelectItem value="Partner">Partner</SelectItem>
                                        <SelectItem value="Sole Proprietor">Sole Proprietor</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1">
                                    <Label htmlFor="owner-email" className="text-xs font-medium">Official Email *</Label>
                                    <Input
                                      id="owner-email"
                                      type="email"
                                      placeholder="owner@company.com"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      required
                                      className="h-9 rounded-xl text-sm"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <Label htmlFor="owner-password" className="text-xs font-medium">Create Password *</Label>
                                  <Input
                                    id="owner-password"
                                    type="password"
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-9 rounded-xl text-sm"
                                  />
                                </div>
                              </div>

                              {/* Company Details */}
                              <div className="p-3 rounded-xl bg-muted/40 border border-border/70 space-y-2.5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                                  Business & MSME Information
                                </span>

                                <div className="grid grid-cols-2 gap-2.5">
                                  <div className="space-y-1">
                                    <Label htmlFor="business-type" className="text-xs font-medium">MSME Sector</Label>
                                    <Select value={businessType} onValueChange={setBusinessType}>
                                      <SelectTrigger id="business-type" className="h-9 rounded-xl text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                        <SelectItem value="trading">Trading</SelectItem>
                                        <SelectItem value="services">Services</SelectItem>
                                        <SelectItem value="retail">Retail</SelectItem>
                                        <SelectItem value="tech">Tech / Startup</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1">
                                    <Label htmlFor="constitution" className="text-xs font-medium">Legal Constitution</Label>
                                    <Select value={constitution} onValueChange={setConstitution}>
                                      <SelectTrigger id="constitution" className="h-9 rounded-xl text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Private Limited Company">Private Limited Company</SelectItem>
                                        <SelectItem value="Limited Liability Partnership (LLP)">LLP</SelectItem>
                                        <SelectItem value="Partnership Firm">Partnership Firm</SelectItem>
                                        <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                  <div className="space-y-1">
                                    <Label htmlFor="company-city" className="text-xs font-medium">City & State</Label>
                                    <Input
                                      id="company-city"
                                      placeholder="e.g. Pune, Maharashtra"
                                      value={companyCity}
                                      onChange={(e) => setCompanyCity(e.target.value)}
                                      className="h-9 rounded-xl text-xs"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <Label htmlFor="company-gstin" className="text-xs font-medium">GSTIN (Optional)</Label>
                                    <Input
                                      id="company-gstin"
                                      placeholder="27AABCB1234D1Z2"
                                      value={companyGstin}
                                      onChange={(e) => setCompanyGstin(e.target.value.toUpperCase())}
                                      className="h-9 rounded-xl text-xs font-mono uppercase"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Register and Generate ID Button */}
                              <Button
                                type="submit"
                                className="w-full h-11 rounded-xl font-semibold shadow-md mt-3 bg-teal-600 hover:bg-teal-700 text-white gap-2"
                                disabled={loading}
                              >
                                <Building2 className="w-4 h-4" />
                                {loading ? 'Generating Company ID...' : 'Register Company & Generate ID'}
                              </Button>
                            </form>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2 text-center">
                      <p className="text-xs text-muted-foreground">
                        By registering, you agree to statutory MSMED Act compliance & Terms of Service.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approval Requested Confirmation Dialog */}
      <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl border-border bg-card shadow-2xl space-y-4">
          <div className="text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
              <UserCheck className="h-7 w-7" />
            </div>

            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                Approval Request Submitted!
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Your request to join this organization has been sent to the company administrator.
              </DialogDescription>
            </DialogHeader>

            {submittedApprovalData && (
              <div className="p-4 rounded-2xl bg-muted/50 border border-border/80 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <strong className="text-foreground">{submittedApprovalData.companyName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Company ID:</span>
                  <strong className="font-mono text-teal-600">{submittedApprovalData.companyId}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Requested Role:</span>
                  <strong className="text-foreground">{submittedApprovalData.role}</strong>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-muted-foreground">Administrator:</span>
                  <span className="font-medium text-foreground">{submittedApprovalData.adminName}</span>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground leading-relaxed">
              Once verified by your administrator, you will be able to sign in and access the enterprise compliance workspace.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl text-xs"
                onClick={() => {
                  setApprovalModalOpen(false);
                  setAuthMode('signin');
                }}
              >
                Return to Sign In
              </Button>
              <Button
                className="w-full h-10 rounded-xl text-xs bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => {
                  setApprovalModalOpen(false);
                  loginAsDemoMember();
                }}
              >
                Instant Access as Approved Member (Demo)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
