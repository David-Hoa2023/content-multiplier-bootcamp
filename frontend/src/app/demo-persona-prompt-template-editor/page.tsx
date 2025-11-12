'use client'

import { useState } from 'react'
import { PersonaPromptTemplateEditor, type PersonaTemplate } from '@/components/ui'

const initialTemplates: PersonaTemplate[] = [
  {
    persona: 'Startup founder',
    industry: 'Technology',
    prompt_template: 'As a startup founder in the tech industry, create a compelling pitch for {{product_name}} that addresses {{pain_point}} and highlights {{unique_value_proposition}}.',
    notes: 'Use for investor pitches and early customer outreach'
  },
  {
    persona: 'Marketing manager',
    industry: 'Retail',
    prompt_template: 'As a marketing manager in retail, develop a campaign strategy for {{campaign_name}} targeting {{audience}} with a focus on {{key_message}}.',
    notes: 'Suitable for seasonal campaigns and product launches'
  }
]

export default function PersonaPromptTemplateEditorDemo() {
  const [templates, setTemplates] = useState<PersonaTemplate[]>(initialTemplates)

  const handleTemplatesChange = (newTemplates: PersonaTemplate[]) => {
    setTemplates(newTemplates)
    console.log('Templates updated:', newTemplates)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Persona prompt template editor demo</h1>
        <p className="text-muted-foreground">
          Create and manage prompt templates for different personas and industries.
        </p>
      </div>
      
      <PersonaPromptTemplateEditor 
        templates={templates}
        onTemplatesChange={handleTemplatesChange}
      />
    </div>
  )
}


