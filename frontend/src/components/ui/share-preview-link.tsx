'use client'

import * as React from 'react'
import { Share2, Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export interface SharePreviewLinkProps {
  packId: string
  previewUrl?: string
  expiresIn?: number // days
  className?: string
  onGenerateLink?: (packId: string) => Promise<string>
  onCopyLink?: (link: string) => void
}

export function SharePreviewLink({
  packId,
  previewUrl,
  expiresIn = 7,
  className,
  onGenerateLink,
  onCopyLink
}: SharePreviewLinkProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [shareLink, setShareLink] = React.useState<string>(previewUrl || '')
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (previewUrl) {
      setShareLink(previewUrl)
    }
  }, [previewUrl])

  const generateShareLink = async () => {
    if (!packId) return

    setIsGenerating(true)
    try {
      let link = shareLink

      if (onGenerateLink) {
        link = await onGenerateLink(packId)
      } else {
        // Default: generate a share link
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const token = btoa(`${packId}-${Date.now()}-${Math.random()}`).replace(/[+/=]/g, '')
        link = `${baseUrl}/preview/${packId}?token=${token}`
      }

      setShareLink(link)
      
      toast({
        title: "Link đã được tạo",
        description: "Link share đã sẵn sàng để chia sẻ với team.",
      })
    } catch (error) {
      console.error('Generate share link error:', error)
      toast({
        title: "Lỗi tạo link",
        description: "Không thể tạo share link. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareLink) {
      toast({
        title: "Chưa có link",
        description: "Vui lòng tạo link trước khi copy.",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      
      toast({
        title: "Đã copy",
        description: "Link đã được copy vào clipboard.",
      })

      onCopyLink?.(shareLink)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Copy error:', error)
      toast({
        title: "Lỗi copy",
        description: "Không thể copy link. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleOpenLink = () => {
    if (shareLink) {
      window.open(shareLink, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
        >
          <Share2 className="h-4 w-4" />
          Share Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chia sẻ Preview</DialogTitle>
          <DialogDescription>
            Tạo link để chia sẻ preview với team. Link sẽ hết hạn sau {expiresIn} ngày.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-link">Share Link</Label>
            <div className="flex gap-2">
              <Input
                id="share-link"
                value={shareLink}
                readOnly
                placeholder="Click Generate để tạo link"
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                disabled={!shareLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {shareLink && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Check className="h-3 w-3" />
                Link đã sẵn sàng
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenLink}
                className="gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Mở link
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Đóng
            </Button>
            <Button
              onClick={generateShareLink}
              disabled={isGenerating}
            >
              {isGenerating ? 'Đang tạo...' : shareLink ? 'Tạo lại' : 'Generate Link'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



