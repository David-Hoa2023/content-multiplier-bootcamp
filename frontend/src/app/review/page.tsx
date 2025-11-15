'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, ArrowRight, Send, MessageSquare, Loader2, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DraftEditor } from '@/components/ui/draft-editor'import { API_URL } from '@/lib/api-config';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// API_URL imported from @/lib/api-config

interface ContentPack {
  pack_id: string
  brief_id: string
  draft_content: string
  word_count: number
  status: string
  brief_title: string | null
  created_at: string
  updated_at: string
}

interface Comment {
  comment_id: string
  pack_id: string
  comment_text: string
  author: string
  status: string
  created_at: string
  updated_at: string
}

export default function ReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [packs, setPacks] = useState<ContentPack[]>([])
  const [selectedPackId, setSelectedPackId] = useState<string>('')
  const [selectedPack, setSelectedPack] = useState<ContentPack | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPack, setLoadingPack] = useState(false)
  const [savingComment, setSavingComment] = useState(false)
  const [sendingBack, setSendingBack] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('Reviewer')

  useEffect(() => {
    fetchPacks()
    
    // Check if pack_id is in URL params
    const packIdFromUrl = searchParams.get('pack_id')
    if (packIdFromUrl) {
      setSelectedPackId(packIdFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    if (selectedPackId) {
      fetchPack(selectedPackId)
      fetchComments(selectedPackId)
    } else {
      setSelectedPack(null)
      setComments([])
    }
  }, [selectedPackId])

  const fetchPacks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/packs/review`)
      const result = await response.json()

      if (result.success) {
        setPacks(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch packs')
      }
    } catch (error) {
      console.error('Error fetching packs:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách content packs',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPack = async (packId: string) => {
    try {
      setLoadingPack(true)
      const response = await fetch(`${API_URL}/api/packs/${packId}`)
      const result = await response.json()

      if (result.success) {
        setSelectedPack(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch pack')
      }
    } catch (error) {
      console.error('Error fetching pack:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải content pack',
        variant: 'destructive',
      })
    } finally {
      setLoadingPack(false)
    }
  }

  const fetchComments = async (packId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/packs/${packId}/comments`)
      const result = await response.json()

      if (result.success) {
        setComments(result.data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleAddComment = async () => {
    if (!selectedPackId || !commentText.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập nội dung comment',
        variant: 'destructive',
      })
      return
    }

    try {
      setSavingComment(true)
      const response = await fetch(`${API_URL}/api/packs/${selectedPackId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_text: commentText,
          author: commentAuthor,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCommentText('')
        fetchComments(selectedPackId)
        toast({
          title: 'Thành công',
          description: 'Đã thêm comment thành công',
        })
      } else {
        throw new Error(result.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể thêm comment',
        variant: 'destructive',
      })
    } finally {
      setSavingComment(false)
    }
  }

  const handleSendBackToEdit = async () => {
    if (!selectedPackId) return

    try {
      setSendingBack(true)
      const response = await fetch(`${API_URL}/api/packs/${selectedPackId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'draft',
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Thành công',
          description: 'Đã gửi lại bước chỉnh sửa với comments',
        })
        // Refresh packs list
        fetchPacks()
        // Clear selection
        setSelectedPackId('')
      } else {
        throw new Error(result.error || 'Failed to send back')
      }
    } catch (error) {
      console.error('Error sending back:', error)
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể gửi lại',
        variant: 'destructive',
      })
    } finally {
      setSendingBack(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedPackId) return

    try {
      setSendingBack(true)
      const response = await fetch(`${API_URL}/api/packs/${selectedPackId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Thành công',
          description: 'Đã duyệt content pack',
        })
        // Navigate to derivatives page with the pack_id
        router.push(`/derivatives?pack_id=${selectedPackId}`)
      } else {
        throw new Error(result.error || 'Failed to approve')
      }
    } catch (error) {
      console.error('Error approving:', error)
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể duyệt',
        variant: 'destructive',
      })
    } finally {
      setSendingBack(false)
    }
  }

  if (loading) {
    return (
      <AppLayout
        pageTitle="Duyệt nội dung"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Duyệt' },
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      pageTitle="Duyệt nội dung"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Duyệt' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Duyệt nội dung</h1>
          <p className="text-muted-foreground">
            Xem và duyệt các content packs đã hoàn thành từ bước chỉnh sửa
          </p>
        </div>

        {/* Pack Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Chọn Content Pack để duyệt
            </CardTitle>
            <CardDescription>
              Chọn một content pack để xem và thêm comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="pack-select">Content Pack</Label>
              <Select value={selectedPackId} onValueChange={setSelectedPackId}>
                <SelectTrigger id="pack-select">
                  <SelectValue placeholder="Chọn content pack để duyệt" />
                </SelectTrigger>
                <SelectContent>
                  {packs.length === 0 ? (
                    <SelectItem value="no-packs" disabled>
                      Không có content pack nào chờ duyệt
                    </SelectItem>
                  ) : (
                    packs.map((pack) => (
                      <SelectItem key={pack.pack_id} value={pack.pack_id}>
                        {pack.brief_title || `Pack ${pack.pack_id.slice(0, 8)}`}
                        {' '}
                        <Badge variant="outline" className="ml-2">
                          {pack.status}
                        </Badge>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {packs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Chưa có content pack nào chờ duyệt. Hãy tạo và chỉnh sửa content pack trước.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pack Info */}
        {selectedPack && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin pack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Pack ID:</span>
                  <p className="font-mono text-xs">{selectedPack.pack_id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Số từ:</span>
                  <p className="font-semibold">{selectedPack.word_count}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <Badge>{selectedPack.status}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Cập nhật:</span>
                  <p className="text-sm">
                    {new Date(selectedPack.updated_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Draft Content */}
        {loadingPack ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ) : selectedPack ? (
          <Card>
            <CardHeader>
              <CardTitle>Nội dung draft</CardTitle>
              <CardDescription>
                Nội dung đã được chỉnh sửa từ bước trước
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DraftEditor
                content={selectedPack.draft_content || 'Không có nội dung'}
                isStreaming={false}
                title=""
              />
            </CardContent>
          </Card>
        ) : null}

        {/* Comments Section */}
        {selectedPack && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments
              </CardTitle>
              <CardDescription>
                Thêm comments để gửi feedback về bước chỉnh sửa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Comments */}
              {comments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Comments hiện có:</h4>
                  {comments.map((comment) => (
                    <div
                      key={comment.comment_id}
                      className="p-3 border rounded-lg bg-muted/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.author}</span>
                          <Badge variant="outline" className="text-xs">
                            {comment.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {comment.comment_text}
                      </p>
                    </div>
                  ))}
                  <Separator />
                </div>
              )}

              {/* Add Comment Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comment-author">Người gửi</Label>
                  <Input
                    id="comment-author"
                    type="text"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    placeholder="Tên người review"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment-text">Comment</Label>
                  <Textarea
                    id="comment-text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Nhập comment để gửi feedback về bước chỉnh sửa..."
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleAddComment}
                  disabled={savingComment || !commentText.trim()}
                  className="flex items-center gap-2"
                >
                  {savingComment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      Thêm Comment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {selectedPack && (
          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
              <CardDescription>
                Gửi feedback về bước chỉnh sửa hoặc duyệt nội dung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  onClick={handleSendBackToEdit}
                  disabled={sendingBack}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {sendingBack ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Gửi lại bước chỉnh sửa
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={sendingBack}
                  className="flex items-center gap-2"
                >
                  {sendingBack ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang duyệt...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Duyệt
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                "Gửi lại bước chỉnh sửa" sẽ chuyển pack về trạng thái draft và gửi kèm các comments để editor có thể xem và chỉnh sửa lại.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

