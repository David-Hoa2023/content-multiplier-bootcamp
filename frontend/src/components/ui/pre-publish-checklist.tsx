'use client'

import * as React from 'react'
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export type ChecklistItemStatus = 'pending' | 'checking' | 'pass' | 'fail'

export interface ChecklistItem {
  id: string
  label: string
  description?: string
  status: ChecklistItemStatus
  message?: string
  required?: boolean
}

export interface PrePublishChecklistProps {
  content: string
  platform: 'Twitter' | 'LinkedIn' | 'Facebook' | 'Instagram' | 'TikTok'
  characterLimit: number
  onValidate?: (results: ChecklistItem[]) => void
  className?: string
  autoValidate?: boolean
}

const platformLimits = {
  Twitter: 280,
  LinkedIn: 3000,
  Facebook: 5000,
  Instagram: 2200,
  TikTok: 300
}

// Simulate toxicity check (in real app, this would call an API)
const checkToxicity = async (content: string): Promise<{ isToxic: boolean; score: number }> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Simple heuristic: check for common toxic words
  const toxicWords = ['hate', 'stupid', 'idiot', 'kill', 'die']
  const lowerContent = content.toLowerCase()
  const foundToxic = toxicWords.some(word => lowerContent.includes(word))
  
  return {
    isToxic: foundToxic,
    score: foundToxic ? 0.8 : 0.1
  }
}

// Check for citations (URLs, @mentions, #hashtags)
const checkCitations = (content: string): { hasCitations: boolean; count: number } => {
  const urlPattern = /https?:\/\/[^\s]+/g
  const mentionPattern = /@\w+/g
  const hashtagPattern = /#\w+/g
  
  const urls = content.match(urlPattern) || []
  const mentions = content.match(mentionPattern) || []
  const hashtags = content.match(hashtagPattern) || []
  
  const totalCitations = urls.length + mentions.length + hashtags.length
  
  return {
    hasCitations: totalCitations > 0,
    count: totalCitations
  }
}

export function PrePublishChecklist({
  content,
  platform,
  characterLimit,
  onValidate,
  className,
  autoValidate = true
}: PrePublishChecklistProps) {
  const [items, setItems] = React.useState<ChecklistItem[]>([
    {
      id: 'length',
      label: 'Character Length',
      description: `Content must be within ${characterLimit} characters`,
      status: 'pending',
      required: true
    },
    {
      id: 'citations',
      label: 'Citations & References',
      description: 'Content should include citations, links, or references',
      status: 'pending',
      required: false
    },
    {
      id: 'toxicity',
      label: 'Toxicity Check',
      description: 'Content must pass toxicity screening',
      status: 'pending',
      required: true
    }
  ])

  const [isValidating, setIsValidating] = React.useState(false)

  const validateContent = React.useCallback(async () => {
    setIsValidating(true)
    
    const newItems: ChecklistItem[] = []

    // Check 1: Character Length
    const length = content.length
    const lengthItem: ChecklistItem = {
      id: 'length',
      label: 'Character Length',
      description: `Content must be within ${characterLimit} characters`,
      status: length <= characterLimit ? 'pass' : 'fail',
      message: length <= characterLimit 
        ? `✓ ${length} characters (within limit)`
        : `✗ ${length} characters (exceeds limit by ${length - characterLimit})`,
      required: true
    }
    newItems.push(lengthItem)

    // Check 2: Citations
    const citations = checkCitations(content)
    const citationsItem: ChecklistItem = {
      id: 'citations',
      label: 'Citations & References',
      description: 'Content should include citations, links, or references',
      status: citations.hasCitations ? 'pass' : 'fail',
      message: citations.hasCitations
        ? `✓ Found ${citations.count} citation(s)`
        : '⚠ No citations found (recommended)',
      required: false
    }
    newItems.push(citationsItem)

    // Check 3: Toxicity (async)
    const toxicityItem: ChecklistItem = {
      id: 'toxicity',
      label: 'Toxicity Check',
      description: 'Content must pass toxicity screening',
      status: 'checking',
      required: true
    }
    newItems.push(toxicityItem)
    setItems([...newItems])

    try {
      const toxicityResult = await checkToxicity(content)
      toxicityItem.status = !toxicityResult.isToxic ? 'pass' : 'fail'
      toxicityItem.message = !toxicityResult.isToxic
        ? `✓ Content is safe (toxicity score: ${toxicityResult.score.toFixed(2)})`
        : `✗ Content may be toxic (score: ${toxicityResult.score.toFixed(2)})`
    } catch (error) {
      toxicityItem.status = 'fail'
      toxicityItem.message = '✗ Failed to check toxicity'
    }

    newItems[2] = toxicityItem
    setItems([...newItems])
    setIsValidating(false)
    
    onValidate?.(newItems)
  }, [content, characterLimit, onValidate])

  React.useEffect(() => {
    if (autoValidate && content) {
      validateContent()
    }
  }, [content, autoValidate, validateContent])

  const passedCount = items.filter(item => item.status === 'pass').length
  const failedCount = items.filter(item => item.status === 'fail').length
  const requiredFailed = items.filter(item => item.required && item.status === 'fail').length
  const totalItems = items.length
  const progress = totalItems > 0 ? (passedCount / totalItems) * 100 : 0

  const canPublish = requiredFailed === 0 && !isValidating

  const getStatusIcon = (status: ChecklistItemStatus) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'checking':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: ChecklistItemStatus, required?: boolean) => {
    switch (status) {
      case 'pass':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Pass</Badge>
      case 'fail':
        return <Badge variant={required ? 'destructive' : 'secondary'} className={required ? '' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}>
          {required ? 'Fail' : 'Warning'}
        </Badge>
      case 'checking':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Checking...</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Pre-Publish Checklist
              <Badge variant="outline">{platform}</Badge>
            </CardTitle>
            <CardDescription>
              Validate content before publishing
            </CardDescription>
          </div>
          {canPublish && (
            <Badge className="bg-green-500 text-white">Ready to Publish</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {passedCount} of {totalItems} checks passed
            </span>
            <span className={cn(
              'font-semibold',
              canPublish ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {canPublish ? '✓ All required checks passed' : `✗ ${requiredFailed} required check(s) failed`}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                item.status === 'pass' && 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
                item.status === 'fail' && item.required && 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
                item.status === 'fail' && !item.required && 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
                item.status === 'checking' && 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
                item.status === 'pending' && 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
              )}
            >
              <div className="mt-0.5">
                {getStatusIcon(item.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{item.label}</h4>
                    {item.required && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                  </div>
                  {getStatusBadge(item.status, item.required)}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground mb-1">{item.description}</p>
                )}
                {item.message && (
                  <p className={cn(
                    'text-xs font-medium',
                    item.status === 'pass' && 'text-green-700 dark:text-green-300',
                    item.status === 'fail' && item.required && 'text-red-700 dark:text-red-300',
                    item.status === 'fail' && !item.required && 'text-yellow-700 dark:text-yellow-300',
                    item.status === 'checking' && 'text-blue-700 dark:text-blue-300'
                  )}>
                    {item.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Manual Validate Button */}
        {!autoValidate && (
          <Button
            onClick={validateContent}
            disabled={isValidating || !content}
            className="w-full"
            variant="outline"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Validate Content'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}




