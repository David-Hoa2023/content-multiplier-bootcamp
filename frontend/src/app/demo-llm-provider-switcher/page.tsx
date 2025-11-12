'use client'

import { useState } from 'react'
import { LLMProviderSwitcher, type SelectedProvider } from '@/components/ui'

export default function LLMProviderSwitcherDemo() {
  const [selectedProvider, setSelectedProvider] = useState<SelectedProvider | null>(null)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">LLM provider switcher demo</h1>
        <p className="text-muted-foreground">
          A comprehensive component for managing multiple LLM providers and models with task-specific defaults.
        </p>
      </div>
      
      <div className="flex justify-center">
        <LLMProviderSwitcher 
          selectedProvider={selectedProvider}
          onChange={setSelectedProvider}
        />
      </div>

      {selectedProvider && (
        <div className="mt-8 p-4 border rounded-lg max-w-2xl mx-auto">
          <h2 className="font-semibold mb-2">Current selection:</h2>
          <pre className="bg-muted p-3 rounded text-sm">
            {JSON.stringify(selectedProvider, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}


