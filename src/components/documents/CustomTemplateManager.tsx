import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Save, X, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CustomTemplateManagerProps {
  onTemplateSelect?: (template: any) => void;
}

interface CustomField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number';
}

export const CustomTemplateManager = ({ onTemplateSelect }: CustomTemplateManagerProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'date' | 'number'>('text');

  const createTemplate = useMutation({
    mutationFn: async () => {
      if (!user || !templateName || !templateCategory || customFields.length === 0) {
        throw new Error('Please fill in all required fields and add at least one custom field');
      }

      const { data, error } = await supabase
        .from('custom_templates')
        .insert({
          user_id: user.id,
          name: templateName,
          description: templateDescription,
          category: templateCategory,
          fields: customFields as any
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-templates', user?.id] });
      toast.success('Custom template created successfully');
      resetForm();
      setShowCreateDialog(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create template');
    }
  });

  const resetForm = () => {
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('');
    setCustomFields([]);
    setNewFieldName('');
    setNewFieldType('text');
  };

  const addField = () => {
    if (!newFieldName.trim()) {
      toast.error('Please enter a field name');
      return;
    }

    const fieldName = newFieldName.trim().toLowerCase().replace(/\s+/g, '_');
    const fieldLabel = newFieldName.trim();

    if (customFields.some(f => f.name === fieldName)) {
      toast.error('A field with this name already exists');
      return;
    }

    setCustomFields([...customFields, { name: fieldName, label: fieldLabel, type: newFieldType }]);
    setNewFieldName('');
  };

  const removeField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  return (
    <>
      <Button
        onClick={() => setShowCreateDialog(true)}
        className="rounded-xl shadow-soft hover:shadow-medium transition-all"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Custom Template
      </Button>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Custom Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Custom Partnership Agreement"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Brief description of this template"
                  className="mt-1.5"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="template-category">Category *</Label>
                <Input
                  id="template-category"
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  placeholder="e.g., Custom Contracts"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Custom Fields</h3>
              
              <Card className="p-4 bg-accent/50 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <Input
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="Field label (e.g., Company Name)"
                      onKeyPress={(e) => e.key === 'Enter' && addField()}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as any)}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="date">Date</option>
                      <option value="number">Number</option>
                    </select>
                    <Button onClick={addField} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {customFields.length > 0 && (
                <div className="space-y-2">
                  {customFields.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-background"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{field.label}</p>
                          <p className="text-xs text-muted-foreground">
                            Type: {field.type} | Name: {field.name}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {customFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No fields added yet. Add custom fields above.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => createTemplate.mutate()}
                disabled={createTemplate.isPending || !templateName || !templateCategory || customFields.length === 0}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {createTemplate.isPending ? 'Creating...' : 'Create Template'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowCreateDialog(false);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
