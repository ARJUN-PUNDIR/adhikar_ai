export interface ClientDocument {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  type: string;
  url?: string;
}

export interface TaskComment {
  id: string;
  author: string;
  role: string;
  text: string;
  time: string;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ClientTask {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  category: 'GST' | 'Income Tax' | 'Audit' | 'MCA Compliance' | 'MSME' | 'Payroll & EPF';
  description: string;
  detailedRequirements?: string;
  status: 'pending' | 'in_progress' | 'in_review' | 'completed';
  priority: 'urgent' | 'high' | 'medium' | 'normal';
  dueDate: string;
  assignedDate: string;
  documents: ClientDocument[];
  comments: TaskComment[];
  checklist: TaskChecklistItem[];
  estimatedHours?: number;
  penaltyRiskAmount?: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstin: string;
  pan: string;
  businessType: 'Manufacturing' | 'Trading' | 'Services' | 'Retail' | 'Tech/Startup';
  turnoverBracket: string;
  city: string;
  state: string;
  complianceScore: number;
  status: 'Active' | 'Under Review' | 'Action Needed';
  assignedCA: string;
  totalTasks: number;
  pendingTasksCount: number;
  urgentTasksCount: number;
  avatarColor: string;
  lastActive: string;
  notes?: string;
}

export interface PolicyReform {
  id: string;
  title: string;
  ministry: string;
  date: string;
  effectiveDate: string;
  notificationNumber: string;
  category: 'GST' | 'Direct Tax' | 'MCA / Companies Act' | 'MSME Act' | 'Labor & EPF';
  impactLevel: 'Critical' | 'High' | 'Moderate' | 'Informational';
  summary: string;
  details: string;
  actionRequired: string;
  applicableTo: string;
  readTime: string;
}

export interface ComplianceDeadline {
  id: string;
  title: string;
  category: 'GST' | 'Income Tax' | 'MCA' | 'EPF / ESI' | 'Customs';
  dueDate: string;
  period: string;
  applicableClientsCount: number;
  status: 'upcoming' | 'due_today' | 'critical' | 'completed';
  formNumber: string;
  penaltyClause: string;
}
