import { Client, ClientTask, PolicyReform, ComplianceDeadline } from '@/types/ca';

export const mockClients: Client[] = [
  {
    id: 'cli-1',
    companyName: 'Bharat Robotics & Automation Pvt Ltd',
    contactPerson: 'Rajesh Sharma (MD)',
    email: 'finance@bharatrobotics.in',
    phone: '+91 98201 44521',
    gstin: '27AABCB1234D1Z2',
    pan: 'AABCB1234D',
    businessType: 'Manufacturing',
    turnoverBracket: '₹12.5 Cr (Small Enterprise)',
    city: 'Pune',
    state: 'Maharashtra',
    complianceScore: 88,
    status: 'Action Needed',
    assignedCA: 'CA R. K. Agrawal & Co.',
    totalTasks: 7,
    pendingTasksCount: 3,
    urgentTasksCount: 1,
    avatarColor: 'from-blue-600 to-indigo-600',
    lastActive: '10 mins ago',
    notes: 'Requires urgent clearance of Section 43B(h) vendor liabilities before quarter end.'
  },
  {
    id: 'cli-2',
    companyName: 'Vedic Agro Organics LLP',
    contactPerson: 'Anjali Deshmukh (Partner)',
    email: 'accounts@vedicorganics.com',
    phone: '+91 94250 88124',
    gstin: '23AABCV5678E1Z4',
    pan: 'AABCV5678E',
    businessType: 'Trading',
    turnoverBracket: '₹4.8 Cr (Micro Enterprise)',
    city: 'Indore',
    state: 'Madhya Pradesh',
    complianceScore: 95,
    status: 'Active',
    assignedCA: 'CA R. K. Agrawal & Co.',
    totalTasks: 5,
    pendingTasksCount: 1,
    urgentTasksCount: 0,
    avatarColor: 'from-emerald-600 to-teal-600',
    lastActive: '2 hours ago',
    notes: 'Exports agricultural goods, zero-rated GST claim awaiting verification.'
  },
  {
    id: 'cli-3',
    companyName: 'NexaFin Solutions Tech Pvt Ltd',
    contactPerson: 'Vikram Mehta (Director)',
    email: 'tax@nexafintech.io',
    phone: '+91 99887 66231',
    gstin: '29AABCN9876F1Z8',
    pan: 'AABCN9876F',
    businessType: 'Tech/Startup',
    turnoverBracket: '₹22.0 Cr (Medium Enterprise)',
    city: 'Bengaluru',
    state: 'Karnataka',
    complianceScore: 78,
    status: 'Action Needed',
    assignedCA: 'CA R. K. Agrawal & Co.',
    totalTasks: 9,
    pendingTasksCount: 4,
    urgentTasksCount: 2,
    avatarColor: 'from-violet-600 to-purple-600',
    lastActive: 'Yesterday',
    notes: 'ESOP tax withholding and Transfer Pricing audit for foreign subsidiary pending.'
  },
  {
    id: 'cli-4',
    companyName: 'Kavita Tex-Fab Enterprises',
    contactPerson: 'Suresh Patel (Proprietor)',
    email: 'kavitatexfab@gmail.com',
    phone: '+91 98251 33499',
    gstin: '24AABCK4321G1Z1',
    pan: 'AABCK4321G',
    businessType: 'Retail',
    turnoverBracket: '₹1.9 Cr (Micro Enterprise)',
    city: 'Surat',
    state: 'Gujarat',
    complianceScore: 92,
    status: 'Active',
    assignedCA: 'CA R. K. Agrawal & Co.',
    totalTasks: 4,
    pendingTasksCount: 1,
    urgentTasksCount: 0,
    avatarColor: 'from-amber-600 to-orange-600',
    lastActive: '3 days ago',
    notes: 'Composition scheme to Regular GST scheme migration review complete.'
  },
  {
    id: 'cli-5',
    companyName: 'Shree Balaji Logistics & Warehousing',
    contactPerson: 'Manoj Yadav (CFO)',
    email: 'admin@balajilogistics.co.in',
    phone: '+91 98112 55432',
    gstin: '06AABCS8765H1Z6',
    pan: 'AABCS8765H',
    businessType: 'Services',
    turnoverBracket: '₹34.0 Cr (Medium Enterprise)',
    city: 'Gurugram',
    state: 'Haryana',
    complianceScore: 68,
    status: 'Under Review',
    assignedCA: 'CA R. K. Agrawal & Co.',
    totalTasks: 8,
    pendingTasksCount: 5,
    urgentTasksCount: 2,
    avatarColor: 'from-cyan-600 to-blue-600',
    lastActive: '5 hours ago',
    notes: 'E-Way bill reconciliation mismatch flagged under Rule 138.'
  }
];

export const mockClientTasks: ClientTask[] = [
  {
    id: 'task-101',
    clientId: 'cli-1',
    clientName: 'Bharat Robotics & Automation Pvt Ltd',
    title: 'Section 43B(h) MSME 45-Day Vendor Payment Audit',
    category: 'MSME',
    description: 'Verify 42 vendor invoices totaling ₹68.4 Lakhs to ensure compliance with the 45-day payment statutory rule before fiscal close.',
    detailedRequirements: '1. Extract Ageing Analysis of Sundry Creditors.\n2. Cross-reference Udyam Registration certificates of all vendors.\n3. Identify delayed payments liable for interest at 3x RBI Bank rate.\n4. Disallow unpaid claims under Section 43B(h) of Income Tax Act.',
    status: 'pending',
    priority: 'urgent',
    dueDate: '2025-03-31',
    assignedDate: '2025-03-01',
    documents: [
      { id: 'doc-1', name: 'Creditors_Ageing_Report_Feb2025.xlsx', size: '1.4 MB', uploadDate: '2025-03-02', type: 'Spreadsheet' },
      { id: 'doc-2', name: 'Vendor_Udyam_Certificates_Batch.zip', size: '8.2 MB', uploadDate: '2025-03-03', type: 'Archive' }
    ],
    comments: [
      { id: 'c-1', author: 'Rajesh Sharma', role: 'Client MD', text: 'We have paid 30 out of 42 vendors. Receipts are attached.', time: '2 hours ago' },
      { id: 'c-2', author: 'CA Agrawal', role: 'Chartered Accountant', text: 'Reviewing the remaining 12 vendors. Please confirm if written contracts exist for 45-day credit terms.', time: '30 mins ago' }
    ],
    checklist: [
      { id: 'chk-1', text: 'Collect vendor Udyam classification', completed: true },
      { id: 'chk-2', text: 'Calculate interest on delayed payments', completed: false },
      { id: 'chk-3', text: 'Compute tax add-back liability under P&L', completed: false },
      { id: 'chk-4', text: 'Sign off certification annexure', completed: false }
    ],
    estimatedHours: 6,
    penaltyRiskAmount: '₹14.2 Lakhs'
  },
  {
    id: 'task-102',
    clientId: 'cli-1',
    clientName: 'Bharat Robotics & Automation Pvt Ltd',
    title: 'GSTR-3B & GSTR-2B Input Tax Credit Mismatch Resolution',
    category: 'GST',
    description: 'Resolve ₹4.2 Lakhs difference between books ITC and Auto-populated GSTR-2B before filing monthly GSTR-3B.',
    detailedRequirements: '1. Reconcile purchase register with GSTR-2B portal dump.\n2. Segregate ineligible ITC under Section 17(5).\n3. Draft communication to 4 defaulting suppliers who haven’t filed GSTR-1.\n4. Formulate monthly ITC claim schedule.',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2025-03-20',
    assignedDate: '2025-03-05',
    documents: [
      { id: 'doc-3', name: 'GSTR_2B_Download_Feb2025.json', size: '3.1 MB', uploadDate: '2025-03-05', type: 'JSON' },
      { id: 'doc-4', name: 'Purchase_Ledger_Extract.xlsx', size: '4.7 MB', uploadDate: '2025-03-06', type: 'Spreadsheet' }
    ],
    comments: [
      { id: 'c-3', author: 'CA Agrawal', role: 'Chartered Accountant', text: 'Found 3 vendors who entered incorrect GSTIN on invoice.', time: '1 day ago' }
    ],
    checklist: [
      { id: 'chk-5', text: 'Run 2B automated reconciliation', completed: true },
      { id: 'chk-6', text: 'Notify non-compliant vendors', completed: true },
      { id: 'chk-7', text: 'Finalize eligible ITC figure', completed: false }
    ],
    estimatedHours: 4,
    penaltyRiskAmount: '₹4.2 Lakhs'
  },
  {
    id: 'task-103',
    clientId: 'cli-1',
    clientName: 'Bharat Robotics & Automation Pvt Ltd',
    title: 'Advance Tax Q4 Final Estimation & Challan Generation',
    category: 'Income Tax',
    description: 'Calculate 100% cumulative Advance Tax payable before March 15 deadline to avoid Section 234B & 234C interest.',
    detailedRequirements: 'Assess Q4 projected net revenue and compute advance tax installment payable on Form ITNS 280.',
    status: 'completed',
    priority: 'medium',
    dueDate: '2025-03-15',
    assignedDate: '2025-02-28',
    documents: [
      { id: 'doc-5', name: 'Challan_Receipt_ITNS280_Q4.pdf', size: '420 KB', uploadDate: '2025-03-14', type: 'PDF' }
    ],
    comments: [
      { id: 'c-4', author: 'CA Agrawal', role: 'Chartered Accountant', text: 'Challan generated for ₹6,45,000 and confirmed paid by bank.', time: '2 days ago' }
    ],
    checklist: [
      { id: 'chk-8', text: 'Profit projection analysis', completed: true },
      { id: 'chk-9', text: 'TDS credit credit verification in 26AS', completed: true },
      { id: 'chk-10', text: 'Challan verification on TRACES', completed: true }
    ],
    estimatedHours: 2,
    penaltyRiskAmount: '₹0 (Completed)'
  },
  {
    id: 'task-201',
    clientId: 'cli-2',
    clientName: 'Vedic Agro Organics LLP',
    title: 'Filing GST RFD-01 for Zero-Rated Export Refund',
    category: 'GST',
    description: 'Submit GST refund application for accumulated unutilized Input Tax Credit on organic food grains exported without payment of tax (LUT).',
    detailedRequirements: 'Prepare Annexure-A, Shipping Bills verification, and BRC/FIRC realization certification from Authorized Dealer Bank.',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2025-03-25',
    assignedDate: '2025-03-08',
    documents: [
      { id: 'doc-6', name: 'Shipping_Bills_Q3.pdf', size: '5.6 MB', uploadDate: '2025-03-08', type: 'PDF' },
      { id: 'doc-7', name: 'Bank_Realization_FIRC.pdf', size: '2.1 MB', uploadDate: '2025-03-09', type: 'PDF' }
    ],
    comments: [
      { id: 'c-5', author: 'Anjali Deshmukh', role: 'Partner', text: 'Total refund claimed is ₹8.65 Lakhs under rule 89(4).', time: '1 day ago' }
    ],
    checklist: [
      { id: 'chk-11', text: 'Verify Shipping Bill with ICEGATE', completed: true },
      { id: 'chk-12', text: 'Prepare turnover turnover ratio working', completed: true },
      { id: 'chk-13', text: 'Upload RFD-01 on GST Portal with DSC', completed: false }
    ],
    estimatedHours: 5,
    penaltyRiskAmount: '₹8.65 Lakhs (Blocked Refund)'
  },
  {
    id: 'task-301',
    clientId: 'cli-3',
    clientName: 'NexaFin Solutions Tech Pvt Ltd',
    title: 'DIR-3 KYC Web Filing for 3 Resident Directors',
    category: 'MCA Compliance',
    description: 'Complete annual KYC compliance for Director Identification Numbers (DIN) on Ministry of Corporate Affairs portal before penalty triggers.',
    detailedRequirements: 'Verify OTP on registered mobile and email addresses for all 3 directors. Validate active status on MCA V3.',
    status: 'pending',
    priority: 'urgent',
    dueDate: '2025-03-31',
    assignedDate: '2025-03-04',
    documents: [
      { id: 'doc-8', name: 'Directors_Aadhaar_PAN_Copies.pdf', size: '3.4 MB', uploadDate: '2025-03-04', type: 'PDF' }
    ],
    comments: [
      { id: 'c-6', author: 'Vikram Mehta', role: 'Director', text: 'One director is currently in Singapore. Will OTP work on international number?', time: '3 hours ago' },
      { id: 'c-7', author: 'CA Agrawal', role: 'Chartered Accountant', text: 'Yes, email OTP is valid for MCA V3 verification. Scheduling slot today.', time: '1 hour ago' }
    ],
    checklist: [
      { id: 'chk-14', text: 'Director 1 (Vikram Mehta) KYC', completed: true },
      { id: 'chk-15', text: 'Director 2 (Pooja Rao) KYC', completed: false },
      { id: 'chk-16', text: 'Director 3 (Arjun Singhania) KYC', completed: false }
    ],
    estimatedHours: 2,
    penaltyRiskAmount: '₹15,000 (₹5,000 per DIN)'
  },
  {
    id: 'task-302',
    clientId: 'cli-3',
    clientName: 'NexaFin Solutions Tech Pvt Ltd',
    title: 'TDS Form 24Q & 26Q Reconciliation for Q4',
    category: 'Income Tax',
    description: 'Verify salary TDS (Sec 192) and vendor TDS (Sec 194C, 194J, 194Q) deductions for 85 software employees and 20 contractors.',
    detailedRequirements: 'Reconcile payroll deductions with monthly challan deposits. Ensure zero short deduction or interest flags in TRACES.',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2025-04-15',
    assignedDate: '2025-03-07',
    documents: [
      { id: 'doc-9', name: 'Payroll_TDS_Dump_Jan_Feb2025.xlsx', size: '2.8 MB', uploadDate: '2025-03-07', type: 'Spreadsheet' }
    ],
    comments: [
      { id: 'c-8', author: 'CA Agrawal', role: 'Chartered Accountant', text: 'Tax audit requires special attention to 194J (Professional fees vs Technical fees 2%).', time: 'Yesterday' }
    ],
    checklist: [
      { id: 'chk-17', text: 'PAN verification of all contractors', completed: true },
      { id: 'chk-18', text: 'Validate Section 194Q threshold (> ₹50L purchases)', completed: false },
      { id: 'chk-19', text: 'Generate FVU utility file', completed: false }
    ],
    estimatedHours: 8,
    penaltyRiskAmount: '₹45,000'
  },
  {
    id: 'task-501',
    clientId: 'cli-5',
    clientName: 'Shree Balaji Logistics & Warehousing',
    title: 'E-Way Bill vs GSTR-1 Mismatch Hearing Notice Response',
    category: 'GST',
    description: 'Draft legal response to GST Department Notice under Section 73 regarding alleged disparity between generated E-Way bills and outward taxable supplies.',
    detailedRequirements: 'Compile cancelled E-Way bills, multi-modal transport receipts, and vehicle breakdown logs to justify invoice value alignment.',
    status: 'pending',
    priority: 'urgent',
    dueDate: '2025-03-22',
    assignedDate: '2025-03-09',
    documents: [
      { id: 'doc-10', name: 'GST_DRC_01_Notice.pdf', size: '1.2 MB', uploadDate: '2025-03-09', type: 'PDF' },
      { id: 'doc-11', name: 'Logistics_Trip_Proof_Annexures.pdf', size: '14.5 MB', uploadDate: '2025-03-10', type: 'PDF' }
    ],
    comments: [
      { id: 'c-9', author: 'Manoj Yadav', role: 'CFO', text: 'Notice demands ₹11.8 Lakhs plus 100% penalty. Needs your urgent representation.', time: '5 hours ago' }
    ],
    checklist: [
      { id: 'chk-20', text: 'Analyze DRC-01 ground-by-ground', completed: true },
      { id: 'chk-21', text: 'Prepare reconciliation statement', completed: false },
      { id: 'chk-22', text: 'Draft reply under Form DRC-06', completed: false },
      { id: 'chk-23', text: 'File on portal with legal citations', completed: false }
    ],
    estimatedHours: 10,
    penaltyRiskAmount: '₹23.6 Lakhs'
  },
  {
    id: 'task-401',
    clientId: 'cli-4',
    clientName: 'Kavita Tex-Fab Enterprises',
    title: 'Shop & Establishment Act Annual Compliance Renewal',
    category: 'Payroll & EPF',
    description: 'Renew local municipal trade license and verify compliance with state-specific shop employee registers and working hour limits.',
    detailedRequirements: 'Submit online Form B with updated employee count and proof of local property tax payment.',
    status: 'pending',
    priority: 'normal',
    dueDate: '2025-04-10',
    assignedDate: '2025-03-10',
    documents: [
      { id: 'doc-12', name: 'Shop_License_Previous.pdf', size: '890 KB', uploadDate: '2025-03-10', type: 'PDF' }
    ],
    comments: [],
    checklist: [
      { id: 'chk-24', text: 'Review employee muster roll', completed: true },
      { id: 'chk-25', text: 'Submit renewal application', completed: false }
    ],
    estimatedHours: 1,
    penaltyRiskAmount: '₹5,000'
  }
];

export const mockPolicyReforms: PolicyReform[] = [
  {
    id: 'ref-1',
    title: 'Section 43B(h) MSME 45-Day Payment Mandate Clarification',
    ministry: 'Ministry of Finance & CBDT',
    date: 'March 2025',
    effectiveDate: 'Applicable for FY 2024-25 (AY 2025-26)',
    notificationNumber: 'Circular No. 04/2025 / F.No. 370142',
    category: 'MSME Act',
    impactLevel: 'Critical',
    summary: 'Strict enforcement: Sums payable to registered Micro and Small enterprises beyond 45 days (or 15 days without agreement) shall be disallowed as expenditure for income tax calculation unless paid within the fiscal year.',
    details: 'The Central Board of Direct Taxes (CBDT) has clarified that Section 43B(h) applies only to Micro and Small enterprises registered under Udyam. Medium enterprises and wholesale/retail traders are exempt from Section 43B(h) disallowance. Tax auditors must specifically report outstanding balances beyond statutory timelines in Form 3CD Clause 22.',
    actionRequired: 'Review all Sundry Creditors ageing reports for clients. Verify Udyam certificate enterprise status (Micro vs Small vs Medium) and ensure clearance of outstanding balances before March 31.',
    applicableTo: 'All MSME corporate & non-corporate entities with turnover > ₹1 Crore',
    readTime: '3 min read'
  },
  {
    id: 'ref-2',
    title: 'GST Amnesty Scheme & Relaxation for Sections 73 Notices',
    ministry: 'Ministry of Finance (CBIC)',
    date: 'February 2025',
    effectiveDate: '1st November 2024 - 31st March 2025',
    notificationNumber: 'Notification No. 21/2024 - Central Tax',
    category: 'GST',
    impactLevel: 'High',
    summary: 'Waiver of interest and penalty for tax demands issued under Section 73 (non-fraud cases) for Financial Years 2017-18, 2018-19, and 2019-20 if full principal tax is deposited.',
    details: 'Provides massive relief to MSMEs facing legacy scrutiny orders for initial years of GST rollout. Taxpayers can file application in Form GST SPL-01 on the portal. No penalty or interest will be recovered once the tax amount determined by the officer is settled.',
    actionRequired: 'Identify clients having pending adjudication orders or demand notices for FY 17-18 through FY 19-20 and advise on availing amnesty benefit before March 31 deadline.',
    applicableTo: 'All GST registered business entities facing Section 73 orders',
    readTime: '4 min read'
  },
  {
    id: 'ref-3',
    title: 'Mandatory E-Invoicing Threshold Expanded for MSMEs',
    ministry: 'GST Council / CBIC',
    date: 'January 2025',
    effectiveDate: '1st April 2025',
    notificationNumber: 'Notification No. 10/2025 - Central Tax',
    category: 'GST',
    impactLevel: 'Critical',
    summary: 'Government lowers mandatory E-Invoicing threshold to include all registered businesses with aggregate annual turnover exceeding ₹5 Crores in any preceding fiscal year.',
    details: 'B2B invoices and Export invoices generated without Invoice Reference Number (IRN) and signed QR code from IRP portals (NIC/Clear/Taxilla) will be deemed invalid. Input Tax Credit cannot be availed by recipient if e-invoice is absent.',
    actionRequired: 'Audit accounting ERP software for clients crossing ₹5 Cr turnover threshold. Ensure automated API or portal integration with Invoice Registration Portal (IRP).',
    applicableTo: 'MSME entities with annual turnover between ₹5 Cr to ₹10 Cr',
    readTime: '2 min read'
  },
  {
    id: 'ref-4',
    title: 'MCA V3 Portal Enhanced Filing & Form CSR-2 Revision',
    ministry: 'Ministry of Corporate Affairs (MCA)',
    date: 'February 2025',
    effectiveDate: 'Immediate',
    notificationNumber: 'General Circular 02/2025',
    category: 'MCA / Companies Act',
    impactLevel: 'Moderate',
    summary: 'Companies Act filings migrate completely to MCA V3 with mandatory two-factor authentication and strict biometric-linked DSC verification.',
    details: 'Standalone filing of Form CSR-2 (Report on Corporate Social Responsibility) made mandatory for all companies qualifying Section 135 criteria prior to filing AOC-4. Directors must update mobile and email in DIR-3 KYC before signing.',
    actionRequired: 'Ensure all corporate directors have active DSC with updated drivers compatible with MCA V3 system. File CSR-2 and annual financial returns timely to avoid ₹100/day late fees.',
    applicableTo: 'Private Limited Companies & Public Limited Companies',
    readTime: '3 min read'
  },
  {
    id: 'ref-5',
    title: 'TDS Section 194-O Rate Slashed for MSME E-Commerce Sellers',
    ministry: 'Central Board of Direct Taxes (CBDT)',
    date: 'January 2025',
    effectiveDate: 'Effective Q4 FY 2024-25',
    notificationNumber: 'CBDT Press Release / Finance Act',
    category: 'Direct Tax',
    impactLevel: 'High',
    summary: 'TDS rate on gross sale consideration of goods or services facilitated by e-commerce operators reduced from 1% down to 0.1% for individual/HUF/MSME sellers.',
    details: 'This amendment significantly eases liquidity and working capital strain for small enterprises selling on platforms like Amazon, Flipkart, ONDC, and Meesho. The 0.1% rate applies provided the seller possesses a valid PAN.',
    actionRequired: 'Advise e-commerce client sellers to update their vendor profile on digital marketplaces to ensure TDS is withheld only at 0.1% and verify Form 26AS reflection.',
    applicableTo: 'All MSME sellers operating on digital e-commerce platforms',
    readTime: '2 min read'
  }
];

export const mockComplianceDeadlines: ComplianceDeadline[] = [
  {
    id: 'dl-1',
    title: 'Advance Tax 4th Installment (100% Tax Payable)',
    category: 'Income Tax',
    dueDate: '2025-03-15',
    period: 'FY 2024-25 (Q4)',
    applicableClientsCount: 5,
    status: 'critical',
    formNumber: 'Challan ITNS 280',
    penaltyClause: 'Interest @ 1% per month under Section 234B & 234C on deficit amount'
  },
  {
    id: 'dl-2',
    title: 'GSTR-3B Monthly Return Filing (Regular Taxpayers)',
    category: 'GST',
    dueDate: '2025-03-20',
    period: 'February 2025',
    applicableClientsCount: 4,
    status: 'upcoming',
    formNumber: 'GSTR-3B',
    penaltyClause: 'Late fee ₹50/day (₹20 for Nil return) + Interest @ 18% p.a. on net tax'
  },
  {
    id: 'dl-3',
    title: 'GSTR-1 Monthly Outward Supplies (Turnover > ₹5 Cr)',
    category: 'GST',
    dueDate: '2025-03-11',
    period: 'February 2025',
    applicableClientsCount: 3,
    status: 'due_today',
    formNumber: 'GSTR-1 / IFF',
    penaltyClause: 'Blocking of E-Way Bill generation on consecutive defaults'
  },
  {
    id: 'dl-4',
    title: 'Section 43B(h) MSME Vendor Outstanding Settlement',
    category: 'Income Tax',
    dueDate: '2025-03-31',
    period: 'FY 2024-25 Close',
    applicableClientsCount: 5,
    status: 'critical',
    formNumber: 'Clause 22 Form 3CD',
    penaltyClause: '100% disallowance of expenditure added back to taxable business profits'
  },
  {
    id: 'dl-5',
    title: 'EPF & ESI Monthly Electronic Challan cum Return (ECR)',
    category: 'EPF / ESI',
    dueDate: '2025-03-15',
    period: 'February 2025',
    applicableClientsCount: 4,
    status: 'critical',
    formNumber: 'ECR Portal Upload',
    penaltyClause: 'Damages up to 25% p.a. under Section 14B + Disallowance under IT Act'
  },
  {
    id: 'dl-6',
    title: 'DIR-3 KYC Filing for Directors without Late Fee',
    category: 'MCA',
    dueDate: '2025-03-31',
    period: 'Annual DIN Validation',
    applicableClientsCount: 3,
    status: 'upcoming',
    formNumber: 'Form DIR-3 KYC Web',
    penaltyClause: 'Fixed late penalty of ₹5,000 per DIN and deactivation of director status'
  }
];
