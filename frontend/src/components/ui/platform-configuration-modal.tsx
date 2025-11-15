'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  TestTube, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  Globe,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Video
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'import { API_URL } from '@/lib/api-config';


interface PlatformConfig {
  id?: number
  platform_type: string
  platform_name: string
  configuration: Record<string, any>
  is_active?: boolean
}

interface SupportedPlatform {
  type: string
  name: string
  capabilities: Record<string, any>
}

interface PlatformConfigurationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  platformType: string
  existingConfig?: PlatformConfig | null
  supportedPlatforms: SupportedPlatform[]
  onSave: (config: any) => Promise<void>
}

export function PlatformConfigurationModal({
  open,
  onOpenChange,
  platformType,
  existingConfig,
  supportedPlatforms,
  onSave
}: PlatformConfigurationModalProps) {
  const { toast } = useToast()
  const [platformName, setPlatformName] = useState('')
  const [configuration, setConfiguration] = useState<Record<string, any>>({})
  const [credentials, setCredentials] = useState<Record<string, any>>({})
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  const platform = supportedPlatforms.find(p => p.type === platformType)

  useEffect(() => {
    if (existingConfig) {
      setPlatformName(existingConfig.platform_name)
      setConfiguration(existingConfig.configuration)
      setCredentials({}) // Don't pre-fill credentials for security
    } else {
      setPlatformName(`My ${platform?.name || platformType}`)
      setConfiguration(getDefaultConfiguration(platformType))
      setCredentials({})
    }
    setTestResult(null)
  }, [existingConfig, platformType, platform])

  const getDefaultConfiguration = (type: string): Record<string, any> => {
    switch (type) {
      case 'mailchimp':
        return {
          fromName: 'Your Company',
          fromEmail: 'marketing@yourcompany.com',
          replyTo: 'noreply@yourcompany.com',
          trackOpens: true,
          trackClicks: true,
          listId: '',
          dataCenter: 'us1'
        }
      
      case 'wordpress':
        return {
          siteUrl: '',
          authType: 'application_password',
          defaultCategory: 'Blog',
          defaultStatus: 'draft',
          allowComments: true,
          seoOptimization: true
        }
      
      case 'twitter':
        return {
          defaultHashtags: ['#content', '#marketing'],
          scheduleTimezone: 'UTC'
        }
      
      case 'linkedin':
        return {
          defaultHashtags: ['#business', '#professional'],
          scheduleTimezone: 'UTC'
        }
      
      default:
        return {}
    }
  }

  const handleConfigurationChange = (key: string, value: any) => {
    setConfiguration(prev => ({ ...prev, [key]: value }))
  }

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }))
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    
    try {
      const response = await fetch(`${API_URL}/platforms/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform_type: platformType,
          configuration: {
            ...configuration,
            ...credentials // Merge credentials for testing
          },
          credentials
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.data) {
        setTestResult({
          success: result.data.success,
          message: result.data.message || 'Test completed'
        })
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Test failed'
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Network error during test'
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const configData = {
        platform_type: platformType,
        platform_name: platformName,
        configuration,
        credentials,
        test_connection: false
      }
      
      await onSave(configData)
    } catch (error) {
      console.error('Error saving configuration:', error)
    } finally {
      setSaving(false)
    }
  }

  const renderConfigurationForm = () => {
    switch (platformType) {
      case 'mailchimp':
        return <MailChimpConfigForm 
          configuration={configuration}
          credentials={credentials}
          onChange={handleConfigurationChange}
          onCredentialChange={handleCredentialChange}
          showPassword={showPassword}
        />
      
      case 'wordpress':
        return <WordPressConfigForm 
          configuration={configuration}
          credentials={credentials}
          onChange={handleConfigurationChange}
          onCredentialChange={handleCredentialChange}
          showPassword={showPassword}
        />
      
      case 'twitter':
      case 'linkedin':
      case 'facebook':
      case 'instagram':
      case 'tiktok':
        return <SocialConfigForm 
          platformType={platformType}
          configuration={configuration}
          credentials={credentials}
          onChange={handleConfigurationChange}
          onCredentialChange={handleCredentialChange}
          showPassword={showPassword}
        />
      
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Configuration form for {platformType} is not yet implemented.
          </div>
        )
    }
  }

  const getPlatformIcon = () => {
    const iconMap: Record<string, JSX.Element> = {
      twitter: <Twitter className="h-5 w-5" />,
      linkedin: <Linkedin className="h-5 w-5" />,
      facebook: <Facebook className="h-5 w-5" />,
      instagram: <Instagram className="h-5 w-5" />,
      tiktok: <Video className="h-5 w-5" />,
      mailchimp: <Mail className="h-5 w-5" />,
      wordpress: <Globe className="h-5 w-5" />
    }
    return iconMap[platformType] || <Settings className="h-5 w-5" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPlatformIcon()}
            {existingConfig ? 'Chỉnh sửa' : 'Thêm'} {platform?.name || platformType}
          </DialogTitle>
          <DialogDescription>
            {existingConfig 
              ? 'Cập nhật cấu hình platform của bạn'
              : 'Cấu hình kết nối với platform mới'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Cơ bản</TabsTrigger>
            <TabsTrigger value="auth">Xác thực</TabsTrigger>
            <TabsTrigger value="advanced">Nâng cao</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            {/* Platform Name */}
            <div className="space-y-2">
              <Label htmlFor="platform-name">Tên cấu hình</Label>
              <Input
                id="platform-name"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                placeholder={`My ${platform?.name || platformType}`}
              />
            </div>

            {/* Platform-specific basic configuration */}
            {renderConfigurationForm()}
          </TabsContent>

          <TabsContent value="auth" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Thông tin xác thực</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Authentication form based on platform */}
              {renderAuthenticationForm()}
              
              {/* Test Connection */}
              <div className="space-y-2">
                <Button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="w-full"
                >
                  {testing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Kiểm tra kết nối
                    </>
                  )}
                </Button>
                
                {testResult && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm">{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            {/* Advanced platform-specific settings */}
            {renderAdvancedSettings()}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !platformName.trim()}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              existingConfig ? 'Cập nhật' : 'Tạo mới'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  function renderAuthenticationForm() {
    switch (platformType) {
      case 'mailchimp':
        return (
          <div className="space-y-3">
            <div>
              <Label>MailChimp API Key <span className="text-red-500">*</span></Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={credentials.mailchimpApiKey || ''}
                onChange={(e) => handleCredentialChange('mailchimpApiKey', e.target.value)}
                placeholder="abc123456789abcdef..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your MailChimp API key (without datacenter suffix)
              </p>
            </div>
            <div>
              <Label>Server Prefix (Datacenter) <span className="text-red-500">*</span></Label>
              <Input
                value={credentials.serverPrefix || ''}
                onChange={(e) => handleCredentialChange('serverPrefix', e.target.value)}
                placeholder="us1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your MailChimp datacenter (e.g., us1, us2, us3)
              </p>
            </div>

            <div className="border-t pt-3 mt-4">
              <h4 className="font-medium mb-3 text-sm">Email Configuration (Required)</h4>

              <div className="space-y-3">
                <div>
                  <Label>List ID (Audience ID) <span className="text-red-500">*</span></Label>
                  <Input
                    value={configuration.listId || ''}
                    onChange={(e) => handleConfigurationChange('listId', e.target.value)}
                    placeholder="abc123def4"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Find this in MailChimp: Audience → Settings → Audience ID
                  </p>
                </div>

                <div>
                  <Label>From Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={configuration.fromName || ''}
                    onChange={(e) => handleConfigurationChange('fromName', e.target.value)}
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <Label>From Email <span className="text-red-500">*</span></Label>
                  <Input
                    type="email"
                    value={configuration.fromEmail || ''}
                    onChange={(e) => handleConfigurationChange('fromEmail', e.target.value)}
                    placeholder="marketing@yourcompany.com"
                  />
                </div>

                <div>
                  <Label>Reply To Email <span className="text-red-500">*</span></Label>
                  <Input
                    type="email"
                    value={configuration.replyTo || ''}
                    onChange={(e) => handleConfigurationChange('replyTo', e.target.value)}
                    placeholder="noreply@yourcompany.com"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'wordpress':
        return (
          <div className="space-y-3">
            <div>
              <Label>Username</Label>
              <Input
                value={credentials.username || ''}
                onChange={(e) => handleCredentialChange('username', e.target.value)}
                placeholder="admin"
              />
            </div>
            <div>
              <Label>Application Password</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={credentials.applicationPassword || ''}
                onChange={(e) => handleCredentialChange('applicationPassword', e.target.value)}
                placeholder="xxxx xxxx xxxx xxxx"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Create in WordPress: Users → Profile → Application Passwords
              </p>
            </div>
          </div>
        )
      
      case 'twitter':
      case 'linkedin':
      case 'facebook':
      case 'instagram':
      case 'tiktok':
        return <SocialMediaAuthForm 
          platformType={platformType}
          credentials={credentials}
          onCredentialChange={handleCredentialChange}
          showPassword={showPassword}
        />
      
      default:
        return (
          <div className="text-center py-4 text-muted-foreground">
            Authentication configuration not available for {platformType}.
          </div>
        )
    }
  }

  function renderAdvancedSettings() {
    // Platform-specific advanced settings
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Advanced settings for {platform?.name || platformType}
        </p>
        
        {/* Platform capabilities display */}
        {platform && (
          <div className="space-y-2">
            <h4 className="font-medium">Platform Capabilities</h4>
            <div className="flex flex-wrap gap-2">
              {platform.capabilities.supportsScheduling && (
                <Badge variant="outline">Scheduling</Badge>
              )}
              {platform.capabilities.supportsImages && (
                <Badge variant="outline">Images</Badge>
              )}
              {platform.capabilities.supportsVideos && (
                <Badge variant="outline">Videos</Badge>
              )}
              {platform.capabilities.supportsHashtags && (
                <Badge variant="outline">Hashtags</Badge>
              )}
              <Badge variant="outline">
                Max: {platform.capabilities.maxContentLength} chars
              </Badge>
            </div>
          </div>
        )}
      </div>
    )
  }
}

// Component for MailChimp configuration
function MailChimpConfigForm({ configuration, onChange }: any) {
  return (
    <div className="space-y-3">
      <div>
        <Label>List ID</Label>
        <Input
          value={configuration.listId || ''}
          onChange={(e) => onChange('listId', e.target.value)}
          placeholder="abc123def4"
        />
      </div>
      <div>
        <Label>From Name</Label>
        <Input
          value={configuration.fromName || ''}
          onChange={(e) => onChange('fromName', e.target.value)}
          placeholder="Your Company"
        />
      </div>
      <div>
        <Label>From Email</Label>
        <Input
          type="email"
          value={configuration.fromEmail || ''}
          onChange={(e) => onChange('fromEmail', e.target.value)}
          placeholder="marketing@yourcompany.com"
        />
      </div>
      <div>
        <Label>Reply To</Label>
        <Input
          type="email"
          value={configuration.replyTo || ''}
          onChange={(e) => onChange('replyTo', e.target.value)}
          placeholder="noreply@yourcompany.com"
        />
      </div>
    </div>
  )
}

// Component for WordPress configuration
function WordPressConfigForm({ configuration, onChange }: any) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Site URL</Label>
        <Input
          type="url"
          value={configuration.siteUrl || ''}
          onChange={(e) => onChange('siteUrl', e.target.value)}
          placeholder="https://yoursite.com"
        />
      </div>
      <div>
        <Label>Default Category</Label>
        <Input
          value={configuration.defaultCategory || ''}
          onChange={(e) => onChange('defaultCategory', e.target.value)}
          placeholder="Blog"
        />
      </div>
      <div>
        <Label>Default Status</Label>
        <Select value={configuration.defaultStatus} onValueChange={(value) => onChange('defaultStatus', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="publish">Publish</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Component for social media authentication
function SocialMediaAuthForm({ platformType, credentials, onCredentialChange, showPassword }: any) {
  const getAuthInstructions = () => {
    switch (platformType) {
      case 'twitter':
        return {
          title: 'Twitter API v2 Authentication',
          instructions: 'Create a Twitter Developer Account and generate API keys from the Twitter Developer Portal.',
          fields: [
            { key: 'apiKey', label: 'API Key', placeholder: 'your-api-key' },
            { key: 'apiSecret', label: 'API Secret Key', placeholder: 'your-api-secret', type: 'password' },
            { key: 'accessToken', label: 'Access Token', placeholder: 'your-access-token' },
            { key: 'accessTokenSecret', label: 'Access Token Secret', placeholder: 'your-access-token-secret', type: 'password' },
            { key: 'bearerToken', label: 'Bearer Token (Optional)', placeholder: 'your-bearer-token', type: 'password' }
          ],
          link: 'https://developer.twitter.com/en/portal/dashboard'
        }
      
      case 'facebook':
        return {
          title: 'Facebook Graph API Authentication',
          instructions: 'Create a Facebook App and generate an Access Token with pages_manage_posts permission.',
          fields: [
            { key: 'appId', label: 'App ID', placeholder: 'your-app-id' },
            { key: 'appSecret', label: 'App Secret', placeholder: 'your-app-secret', type: 'password' },
            { key: 'accessToken', label: 'Page Access Token', placeholder: 'your-page-access-token', type: 'password' },
            { key: 'pageId', label: 'Page ID', placeholder: 'your-facebook-page-id' }
          ],
          link: 'https://developers.facebook.com/apps'
        }
      
      case 'instagram':
        return {
          title: 'Instagram Basic Display API',
          instructions: 'Use Facebook Developer Console to create Instagram Basic Display App.',
          fields: [
            { key: 'appId', label: 'Instagram App ID', placeholder: 'your-instagram-app-id' },
            { key: 'appSecret', label: 'Instagram App Secret', placeholder: 'your-app-secret', type: 'password' },
            { key: 'accessToken', label: 'User Access Token', placeholder: 'your-user-access-token', type: 'password' },
            { key: 'userId', label: 'Instagram User ID', placeholder: 'your-instagram-user-id' }
          ],
          link: 'https://developers.facebook.com/docs/instagram-basic-display-api'
        }
      
      case 'linkedin':
        return {
          title: 'LinkedIn API Authentication',
          instructions: 'Create a LinkedIn App and generate OAuth 2.0 credentials.',
          fields: [
            { key: 'clientId', label: 'Client ID', placeholder: 'your-client-id' },
            { key: 'clientSecret', label: 'Client Secret', placeholder: 'your-client-secret', type: 'password' },
            { key: 'accessToken', label: 'Access Token', placeholder: 'your-access-token', type: 'password' },
            { key: 'organizationId', label: 'Organization ID (Optional)', placeholder: 'your-organization-id' }
          ],
          link: 'https://www.linkedin.com/developers/apps'
        }
      
      case 'tiktok':
        return {
          title: 'TikTok for Business API',
          instructions: 'Register for TikTok for Business API and obtain OAuth credentials.',
          fields: [
            { key: 'appId', label: 'App ID', placeholder: 'your-tiktok-app-id' },
            { key: 'appSecret', label: 'App Secret', placeholder: 'your-app-secret', type: 'password' },
            { key: 'accessToken', label: 'Access Token', placeholder: 'your-access-token', type: 'password' },
            { key: 'advertiserIds', label: 'Advertiser IDs', placeholder: 'comma-separated-advertiser-ids' }
          ],
          link: 'https://business-api.tiktok.com/'
        }
      
      default:
        return {
          title: 'API Authentication',
          instructions: 'Configure API credentials for this platform.',
          fields: [
            { key: 'apiKey', label: 'API Key', placeholder: 'your-api-key', type: 'password' }
          ],
          link: '#'
        }
    }
  }

  const authConfig = getAuthInstructions()

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 bg-muted/50">
        <h4 className="font-medium text-sm mb-2">{authConfig.title}</h4>
        <p className="text-xs text-muted-foreground mb-3">{authConfig.instructions}</p>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => window.open(authConfig.link, '_blank')}
          className="h-auto p-0 text-xs"
        >
          Open Developer Portal →
        </Button>
      </div>

      {authConfig.fields.map((field) => (
        <div key={field.key}>
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            type={field.type === 'password' ? (showPassword ? 'text' : 'password') : 'text'}
            value={credentials[field.key] || ''}
            onChange={(e) => onCredentialChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      ))}
    </div>
  )
}

// Component for social media configuration
function SocialConfigForm({ platformType, configuration, onChange }: any) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Default Hashtags</Label>
        <Input
          value={(configuration.defaultHashtags || []).join(', ')}
          onChange={(e) => onChange('defaultHashtags', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
          placeholder="#marketing, #content"
        />
      </div>
      <div>
        <Label>Timezone</Label>
        <Select value={configuration.scheduleTimezone} onValueChange={(value) => onChange('scheduleTimezone', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UTC">UTC</SelectItem>
            <SelectItem value="Asia/Ho_Chi_Minh">Vietnam (GMT+7)</SelectItem>
            <SelectItem value="America/New_York">Eastern Time</SelectItem>
            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}