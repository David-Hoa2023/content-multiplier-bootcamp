import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export interface TokenUsage {
  pack_id: string
  model: string
  input_tokens: number
  output_tokens: number
  timestamp: string
}

export interface TokenUsageVisualizerProps {
  usage: TokenUsage[]
}

export const TokenUsageVisualizer: React.FC<TokenUsageVisualizerProps> = ({ usage }) => {
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN')
  }

  const getModelBadgeVariant = (model: string): "default" | "secondary" | "outline" | "destructive" => {
    if (model.includes('gpt-4')) return 'default'
    if (model.includes('claude')) return 'secondary'
    if (model.includes('gemini')) return 'outline'
    return 'destructive'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Token usage tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        {usage.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Chưa có dữ liệu sử dụng token
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Content pack</TableHead>
                  <TableHead className="font-medium">Model</TableHead>
                  <TableHead className="font-medium text-right">Input</TableHead>
                  <TableHead className="font-medium text-right">Output</TableHead>
                  <TableHead className="font-medium text-right">Total</TableHead>
                  <TableHead className="font-medium">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usage.map((item, index) => {
                  const totalTokens = item.input_tokens + item.output_tokens
                  return (
                    <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        {item.pack_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getModelBadgeVariant(item.model)} className="text-xs">
                          {item.model}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <span className="text-blue-600 dark:text-blue-400">
                          {formatNumber(item.input_tokens)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <span className="text-green-600 dark:text-green-400">
                          {formatNumber(item.output_tokens)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold">
                        <span className="text-gray-900 dark:text-gray-100">
                          {formatNumber(totalTokens)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(item.timestamp)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
        
        {usage.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-600 dark:text-gray-400">Total input</div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {formatNumber(usage.reduce((sum, item) => sum + item.input_tokens, 0))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-gray-400">Total output</div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {formatNumber(usage.reduce((sum, item) => sum + item.output_tokens, 0))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-gray-400">Total tokens</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatNumber(usage.reduce((sum, item) => sum + item.input_tokens + item.output_tokens, 0))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TokenUsageVisualizer


