'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { LLMProviderSwitcher } from '@/components/ui/llm-provider-switcher'
import { Badge } from '@/components/ui/badge'
import {
  Share2,
  Settings,
  Wifi,
  WifiOff,
  ChevronRight,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Video,
  Mail,
  Globe
} from 'lucide-react'
import { API_URL } from '@/lib/api-config'

interface PlatformConfig {
  id: number
  platform_type: string
  platform_name: string
  is_active: boolean
  is_connected: boolean
}

const platformIcons: Record<string, JSX.Element> = {
  twitter: <Twitter className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  tiktok: <Video className="h-4 w-4" />,
  mailchimp: <Mail className="h-4 w-4" />,
  wordpress: <Globe className="h-4 w-4" />
}

export default function SettingsPage() {
  const router = useRouter()
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfig[]>([])
  const [loadingPlatforms, setLoadingPlatforms] = useState(true)

  useEffect(() => {
    fetchPlatformConfigs()
  }, [])

  const fetchPlatformConfigs = async () => {
    try {
      const response = await fetch(`${API_URL}/platforms/configurations`)
      const result = await response.json()
      if (result.success) {
        setPlatformConfigs(result.data)
      }
    } catch (error) {
      console.error('Error fetching platform configurations:', error)
    } finally {
      setLoadingPlatforms(false)
    }
  }

  const getConnectedPlatforms = () => {
    return platformConfigs.filter(p => p.is_connected && p.is_active)
  }

  const getTotalPlatforms = () => {
    return platformConfigs.length
  }
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Platform Configuration
                  </CardTitle>
                  <CardDescription>
                    Quản lý kết nối với các nền tảng xuất bản nội dung
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/settings/platforms')}
                  className="flex items-center gap-1"
                >
                  Quản lý
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPlatforms ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Platform Overview */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{getTotalPlatforms()}</p>
                        <p className="text-xs text-muted-foreground">Đã cấu hình</p>
                      </div>
                      <Separator orientation="vertical" className="h-12" />
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{getConnectedPlatforms().length}</p>
                        <p className="text-xs text-muted-foreground">Đã kết nối</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getConnectedPlatforms().length > 0 ? (
                        <Badge variant="default" className="gap-1">
                          <Wifi className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <WifiOff className="h-3 w-3" />
                          No Active Connections
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Connected Platforms List */}
                  {platformConfigs.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Platforms đã cấu hình:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {platformConfigs.map(config => (
                          <div
                            key={config.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${
                              config.is_connected && config.is_active
                                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                                : 'bg-muted border-border text-muted-foreground'
                            }`}
                          >
                            {platformIcons[config.platform_type] || <Settings className="h-3 w-3" />}
                            <span>{config.platform_name}</span>
                            {config.is_connected && config.is_active && (
                              <Wifi className="h-3 w-3" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Chưa có platform nào được cấu hình
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => router.push('/settings/platforms')}
                      >
                        Cấu hình Platform đầu tiên
                      </Button>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="pt-2 border-t">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push('/settings/platforms')}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Cấu hình chi tiết
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push('/derivatives')}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Tạo nội dung
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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