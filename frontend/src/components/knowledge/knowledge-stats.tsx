'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  HardDrive,
  Layers
} from 'lucide-react'

interface KnowledgeStatsData {
  total_documents: number
  ready_documents: number
  processing_documents: number
  error_documents: number
  total_file_size: number
  total_chunks: number
}

interface KnowledgeStatsProps {
  stats: KnowledgeStatsData | null
  loading: boolean
}

export function KnowledgeStats({ stats, loading }: KnowledgeStatsProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <AlertCircle className="h-5 w-5 mr-2" />
            Không thể tải thống kê
          </div>
        </CardContent>
      </Card>
    )
  }

  const statItems = [
    {
      title: 'Tổng tài liệu',
      value: stats.total_documents,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Sẵn sàng',
      value: stats.ready_documents,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Đang xử lý',
      value: stats.processing_documents,
      icon: Loader2,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      animate: stats.processing_documents > 0 ? 'animate-spin' : ''
    },
    {
      title: 'Lỗi',
      value: stats.error_documents,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Dung lượng',
      value: stats.total_file_size ? formatFileSize(stats.total_file_size) : '0 B',
      icon: HardDrive,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      isString: true
    },
    {
      title: 'Chunks',
      value: stats.total_chunks,
      icon: Layers,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.title}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`h-5 w-5 ${item.color} ${item.animate || ''}`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {item.isString ? item.value : item.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}