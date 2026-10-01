import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Plus, Search, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { DocumentCollaboration } from '@/components/documents/DocumentCollaboration';
import { DocumentWorkflow } from '@/components/documents/DocumentWorkflow';
import { PageTransition } from '@/components/ui/PageTransition';
import { CustomTemplateManager } from '@/components/documents/CustomTemplateManager';

// Comprehensive MSME legal document templates
const documentTemplates = [
  {
    type: 'partnership_deed',
    name: 'Partnership Deed',
    description: 'Legal agreement between business partners',
    category: 'Business Formation',
    fields: ['partner1_name', 'partner1_address', 'partner2_name', 'partner2_address', 'business_name', 'capital_contribution', 'profit_sharing_ratio', 'business_purpose']
  },
  {
    type: 'nda',
    name: 'Non-Disclosure Agreement (NDA)',
    description: 'Confidentiality agreement for business discussions',
    category: 'Contracts',
    fields: ['party1_name', 'party2_name', 'effective_date', 'purpose', 'confidential_info']
  },
  {
    type: 'employment_contract',
    name: 'Employment Contract',
    description: 'Agreement between employer and employee',
    category: 'Employment',
    fields: ['employee_name', 'position', 'salary', 'start_date', 'work_hours', 'benefits', 'notice_period']
  },
  {
    type: 'service_agreement',
    name: 'Service Agreement',
    description: 'Contract for service provision',
    category: 'Contracts',
    fields: ['service_provider', 'client_name', 'service_description', 'payment_terms', 'timeline', 'deliverables']
  },
  {
    type: 'vendor_agreement',
    name: 'Vendor Agreement',
    description: 'Contract with suppliers and vendors',
    category: 'Contracts',
    fields: ['vendor_name', 'goods_description', 'pricing', 'payment_terms', 'delivery_terms', 'quality_standards']
  },
  {
    type: 'lease_agreement',
    name: 'Commercial Lease Agreement',
    description: 'Rental agreement for business premises',
    category: 'Real Estate',
    fields: ['landlord_name', 'tenant_name', 'property_address', 'rent_amount', 'lease_term', 'security_deposit', 'maintenance_terms']
  },
  {
    type: 'mou',
    name: 'Memorandum of Understanding (MOU)',
    description: 'Agreement of intent between parties',
    category: 'Contracts',
    fields: ['party1_name', 'party2_name', 'purpose', 'responsibilities', 'timeline', 'terms']
  },
  {
    type: 'sale_agreement',
    name: 'Sale Agreement',
    description: 'Agreement for sale of goods or services',
    category: 'Transactions',
    fields: ['seller_name', 'buyer_name', 'item_description', 'sale_price', 'payment_terms', 'delivery_date', 'warranty']
  },
  {
    type: 'loan_agreement',
    name: 'Loan Agreement',
    description: 'Agreement for business loans',
    category: 'Finance',
    fields: ['lender_name', 'borrower_name', 'loan_amount', 'interest_rate', 'repayment_schedule', 'collateral', 'default_terms']
  },
  {
    type: 'consultancy_agreement',
    name: 'Consultancy Agreement',
    description: 'Contract for consulting services',
    category: 'Contracts',
    fields: ['consultant_name', 'client_name', 'scope_of_work', 'fees', 'payment_schedule', 'deliverables', 'confidentiality']
  },
  {
    type: 'franchise_agreement',
    name: 'Franchise Agreement',
    description: 'Agreement for franchise operations',
    category: 'Business Expansion',
    fields: ['franchisor_name', 'franchisee_name', 'territory', 'franchise_fee', 'royalty_terms', 'training', 'support_terms']
  },
  {
    type: 'ip_assignment',
    name: 'Intellectual Property Assignment',
    description: 'Transfer of IP rights',
    category: 'Intellectual Property',
    fields: ['assignor_name', 'assignee_name', 'ip_description', 'consideration', 'warranties', 'effective_date']
  },
  {
    type: 'shareholders_agreement',
    name: 'Shareholders Agreement',
    description: 'Agreement between company shareholders',
    category: 'Business Formation',
    fields: ['company_name', 'shareholder_names', 'share_distribution', 'voting_rights', 'dividend_policy', 'exit_terms']
  },
  {
    type: 'distribution_agreement',
    name: 'Distribution Agreement',
    description: 'Agreement for product distribution',
    category: 'Business Operations',
    fields: ['manufacturer_name', 'distributor_name', 'products', 'territory', 'pricing', 'minimum_order', 'exclusivity']
  },
  {
    type: 'termination_letter',
    name: 'Employment Termination Letter',
    description: 'Official notice of employment termination',
    category: 'Employment',
    fields: ['employee_name', 'position', 'termination_date', 'reason', 'final_settlement', 'notice_period']
  },
  {
    type: 'appointment_letter',
    name: 'Appointment Letter',
    description: 'Official job offer letter',
    category: 'Employment',
    fields: ['employee_name', 'position', 'department', 'reporting_to', 'salary', 'joining_date', 'probation_period']
  },
  {
    type: 'indemnity_bond',
    name: 'Indemnity Bond',
    description: 'Protection against loss or damage',
    category: 'Legal Protection',
    fields: ['indemnifier_name', 'indemnified_name', 'purpose', 'coverage_amount', 'terms', 'duration']
  },
  {
    type: 'power_of_attorney',
    name: 'Power of Attorney',
    description: 'Authorization to act on behalf',
    category: 'Legal Authorization',
    fields: ['principal_name', 'attorney_name', 'powers_granted', 'limitations', 'duration', 'effective_date']
  }
];

const Documents = () => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isCustomTemplate, setIsCustomTemplate] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const queryClient = useQueryClient();

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user
  });

  const { data: customTemplates = [] } = useQuery({
    queryKey: ['custom-templates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('custom_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user
  });

  const createDocument = useMutation({
    mutationFn: async () => {
      if (!user || !selectedTemplate) return;

      let template: any;
      let templateFields: any;

      if (isCustomTemplate) {
        const customTemplate = customTemplates.find((t: any) => t.id === selectedTemplate);
        if (!customTemplate) return;
        template = {
          type: customTemplate.id,
          name: customTemplate.name,
          fields: (customTemplate.fields as any[]).map((f: any) => f.name)
        };
        templateFields = customTemplate.fields;
      } else {
        template = documentTemplates.find(t => t.type === selectedTemplate);
        if (!template) return;
        templateFields = template.fields;
      }

      toast.loading('Generating document with AI...', { id: 'ai-generate' });

      // Call AI generation edge function
      const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-document', {
        body: {
          templateType: template.type,
          templateName: template.name,
          fields: formData,
          language: selectedLanguage
        }
      });

      if (aiError) throw aiError;

      const generatedContent = aiData.content;

      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: template.name,
          doc_type: template.type,
          content: generatedContent
        })
        .select()
        .single();

      if (docError) throw docError;

      // Create initial version
      await supabase.from('document_versions').insert({
        document_id: docData.id,
        version_number: 1,
        content: generatedContent,
        created_by: user.id
      });

      return docData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', user?.id] });
      toast.success('Document generated successfully', { id: 'ai-generate' });
      setSelectedTemplate('');
      setFormData({});
      setIsCustomTemplate(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate document', { id: 'ai-generate' });
    }
  });

  const deleteCustomTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('custom_templates')
        .delete()
        .eq('id', templateId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-templates', user?.id] });
      toast.success('Template deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete template');
    }
  });

  const allCategories = [
    'all',
    ...Array.from(new Set([
      ...documentTemplates.map(t => t.category),
      ...customTemplates.map((t: any) => t.category)
    ]))
  ];
  
  const allTemplates = [
    ...documentTemplates.map(t => ({ ...t, isCustom: false, id: t.type })),
    ...customTemplates.map((t: any) => ({ 
      ...t, 
      isCustom: true, 
      type: t.id,
      fields: (t.fields as any[]).map((f: any) => f.name)
    }))
  ];

  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedTemplateData = isCustomTemplate 
    ? customTemplates.find((t: any) => t.id === selectedTemplate)
    : documentTemplates.find(t => t.type === selectedTemplate);

  return (
    <PageTransition className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-semibold mb-2 tracking-tight">Legal Documents</h1>
        <p className="text-muted-foreground">Create, manage, and download essential business documents</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Document Library */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-0 shadow-medium bg-card/50 backdrop-blur">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Document Templates</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-xl border-border bg-background shadow-soft"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {allCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full"
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </Button>
                ))}
                <CustomTemplateManager />
              </div>
            </div>

            <div className="grid gap-3">
              {filteredTemplates.map((template: any) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setIsCustomTemplate(template.isCustom);
                    setFormData({});
                  }}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all hover:shadow-medium",
                    selectedTemplate === template.id 
                      ? "border-primary bg-primary/5 shadow-soft" 
                      : "border-border bg-background hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-sm">{template.name}</h3>
                        {template.isCustom && (
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">Custom</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                      <span className="inline-block px-2 py-0.5 bg-accent rounded-full text-xs font-medium">
                        {template.category}
                      </span>
                    </div>
                    {template.isCustom && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomTemplate.mutate(template.id);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Document Creation Form */}
        <div className="space-y-6">
          <Card className="p-6 border-0 shadow-medium bg-card/50 backdrop-blur sticky top-6">
            {selectedTemplateData ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{selectedTemplateData.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTemplateData.description}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="language" className="text-sm font-medium">
                      Document Language
                    </Label>
                    <select
                      id="language"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="english">English</option>
                      <option value="hindi">Hindi (हिन्दी)</option>
                      <option value="tamil">Tamil (தமிழ்)</option>
                      <option value="telugu">Telugu (తెలుగు)</option>
                      <option value="marathi">Marathi (मराठी)</option>
                      <option value="gujarati">Gujarati (ગુજરાતી)</option>
                      <option value="kannada">Kannada (ಕನ್ನಡ)</option>
                      <option value="bengali">Bengali (বাংলা)</option>
                      <option value="malayalam">Malayalam (മലയാളം)</option>
                      <option value="punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {isCustomTemplate ? (
                    // Render custom template fields
                    (selectedTemplateData.fields as any[]).map((field: any) => (
                      <div key={field.name}>
                        <Label htmlFor={field.name} className="text-sm font-medium">
                          {field.label}
                        </Label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            id={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            className="mt-1.5 rounded-xl border-border bg-background shadow-soft"
                            rows={3}
                          />
                        ) : field.type === 'date' ? (
                          <Input
                            id={field.name}
                            type="date"
                            value={formData[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            className="mt-1.5 rounded-xl border-border bg-background shadow-soft"
                          />
                        ) : field.type === 'number' ? (
                          <Input
                            id={field.name}
                            type="number"
                            value={formData[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            className="mt-1.5 rounded-xl border-border bg-background shadow-soft"
                          />
                        ) : (
                          <Input
                            id={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            className="mt-1.5 rounded-xl border-border bg-background shadow-soft"
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    // Render predefined template fields
                    (selectedTemplateData.fields as string[]).map((field: string) => (
                      <div key={field}>
                        <Label htmlFor={field} className="text-sm font-medium">
                          {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Label>
                        {field.includes('description') || field.includes('purpose') || field.includes('terms') ? (
                          <Textarea
                            id={field}
                            value={formData[field] || ''}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                            className="mt-1.5 rounded-xl border-border bg-background shadow-soft"
                            rows={3}
                          />
                        ) : (
                          <Input
                            id={field}
                            value={formData[field] || ''}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                            className="mt-1.5 rounded-xl border-border bg-background shadow-soft"
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>

                <Button
                  onClick={() => createDocument.mutate()}
                  disabled={createDocument.isPending}
                  className="w-full rounded-xl shadow-soft hover:shadow-medium transition-all"
                >
                  {createDocument.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Select a template to get started</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* My Documents */}
      <Card className="p-6 border-0 shadow-medium bg-card/50 backdrop-blur">
        <h2 className="text-xl font-semibold mb-6">My Documents</h2>
        <div className="space-y-3">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">No documents yet. Create your first document above.</p>
            </div>
          ) : (
            documents.map((doc: any) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocument(doc)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:shadow-medium transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{doc.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </Card>

      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>
          {selectedDocument && <DocumentViewer document={selectedDocument} />}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Documents;
