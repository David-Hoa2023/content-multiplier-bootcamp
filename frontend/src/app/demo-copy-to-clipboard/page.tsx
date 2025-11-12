'use client'

import { useState } from 'react'
import { CopyToClipboard, CopyText, CopyIcon, CopyJSON, CopyCode } from '@/components/ui/copy-to-clipboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/toaster'
import { 
  RefreshCw,
  Settings,
  Code,
  FileText,
  Database,
  Copy,
  Palette
} from 'lucide-react'

// Sample data for testing
const sampleText = "This is a simple text that can be copied to clipboard!"

const sampleJSONObject = {
  name: "Nguyễn Văn A",
  age: 25,
  skills: ["React", "TypeScript", "Node.js"],
  address: {
    street: "123 Main St",
    city: "Ho Chi Minh City",
    country: "Vietnam"
  },
  isActive: true
}

const sampleJSONString = JSON.stringify(sampleJSONObject)

const sampleCode = `import React from 'react'
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard'

export default function MyComponent() {
  const handleCopy = (text: string) => {
    console.log('Copied:', text)
  }

  return (
    <CopyToClipboard
      text="Hello, World!"
      label="Copy Greeting"
      onCopy={handleCopy}
    />
  )
}`

const multilineText = `Đây là văn bản nhiều dòng
Có thể chứa các ký tự đặc biệt: @#$%^&*()
Unicode: 你好, こんにちは, 안녕하세요
Emojis: 🚀 📊 ✨ 🎯 💡

Và có thể copy tất cả cùng một lúc!`

const longText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."

export default function DemoCopyToClipboardPage() {
  const [copyCount, setCopyCount] = useState(0)
  const [toastPosition, setToastPosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'>('top-right')

  const handleCopySuccess = (text: string) => {
    setCopyCount(prev => prev + 1)
    console.log('Copy successful:', text.length, 'characters')
  }

  const handleCopyError = (error: Error) => {
    console.error('Copy failed:', error.message)
  }

  const resetDemo = () => {
    setCopyCount(0)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CopyToClipboard Demo</h1>
            <p className="text-muted-foreground">
              Demo component CopyToClipboard với đầy đủ tính năng và customization options.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Copies: {copyCount}
            </Badge>
            <Button variant="outline" onClick={resetDemo} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Demo
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Usage</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="json">JSON & Code</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Basic Usage Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5 text-blue-500" />
                  Basic Examples
                </CardTitle>
                <CardDescription>
                  Các cách sử dụng cơ bản của CopyToClipboard component
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Text với Label</h4>
                  <CopyToClipboard
                    text={sampleText}
                    label="Copy Text"
                    onCopy={handleCopySuccess}
                    onError={handleCopyError}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Icon Only</h4>
                  <CopyToClipboard
                    text={sampleText}
                    iconOnly={true}
                    tooltipText="Copy sample text"
                    onCopy={handleCopySuccess}
                    onError={handleCopyError}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Multiline Text</h4>
                  <CopyToClipboard
                    text={multilineText}
                    label="Copy Multiline"
                    variant="secondary"
                    onCopy={handleCopySuccess}
                    onError={handleCopyError}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Long Text</h4>
                  <CopyToClipboard
                    text={longText}
                    label="Copy Long Text"
                    variant="outline"
                    size="sm"
                    onCopy={handleCopySuccess}
                    onError={handleCopyError}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview Content</CardTitle>
                <CardDescription>
                  Nội dung sẽ được copy vào clipboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Sample Text:</h4>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {sampleText}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Multiline Text:</h4>
                  <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-line">
                    {multilineText}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Long Text (truncated):</h4>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {longText.substring(0, 100)}...
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-500" />
                  Button Variants
                </CardTitle>
                <CardDescription>
                  Các variant khác nhau của button
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <CopyToClipboard
                    text={sampleText}
                    label="Default"
                    variant="default"
                    onCopy={handleCopySuccess}
                  />
                  <CopyToClipboard
                    text={sampleText}
                    label="Secondary"
                    variant="secondary"
                    onCopy={handleCopySuccess}
                  />
                  <CopyToClipboard
                    text={sampleText}
                    label="Outline"
                    variant="outline"
                    onCopy={handleCopySuccess}
                  />
                  <CopyToClipboard
                    text={sampleText}
                    label="Ghost"
                    variant="ghost"
                    onCopy={handleCopySuccess}
                  />
                  <CopyToClipboard
                    text={sampleText}
                    label="Link"
                    variant="link"
                    onCopy={handleCopySuccess}
                  />
                  <CopyToClipboard
                    text={sampleText}
                    label="Destructive"
                    variant="destructive"
                    onCopy={handleCopySuccess}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Sizes</CardTitle>
                <CardDescription>
                  Các kích thước khác nhau của button
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">
                  <CopyToClipboard
                    text={sampleText}
                    label="Small"
                    size="sm"
                    variant="outline"
                    onCopy={handleCopySuccess}
                  />
                  <CopyToClipboard
                    text={sampleText}
                    label="Default"
                    size="default"
                    variant="outline"
                    onCopy={handleCopySuccess}
                  />
                  <CopyToClipboard
                    text={sampleText}
                    label="Large"
                    size="lg"
                    variant="outline"
                    onCopy={handleCopySuccess}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Icon only:</span>
                    <CopyToClipboard
                      text={sampleText}
                      iconOnly={true}
                      size="icon"
                      variant="outline"
                      onCopy={handleCopySuccess}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-orange-500" />
                  Advanced Features
                </CardTitle>
                <CardDescription>
                  Tính năng nâng cao với custom settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Custom Reset Delay (5s)</h4>
                  <CopyToClipboard
                    text={sampleText}
                    label="5s Reset"
                    resetDelay={5000}
                    successMessage="Copied! Will reset in 5 seconds"
                    onCopy={handleCopySuccess}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Custom Messages</h4>
                  <CopyToClipboard
                    text={sampleText}
                    label="Custom Messages"
                    successMessage="🎉 Text copied successfully!"
                    errorMessage="😢 Failed to copy text"
                    tooltipText="Click để copy với custom message"
                    onCopy={handleCopySuccess}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">No Toast Notification</h4>
                  <CopyToClipboard
                    text={sampleText}
                    label="Silent Copy"
                    showToast={false}
                    onCopy={handleCopySuccess}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Toast Position: {toastPosition}</h4>
                  <CopyToClipboard
                    text={sampleText}
                    label={`Copy (${toastPosition})`}
                    toastPosition={toastPosition}
                    onCopy={handleCopySuccess}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Toast Position Control</CardTitle>
                <CardDescription>
                  Test different toast positions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={toastPosition === 'top-left' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setToastPosition('top-left')}
                  >
                    Top Left
                  </Button>
                  <Button
                    variant={toastPosition === 'top-right' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setToastPosition('top-right')}
                  >
                    Top Right
                  </Button>
                  <Button
                    variant={toastPosition === 'top-center' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setToastPosition('top-center')}
                  >
                    Top Center
                  </Button>
                  <Button
                    variant={toastPosition === 'bottom-left' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setToastPosition('bottom-left')}
                  >
                    Bottom Left
                  </Button>
                  <Button
                    variant={toastPosition === 'bottom-right' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setToastPosition('bottom-right')}
                  >
                    Bottom Right
                  </Button>
                  <Button
                    variant={toastPosition === 'bottom-center' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setToastPosition('bottom-center')}
                  >
                    Bottom Center
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Utility Components</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">CopyText:</span>
                      <CopyText
                        text={sampleText}
                        label="Copy Text"
                        onCopy={handleCopySuccess}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">CopyIcon:</span>
                      <CopyIcon
                        text={sampleText}
                        onCopy={handleCopySuccess}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* JSON & Code Tab */}
        <TabsContent value="json" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  JSON Copying
                </CardTitle>
                <CardDescription>
                  Copy JSON data với auto-formatting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">JSON Object</h4>
                  <CopyJSON
                    data={sampleJSONObject}
                    label="Copy JSON Object"
                    onCopy={handleCopySuccess}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">JSON String (auto-format)</h4>
                  <CopyToClipboard
                    text={sampleJSONString}
                    label="Copy & Format JSON"
                    formatJSON={true}
                    onCopy={handleCopySuccess}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Raw JSON String</h4>
                  <CopyToClipboard
                    text={sampleJSONString}
                    label="Copy Raw JSON"
                    formatJSON={false}
                    onCopy={handleCopySuccess}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-500" />
                  Code Copying
                </CardTitle>
                <CardDescription>
                  Copy code với syntax preservation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">React Component</h4>
                  <CopyCode
                    code={sampleCode}
                    language="React"
                    onCopy={handleCopySuccess}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Code Preview</h4>
                  <div className="p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto">
                    <pre>{sampleCode}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>JSON Preview</CardTitle>
              <CardDescription>
                JSON object sẽ được format khi copy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-md text-sm font-mono overflow-x-auto">
                <pre>{JSON.stringify(sampleJSONObject, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                Component Props & Usage
              </CardTitle>
              <CardDescription>
                Tài liệu sử dụng và API reference
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Basic Props</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <code className="bg-muted px-2 py-1 rounded">text: string</code>
                    <p>Nội dung cần sao chép (required)</p>
                  </div>
                  <div className="space-y-2">
                    <code className="bg-muted px-2 py-1 rounded">label?: string</code>
                    <p>Text hiển thị trên nút</p>
                  </div>
                  <div className="space-y-2">
                    <code className="bg-muted px-2 py-1 rounded">variant?: ButtonVariant</code>
                    <p>Kiểu nút: default, outline, ghost, etc.</p>
                  </div>
                  <div className="space-y-2">
                    <code className="bg-muted px-2 py-1 rounded">iconOnly?: boolean</code>
                    <p>Chỉ hiển thị icon, không có label</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Advanced Props</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <code className="bg-muted px-2 py-1 rounded">resetDelay?: number</code>
                    <p>Thời gian reset icon (ms), default: 2000</p>
                  </div>
                  <div className="space-y-2">
                    <code className="bg-muted px-2 py-1 rounded">toastPosition?: string</code>
                    <p>Vị trí hiển thị toast notification</p>
                  </div>
                  <div className="space-y-2">
                    <code className="bg-muted px-2 py-1 rounded">showToast?: boolean</code>
                    <p>Hiển thị toast notification, default: true</p>
                  </div>
                  <div className="space-y-2">
                    <code className="bg-muted px-2 py-1 rounded">formatJSON?: boolean</code>
                    <p>Auto-format JSON content khi copy</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Callbacks</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <code className="bg-muted px-2 py-1 rounded">onCopy?: (text: string) =&gt; void</code>
                    <p>Callback khi copy thành công</p>
                  </div>
                  <div className="space-y-2">
                    <code className="bg-muted px-2 py-1 rounded">onError?: (error: Error) =&gt; void</code>
                    <p>Callback khi copy bị lỗi</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Utility Components</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">CopyText</code>
                    <p className="mt-1">Preset component với iconOnly=false</p>
                  </div>
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">CopyIcon</code>
                    <p className="mt-1">Preset component với iconOnly=true</p>
                  </div>
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">CopyJSON</code>
                    <p className="mt-1">Specialized cho JSON data với auto-formatting</p>
                  </div>
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">CopyCode</code>
                    <p className="mt-1">Specialized cho code snippets</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  )
}