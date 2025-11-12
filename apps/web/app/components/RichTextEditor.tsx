'use client'
import { useState, useRef, useEffect } from 'react'

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    packId?: string
}

// Simple image upload to base64 (for demo - in production use S3/Cloudinary)
const uploadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Check file size (limit to 5MB for base64)
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error('File too large (max 5MB)'))
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            try {
                const result = reader.result as string
                if (result && result.startsWith('data:')) {
                    console.log('Image processed:', file.name, 'size:', result.length)
                    resolve(result)
                } else {
                    reject(new Error('Invalid file format'))
                }
            } catch (err) {
                reject(new Error('Failed to process image'))
            }
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

export default function RichTextEditor({ value, onChange, placeholder, packId }: RichTextEditorProps) {
    const [showPreview, setShowPreview] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadedImages, setUploadedImages] = useState<{ [filename: string]: string }>({})
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Debug: Log when component mounts or value changes
    useEffect(() => {
        console.log('RichTextEditor mounted/updated with value length:', value?.length || 0)
        if (value && value.includes('data:image')) {
            console.log('Value contains base64 images!')
        }
    }, [])

    // Extract base64 images from markdown content and restore them to uploadedImages state
    useEffect(() => {
        if (value) {
            console.log('RichTextEditor value changed, checking for images...')
            console.log('Value length:', value.length)
            console.log('Value preview:', value.substring(0, 200) + '...')

            // More robust regex to match base64 images
            const imageMatches = value.match(/!\[([^\]]*)\]\((data:image\/[^;]+;base64,[^)]+)\)/g)
            console.log('Found image matches:', imageMatches?.length || 0)

            if (imageMatches && imageMatches.length > 0) {
                const extractedImages: { [filename: string]: string } = {}
                imageMatches.forEach(match => {
                    const matchResult = match.match(/!\[([^\]]*)\]\((data:image\/[^;]+;base64,[^)]+)\)/)
                    if (matchResult) {
                        const [, filename, base64] = matchResult
                        if (filename && base64) {
                            extractedImages[filename] = base64
                            console.log('Extracted image:', filename, 'base64 length:', base64.length)
                        }
                    }
                })

                if (Object.keys(extractedImages).length > 0) {
                    console.log('Restoring images from markdown:', Object.keys(extractedImages))
                    setUploadedImages(extractedImages)
                } else {
                    console.log('No valid images extracted')
                }
            } else {
                console.log('No base64 images found in markdown')
            }
        }
    }, [value])

    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

        onChange(newText)

        // Restore cursor position
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + before.length, end + before.length)
        }, 0)
    }

    const insertImage = (base64: string, filename: string) => {
        console.log('Inserting image:', filename, 'base64 length:', base64.length)
        // Store the base64 for any preview logic
        setUploadedImages(prev => ({ ...prev, [filename]: base64 }))

        // Insert full base64 markdown so it persists after save
        const imageMarkdown = `![${filename}](${base64})`
        console.log('Image markdown to insert:', imageMarkdown.substring(0, 100) + '...')
        insertMarkdown(imageMarkdown, '')
    }

    // Helper function to get base64 data for an image filename
    const getImageBase64 = (filename: string): string | null => {
        return uploadedImages[filename] || null
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            // Convert to base64 for preview (but don't insert into editor)
            const base64 = await uploadImage(file)
            console.log('Image processed:', file.name, 'size:', base64.length)

            // Insert placeholder in editor, store base64 for preview
            insertImage(base64, file.name)

            // Store the actual base64 data for preview rendering
            // In a real app, you'd upload this to a server and get back a URL
            const imageData = { filename: file.name, base64, uploadedAt: Date.now() }
            console.log('Image data stored for preview')
        } catch (err) {
            console.error('Image upload failed:', err)
            alert('Image upload failed: ' + (err as Error).message)
        }
        setUploading(false)
    }

    const insertTable = () => {
        const table = '\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n'
        insertMarkdown(table, '')
    }

    const insertYouTube = () => {
        const url = prompt('Enter YouTube URL:')
        if (url) {
            const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
            if (videoId) {
                insertMarkdown(`\n<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>\n`, '')
            } else {
                alert('Invalid YouTube URL')
            }
        }
    }

    const insertTwitter = () => {
        const url = prompt('Enter Twitter/X post URL:')
        if (url) {
            insertMarkdown(`\n[Twitter Post](${url})\n`, '')
        }
    }

    const exportToPDF = async () => {
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF()

        // Simple text export (in production, use proper HTML to PDF conversion)
        const lines = doc.splitTextToSize(value, 180)
        doc.text(lines, 15, 15)
        doc.save(`draft-${packId || 'content'}.pdf`)
    }

    const exportToWord = () => {
        // Simple DOCX export using HTML
        const blob = new Blob(
            [`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${renderPreviewHTML()}</body></html>`],
            { type: 'application/msword' }
        )
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `draft-${packId || 'content'}.doc`
        a.click()
        URL.revokeObjectURL(url)
    }

    const formatButton = (label: string, onClick: () => void, title?: string) => (
        <button
            type="button"
            onClick={onClick}
            disabled={uploading}
            style={{
                padding: '0.5rem',
                margin: '0.25rem',
                border: '1px solid #ddd',
                background: '#f5f5f5',
                cursor: uploading ? 'wait' : 'pointer',
                borderRadius: '4px',
                fontSize: '12px'
            }}
            title={title || label}
        >
            {label}
        </button>
    )

    const renderPreviewHTML = () => {
        // Enhanced markdown-to-HTML conversion (ES2020 compatible)
        let html = value
        console.log('renderPreviewHTML - value length:', value.length)
        console.log('renderPreviewHTML - uploadedImages:', Object.keys(uploadedImages))

        // Convert image placeholders back to markdown for preview
        html = html.replace(/\[Image: ([^\]]+)\]/g, (match, filename) => {
            // Look up the stored base64 data
            const base64 = getImageBase64(filename)
            if (base64) {
                return `![${filename}](${base64})`
            } else {
                // Fallback to placeholder if image data not found
                return `![${filename}](https://via.placeholder.com/400x300?text=${encodeURIComponent(filename)})`
            }
        })

        // Debug: Check if we have image markdown
        const hasImageMarkdown = /!\[.*?\]\(.*?\)/.test(html)
        if (hasImageMarkdown) {
            console.log('Found image markdown in preview')
            // Log all image matches for debugging
            const imageMatches = html.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || []
            imageMatches.forEach(match => console.log('Image match:', match))
        }

        // Apply markdown transformations to html
        html = html
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background: #f5f5f5; padding: 1rem; overflow-x: auto;"><code>$2</code></pre>')
            .replace(/`(.*?)`/g, '<code style="background: #f5f5f5; padding: 0.2rem 0.4rem;">$1</code>')
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold/Italic
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Tables
            .replace(/\n\|(.*)\|\n\|([-| ]+)\|\n((?:\|.*\|\n?)*)/g, (match, header, sep, rows) => {
                const headers = header.split('|').map((h: string) => `<th>${h.trim()}</th>`).join('')
                const rowsHtml = rows.trim().split('\n').map((row: string) => {
                    const cells = row.split('|').filter((c: string) => c).map((c: string) => `<td>${c.trim()}</td>`).join('')
                    return `<tr>${cells}</tr>`
                }).join('')
                return `<table style="border-collapse: collapse; width: 100%; margin: 1rem 0;"><thead><tr>${headers}</tr></thead><tbody>${rowsHtml}</tbody></table>`
            })
            // Images - handle base64 and regular URLs (more robust matching)
            .replace(/!\[([^\]]*)\]\((data:image\/[^;]+;base64,([^)]+))\)/g, (match, alt, fullSrc, base64Data) => {
                console.log('Rendering base64 image:', alt, 'length:', base64Data.length, 'fullSrc length:', fullSrc.length)
                // Check if we have this image in our stored images (for better performance)
                const storedBase64 = getImageBase64(alt)
                const srcToUse = storedBase64 || fullSrc
                return `<img src="${srcToUse}" alt="${alt}" style="max-width: 100%; height: auto;" />`
            })
            .replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
            // Links
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #007bff;">$1</a>')
            // Lists
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul style="margin: 1rem 0;">$1</ul>')
            // Preserve HTML (for embeds)
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br/>')

        html = '<div style="font-family: Georgia, serif; line-height: 1.6;"><p>' + html + '</p></div>'

        // Add table styling
        html = html.replace(/<table/g, '<table style="border: 1px solid #ddd;"')
        html = html.replace(/<th/g, '<th style="border: 1px solid #ddd; padding: 0.5rem; background: #f5f5f5;"')
        html = html.replace(/<td/g, '<td style="border: 1px solid #ddd; padding: 0.5rem;"')

        return html
    }

    const renderPreview = () => {
        return <div dangerouslySetInnerHTML={{ __html: renderPreviewHTML() }} />
    }

    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
            {/* Toolbar */}
            <div style={{
                padding: '0.5rem',
                background: '#f9f9f9',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.25rem',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {formatButton('Bold', () => insertMarkdown('**', '**'), 'Bold text')}
                    {formatButton('Italic', () => insertMarkdown('*', '*'), 'Italic text')}
                    {formatButton('H1', () => insertMarkdown('# ', ''), 'Heading 1')}
                    {formatButton('H2', () => insertMarkdown('## ', ''), 'Heading 2')}
                    {formatButton('H3', () => insertMarkdown('### ', ''), 'Heading 3')}
                    {formatButton('Link', () => insertMarkdown('[', '](url)'), 'Insert link')}
                    {formatButton('Code', () => insertMarkdown('`', '`'), 'Inline code')}
                    {formatButton('Code Block', () => insertMarkdown('\n```\n', '\n```\n'), 'Code block')}
                    {formatButton('List', () => insertMarkdown('- ', ''), 'Bullet list')}
                    {formatButton('Table', insertTable, 'Insert table')}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                    {formatButton(uploading ? 'Uploading...' : '📷 Image', () => fileInputRef.current?.click(), 'Upload image')}

                    {formatButton('🎥 YouTube', insertYouTube, 'Embed YouTube video')}
                    {formatButton('🐦 Twitter', insertTwitter, 'Insert Twitter link')}
                    {formatButton('🔍 Debug', () => {
                        console.log('Manual debug - value:', value.substring(0, 200))
                        console.log('Manual debug - uploadedImages:', Object.keys(uploadedImages))
                        console.log('Manual debug - has base64:', /data:image/.test(value))
                    }, 'Debug image state')}
                </div>

                <div style={{ flex: 1 }} />

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {formatButton('📄 PDF', exportToPDF, 'Export to PDF')}
                    {formatButton('📝 Word', exportToWord, 'Export to Word')}

                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #007bff',
                            background: showPreview ? '#007bff' : 'white',
                            color: showPreview ? 'white' : '#007bff',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            fontSize: '12px'
                        }}
                    >
                        {showPreview ? '✏️ Edit' : '👁️ Preview'}
                    </button>
                </div>
            </div>

            {/* Editor/Preview */}
            <div style={{ minHeight: '400px' }}>
                {showPreview ? (
                    <div style={{
                        padding: '2rem',
                        minHeight: '400px',
                        background: 'white',
                        maxWidth: '800px',
                        margin: '0 auto'
                    }}>
                        {renderPreview()}
                    </div>
                ) : (
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder || 'Write your content in Markdown...'}
                        style={{
                            width: '100%',
                            minHeight: '400px',
                            padding: '1.5rem',
                            border: 'none',
                            fontFamily: 'ui-monospace, monospace',
                            fontSize: '14px',
                            lineHeight: '1.8',
                            resize: 'vertical',
                            outline: 'none'
                        }}
                    />
                )}
            </div>

            {/* Status bar */}
            <div style={{
                padding: '0.5rem 1rem',
                background: '#f9f9f9',
                borderTop: '1px solid #ddd',
                fontSize: '12px',
                color: '#666',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <span>{value.split(/\s+/).filter(Boolean).length} words</span>
                <span>{value.length} characters</span>
            </div>
        </div>
    )
}

