# SettingsPage Component Documentation

## Tổng quan

`SettingsPage` là một component React được xây dựng với **Tailwind CSS** và **shadcn/ui**, cung cấp giao diện settings hoàn chỉnh với user info, theme, language, notifications và data export.

## Features

- ✅ **User Information**: Hiển thị name, email với avatar upload
- ✅ **Theme Settings**: Light/Dark/System mode với useTheme() integration
- ✅ **Language Selector**: English/Vietnamese với flag icons
- ✅ **Notification Controls**: Email, Push, Updates notifications
- ✅ **Data Export**: Download user data với loading states
- ✅ **Auto-save**: Tự động lưu vào localStorage
- ✅ **Toast Notifications**: Feedback khi thay đổi settings
- ✅ **Avatar Upload**: File upload với preview và validation
- ✅ **Responsive Design**: Mobile-friendly layout
- ✅ **Smooth Animations**: Framer Motion transitions

## Installation

### Dependencies

```bash
npm install framer-motion next-themes
```

### shadcn/ui Components

```bash
npx shadcn@latest add card button input label switch select checkbox separator avatar tooltip toast
```

## Basic Usage

### Simple Implementation

```tsx
import { SettingsPage } from '@/components/ui/settings-page'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <div>
      <SettingsPage />
      <Toaster />
    </div>
  )
}
```

### With Layout Wrapper

```tsx
import { SettingsPage } from '@/components/ui/settings-page'
import { ThemeProvider } from '@/components/theme-provider'

function SettingsRoute() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <SettingsPage />
      </div>
    </ThemeProvider>
  )
}
```

## Component Structure

### Main Sections

1. **User Information**
   - Avatar upload với preview
   - Name và email (read-only)
   - Camera icon để change avatar

2. **Theme Settings**
   - Light/Dark/System mode selector
   - Theme icon updates
   - next-themes integration

3. **Language Settings**
   - English/Vietnamese selector
   - Flag icons
   - Auto-save to localStorage

4. **Notification Settings**
   - Email notifications switch
   - Push notifications switch
   - Product updates switch

5. **Data Export**
   - Download button với loading state
   - JSON export functionality
   - Success/Error handling

6. **Quick Stats Sidebar**
   - Current language display
   - Current theme display
   - Notification count

## Data Management

### LocalStorage Schema

```typescript
// app-settings
interface SettingsState {
  language: 'en' | 'vi'
  notifications: {
    email: boolean
    push: boolean
    updates: boolean
  }
}

// user-info
interface UserInfo {
  name: string
  email: string
  avatar?: string  // Base64 image data
}
```

### Default Values

```typescript
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
```

## Features Detail

### Avatar Upload

```typescript
const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (file) {
    // 5MB file size limit
    if (file.size > 5 * 1024 * 1024) {
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
      // Save to localStorage
      saveUser({ ...user, avatar: result })
    }
    reader.readAsDataURL(file)
  }
}
```

### Theme Integration

```typescript
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()

// Theme selector với icons
const getThemeIcon = () => {
  switch (theme) {
    case 'light': return <Sun className="h-4 w-4" />
    case 'dark': return <Moon className="h-4 w-4" />
    default: return <Monitor className="h-4 w-4" />
  }
}
```

### Auto-save Functionality

```typescript
const saveSettings = (newSettings: SettingsState) => {
  localStorage.setItem('app-settings', JSON.stringify(newSettings))
  setSettings(newSettings)
  
  toast({
    title: "Đã lưu thiết lập",
    description: "Thiết lập của bạn đã được cập nhật thành công.",
  })
}

// Auto-save khi change
const handleLanguageChange = (language: 'en' | 'vi') => {
  const newSettings = { ...settings, language }
  saveSettings(newSettings)
}
```

### Data Export

```typescript
const handleExportData = async () => {
  setIsExporting(true)
  
  try {
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
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
    // Error handling
  } finally {
    setIsExporting(false)
  }
}
```

## Animations

### Section Entry Animation

```typescript
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

<motion.div
  initial="hidden"
  animate="visible"
  variants={sectionVariants}
>
  <Card>...</Card>
</motion.div>
```

### Item Stagger Animation

```typescript
const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

<motion.div variants={itemVariants}>
  <SettingItem />
</motion.div>
```

### Export Button Animation

```typescript
<AnimatePresence mode="wait">
  {isExporting ? (
    <motion.div
      key="loading"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <Spinner /> Đang xuất...
    </motion.div>
  ) : (
    <motion.div key="default">
      <Download /> Tải xuống dữ liệu
    </motion.div>
  )}
</AnimatePresence>
```

## Responsive Design

### Layout Breakpoints

```typescript
// Main grid layout
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Main settings - 2 columns on large screens */}
  <div className="lg:col-span-2 space-y-6">
    {/* Settings sections */}
  </div>
  
  {/* Sidebar - 1 column on large screens */}
  <div className="space-y-6">
    {/* Export & Quick stats */}
  </div>
</div>
```

### Form Fields

```typescript
// User info fields - responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label>Họ và tên</Label>
    <Input value={user.name} disabled />
  </div>
  <div className="space-y-2">
    <Label>Email</Label>
    <Input value={user.email} disabled />
  </div>
</div>
```

## Customization

### Custom User Data

```typescript
// Override default user
const customUser: UserInfo = {
  name: 'John Doe',
  email: 'john@company.com',
  avatar: '/path/to/avatar.jpg'
}

// Pass via props (if modified to accept props)
<SettingsPage defaultUser={customUser} />
```

### Custom Languages

```typescript
const languages = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' }
]
```

### Custom Theme Options

```typescript
// Add custom theme option
<SelectItem value="auto">
  <div className="flex items-center gap-2">
    <Sparkles className="h-4 w-4" />
    Auto
  </div>
</SelectItem>
```

### Custom Notification Types

```typescript
const notificationTypes = [
  {
    key: 'email',
    label: 'Email notifications',
    description: 'Nhận thông báo qua email'
  },
  {
    key: 'push',
    label: 'Push notifications', 
    description: 'Nhận thông báo đẩy trên trình duyệt'
  },
  {
    key: 'sms',
    label: 'SMS notifications',
    description: 'Nhận thông báo qua SMS'
  }
]
```

## Error Handling

### File Upload Validation

```typescript
const validateFile = (file: File) => {
  // Size validation
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File quá lớn (max 5MB)')
  }
  
  // Type validation
  if (!file.type.startsWith('image/')) {
    throw new Error('Chỉ chấp nhận file ảnh')
  }
  
  // Extension validation
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  if (!allowedExtensions.includes(extension)) {
    throw new Error('Format không được hỗ trợ')
  }
}
```

### localStorage Error Handling

```typescript
const safelySetLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Failed to save ${key}:`, error)
    toast({
      title: "Lỗi lưu trữ",
      description: "Không thể lưu thiết lập. Vui lòng thử lại.",
      variant: "destructive"
    })
  }
}
```

## Usage Patterns

### Settings Modal

```typescript
function SettingsModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cài đặt</DialogTitle>
        </DialogHeader>
        <SettingsPage />
      </DialogContent>
    </Dialog>
  )
}
```

### Settings Drawer (Mobile)

```typescript
function SettingsDrawer({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Cài đặt</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <SettingsPage />
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

### Settings Page Route

```typescript
// app/settings/page.tsx
import { SettingsPage } from '@/components/ui/settings-page'

export default function Settings() {
  return (
    <div className="container mx-auto py-8">
      <SettingsPage />
    </div>
  )
}
```

### Embedded Settings

```typescript
function UserProfile() {
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <ProfileContent />
      </TabsContent>
      
      <TabsContent value="settings">
        <SettingsPage />
      </TabsContent>
    </Tabs>
  )
}
```

## Integration Examples

### With Authentication

```typescript
function AuthenticatedSettings() {
  const { user, logout } = useAuth()
  
  // Pass real user data to settings
  const userInfo = {
    name: user.displayName,
    email: user.email,
    avatar: user.photoURL
  }
  
  return (
    <SettingsPage 
      defaultUser={userInfo}
      onLogout={logout}
    />
  )
}
```

### With API Sync

```typescript
function SyncedSettings() {
  const updateUserSettings = async (settings: SettingsState) => {
    try {
      await api.updateUserSettings(settings)
      // Auto-save to localStorage after API success
      localStorage.setItem('app-settings', JSON.stringify(settings))
    } catch (error) {
      // Revert changes on API error
      toast({
        title: "Lỗi đồng bộ",
        description: "Không thể lưu thiết lập lên server.",
        variant: "destructive"
      })
    }
  }
  
  return <SettingsPage onSettingsChange={updateUserSettings} />
}
```

## Best Practices

1. **Data Persistence**:
   - Always validate localStorage data
   - Provide fallback defaults
   - Handle localStorage quota exceeded

2. **File Upload**:
   - Validate file size và type
   - Show upload progress for large files
   - Provide image compression option

3. **User Experience**:
   - Auto-save changes immediately
   - Provide clear feedback với toast
   - Smooth animations for transitions

4. **Performance**:
   - Debounce auto-save operations
   - Lazy load heavy components
   - Optimize image previews

5. **Accessibility**:
   - Proper ARIA labels
   - Keyboard navigation support
   - Focus management

6. **Error Handling**:
   - Graceful degradation
   - Clear error messages
   - Retry mechanisms

## Troubleshooting

### Theme không sync
- Kiểm tra ThemeProvider wrapper
- Verify next-themes setup
- Check localStorage permissions

### Avatar upload không hoạt động
- Kiểm tra file input ref
- Verify FileReader support
- Check file size limits

### Settings không persist
- Kiểm tra localStorage availability
- Verify JSON serialization
- Check browser storage limits

### Toast không hiển thị
- Đảm bảo Toaster component được render
- Kiểm tra toast hook import
- Verify component hierarchy

## Demo

Truy cập `/demo-settings` để xem demo đầy đủ tính năng của SettingsPage component.

---

## Support

Component này được xây dựng với:
- **Next.js 14** - App Router
- **Tailwind CSS** - Styling
- **shadcn/ui** - Base components
- **Framer Motion** - Animations
- **next-themes** - Theme management