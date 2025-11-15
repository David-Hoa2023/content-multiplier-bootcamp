// Base Platform Interface
export interface PlatformConfig {
  id?: number
  platform_type: string
  platform_name: string
  configuration: Record<string, any>
  credentials?: Record<string, any>
  is_active: boolean
  is_connected?: boolean
  // Platform-specific fields (optional at type-level; validate at runtime)
  pageId?: string            // Facebook
  userId?: string            // Instagram
  organizationId?: string    // LinkedIn
  appId?: string             // TikTok
  advertiserIds?: string[]   // TikTok Ads
  [key: string]: any
}

export interface AuthResult {
  success: boolean
  message?: string
  data?: any
}

export interface ValidationResult {
  valid: boolean
  errors?: string[]
  warnings?: string[]
}

export interface PublishResult {
  success: boolean
  platformId?: string
  url?: string
  message?: string
  error?: string
  metadata?: Record<string, any>
  data?: any  // Allow additional platform-specific data
}

export interface ScheduleResult {
  success: boolean
  scheduleId?: string
  message?: string
  scheduledTime?: Date
  error?: string
  data?: any  // Allow additional platform-specific data
}

export interface ContentResult {
  success: boolean
  content?: any
  metrics?: Record<string, any>
  error?: string
}

export interface DeleteResult {
  success: boolean
  message?: string
  error?: string
}

export interface PlatformCapabilities {
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

// Abstract Base Platform Class
export abstract class BasePlatform {
  abstract readonly type: string
  abstract readonly name: string
  abstract readonly capabilities: PlatformCapabilities

  // Core authentication methods
  abstract authenticate(config: PlatformConfig): Promise<AuthResult>
  abstract validateConfig(config: PlatformConfig): Promise<ValidationResult>
  abstract testConnection(config: PlatformConfig): Promise<AuthResult>

  // Publishing methods
  abstract publish(content: string, config: PlatformConfig, options?: any): Promise<PublishResult>
  abstract scheduleContent(content: string, scheduledTime: Date, config: PlatformConfig, options?: any): Promise<ScheduleResult>
  abstract cancelScheduledContent(scheduleId: string, config: PlatformConfig): Promise<DeleteResult>

  // Content management
  abstract getPublishedContent(platformId: string, config: PlatformConfig): Promise<ContentResult>
  abstract deleteContent(platformId: string, config: PlatformConfig): Promise<DeleteResult>
  abstract updateContent(platformId: string, newContent: string, config: PlatformConfig): Promise<PublishResult>

  // Content formatting (can be overridden)
  formatContent(originalContent: string, config: PlatformConfig): string {
    // Default implementation - platforms can override
    let formattedContent = originalContent

    // Apply character limit if specified
    if (this.capabilities.maxContentLength > 0 && formattedContent.length > this.capabilities.maxContentLength) {
      formattedContent = this.truncateContent(formattedContent, this.capabilities.maxContentLength)
    }

    return formattedContent
  }

  // Helper methods
  protected truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content
    
    // Try to truncate at word boundary
    const truncated = content.substring(0, maxLength - 3)
    const lastSpace = truncated.lastIndexOf(' ')
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...'
    }
    
    return truncated + '...'
  }

  protected extractHashtags(content: string): string[] {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g
    const matches = content.match(hashtagRegex)
    return matches ? matches.map(tag => tag.substring(1)) : []
  }

  protected extractMentions(content: string): string[] {
    const mentionRegex = /@[a-zA-Z0-9_]+/g
    const matches = content.match(mentionRegex)
    return matches ? matches.map(mention => mention.substring(1)) : []
  }

  protected extractUrls(content: string): string[] {
    const urlRegex = /https?:\/\/[^\s]+/g
    const matches = content.match(urlRegex)
    return matches || []
  }

  protected addDefaultHashtags(content: string, defaultHashtags: string[]): string {
    if (!defaultHashtags || defaultHashtags.length === 0) return content

    const existingHashtags = this.extractHashtags(content)
    const newHashtags = defaultHashtags.filter(tag => 
      !existingHashtags.includes(tag.replace('#', ''))
    )

    if (newHashtags.length === 0) return content

    const hashtagString = newHashtags.map(tag => 
      tag.startsWith('#') ? tag : `#${tag}`
    ).join(' ')

    return `${content}\n\n${hashtagString}`
  }

  // Encryption helpers for sensitive data
  protected encryptCredentials(credentials: Record<string, any>): string {
    // In production, use proper encryption
    return Buffer.from(JSON.stringify(credentials)).toString('base64')
  }

  protected decryptCredentials(encryptedCredentials: string): Record<string, any> {
    // In production, use proper decryption
    try {
      return JSON.parse(Buffer.from(encryptedCredentials, 'base64').toString('utf-8'))
    } catch {
      return {}
    }
  }

  // Rate limiting helpers
  protected async handleRateLimit(retryAfter?: number): Promise<void> {
    if (retryAfter) {
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
    }
  }

  // Error handling
  protected handleApiError(error: any): { success: false; error: string } {
    if (error.response?.data?.message) {
      return { success: false, error: error.response.data.message }
    }
    if (error.message) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Unknown platform error occurred' }
  }

  // Validation helpers
  protected validateRequired(config: Record<string, any>, requiredFields: string[]): string[] {
    const errors: string[] = []
    
    for (const field of requiredFields) {
      if (!config[field] || (typeof config[field] === 'string' && config[field].trim() === '')) {
        errors.push(`${field} is required`)
      }
    }
    
    return errors
  }

  protected validateUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}