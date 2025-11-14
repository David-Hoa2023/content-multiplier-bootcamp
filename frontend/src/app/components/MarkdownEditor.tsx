'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { useState, useEffect, useRef, useCallback } from 'react'
import '@uiw/react-md-editor/markdown-editor.css'
import { Image as ImageIcon, Link as LinkIcon, Upload, Eye } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Dynamically import to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

const API_URL = 'http://localhost:4000'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  height?: number
  additionalButtons?: React.ReactNode
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '',
  className = '',
  height = 300,
  additionalButtons,
}: MarkdownEditorProps) {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [commandsModule, setCommandsModule] = useState<any>(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')

  // Load commands module
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@uiw/react-md-editor').then((mod) => {
        setCommandsModule(mod)
      })
    }
  }, [])

  useEffect(() => {
    // Sync with system preference, default to light
    const updateColorMode = () => {
      const htmlEl = document.documentElement
      const hasDarkClass = htmlEl.classList.contains('dark')
      
      if (hasDarkClass) {
        setColorMode('dark')
      } else {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        setColorMode(mediaQuery.matches ? 'dark' : 'light')
      }
    }

    // Initial check
    updateColorMode()

    // Watch for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleMediaChange = () => {
      if (!document.documentElement.classList.contains('dark')) {
        setColorMode(mediaQuery.matches ? 'dark' : 'light')
      }
    }
    
    mediaQuery.addEventListener('change', handleMediaChange)

    // Watch for class changes on html element (for app theme changes)
    const htmlEl = document.documentElement
    const observer = new MutationObserver(() => {
      updateColorMode()
    })
    
    observer.observe(htmlEl, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange)
      observer.disconnect()
    }
  }, [])

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_URL}/api/images/upload`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // Insert image markdown at cursor position
        const imageMarkdown = `![${file.name}](${API_URL}${result.data.url})\n\n`
        
        // Try to get cursor position from the editor
        const textarea = document.querySelector('.w-md-editor-text-input') as HTMLTextAreaElement
        if (textarea) {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const newValue = value.slice(0, start) + imageMarkdown + value.slice(end)
          onChange(newValue)
          
          // Set cursor position after inserted image
          setTimeout(() => {
            if (textarea) {
              const newPos = start + imageMarkdown.length
              textarea.setSelectionRange(newPos, newPos)
              textarea.focus()
            }
          }, 0)
        } else {
          // Fallback: insert at end
          onChange(value + imageMarkdown)
        }
      } else {
        alert(result.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
      // Close dialog after upload completes
      setImageDialogOpen(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openImageDialog = useCallback(() => {
    setImageDialogOpen(true)
  }, [])

  const openFileDialog = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const insertImageFromUrl = useCallback(() => {
    if (!imageUrl.trim()) {
      alert('Please enter an image URL')
      return
    }

    const altText = imageAlt.trim() || 'Image'
    const imageMarkdown = `![${altText}](${imageUrl})\n\n`
    
    // Try to get cursor position from the editor
    const textarea = document.querySelector('.w-md-editor-text-input') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.slice(0, start) + imageMarkdown + value.slice(end)
      onChange(newValue)
      
      // Set cursor position after inserted image
      setTimeout(() => {
        if (textarea) {
          const newPos = start + imageMarkdown.length
          textarea.setSelectionRange(newPos, newPos)
          textarea.focus()
        }
      }, 0)
    } else {
      // Fallback: insert at end
      onChange(value + imageMarkdown)
    }

    // Reset and close dialog
    setImageUrl('')
    setImageAlt('')
    setImageDialogOpen(false)
  }, [imageUrl, imageAlt, value, onChange])

  // Custom image command that replaces the default one - supports both URL and file upload
  const imageCommand = commandsModule?.commands ? {
    name: 'image',
    keyCommand: 'image',
    buttonProps: { 
      'aria-label': 'Insert image (URL or upload)', 
      title: 'Insert image'
    },
    icon: (
      <span style={{ padding: '0 4px', display: 'flex', alignItems: 'center' }}>
        <ImageIcon size={16} />
      </span>
    ),
    execute: (state: any, api: any) => {
      openImageDialog()
    },
  } : null

  // Get commands - replace default image command with our custom one
  const editorCommands = commandsModule?.commands && imageCommand
    ? commandsModule.commands.getCommands().map((cmd: any) => 
        cmd.name === 'image' ? imageCommand : cmd
      )
    : undefined

  const editorExtraCommands = commandsModule?.commands
    ? commandsModule.commands.getExtraCommands()
    : undefined

  return (
    <div className={className} data-color-mode={colorMode}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      {/* Preview button and additional buttons */}
      <div className="mb-2 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPreviewDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Eye size={16} />
          Preview Draft
        </Button>
        {additionalButtons}
      </div>

      {/* Preview dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Draft Preview</DialogTitle>
            <DialogDescription>
              Preview of your draft content with images
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                // Custom rendering for images - handle relative URLs
                img: ({ src, alt, ...props }) => {
                  // If src is a relative URL starting with /uploads, prepend API_URL
                  const imageSrc = src?.startsWith('/uploads') 
                    ? `${API_URL}${src}` 
                    : src
                  
                  return (
                    <img
                      src={imageSrc}
                      alt={alt}
                      className="max-w-full h-auto rounded-lg my-4 border border-border"
                      onError={(e) => {
                        // Handle broken images
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                      {...props}
                    />
                  )
                },
                // Custom rendering for headings
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold mt-6 mb-4 text-foreground">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold mt-5 mb-3 text-foreground">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold mt-4 mb-2 text-foreground">{children}</h3>
                ),
                // Custom rendering for paragraphs
                p: ({ children }) => (
                  <p className="mb-4 text-foreground leading-relaxed">{children}</p>
                ),
                // Custom rendering for code blocks
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '')
                  const isInline = !match
                  
                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded-sm bg-muted font-mono text-sm text-foreground" {...props}>
                        {children}
                      </code>
                    )
                  }
                  
                  return (
                    <pre className="mb-4 p-4 rounded-lg bg-muted overflow-x-auto">
                      <code className="font-mono text-sm text-foreground" {...props}>
                        {children}
                      </code>
                    </pre>
                  )
                },
                // Custom rendering for blockquotes
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/50 pl-4 my-4 italic text-foreground/80">
                    {children}
                  </blockquote>
                ),
                // Custom rendering for lists
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 text-foreground">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="ml-4 text-foreground">{children}</li>
                ),
                // Custom rendering for links
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {children}
                  </a>
                ),
                // Custom rendering for strong/bold text
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                // Custom rendering for emphasis/italic text
                em: ({ children }) => (
                  <em className="italic">{children}</em>
                ),
              }}
            >
              {value || '*No content to preview*'}
            </ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>
              Add an image by URL or upload from your computer
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="flex items-center gap-2">
                <LinkIcon size={16} />
                From URL
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload size={16} />
                Upload File
              </TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-alt">Alt Text (optional)</Label>
                <Input
                  id="image-alt"
                  placeholder="Description of the image"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>
              <Button onClick={insertImageFromUrl} className="w-full">
                Insert Image
              </Button>
            </TabsContent>
            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Select Image File</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={openFileDialog}
                  disabled={isUploading}
                  className="w-full flex items-center gap-2"
                >
                  <Upload size={16} />
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Supported formats: JPG, PNG, GIF, WebP, SVG
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <MDEditor
        value={value}
        onChange={(val) => {
          console.log('📝 MDEditor onChange triggered, value:', val?.substring(0, 50))
          onChange(val || '')
        }}
        preview="edit"
        hideToolbar={false}
        visibleDragbar={false}
        height={height}
        commands={editorCommands}
        extraCommands={editorExtraCommands}
      />
      {isUploading && (
        <div className="mt-2 text-sm text-muted-foreground">
          Uploading image...
        </div>
      )}
    </div>
  )
}

