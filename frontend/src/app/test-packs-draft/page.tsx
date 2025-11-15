'use client'

import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Play, CheckCircle2, XCircle, Sparkles, ArrowRight, Package, Lightbulb, FileText, Edit, CheckCircle, Share2, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { DraftEditor } from '@/components/ui'
import { useRouter, useSearchParams } from 'next/navigation'import { API_URL } from '@/lib/api-config';


// API_URL imported from @/lib/api-config

interface Brief {
  brief_id: string
  title: string | null
  content: string
  created_at: string
  updated_at: string
}

interface SSEMessage {
  type: 'start' | 'chunk' | 'done' | 'error'
  provider?: string
  content?: string
  pack_id?: string
  word_count?: number
  total_length?: number
  error?: string
}

export default function TestPacksDraftPage() {
  const searchParams = useSearchParams()
  const [briefId, setBriefId] = useState('0c638291-9a37-42d6-a308-209b73bf67db')
  const [brief, setBrief] = useState<Brief | null>(null)
  const [audience, setAudience] = useState('Marketing professionals')
  const [provider, setProvider] = useState<string>('deepseek')
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const [packId, setPackId] = useState<string | null>(null)
  const [wordCount, setWordCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const fetchBrief = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/briefs/${id}`)
      const result = await response.json()
      
      if (result.success) {
        setBrief(result.data)
      } else {
        setBrief(null)
      }
    } catch (error) {
      console.error('Error fetching brief:', error)
      setBrief(null)
    }
  }, [])

  // Read brief_id from URL params and fetch brief data
  useEffect(() => {
    // Support both brief_id and brief_ids query parameters
    const urlBriefId = searchParams?.get('brief_id') || searchParams?.get('brief_ids')
    if (urlBriefId) {
      setBriefId(urlBriefId)
      fetchBrief(urlBriefId)
    }
  }, [searchParams, fetchBrief])

  // Fetch brief when briefId changes manually (with debounce to avoid too many requests)
  useEffect(() => {
    if (!briefId || !briefId.trim()) {
      setBrief(null)
      return
    }

    const trimmedId = briefId.trim()
    // Only fetch if it's a valid UUID format (basic check)
    if (trimmedId.length >= 30) {
      const timeoutId = setTimeout(() => {
        fetchBrief(trimmedId)
      }, 500) // Debounce 500ms

      return () => clearTimeout(timeoutId)
    } else {
      setBrief(null)
    }
  }, [briefId, fetchBrief])

  const handleGenerate = async () => {
    if (!briefId.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập brief_id',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    setStreamedContent('')
    setPackId(null)
    setWordCount(null)
    setError(null)
    setProvider('')

    try {
      const response = await fetch(`${API_URL}/api/packs/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brief_id: briefId.trim(),
          audience: audience.trim() || undefined,
          provider: provider.trim() || undefined,
        }),
      })

      if (!response.ok) {
        // Try to read error message from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response is not JSON, try to read as text
          try {
            const errorText = await response.text()
            if (errorText) errorMessage = errorText
          } catch {
            // Keep default error message
          }
        }
        throw new Error(errorMessage)
      }

      // Read SSE stream
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: SSEMessage = JSON.parse(line.slice(6))
              
              switch (data.type) {
                case 'start':
                  setProvider(data.provider || '')
                  toast({
                    title: 'Bắt đầu',
                    description: `Đang sử dụng provider: ${data.provider}`,
                  })
                  break
                
                case 'chunk':
                  if (data.content) {
                    setStreamedContent(prev => prev + data.content)
                  }
                  break
                
                case 'done':
                  setPackId(data.pack_id || null)
                  setWordCount(data.word_count || null)
                  setIsGenerating(false)
                  toast({
                    title: 'Hoàn thành',
                    description: `Đã tạo pack với ${data.word_count} từ`,
                  })
                  break
                
                case 'error':
                  setError(data.error || 'Unknown error')
                  setIsGenerating(false)
                  toast({
                    title: 'Lỗi',
                    description: data.error || 'Unknown error',
                    variant: 'destructive',
                  })
                  break
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      console.error('Error generating draft:', err)
      let errorMessage = 'Failed to generate draft'
      
      if (err instanceof TypeError) {
        if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend server đã chạy tại http://localhost:4000\n2. CORS đã được cấu hình đúng\n3. Kiểm tra console để xem chi tiết lỗi'
        } else {
          errorMessage = err.message
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setIsGenerating(false)
      toast({
        title: 'Lỗi',
        description: errorMessage.split('\n')[0], // Show first line in toast
        variant: 'destructive',
      })
    }
  }

  return (
    <AppLayout
      pageTitle="Test Packs Draft"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Test Packs Draft' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Test POST /api/packs/draft</h1>
          <p className="text-muted-foreground">
            Test endpoint tạo draft content từ brief với SSE streaming
          </p>
        </div>

        {/* Workflow Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quy trình tạo nội dung</CardTitle>
            <CardDescription>
              Quy trình từ ý tưởng đến xuất bản nội dung
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Workflow Steps */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  <span>Ideas</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>Briefs</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1 font-semibold text-foreground">
                  <Package className="h-3 w-3" />
                  <span>Content Packs</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <Edit className="h-3 w-3" />
                  <span>Chỉnh sửa</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Duyệt</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <Share2 className="h-3 w-3" />
                  <span>Derivatives</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <Send className="h-3 w-3" />
                  <span>Xuất bản</span>
                </div>
              </div>
            </div>

            {/* Next Step Actions */}
            <div className="flex flex-wrap gap-3">
              {packId && (
                <Button
                  onClick={() => router.push(`/packs/${packId}/edit`)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa nội dung
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin request</CardTitle>
            <CardDescription>
              Nhập thông tin để test endpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brief_title">Brief title</Label>
              <Input
                id="brief_title"
                value={brief?.title || 'N/A'}
                disabled
                className="bg-muted"
                placeholder="Brief title will appear here when brief_id is provided"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brief_id">Brief ID *</Label>
              <Input
                id="brief_id"
                value={briefId}
                onChange={(e) => setBriefId(e.target.value)}
                placeholder="Nhập brief_id"
                disabled={isGenerating}
              />
              <p className="text-sm text-muted-foreground">
                Test brief ID: <code className="text-xs bg-muted px-1 py-0.5 rounded">4f18f382-f706-4010-9920-8cd02aef686d</code>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Audience (optional)</Label>
              <Input
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Nhập đối tượng mục tiêu"
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={provider}
                onValueChange={setProvider}
                disabled={isGenerating}
              >
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Chọn AI provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek">Deepseek (Recommended)</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Deepseek được khuyến nghị vì đã được cấu hình
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !briefId.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo draft...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Tạo draft content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Status */}
        {provider && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Provider
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{provider}</p>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                Lỗi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Draft Editor - Show when there's content or streaming */}
        {(streamedContent || isGenerating) && (
          <DraftEditor 
            content={streamedContent}
            isStreaming={isGenerating}
            title="Draft Content"
          />
        )}

        {/* Result */}
        {packId && (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Hoàn thành
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label className="text-sm font-medium">Pack ID:</Label>
                <p className="font-mono text-sm">{packId}</p>
              </div>
              {wordCount !== null && (
                <div>
                  <Label className="text-sm font-medium">Word Count:</Label>
                  <p className="text-lg font-semibold">{wordCount} từ</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Total Length:</Label>
                <p className="text-sm">{streamedContent.length} ký tự</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

