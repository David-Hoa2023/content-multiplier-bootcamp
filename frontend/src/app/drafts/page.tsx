'use client'

import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pen, Plus, Search, Filter } from 'lucide-react'

export default function DraftsPage() {
  return (
    <AppLayout 
      pageTitle="Drafts"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Drafts' }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Drafts</h1>
            <p className="text-muted-foreground">
              Quản lý các bản thảo và nội dung đang soạn thảo.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tạo bản thảo mới
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm bản thảo..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Lọc
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng bản thảo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 từ tuần trước
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang viết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Cần hoàn thành
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sẵn sàng xuất bản</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                Chờ review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <Pen className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">Chưa có bản thảo nào</h3>
              <p className="text-muted-foreground">
                Bắt đầu viết nội dung từ ý tưởng hoặc brief của bạn
              </p>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Bắt đầu viết
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}