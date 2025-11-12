'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestBriefPage() {
  const [planId, setPlanId] = useState('7')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testCreateBrief = async () => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const url = `http://localhost:4000/briefs/create-from-plan/${planId}`
      console.log('Testing API:', url)

      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Response status:', response.status, response.statusText)

      const data = await response.json()
      console.log('Response data:', JSON.stringify(data, null, 2))

      if (response.ok) {
        setResult(data)
      } else {
        const errorMsg = data.error || data.message || JSON.stringify(data)
        console.error('Error details:', errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout
      pageTitle="Test Brief"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Test Brief' },
      ]}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Create Brief API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Plan ID:
              </label>
              <input
                type="text"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter plan ID"
              />
            </div>

            <Button
              onClick={testCreateBrief}
              disabled={loading || !planId}
              className="w-full"
            >
              {loading ? 'Creating Brief...' : 'Create Brief'}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 font-semibold">Error:</p>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-semibold mb-2">Success!</p>
                <pre className="text-xs bg-white p-2 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Enter a valid content plan ID (default: 7)</li>
              <li>Click "Create Brief" button</li>
              <li>Check browser console (F12) for detailed logs</li>
              <li>Check backend terminal for server logs</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

