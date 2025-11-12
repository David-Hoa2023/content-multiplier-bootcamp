'use client'

import { SettingsPage } from '@/components/ui/settings-page'
import { Toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Info,
  Palette,
  Globe,
  Bell,
  Download,
  User,
  Camera,
  RefreshCw,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function DemoSettingsPage() {
  const clearStorage = () => {
    localStorage.removeItem('app-settings')
    localStorage.removeItem('user-info')
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Header */}
      <div className="border-b border-border bg-muted/20">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">SettingsPage Component Demo</h1>
              <p className="text-muted-foreground">
                Demo component SettingsPage với đầy đủ tính năng và animations.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={clearStorage} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset Demo
              </Button>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="container mx-auto p-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Features Overview</CardTitle>
            <CardDescription>
              Tính năng chính của SettingsPage component
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* User Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium">Thông tin người dùng</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Hiển thị tên và email (read-only)</li>
                  <li>• Upload avatar với preview</li>
                  <li>• File size validation (5MB)</li>
                  <li>• Auto-save to localStorage</li>
                </ul>
              </div>

              {/* Theme */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-500" />
                  <h4 className="font-medium">Theme Settings</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Light / Dark / System mode</li>
                  <li>• useTheme() integration</li>
                  <li>• Smooth transitions</li>
                  <li>• Icon updates theo theme</li>
                </ul>
              </div>

              {/* Language */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium">Ngôn ngữ</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• English / Tiếng Việt</li>
                  <li>• Flag icons cho các ngôn ngữ</li>
                  <li>• Auto-save to localStorage</li>
                  <li>• Toast notification</li>
                </ul>
              </div>

              {/* Notifications */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-500" />
                  <h4 className="font-medium">Thông báo</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Email notifications</li>
                  <li>• Push notifications</li>
                  <li>• Product updates</li>
                  <li>• Switch controls</li>
                </ul>
              </div>

              {/* Export */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-red-500" />
                  <h4 className="font-medium">Export Data</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Download user data as JSON</li>
                  <li>• Loading state với spinner</li>
                  <li>• Success/Error handling</li>
                  <li>• Simulated export process</li>
                </ul>
              </div>

              {/* Technical */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-cyan-500" />
                  <h4 className="font-medium">Technical Features</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Framer Motion animations</li>
                  <li>• localStorage persistence</li>
                  <li>• Responsive design</li>
                  <li>• Dark mode support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Hướng dẫn sử dụng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <h4 className="font-medium">Interactions:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Click vào camera icon để upload avatar</li>
                  <li>Toggle theme để xem smooth transitions</li>
                  <li>Thay đổi ngôn ngữ để test persistence</li>
                  <li>Bật/tắt notifications để test switches</li>
                  <li>Click "Tải xuống dữ liệu" để test export</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Features to Test:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Tất cả settings được lưu vào localStorage</li>
                  <li>Refresh page để test persistence</li>
                  <li>Toast notifications hiển thị khi save</li>
                  <li>Responsive behavior trên mobile</li>
                  <li>Dark mode support hoàn chỉnh</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">localStorage Persistence</Badge>
              <Badge variant="outline">Toast Notifications</Badge>
              <Badge variant="outline">File Upload</Badge>
              <Badge variant="outline">Theme Integration</Badge>
              <Badge variant="outline">Responsive Design</Badge>
              <Badge variant="outline">Auto-save</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Component */}
      <SettingsPage />

      {/* Required for toast notifications */}
      <Toaster />
    </div>
  )
}