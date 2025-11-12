'use client'

import SidebarLayout from '@/components/layout/SidebarLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  FileText,
  Lightbulb,
  Pen,
  Settings
} from 'lucide-react'

export default function DemoSidebarPage() {
  const handleLogout = () => {
    alert('Đăng xuất thành công!')
  }

  return (
    <SidebarLayout
      pageTitle="Sidebar Demo"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Components', href: '/components' },
        { label: 'Sidebar Demo' }
      ]}
      user={{
        name: 'John Doe',
        email: 'john@example.com',
        avatar: undefined
      }}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sidebar Component Demo</h1>
          <p className="text-muted-foreground mt-2">
            Đây là trang demo để test Sidebar component với đầy đủ tính năng.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Responsive Design
              </CardTitle>
              <CardDescription>
                Sidebar tự động ẩn trên mobile và hiện hamburger menu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Mobile Responsive</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Navigation Active States
              </CardTitle>
              <CardDescription>
                Tab đang active được highlight với màu và border
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Active Highlighting</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Smooth Animations
              </CardTitle>
              <CardDescription>
                Collapse/expand với animation mượt mà
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Framer Motion</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Items */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Items</CardTitle>
            <CardDescription>
              Các item navigation được cấu hình với icons và tooltips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Ideas</p>
                  <p className="text-xs text-muted-foreground">Quản lý ý tưởng</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Briefs</p>
                  <p className="text-xs text-muted-foreground">Tạo briefs</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Pen className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Drafts</p>
                  <p className="text-xs text-muted-foreground">Bản thảo</p>
                  <Badge className="mt-1" variant="secondary">3</Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Settings className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Settings</p>
                  <p className="text-xs text-muted-foreground">Cài đặt</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn sử dụng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Desktop:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Nhấn nút "Thu gọn" ở footer sidebar để collapse/expand</li>
                <li>Hover vào icons khi collapsed để xem tooltips</li>
                <li>Click vào navigation items để di chuyển</li>
                <li>Badge số hiển thị trên Drafts item</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Mobile:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Sidebar tự động ẩn trên màn hình nhỏ</li>
                <li>Nhấn nút hamburger menu (góc trên trái) để mở</li>
                <li>Sidebar mở dưới dạng Sheet overlay</li>
                <li>Nhấn X hoặc click ngoài để đóng</li>
              </ul>
            </div>

            <div className="pt-4">
              <Button onClick={() => window.location.reload()}>
                Reload để test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}