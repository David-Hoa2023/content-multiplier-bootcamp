"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { 
  User, 
  Palette, 
  Globe, 
  Bell, 
  Download, 
  Camera,
  Check,
  Upload,
  Moon,
  Sun,
  Monitor,
  ChevronDown
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface UserInfo {
  name: string
  email: string
  avatar?: string
}

interface SettingsState {
  language: 'en' | 'vi'
  notifications: {
    email: boolean
    push: boolean
    updates: boolean
  }
}

const defaultUser: UserInfo = {
  name: 'Vibe Coder',
  email: 'coder@vibecoding.com',
  avatar: undefined
}

const defaultSettings: SettingsState = {
  language: 'vi',
  notifications: {
    email: true,
    push: true,
    updates: false
  }
}

const languages = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' }
]

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" as const }
  }
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<UserInfo>(defaultUser)
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings')
    const savedUser = localStorage.getItem('user-info')
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        if (userData.avatar) {
          setAvatarPreview(userData.avatar)
        }
      } catch (error) {
        console.error('Failed to parse saved user:', error)
      }
    }
  }, [])

  // Auto-save settings to localStorage
  const saveSettings = (newSettings: SettingsState) => {
    localStorage.setItem('app-settings', JSON.stringify(newSettings))
    setSettings(newSettings)
    
    toast({
      title: "Đã lưu thiết lập",
      description: "Thiết lập của bạn đã được cập nhật thành công.",
    })
  }

  const saveUser = (newUser: UserInfo) => {
    localStorage.setItem('user-info', JSON.stringify(newUser))
    setUser(newUser)
  }

  const handleLanguageChange = (language: 'en' | 'vi') => {
    const newSettings = { ...settings, language }
    saveSettings(newSettings)
  }

  const handleNotificationChange = (type: keyof SettingsState['notifications'], checked: boolean) => {
    const newSettings = {
      ...settings,
      notifications: { ...settings.notifications, [type]: checked }
    }
    saveSettings(newSettings)
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File quá lớn",
          description: "Vui lòng chọn ảnh nhỏ hơn 5MB.",
          variant: "destructive"
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
        const newUser = { ...user, avatar: result }
        saveUser(newUser)
        
        toast({
          title: "Đã cập nhật avatar",
          description: "Avatar của bạn đã được cập nhật thành công.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create dummy export data
      const exportData = {
        user,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `content-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Xuất dữ liệu thành công",
        description: "Dữ liệu của bạn đã được tải xuống thành công.",
      })
    } catch (error) {
      toast({
        title: "Lỗi xuất dữ liệu",
        description: "Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />
      case 'dark': return <Moon className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  const currentLanguage = languages.find(lang => lang.value === settings.language)

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 max-w-4xl space-y-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin tài khoản và tùy chỉnh trải nghiệm của bạn.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Thông tin cá nhân
                  </CardTitle>
                  <CardDescription>
                    Thông tin tài khoản của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Upload */}
                  <motion.div 
                    variants={itemVariants}
                    className="flex items-center gap-4"
                  >
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={avatarPreview || user.avatar} alt={user.name} />
                        <AvatarFallback className="text-lg">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Thay đổi avatar</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Click vào icon camera để thay đổi avatar
                      </p>
                    </div>
                  </motion.div>

                  <Separator />

                  {/* User Info Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="name">Họ và tên</Label>
                      <Input
                        id="name"
                        value={user.name}
                        disabled
                        className="bg-muted"
                      />
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-muted"
                      />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Theme Settings */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Giao diện
                  </CardTitle>
                  <CardDescription>
                    Tùy chỉnh theme và giao diện
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Theme</Label>
                        <p className="text-sm text-muted-foreground">
                          Chọn theme sáng, tối hoặc theo hệ thống
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getThemeIcon()}
                        <Select value={theme} onValueChange={setTheme}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">
                              <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4" />
                                Sáng
                              </div>
                            </SelectItem>
                            <SelectItem value="dark">
                              <div className="flex items-center gap-2">
                                <Moon className="h-4 w-4" />
                                Tối
                              </div>
                            </SelectItem>
                            <SelectItem value="system">
                              <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4" />
                                Hệ thống
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Language Settings */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Ngôn ngữ
                  </CardTitle>
                  <CardDescription>
                    Chọn ngôn ngữ hiển thị
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Ngôn ngữ giao diện</Label>
                        <p className="text-sm text-muted-foreground">
                          Thay đổi ngôn ngữ hiển thị của ứng dụng
                        </p>
                      </div>
                      
                      <Select 
                        value={settings.language} 
                        onValueChange={handleLanguageChange}
                      >
                        <SelectTrigger className="w-40">
                          <div className="flex items-center gap-2">
                            <span>{currentLanguage?.flag}</span>
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              <div className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                {lang.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Thông báo
                  </CardTitle>
                  <CardDescription>
                    Quản lý các loại thông báo bạn muốn nhận
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Email notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Nhận thông báo qua email
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => 
                          handleNotificationChange('email', checked)
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Push notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Nhận thông báo đẩy trên trình duyệt
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => 
                          handleNotificationChange('push', checked)
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Product updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Nhận thông báo về cập nhật sản phẩm
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.updates}
                        onCheckedChange={(checked) => 
                          handleNotificationChange('updates', checked)
                        }
                      />
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Export Data */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Xuất dữ liệu
                  </CardTitle>
                  <CardDescription>
                    Tải xuống dữ liệu cá nhân của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div variants={itemVariants} className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Xuất tất cả nội dung, thiết lập và dữ liệu cá nhân của bạn.
                    </p>
                    
                    <Button 
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="w-full gap-2"
                    >
                      <AnimatePresence mode="wait">
                        {isExporting ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                          >
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Đang xuất...
                          </motion.div>
                        ) : (
                          <motion.div
                            key="default"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Tải xuống dữ liệu
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div variants={itemVariants} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ngôn ngữ</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      {currentLanguage?.flag} {currentLanguage?.label}
                    </span>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      {getThemeIcon()}
                      {theme === 'light' ? 'Sáng' : theme === 'dark' ? 'Tối' : 'Hệ thống'}
                    </span>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Thông báo</span>
                    <span className="text-sm font-medium">
                      {Object.values(settings.notifications).filter(Boolean).length}/3
                    </span>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default SettingsPage