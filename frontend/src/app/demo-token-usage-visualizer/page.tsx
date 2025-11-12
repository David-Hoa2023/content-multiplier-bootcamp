'use client'

import { TokenUsageVisualizer, type TokenUsage } from '@/components/ui'

const mockUsage: TokenUsage[] = [
  {
    pack_id: 'pack_001',
    model: 'gpt-4',
    input_tokens: 1500,
    output_tokens: 800,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    pack_id: 'pack_002',
    model: 'claude-3-opus',
    input_tokens: 2300,
    output_tokens: 1200,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    pack_id: 'pack_003',
    model: 'gpt-3.5-turbo',
    input_tokens: 890,
    output_tokens: 450,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    pack_id: 'pack_004',
    model: 'claude-3-sonnet',
    input_tokens: 1750,
    output_tokens: 980,
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    pack_id: 'pack_005',
    model: 'gemini-pro',
    input_tokens: 3200,
    output_tokens: 1650,
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    pack_id: 'pack_006',
    model: 'gpt-4',
    input_tokens: 4100,
    output_tokens: 2300,
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString()
  }
]

export default function TokenUsageVisualizerDemo() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Token usage visualizer demo</h1>
        <p className="text-muted-foreground">
          Track and visualize token usage across different LLM models with detailed metrics.
        </p>
      </div>
      
      <TokenUsageVisualizer usage={mockUsage} />
    </div>
  )
}


