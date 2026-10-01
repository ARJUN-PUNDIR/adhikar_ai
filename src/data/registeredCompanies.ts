export interface RegisteredCompany {
  id: string;
  name: string;
  sector: string;
  city: string;
  ownerName: string;
  adminEmail: string;
  constitution: string;
  gstin?: string;
  createdDate?: string;
}

export interface MemberApprovalRequest {
  id: string;
  companyId: string;
  companyName: string;
  memberName: string;
  memberEmail: string;
  role: string;
  department?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const DEFAULT_REGISTERED_COMPANIES: RegisteredCompany[] = [
  {
    id: 'CMP-BHR-1092',
    name: 'Bharat Robotics & Automation Pvt Ltd',
    sector: 'Manufacturing',
    city: 'Pune, Maharashtra',
    ownerName: 'Rajesh Sharma (MD)',
    adminEmail: 'rajesh@bharatrobotics.in',
    constitution: 'Private Limited Company',
    gstin: '27AABCB1234D1Z2',
    createdDate: '2024-01-15'
  },
  {
    id: 'CMP-VDC-5521',
    name: 'Vedic Agro Organics LLP',
    sector: 'Trading',
    city: 'Indore, Madhya Pradesh',
    ownerName: 'Anjali Deshmukh (Partner)',
    adminEmail: 'accounts@vedicorganics.com',
    constitution: 'Limited Liability Partnership (LLP)',
    gstin: '23AABCV5678E1Z4',
    createdDate: '2024-02-10'
  },
  {
    id: 'CMP-NXF-8834',
    name: 'NexaFin Solutions Tech Pvt Ltd',
    sector: 'Tech / Startup',
    city: 'Bengaluru, Karnataka',
    ownerName: 'Vikram Mehta (Director)',
    adminEmail: 'tax@nexafintech.io',
    constitution: 'Private Limited Company',
    gstin: '29AABCN9876F1Z8',
    createdDate: '2024-02-18'
  },
  {
    id: 'CMP-KVT-3410',
    name: 'Kavita Tex-Fab Enterprises',
    sector: 'Manufacturing',
    city: 'Surat, Gujarat',
    ownerName: 'Manish Shah (Proprietor)',
    adminEmail: 'accounts@kavitatexfab.com',
    constitution: 'Sole Proprietorship',
    gstin: '24AABCK4321G1Z1',
    createdDate: '2024-03-01'
  },
  {
    id: 'CMP-SBL-9042',
    name: 'Shree Balaji Logistics & Warehousing',
    sector: 'Services',
    city: 'Nagpur, Maharashtra',
    ownerName: 'Anand Agarwal (Director)',
    adminEmail: 'compliance@balajilogistics.in',
    constitution: 'Partnership Firm',
    gstin: '27AABCS8765H1Z3',
    createdDate: '2024-03-05'
  }
];

export const getRegisteredCompanies = (): RegisteredCompany[] => {
  try {
    const saved = localStorage.getItem('adhikar_registered_companies');
    if (saved) {
      const parsed: RegisteredCompany[] = JSON.parse(saved);
      const ids = new Set(parsed.map(c => c.id));
      const defaults = DEFAULT_REGISTERED_COMPANIES.filter(c => !ids.has(c.id));
      return [...parsed, ...defaults];
    }
  } catch (e) {
    console.error('Failed to read registered companies from localStorage', e);
  }
  return DEFAULT_REGISTERED_COMPANIES;
};

export const searchRegisteredCompanies = (query: string): RegisteredCompany[] => {
  if (!query || query.trim().length < 2) return [];
  const clean = query.toLowerCase().trim();
  const all = getRegisteredCompanies();
  return all.filter(c => 
    c.name.toLowerCase().includes(clean) ||
    c.id.toLowerCase().includes(clean) ||
    c.city.toLowerCase().includes(clean) ||
    c.ownerName.toLowerCase().includes(clean)
  );
};

export const registerNewCompany = (companyData: {
  name: string;
  sector: string;
  city: string;
  ownerName: string;
  adminEmail: string;
  constitution?: string;
  gstin?: string;
}): RegisteredCompany => {
  const all = getRegisteredCompanies();
  const initials = companyData.name
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase() || 'CMP';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newId = `CMP-${initials}-${randomNum}`;

  const newCompany: RegisteredCompany = {
    id: newId,
    name: companyData.name.trim(),
    sector: companyData.sector || 'Manufacturing',
    city: companyData.city || 'Mumbai, Maharashtra',
    ownerName: companyData.ownerName.trim(),
    adminEmail: companyData.adminEmail.trim(),
    constitution: companyData.constitution || 'Private Limited Company',
    gstin: companyData.gstin?.trim() || undefined,
    createdDate: new Date().toISOString().split('T')[0]
  };

  const updated = [newCompany, ...all];
  try {
    localStorage.setItem('adhikar_registered_companies', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to persist registered company', e);
  }

  return newCompany;
};

export const submitMemberApprovalRequest = (data: {
  companyId: string;
  companyName: string;
  memberName: string;
  memberEmail: string;
  role: string;
  department?: string;
}): MemberApprovalRequest => {
  const newRequest: MemberApprovalRequest = {
    id: `req-${Date.now()}`,
    companyId: data.companyId,
    companyName: data.companyName,
    memberName: data.memberName,
    memberEmail: data.memberEmail,
    role: data.role,
    department: data.department,
    submittedAt: new Date().toISOString(),
    status: 'pending'
  };

  try {
    const saved = localStorage.getItem('adhikar_member_approvals');
    const list: MemberApprovalRequest[] = saved ? JSON.parse(saved) : [];
    list.unshift(newRequest);
    localStorage.setItem('adhikar_member_approvals', JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save approval request', e);
  }

  return newRequest;
};
