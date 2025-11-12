'use client'

import { PromptTemplateLibrary, type PromptTemplate } from '@/components/ui'

const mockTemplates: PromptTemplate[] = [
  {
    name: 'Blog post idea generator',
    type: 'idea',
    persona: 'Content creator',
    prompt: 'Generate 5 engaging blog post ideas about {{topic}} that would resonate with {{audience}}. Focus on {{angle}} and include potential headlines.',
    notes: 'Best for content planning sessions'
  },
  {
    name: 'Product brief writer',
    type: 'brief',
    persona: 'Product manager',
    prompt: 'Create a comprehensive product brief for {{product_name}} including problem statement, target users, key features, and success metrics.',
    notes: 'Use at the start of product development cycle'
  },
  {
    name: 'Email draft creator',
    type: 'draft',
    persona: 'Sales representative',
    prompt: 'Draft a professional outreach email to {{recipient_name}} at {{company}} introducing {{product}} and highlighting how it solves {{pain_point}}.',
    notes: 'Personalize before sending'
  },
  {
    name: 'Social media post derivation',
    type: 'derivative',
    persona: 'Social media manager',
    prompt: 'Transform this content into 3 engaging social media posts for {{platform}}: {{content}}. Adapt tone and length for platform best practices.',
    notes: 'Works well for repurposing long-form content'
  },
  {
    name: 'Source citation formatter',
    type: 'citation',
    persona: 'Research analyst',
    prompt: 'Format these sources into proper citations following {{citation_style}} format: {{sources}}. Include all relevant metadata.',
    notes: 'Supports APA, MLA, Chicago styles'
  },
  {
    name: 'Feature specification',
    type: 'brief',
    persona: 'Software engineer',
    prompt: 'Write a technical specification for {{feature_name}} including requirements, architecture considerations, and implementation steps.',
    notes: 'Include edge cases and performance requirements'
  }
]

export default function PromptTemplateLibraryDemo() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Prompt template library demo</h1>
        <p className="text-muted-foreground">
          Browse and filter reusable prompt templates organized by content type and persona.
        </p>
      </div>
      
      <PromptTemplateLibrary templates={mockTemplates} />
    </div>
  )
}


