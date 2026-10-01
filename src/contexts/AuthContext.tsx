import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export type AccountType = 'ca' | 'company_member';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  accountType: AccountType;
  switchAccountType: (type: AccountType) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loginAsDemoCA: () => void;
  loginAsDemoMember: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState<AccountType>(() => {
    const saved = localStorage.getItem('adhikar_account_type');
    return (saved as AccountType) || 'ca';
  });

  const navigate = useNavigate();

  // Helper to determine account type from user metadata
  const extractAccountType = (usr: User | null): AccountType => {
    if (!usr) return (localStorage.getItem('adhikar_account_type') as AccountType) || 'ca';
    if (usr.user_metadata?.account_type === 'ca' || usr.user_metadata?.role === 'ca') {
      return 'ca';
    }
    if (usr.user_metadata?.account_type === 'company_member') {
      return 'company_member';
    }
    return (localStorage.getItem('adhikar_account_type') as AccountType) || 'ca';
  };

  useEffect(() => {
    // Check if demo user is stored in localStorage
    const savedDemoUser = localStorage.getItem('adhikar_demo_user');
    if (savedDemoUser) {
      try {
        const parsed = JSON.parse(savedDemoUser);
        setUser(parsed);
        setAccountType(parsed.user_metadata?.account_type || 'ca');
        setLoading(false);
        return;
      } catch (e) {
        console.error('Failed to parse saved demo user', e);
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const detectedType = extractAccountType(currentUser);
        setAccountType(detectedType);
        localStorage.setItem('adhikar_account_type', detectedType);
      }

      if (event === 'SIGNED_IN') {
        navigate('/dashboard');
      }
    });

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const detectedType = extractAccountType(currentUser);
        setAccountType(detectedType);
        localStorage.setItem('adhikar_account_type', detectedType);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const switchAccountType = (type: AccountType) => {
    setAccountType(type);
    localStorage.setItem('adhikar_account_type', type);
    if (user) {
      const updatedUser = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          account_type: type
        }
      };
      setUser(updatedUser as User);
      if (localStorage.getItem('adhikar_demo_user')) {
        localStorage.setItem('adhikar_demo_user', JSON.stringify(updatedUser));
      }
    }
    toast.success(`Switched view to ${type === 'ca' ? 'Chartered Accountant (CA)' : 'Company Member'}`);
  };

  const loginAsDemoCA = () => {
    const demoCA: any = {
      id: 'demo-ca-001',
      email: 'ca.agrawal@adhikar.ai',
      user_metadata: {
        full_name: 'CA Rajesh K. Agrawal, FCA',
        account_type: 'ca',
        firm_name: 'R. K. Agrawal & Co., Chartered Accountants',
        ca_reg_number: 'ICAI-084920',
        ca_connect_id: 'CA-AGR-8492',
        specialization: 'MSME Statutory Audit, GST & Corporate Tax',
        city: 'New Delhi & Mumbai'
      }
    };
    setUser(demoCA);
    setAccountType('ca');
    localStorage.setItem('adhikar_demo_user', JSON.stringify(demoCA));
    localStorage.setItem('adhikar_account_type', 'ca');
    toast.success('Logged in as Chartered Accountant (CA Demo Portal)');
    navigate('/dashboard');
  };

  const loginAsDemoMember = () => {
    const demoMember: any = {
      id: 'demo-member-002',
      email: 'rajesh.sharma@bharatrobotics.in',
      user_metadata: {
        full_name: 'Rajesh Sharma',
        account_type: 'company_member',
        business_name: 'Bharat Robotics & Automation Pvt Ltd',
        role: 'Managing Director',
        business_type: 'manufacturing'
      }
    };
    setUser(demoMember);
    setAccountType('company_member');
    localStorage.setItem('adhikar_demo_user', JSON.stringify(demoMember));
    localStorage.setItem('adhikar_account_type', 'company_member');
    toast.success('Logged in as Company Member (MSME Portal)');
    navigate('/dashboard');
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const detectedType = extractAccountType(data.user);
        setAccountType(detectedType);
        localStorage.setItem('adhikar_account_type', detectedType);
      }
      localStorage.removeItem('adhikar_demo_user');
      toast.success('Signed in successfully!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: Record<string, any>
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      const detectedType = userData.account_type || accountType;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            ...userData,
            account_type: detectedType
          }
        }
      });
      
      if (error) throw error;
      
      setAccountType(detectedType);
      localStorage.setItem('adhikar_account_type', detectedType);
      localStorage.removeItem('adhikar_demo_user');
      toast.success('Account created successfully!');
      
      // If auto-signed in
      if (data.user) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('adhikar_demo_user');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast.success('Signed out successfully!');
      navigate('/auth');
    } catch (error: any) {
      console.error('Sign out error:', error);
      localStorage.removeItem('adhikar_demo_user');
      setUser(null);
      setSession(null);
      navigate('/auth');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      accountType, 
      switchAccountType, 
      signIn, 
      signUp, 
      signOut, 
      signInWithGoogle,
      loginAsDemoCA,
      loginAsDemoMember
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
