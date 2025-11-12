'use client'

import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { LLMProviderSwitcher } from '@/components/ui/llm-provider-switcher'

export default function SettingsPage() {
  return (
    <AppLayout 
      pageTitle="Settings"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Settings' }
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Quản lý cài đặt và tùy chọn của bạn.
          </p>
        </div>

        <Separator />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Giao diện</CardTitle>
              <CardDescription>
                Tùy chỉnh giao diện và chủ đề của ứng dụng.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Chế độ hiển thị</label>
                  <p className="text-xs text-muted-foreground">
                    Chọn chế độ sáng, tối hoặc theo hệ thống
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tài khoản</CardTitle>
              <CardDescription>
                Quản lý thông tin tài khoản và bảo mật.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  value="coder@vibecoding.com"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên hiển thị</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  value="Vibe Coder"
                  readOnly
                />
              </div>
              <Button>Cập nhật thông tin</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Provider</CardTitle>
              <CardDescription>
                Cấu hình nhà cung cấp AI và mô hình cho việc tạo nội dung.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LLMProviderSwitcher className="max-w-none" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông báo</CardTitle>
              <CardDescription>
                Cấu hình các loại thông báo bạn muốn nhận.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Email thông báo</label>
                  <p className="text-xs text-muted-foreground">
                    Nhận email khi có ý tưởng mới được tạo
                  </p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Thông báo trong ứng dụng</label>
                  <p className="text-xs text-muted-foreground">
                    Hiển thị thông báo realtime trong ứng dụng
                  </p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}