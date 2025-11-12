# UI Components Integration Guide

## ✅ Already Integrated: LLM Provider Switcher

The **LLM Provider Switcher** has been successfully integrated into your ideas page!

### What it does:
- Allows users to select which AI model (OpenAI, Anthropic, DeepSeek, Gemini) to use
- Saves preferences to localStorage
- Set task-specific defaults (different models for different tasks)
- Test model connectivity
- Compare costs and performance

### How to use it:
1. Click the **"AI model settings"** button at the top of the page
2. Select your preferred provider and model
3. Set defaults for different task types
4. Test the model to verify it's working

### Where to find it:
Visit http://localhost:3000 and click the "AI model settings" button (top right).

---

## Other Components You Can Integrate

### 1. 🎨 Prompt Template Library

**Best for:** Giving users pre-made prompt templates to choose from

**Integration example:**

```typescript
// Add to imports
import { PromptTemplateLibrary, type PromptTemplate } from '@/components/ui'

// Add mock templates or fetch from API
const promptTemplates: PromptTemplate[] = [
  {
    name: 'Blog post idea',
    type: 'idea',
    persona: 'Content creator',
    prompt: 'Generate 5 engaging blog post ideas about {{topic}}...',
    notes: 'Best for content planning'
  },
  // ... more templates
]

// Add a new dialog or section in your page
<Dialog>
  <DialogContent className="max-w-7xl">
    <PromptTemplateLibrary templates={promptTemplates} />
  </DialogContent>
</Dialog>
```

**Use case:** Let users browse and select from pre-made templates when generating content instead of writing prompts manually.

---

### 2. ✏️ Persona Prompt Template Editor

**Best for:** Creating and managing custom prompt templates for different personas

**Integration example:**

```typescript
// Add to imports
import { PersonaPromptTemplateEditor, type PersonaTemplate } from '@/components/ui'

// Add state
const [templates, setTemplates] = useState<PersonaTemplate[]>([
  {
    persona: 'Marketing manager',
    industry: 'Technology',
    prompt_template: 'Create a campaign for {{product}} targeting {{audience}}...',
    notes: 'Use for marketing campaigns'
  }
])

// Add button to open editor
<Button onClick={() => setShowTemplateEditor(true)}>
  Manage templates
</Button>

// Add dialog with editor
<Dialog open={showTemplateEditor} onOpenChange={setShowTemplateEditor}>
  <DialogContent className="max-w-6xl">
    <PersonaPromptTemplateEditor 
      templates={templates}
      onTemplatesChange={setTemplates}
    />
  </DialogContent>
</Dialog>
```

**Use case:** Allow users to create reusable prompt templates that match their persona and industry fields in ideas.

---

### 3. 🔍 RAG Similarity Debugger

**Best for:** Debugging AI retrieval results (if you implement RAG/vector search)

**Integration example:**

```typescript
// Add to imports
import { RAGSimilarityDebugger, type RAGResult } from '@/components/ui'

// When you have RAG results to display
<RAGSimilarityDebugger 
  query="How to write a blog post?"
  results={ragResults}
/>
```

**Use case:** If you implement semantic search or RAG for finding similar ideas, use this to show users how results were ranked.

---

### 4. 📊 Token Usage Visualizer

**Best for:** Showing users how many tokens they've consumed

**Integration example:**

```typescript
// Add to imports
import { TokenUsageVisualizer, type TokenUsage } from '@/components/ui'

// Add state for token usage
const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([])

// After each AI generation, add to token usage
const handleGenerateDescription = async () => {
  // ... existing code ...
  
  // After successful generation
  if (data.success && data.usage) {
    setTokenUsage([...tokenUsage, {
      pack_id: `idea_${Date.now()}`,
      model: selectedProvider?.model || 'gpt-4',
      input_tokens: data.usage.input_tokens,
      output_tokens: data.usage.output_tokens,
      timestamp: new Date().toISOString()
    }])
  }
}

// Add a new tab or section
<TabsTrigger value="usage">
  Token usage
</TabsTrigger>

<TabsContent value="usage">
  <TokenUsageVisualizer usage={tokenUsage} />
</TabsContent>
```

**Use case:** Track and display token usage across all AI generations for cost monitoring and transparency.

---

### 5. 📦 Embedding Chunk Inspector

**Best for:** Debugging document chunking for RAG systems

**Integration example:**

```typescript
// Add to imports
import { EmbeddingChunkInspector, type ChunkData } from '@/components/ui'

// When you have document chunks to display
<EmbeddingChunkInspector chunks={documentChunks} />
```

**Use case:** If you implement RAG/vector search, use this to show how documents are chunked and embedded.

---

## Complete Integration Example

Here's a more complete example showing multiple components working together:

```typescript
'use client'

import { useState } from 'react'
import {
  LLMProviderSwitcher,
  PromptTemplateLibrary,
  TokenUsageVisualizer,
  type SelectedProvider,
  type PromptTemplate,
  type TokenUsage
} from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function IdeasPage() {
  const [selectedProvider, setSelectedProvider] = useState<SelectedProvider | null>(null)
  const [showProviderSettings, setShowProviderSettings] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([])
  
  const promptTemplates: PromptTemplate[] = [
    // Your templates here
  ]

  const handleGenerate = async () => {
    // Use selectedProvider in your API call
    const response = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Generate content...',
        provider: selectedProvider?.provider,
        model: selectedProvider?.model
      })
    })
    
    const data = await response.json()
    
    // Track token usage
    if (data.usage) {
      setTokenUsage(prev => [...prev, {
        pack_id: `gen_${Date.now()}`,
        model: selectedProvider?.model || 'default',
        input_tokens: data.usage.input_tokens,
        output_tokens: data.usage.output_tokens,
        timestamp: new Date().toISOString()
      }])
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => setShowProviderSettings(true)}>
          AI settings
        </Button>
        <Button onClick={() => setShowTemplates(true)}>
          Templates
        </Button>
      </div>

      <Tabs>
        <TabsList>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="usage">Token usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ideas">
          {/* Your ideas content */}
        </TabsContent>
        
        <TabsContent value="usage">
          <TokenUsageVisualizer usage={tokenUsage} />
        </TabsContent>
      </Tabs>

      {/* Provider Settings Dialog */}
      <Dialog open={showProviderSettings} onOpenChange={setShowProviderSettings}>
        <DialogContent className="max-w-4xl">
          <LLMProviderSwitcher 
            selectedProvider={selectedProvider}
            onChange={setSelectedProvider}
          />
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-7xl">
          <PromptTemplateLibrary templates={promptTemplates} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

---

## Next Steps

1. **Currently integrated:** LLM Provider Switcher ✅
2. **Recommended next:** Token Usage Visualizer (for cost tracking)
3. **Optional:** Prompt Template Library (for better UX)
4. **Advanced:** RAG components (if you implement semantic search)

## Testing Your Integration

Visit http://localhost:3000 and click the **"AI model settings"** button to see the LLM Provider Switcher in action!

---

## Tips

- Store selected provider in localStorage (already done by LLMProviderSwitcher)
- Use the selected provider's info when making API calls to your backend
- Track token usage after each AI generation for transparency
- Consider adding a "Templates" button next to "AI model settings" for easy access
- Add the Token Usage tab to monitor costs

## Support

If you want help integrating any of these components, just ask! I can show you step-by-step how to add them to your ideas page.


