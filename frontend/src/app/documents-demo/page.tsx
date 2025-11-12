'use client'

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout'
import { 
  DraftEditor, 
  DocumentUpload, 
  DocumentCard, 
  Footnotes 
} from '@/components/ui'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

// Sample data
const sampleCitations = [
  {
    id: '1',
    title: 'The Future of Artificial Intelligence in Business',
    url: 'https://example.com/ai-business-future',
    snippet: 'Artificial intelligence is transforming how businesses operate, from automating routine tasks to providing deep insights through data analysis.',
    retrievedAt: new Date('2024-01-15T10:30:00'),
  },
  {
    id: '2', 
    title: 'Machine Learning Best Practices for Enterprise',
    url: 'https://example.com/ml-enterprise-practices',
    snippet: 'Implementing machine learning in enterprise environments requires careful consideration of data quality, model governance, and scalability.',
    retrievedAt: new Date('2024-01-16T14:20:00'),
  },
  {
    id: '3',
    title: 'Ethical AI Development Guidelines',
    url: 'https://example.com/ethical-ai-guidelines',
    snippet: 'Developing AI systems responsibly involves addressing bias, ensuring transparency, and maintaining human oversight in decision-making processes.',
    retrievedAt: new Date('2024-01-17T09:15:00'),
  },
]

const sampleDocuments = [
  {
    id: '1',
    title: 'AI Strategy Whitepaper 2024',
    url: 'https://example.com/documents/ai-strategy-2024.pdf',
    uploadDate: new Date('2024-01-15T08:30:00'),
    fileType: 'pdf',
    status: 'ready' as const,
  },
  {
    id: '2',
    title: 'Machine Learning Implementation Guide',
    url: 'https://example.com/documents/ml-guide.docx',
    uploadDate: new Date('2024-01-16T10:45:00'),
    fileType: 'docx',
    status: 'processing' as const,
  },
  {
    id: '3',
    title: 'Data Privacy Compliance Checklist',
    url: 'https://example.com/documents/privacy-checklist.pdf',
    uploadDate: new Date('2024-01-17T15:20:00'),
    fileType: 'pdf',
    status: 'error' as const,
  },
]

const sampleContent = `# Tương lai của Trí tuệ Nhân tạo trong Kinh doanh

Trí tuệ nhân tạo (AI) đang thay đổi cách thức hoạt động của các doanh nghiệp trên toàn thế giới [1]. Từ việc tự động hóa các tác vụ thường ngày đến việc cung cấp thông tin chi tiết sâu sắc thông qua phân tích dữ liệu.

## Ứng dụng Thực tế

Các doanh nghiệp hiện đang triển khai AI trong nhiều lĩnh vực khác nhau [2]:

- **Dịch vụ khách hàng**: Chatbots và trợ lý ảo
- **Phân tích dữ liệu**: Dự đoán xu hướng thị trường
- **Tự động hóa quy trình**: Tối ưu hóa chuỗi cung ứng

## Thách thức và Cân nhắc

Việc phát triển AI có trách nhiệm đòi hỏi phải giải quyết các vấn đề về thiên kiến, đảm bảo tính minh bạch và duy trì sự giám sát của con người trong các quá trình ra quyết định [3].

### Khuyến nghị

1. Đầu tư vào đào tạo nhân viên
2. Thiết lập khung quản trị AI rõ ràng  
3. Ưu tiên bảo mật và quyền riêng tư dữ liệu`

export default function DocumentsDemoPage() {
  const [highlightedCitation, setHighlightedCitation] = useState<string | null>(null)
  const [documents, setDocuments] = useState(sampleDocuments)
  const { toast } = useToast()

  const handleUpload = async (file: File) => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newDocument = {
      id: Date.now().toString(),
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      url: `https://example.com/documents/${file.name}`,
      uploadDate: new Date(),
      fileType: file.name.split('.').pop() || 'unknown',
      status: 'ready' as const,
    }
    
    setDocuments(prev => [newDocument, ...prev])
    
    toast({
      title: 'Upload thành công',
      description: `File "${file.name}" đã được upload`,
    })
  }

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
    toast({
      title: 'Đã xóa',
      description: 'Document đã được xóa khỏi hệ thống',
    })
  }

  const handleCitationClick = (citationId: string) => {
    setHighlightedCitation(citationId)
    // Scroll to footnotes section
    document.getElementById('footnotes-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <AppLayout
      pageTitle="Documents Demo"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Documents Demo' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Documents & Citations Demo</h1>
          <p className="text-muted-foreground">
            Demo tính năng quản lý tài liệu và trích dẫn
          </p>
        </div>

        {/* Document Upload */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Document Upload</h2>
          <DocumentUpload 
            onUpload={handleUpload}
            className="w-fit"
          />
        </div>

        {/* Document Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Documents ({documents.length})</h2>
            <Button
              variant="outline"
              onClick={() => setDocuments(sampleDocuments)}
            >
              Reset Demo Data
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={handleDeleteDocument}
                onClick={(doc) => {
                  toast({
                    title: 'Document clicked',
                    description: `Clicked on "${doc.title}"`,
                  })
                }}
              />
            ))}
          </div>
        </div>

        {/* Draft Editor with Citations */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Draft Editor với Citations</h2>
          <DraftEditor
            content={sampleContent}
            isStreaming={false}
            citations={sampleCitations}
            onCitationClick={handleCitationClick}
          />
        </div>

        {/* Footnotes */}
        <div id="footnotes-section" className="space-y-4">
          <h2 className="text-lg font-semibold">Footnotes</h2>
          <Footnotes
            citations={sampleCitations}
            highlightedCitation={highlightedCitation}
          />
        </div>
        
        {/* Clear Highlight Button */}
        {highlightedCitation && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setHighlightedCitation(null)}
            >
              Clear Highlight
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}