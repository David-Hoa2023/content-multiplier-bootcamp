'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Plus, 
  Wifi, 
  WifiOff, 
  Mail, 
  Globe, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram,
  Video,
  Edit,
  Trash2,
  TestTube
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { PlatformConfigurationModal } from '@/components/ui/platform-configuration-modal'

const API_URL = 'http://localhost:4000'

interface PlatformConfig {
  id: number
  platform_type: string
  platform_name: string
  configuration: Record<string, any>
  is_active: boolean
  is_connected: boolean
  last_tested_at: string | null
  test_result: string | null
  created_at: string
  updated_at: string
}

interface SupportedPlatform {
  type: string
  name: string
  capabilities: {
    supportsScheduling: boolean
    supportsImages: boolean
    supportsVideos: boolean
    supportsHashtags: boolean
    supportsMentions: boolean
    supportsThreads: boolean
    maxContentLength: number
    imageFormats?: string[]
    videoFormats?: string[]
  }
}

interface SupportedPlatformsResponse {
  all: SupportedPlatform[]
  by_category: {
    social: SupportedPlatform[]
    email: SupportedPlatform[]
    cms: SupportedPlatform[]
  }
}

const platformIcons: Record<string, JSX.Element> = {
  twitter: <Twitter className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
  tiktok: <Video className="h-5 w-5" />,
  mailchimp: <Mail className="h-5 w-5" />,
  wordpress: <Globe className="h-5 w-5" />
}

export default function PlatformSettingsPage() {
  const { toast } = useToast()
  const [configurations, setConfigurations] = useState<PlatformConfig[]>([])
  const [supportedPlatforms, setSupportedPlatforms] = useState<SupportedPlatformsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<PlatformConfig | null>(null)
  const [selectedPlatformType, setSelectedPlatformType] = useState<string>('')

  useEffect(() => {
    Promise.all([
      fetchConfigurations(),
      fetchSupportedPlatforms()
    ]).finally(() => setLoading(false))
  }, [])

  const fetchConfigurations = async () => {
    try {
      const response = await fetch(`${API_URL}/platforms/configurations`)
      const result = await response.json()
      if (result.success) {
        setConfigurations(result.data)
      }
    } catch (error) {
      console.error('Error fetching configurations:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải cấu hình platform',
        variant: 'destructive'
      })
    }
  }

  const fetchSupportedPlatforms = async () => {
    try {
      const response = await fetch(`${API_URL}/platforms/supported`)
      const result = await response.json()
      if (result.success) {
        setSupportedPlatforms(result.data)
      }
    } catch (error) {
      console.error('Error fetching supported platforms:', error)
    }
  }

  const handleAddNew = (platformType: string) => {
    setSelectedPlatformType(platformType)
    setEditingConfig(null)
    setConfigModalOpen(true)
  }

  const handleEdit = (config: PlatformConfig) => {
    setEditingConfig(config)
    setSelectedPlatformType(config.platform_type)
    setConfigModalOpen(true)
  }

  const handleDelete = async (config: PlatformConfig) => {
    if (!window.confirm(`Bạn có chắc muốn xóa cấu hình "${config.platform_name}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/platforms/configurations/${config.id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      if (result.success) {
        setConfigurations(prev => prev.filter(c => c.id !== config.id))
        toast({
          title: 'Thành công',
          description: 'Đã xóa cấu hình platform'
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error deleting configuration:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa cấu hình',
        variant: 'destructive'
      })
    }
  }

  const handleTestConnection = async (config: PlatformConfig) => {
    try {
      const response = await fetch(`${API_URL}/platforms/configurations/${config.id}/test`, {
        method: 'POST'
      })
      
      const result = await response.json()
      if (result.success) {
        // Update local state
        setConfigurations(prev => prev.map(c => 
          c.id === config.id 
            ? { 
                ...c, 
                is_connected: result.data.success,
                last_tested_at: new Date().toISOString(),
                test_result: result.data.message
              }
            : c
        ))
        
        toast({
          title: result.data.success ? 'Kết nối thành công' : 'Kết nối thất bại',
          description: result.data.message,
          variant: result.data.success ? 'default' : 'destructive'
        })
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể kiểm tra kết nối',
        variant: 'destructive'
      })
    }
  }

  const handleSaveConfiguration = async (configData: any) => {
    try {
      const url = editingConfig 
        ? `${API_URL}/platforms/configurations/${editingConfig.id}`
        : `${API_URL}/platforms/configurations`
      
      const method = editingConfig ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        if (editingConfig) {
          setConfigurations(prev => prev.map(c => 
            c.id === editingConfig.id ? result.data : c
          ))
        } else {
          setConfigurations(prev => [...prev, result.data])
        }
        
        setConfigModalOpen(false)
        toast({
          title: 'Thành công',
          description: editingConfig ? 'Đã cập nhật cấu hình' : 'Đã tạo cấu hình mới'
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error saving configuration:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cấu hình',
        variant: 'destructive'
      })
    }
  }

  const getConfiguredPlatformTypes = () => {
    return new Set(configurations.map(c => c.platform_type))
  }

  const getAvailablePlatforms = () => {
    if (!supportedPlatforms) return []
    const configuredTypes = getConfiguredPlatformTypes()
    return supportedPlatforms.all.filter(p => !configuredTypes.has(p.type))
  }

  if (loading) {
    return (
      <AppLayout pageTitle="Platform Settings" breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Settings', href: '/settings' },
        { label: 'Platforms' }
      ]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      pageTitle="Platform Settings"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Settings', href: '/settings' },
        { label: 'Platforms' }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý kết nối với các nền tảng xuất bản
          </p>
        </div>

        {/* Configured Platforms */}
        {configurations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Platforms đã cấu hình</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {configurations.map(config => (
                <Card key={config.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {platformIcons[config.platform_type] || <Settings className="h-5 w-5" />}
                        <CardTitle className="text-lg">{config.platform_name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {config.is_connected ? (
                          <Badge variant="default" className="gap-1">
                            <Wifi className="h-3 w-3" />
                            Đã kết nối
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <WifiOff className="h-3 w-3" />
                            Chưa kết nối
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="capitalize">
                      {config.platform_type} • {supportedPlatforms?.all.find(p => p.type === config.platform_type)?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Connection Status */}
                      {config.test_result && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Trạng thái:</span>
                          <p className={config.is_connected ? 'text-green-600' : 'text-red-600'}>
                            {config.test_result}
                          </p>
                        </div>
                      )}

                      {/* Last Tested */}
                      {config.last_tested_at && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Kiểm tra lần cuối:</span>
                          <p>{new Date(config.last_tested_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-between pt-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnection(config)}
                          >
                            <TestTube className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(config)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Sửa
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(config)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Platforms to Add */}
        {supportedPlatforms && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Thêm Platform Mới</h2>
            
            {/* Social Media Platforms */}
            {supportedPlatforms.by_category.social.some(p => !getConfiguredPlatformTypes().has(p.type)) && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-muted-foreground">Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {supportedPlatforms.by_category.social
                    .filter(platform => !getConfiguredPlatformTypes().has(platform.type))
                    .map(platform => (
                      <Card 
                        key={platform.type} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleAddNew(platform.type)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            {platformIcons[platform.type] || <Settings className="h-8 w-8" />}
                            <h3 className="font-medium">{platform.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {platform.capabilities.maxContentLength} ký tự
                            </p>
                            <Button size="sm" className="mt-2">
                              <Plus className="h-4 w-4 mr-1" />
                              Thêm
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Email Platforms */}
            {supportedPlatforms.by_category.email.some(p => !getConfiguredPlatformTypes().has(p.type)) && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-muted-foreground">Email Marketing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {supportedPlatforms.by_category.email
                    .filter(platform => !getConfiguredPlatformTypes().has(platform.type))
                    .map(platform => (
                      <Card 
                        key={platform.type} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleAddNew(platform.type)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            {platformIcons[platform.type] || <Settings className="h-8 w-8" />}
                            <h3 className="font-medium">{platform.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Email campaigns
                            </p>
                            <Button size="sm" className="mt-2">
                              <Plus className="h-4 w-4 mr-1" />
                              Thêm
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* CMS Platforms */}
            {supportedPlatforms.by_category.cms.some(p => !getConfiguredPlatformTypes().has(p.type)) && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-muted-foreground">Content Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {supportedPlatforms.by_category.cms
                    .filter(platform => !getConfiguredPlatformTypes().has(platform.type))
                    .map(platform => (
                      <Card 
                        key={platform.type} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleAddNew(platform.type)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            {platformIcons[platform.type] || <Settings className="h-8 w-8" />}
                            <h3 className="font-medium">{platform.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Blog posts & articles
                            </p>
                            <Button size="sm" className="mt-2">
                              <Plus className="h-4 w-4 mr-1" />
                              Thêm
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {configurations.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có platform nào được cấu hình</h3>
              <p className="text-muted-foreground mb-4">
                Thêm platform đầu tiên để bắt đầu xuất bản nội dung
              </p>
            </CardContent>
          </Card>
        )}

        {/* Configuration Modal */}
        {supportedPlatforms && (
          <PlatformConfigurationModal
            open={configModalOpen}
            onOpenChange={setConfigModalOpen}
            platformType={selectedPlatformType}
            existingConfig={editingConfig}
            supportedPlatforms={supportedPlatforms.all}
            onSave={handleSaveConfiguration}
          />
        )}
      </div>
    </AppLayout>
  )
}