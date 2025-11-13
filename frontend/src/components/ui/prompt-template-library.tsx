import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export type ContentType = 'idea' | 'brief' | 'draft' | 'derivative' | 'citation'

export interface PromptTemplate {
  name: string
  type: ContentType
  persona: string
  prompt: string
  notes?: string
}

export interface PromptTemplateLibraryProps {
  templates: PromptTemplate[]
}

export const PromptTemplateLibrary: React.FC<PromptTemplateLibraryProps> = ({ templates }) => {
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all')
  const [selectedPersona, setSelectedPersona] = useState<string>('all')
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)

  const contentTypes: ContentType[] = ['idea', 'brief', 'draft', 'derivative', 'citation']
  
  const uniquePersonas = useMemo(() => {
    const personas = Array.from(new Set(templates.map(template => template.persona)))
    return personas.sort()
  }, [templates])

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const typeMatch = selectedType === 'all' || template.type === selectedType
      const personaMatch = selectedPersona === 'all' || template.persona === selectedPersona
      return typeMatch && personaMatch
    })
  }, [templates, selectedType, selectedPersona])

  const getTypeColor = (type: ContentType) => {
    const colors = {
      idea: 'bg-blue-100 text-blue-800',
      brief: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      derivative: 'bg-purple-100 text-purple-800',
      citation: 'bg-red-100 text-red-800'
    }
    return colors[type]
  }

  const toggleExpanded = (templateName: string) => {
    setExpandedTemplate(expandedTemplate === templateName ? null : templateName)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Prompt template library</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="type-filter">Filter by content type</Label>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as ContentType | 'all')}>
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {contentTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Label htmlFor="persona-filter">Filter by persona</Label>
            <Select value={selectedPersona} onValueChange={setSelectedPersona}>
              <SelectTrigger id="persona-filter">
                <SelectValue placeholder="Select persona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All personas</SelectItem>
                {uniquePersonas.map(persona => (
                  <SelectItem key={persona} value={persona}>
                    {persona}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => (
          <Card key={`${template.name}-${index}`} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
                <Badge className={getTypeColor(template.type)}>
                  {template.type}
                </Badge>
              </div>
              <CardDescription className="text-sm text-gray-600">
                <span className="font-medium">Persona:</span> {template.persona}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExpanded(template.name)}
                  className="w-full"
                >
                  {expandedTemplate === template.name ? 'Hide' : 'Show'} prompt
                </Button>
              </div>
              
              {expandedTemplate === template.name && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`prompt-${index}`} className="text-sm font-medium">
                      Prompt text
                    </Label>
                    <div className="relative">
                      <Textarea
                        id={`prompt-${index}`}
                        value={template.prompt}
                        readOnly
                        className="min-h-[120px] text-sm bg-gray-50 font-mono resize-none"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(template.prompt)}
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        title="Copy to clipboard"
                      >
                        📋
                      </Button>
                    </div>
                  </div>
                  
                  {template.notes && (
                    <div>
                      <Label className="text-sm font-medium">Notes</Label>
                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border">
                        {template.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No templates found matching your filters.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedType('all')
              setSelectedPersona('all')
            }}
            className="mt-4"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}

export default PromptTemplateLibrary


