import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus, Save } from 'lucide-react'

export interface PersonaTemplate {
  persona: string
  industry: string
  prompt_template: string
  notes?: string
}

export interface PersonaPromptTemplateEditorProps {
  templates: PersonaTemplate[]
  onTemplatesChange?: (templates: PersonaTemplate[]) => void
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Marketing',
  'Consulting',
  'Real Estate',
  'Hospitality',
  'Non-profit',
  'Government',
  'Other'
]

export const PersonaPromptTemplateEditor: React.FC<PersonaPromptTemplateEditorProps> = ({
  templates,
  onTemplatesChange
}) => {
  const [editingTemplates, setEditingTemplates] = useState<PersonaTemplate[]>(templates)

  const handleTemplateChange = (index: number, field: keyof PersonaTemplate, value: string) => {
    const updatedTemplates = [...editingTemplates]
    updatedTemplates[index] = { ...updatedTemplates[index], [field]: value }
    setEditingTemplates(updatedTemplates)
  }

  const addNewTemplate = () => {
    const newTemplate: PersonaTemplate = {
      persona: '',
      industry: '',
      prompt_template: '',
      notes: ''
    }
    setEditingTemplates([...editingTemplates, newTemplate])
  }

  const removeTemplate = (index: number) => {
    const updatedTemplates = editingTemplates.filter((_, i) => i !== index)
    setEditingTemplates(updatedTemplates)
  }

  const saveChanges = () => {
    if (onTemplatesChange) {
      onTemplatesChange(editingTemplates)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Persona prompt template editor</h2>
        <div className="flex gap-2">
          <Button onClick={addNewTemplate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add template
          </Button>
          <Button onClick={saveChanges} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save changes
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {editingTemplates.map((template, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {template.persona || `Template ${index + 1}`}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTemplate(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`persona-${index}`}>Persona name</Label>
                  <Input
                    id={`persona-${index}`}
                    placeholder="e.g., Startup Founder, Marketing Manager"
                    value={template.persona}
                    onChange={(e) => handleTemplateChange(index, 'persona', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`industry-${index}`}>Industry</Label>
                  <Select
                    value={template.industry}
                    onValueChange={(value) => handleTemplateChange(index, 'industry', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`prompt-${index}`}>Prompt template</Label>
                <Textarea
                  id={`prompt-${index}`}
                  placeholder="Enter your prompt template here..."
                  value={template.prompt_template}
                  onChange={(e) => handleTemplateChange(index, 'prompt_template', e.target.value)}
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`notes-${index}`}>Notes (Optional)</Label>
                <Textarea
                  id={`notes-${index}`}
                  placeholder="Additional notes or context for this template..."
                  value={template.notes || ''}
                  onChange={(e) => handleTemplateChange(index, 'notes', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingTemplates.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-4">
              <Plus className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-medium">No templates yet</h3>
              <p className="text-sm">Create your first persona prompt template to get started.</p>
            </div>
            <Button onClick={addNewTemplate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add first template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PersonaPromptTemplateEditor


