'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calculator,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Music,
  Mail
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { Platform } from '@/components/ui/derivative-tabs'

export interface DerivativeCost {
  id: string
  platform: Platform
  title: string
  content: string
  inputTokens: number
  outputTokens: number
  model: string
  cost: number
  timestamp: Date | string
}

export interface PlatformCostTrackerProps {
  costs: DerivativeCost[]
  className?: string
  onExportCSV?: (costs: DerivativeCost[]) => void
  currency?: 'USD' | 'EUR' | 'VND'
}

const platformIcons = {
  Twitter: Twitter,
  LinkedIn: Linkedin,
  Facebook: Facebook,
  Instagram: Instagram,
  TikTok: Music,
  MailChimp: Mail
}

const platformColors = {
  Twitter: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  LinkedIn: 'bg-blue-600 text-white',
  Facebook: 'bg-blue-700 text-white',
  Instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  TikTok: 'bg-black text-white dark:bg-white dark:text-black',
  MailChimp: 'bg-yellow-400 text-black'
}

const currencySymbols = {
  USD: '$',
  EUR: '€',
  VND: '₫'
}

export function PlatformCostTracker({
  costs,
  className,
  onExportCSV,
  currency = 'USD'
}: PlatformCostTrackerProps) {
  const platformStats = React.useMemo(() => {
    const stats: Record<Platform, {
      count: number
      totalCost: number
      totalInputTokens: number
      totalOutputTokens: number
      derivatives: DerivativeCost[]
    }> = {
      Twitter: { count: 0, totalCost: 0, totalInputTokens: 0, totalOutputTokens: 0, derivatives: [] },
      LinkedIn: { count: 0, totalCost: 0, totalInputTokens: 0, totalOutputTokens: 0, derivatives: [] },
      Facebook: { count: 0, totalCost: 0, totalInputTokens: 0, totalOutputTokens: 0, derivatives: [] },
      Instagram: { count: 0, totalCost: 0, totalInputTokens: 0, totalOutputTokens: 0, derivatives: [] },
      TikTok: { count: 0, totalCost: 0, totalInputTokens: 0, totalOutputTokens: 0, derivatives: [] },
      MailChimp: { count: 0, totalCost: 0, totalInputTokens: 0, totalOutputTokens: 0, derivatives: [] }
    }

    costs.forEach(cost => {
      const platform = cost.platform
      if (stats[platform]) {
        stats[platform].count++
        stats[platform].totalCost += cost.cost
        stats[platform].totalInputTokens += cost.inputTokens
        stats[platform].totalOutputTokens += cost.outputTokens
        stats[platform].derivatives.push(cost)
      }
    })

    return stats
  }, [costs])

  const totalCost = React.useMemo(() => {
    return costs.reduce((sum, cost) => sum + cost.cost, 0)
  }, [costs])

  const totalDerivatives = costs.length

  const handleExportCSV = () => {
    if (costs.length === 0) {
      toast({
        title: "Không có dữ liệu",
        description: "Không có cost data để export.",
        variant: "destructive",
      })
      return
    }

    try {
      const csvHeaders = [
        'Platform',
        'Title',
        'Model',
        'Input Tokens',
        'Output Tokens',
        'Cost (USD)',
        'Timestamp'
      ]

      const csvRows = costs.map(cost => [
        cost.platform,
        cost.title || '',
        cost.model,
        cost.inputTokens,
        cost.outputTokens,
        cost.cost,
        typeof cost.timestamp === 'string' ? cost.timestamp : cost.timestamp.toISOString()
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `platform-costs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export thành công",
        description: `${costs.length} cost records đã được export.`,
      })

      onExportCSV?.(costs)
    } catch (error) {
      console.error('Export CSV error:', error)
      toast({
        title: "Lỗi export",
        description: "Không thể export CSV. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    const symbol = currencySymbols[currency]
    if (currency === 'VND') {
      return `${symbol}${Math.round(amount).toLocaleString()}`
    }
    return `${symbol}${amount.toFixed(4)}`
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng chi phí</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalDerivatives} derivatives
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chi phí trung bình</CardTitle>
              <Calculator className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalDerivatives > 0 ? totalCost / totalDerivatives : 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per derivative
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platforms</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(platformStats).filter(s => s.count > 0).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active platforms
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Chi phí theo Platform</CardTitle>
              <CardDescription>
                Phân tích chi phí API/LLM cho từng platform
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Derivatives</TableHead>
                    <TableHead>Input Tokens</TableHead>
                    <TableHead>Output Tokens</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead className="text-right">Avg Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(platformStats)
                    .filter(([_, stats]) => stats.count > 0)
                    .sort(([_, a], [__, b]) => b.totalCost - a.totalCost)
                    .map(([platform, stats]) => {
                      const Icon = platformIcons[platform as Platform]
                      const avgCost = stats.count > 0 ? stats.totalCost / stats.count : 0
                      
                      return (
                        <TableRow key={platform}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span className="font-medium">{platform}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{stats.count}</Badge>
                          </TableCell>
                          <TableCell>
                            {stats.totalInputTokens.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {stats.totalOutputTokens.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(stats.totalCost)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(avgCost)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Costs */}
        {costs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Costs</CardTitle>
              <CardDescription>
                Chi phí gần đây cho các derivatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {costs
                    .sort((a, b) => {
                      const dateA = typeof a.timestamp === 'string' ? new Date(a.timestamp) : a.timestamp
                      const dateB = typeof b.timestamp === 'string' ? new Date(b.timestamp) : b.timestamp
                      return dateB.getTime() - dateA.getTime()
                    })
                    .slice(0, 10)
                    .map((cost) => {
                      const Icon = platformIcons[cost.platform]
                      
                      return (
                        <motion.div
                          key={cost.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={cn("p-2 rounded", platformColors[cost.platform])}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{cost.title || cost.platform}</p>
                              <p className="text-sm text-muted-foreground">
                                {cost.model} • {cost.inputTokens + cost.outputTokens} tokens
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(cost.cost)}</p>
                            <p className="text-xs text-muted-foreground">
                              {typeof cost.timestamp === 'string' 
                                ? new Date(cost.timestamp).toLocaleDateString()
                                : cost.timestamp.toLocaleDateString()}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}

