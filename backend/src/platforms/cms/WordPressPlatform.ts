import { BasePlatform, PlatformConfig, AuthResult, ValidationResult, PublishResult, ScheduleResult, ContentResult, DeleteResult, PlatformCapabilities } from '../base/BasePlatform'

interface WordPressConfig extends PlatformConfig {
  configuration: {
    siteUrl: string
    authType: 'basic' | 'oauth' | 'application_password'
    username?: string
    password?: string
    applicationPassword?: string
    clientId?: string
    clientSecret?: string
    defaultCategory?: string
    defaultTags?: string[]
    defaultStatus: 'draft' | 'pending' | 'private' | 'publish'
    postFormat?: 'standard' | 'aside' | 'gallery' | 'link' | 'image' | 'quote' | 'status' | 'video' | 'audio' | 'chat'
    allowComments?: boolean
    seoOptimization?: boolean
    featuredImageAutoSet?: boolean
    customFields?: Record<string, any>
  }
}

interface WordPressPost {
  id: number
  date: string
  modified: string
  slug: string
  status: string
  type: string
  link: string
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  author: number
  featured_media: number
  comment_status: string
  categories: number[]
  tags: number[]
}

export class WordPressPlatform extends BasePlatform {
  readonly type = 'wordpress'
  readonly name = 'WordPress'
  readonly capabilities: PlatformCapabilities = {
    supportsScheduling: true,
    supportsImages: true,
    supportsVideos: true,
    supportsHashtags: true, // via tags
    supportsMentions: false,
    supportsThreads: false,
    maxContentLength: 65535, // WordPress post_content limit
    imageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    videoFormats: ['mp4', 'webm', 'ogg', 'mov']
  }

  async authenticate(config: WordPressConfig): Promise<AuthResult> {
    try {
      const authHeader = this.buildAuthHeader(config)
      const apiUrl = this.buildApiUrl(config.configuration.siteUrl)

      const response = await fetch(`${apiUrl}/users/me`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const user = await response.json()
        return {
          success: true,
          message: `Successfully authenticated as: ${user.name} (${user.username})`,
          data: {
            user_id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            roles: user.roles,
            capabilities: user.capabilities
          }
        }
      } else {
        const error = await response.json()
        return {
          success: false,
          message: error.message || 'Authentication failed'
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  async validateConfig(config: WordPressConfig): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields validation
    const requiredFields = ['siteUrl', 'authType', 'defaultStatus']
    errors.push(...this.validateRequired(config.configuration, requiredFields))

    // Site URL validation
    if (config.configuration.siteUrl && !this.validateUrl(config.configuration.siteUrl)) {
      errors.push('Site URL must be a valid URL')
    }

    // Auth type specific validation
    switch (config.configuration.authType) {
      case 'basic':
        if (!config.configuration.username || !config.configuration.password) {
          errors.push('Username and password are required for basic authentication')
        }
        warnings.push('Basic authentication is less secure than application passwords')
        break

      case 'application_password':
        if (!config.configuration.username || !config.configuration.applicationPassword) {
          errors.push('Username and application password are required')
        }
        break

      case 'oauth':
        if (!config.configuration.clientId || !config.configuration.clientSecret) {
          errors.push('Client ID and Client Secret are required for OAuth')
        }
        break
    }

    // Status validation
    const validStatuses = ['draft', 'pending', 'private', 'publish']
    if (!validStatuses.includes(config.configuration.defaultStatus)) {
      errors.push('Default status must be one of: draft, pending, private, publish')
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }

  async testConnection(config: WordPressConfig): Promise<AuthResult> {
    try {
      // First authenticate
      const authResult = await this.authenticate(config)
      if (!authResult.success) {
        return authResult
      }

      // Test posting capabilities
      const authHeader = this.buildAuthHeader(config)
      const apiUrl = this.buildApiUrl(config.configuration.siteUrl)

      // Check if user can create posts
      const postTypesResponse = await fetch(`${apiUrl}/types/post`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      })

      if (postTypesResponse.ok) {
        const postType = await postTypesResponse.json()
        const canPublish = authResult.data?.capabilities?.publish_posts || false

        return {
          success: true,
          message: `Connected successfully. ${canPublish ? 'Can publish posts' : 'Can only create drafts'}`,
          data: {
            ...authResult.data,
            can_publish: canPublish,
            post_type_available: true,
            site_name: postType.name || 'WordPress Site'
          }
        }
      } else {
        return {
          success: false,
          message: 'Connection successful but cannot access post endpoints'
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  async publish(content: string, config: WordPressConfig, options?: any): Promise<PublishResult> {
    try {
      const postData = await this.formatForWordPress(content, config, options)
      const authHeader = this.buildAuthHeader(config)
      const apiUrl = this.buildApiUrl(config.configuration.siteUrl)

      const response = await fetch(`${apiUrl}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        const post: WordPressPost = await response.json()
        
        return {
          success: true,
          platformId: post.id.toString(),
          url: post.link,
          message: `Post ${post.status === 'publish' ? 'published' : 'created'} successfully`,
          metadata: {
            post_id: post.id,
            title: post.title.rendered,
            slug: post.slug,
            status: post.status,
            post_type: post.type,
            categories: post.categories,
            tags: post.tags
          }
        }
      } else {
        const error = await response.json()
        return {
          success: false,
          error: error.message || 'Failed to create post'
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  async scheduleContent(content: string, scheduledTime: Date, config: WordPressConfig, options?: any): Promise<ScheduleResult> {
    try {
      const postData = await this.formatForWordPress(content, config, options)
      
      // Set the scheduled date and status
      postData.date = scheduledTime.toISOString()
      postData.status = 'future'

      const authHeader = this.buildAuthHeader(config)
      const apiUrl = this.buildApiUrl(config.configuration.siteUrl)

      const response = await fetch(`${apiUrl}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        const post: WordPressPost = await response.json()
        
        return {
          success: true,
          scheduleId: post.id.toString(),
          scheduledTime,
          message: `Post scheduled for ${scheduledTime.toLocaleString()}`
        }
      } else {
        const error = await response.json()
        return {
          success: false,
          error: error.message || 'Failed to schedule post'
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  async cancelScheduledContent(scheduleId: string, config: WordPressConfig): Promise<DeleteResult> {
    try {
      const authHeader = this.buildAuthHeader(config)
      const apiUrl = this.buildApiUrl(config.configuration.siteUrl)

      // Change status from 'future' to 'draft'
      const response = await fetch(`${apiUrl}/posts/${scheduleId}`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'draft'
        })
      })

      if (response.ok) {
        return {
          success: true,
          message: 'Scheduled post converted to draft'
        }
      } else {
        const error = await response.json()
        return {
          success: false,
          error: error.message || 'Failed to cancel scheduled post'
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  async getPublishedContent(platformId: string, config: WordPressConfig): Promise<ContentResult> {
    try {
      const authHeader = this.buildAuthHeader(config)
      const apiUrl = this.buildApiUrl(config.configuration.siteUrl)

      const response = await fetch(`${apiUrl}/posts/${platformId}`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const post: WordPressPost = await response.json()
        
        return {
          success: true,
          content: post,
          metrics: {
            status: post.status,
            published_date: post.date,
            modified_date: post.modified,
            url: post.link,
            comment_status: post.comment_status
          }
        }
      } else {
        const error = await response.json()
        return {
          success: false,
          error: error.message || 'Failed to get post'
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  async deleteContent(platformId: string, config: WordPressConfig): Promise<DeleteResult> {
    try {
      const authHeader = this.buildAuthHeader(config)
      const apiUrl = this.buildApiUrl(config.configuration.siteUrl)

      const response = await fetch(`${apiUrl}/posts/${platformId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        params: {
          force: 'true' // Permanently delete instead of moving to trash
        }
      })

      if (response.ok) {
        return {
          success: true,
          message: 'Post deleted successfully'
        }
      } else {
        const error = await response.json()
        return {
          success: false,
          error: error.message || 'Failed to delete post'
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  async updateContent(platformId: string, newContent: string, config: WordPressConfig): Promise<PublishResult> {
    try {
      const postData = await this.formatForWordPress(newContent, config)
      const authHeader = this.buildAuthHeader(config)
      const apiUrl = this.buildApiUrl(config.configuration.siteUrl)

      const response = await fetch(`${apiUrl}/posts/${platformId}`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        const post: WordPressPost = await response.json()
        
        return {
          success: true,
          platformId: post.id.toString(),
          url: post.link,
          message: 'Post updated successfully',
          metadata: {
            post_id: post.id,
            modified_date: post.modified,
            status: post.status
          }
        }
      } else {
        const error = await response.json()
        return {
          success: false,
          error: error.message || 'Failed to update post'
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  // Platform-specific helper methods
  private buildAuthHeader(config: WordPressConfig): string {
    switch (config.configuration.authType) {
      case 'basic':
        const basicAuth = Buffer.from(`${config.configuration.username}:${config.configuration.password}`).toString('base64')
        return `Basic ${basicAuth}`

      case 'application_password':
        const appAuth = Buffer.from(`${config.configuration.username}:${config.configuration.applicationPassword}`).toString('base64')
        return `Basic ${appAuth}`

      case 'oauth':
        // In a real implementation, this would handle OAuth tokens
        const token = config.credentials?.accessToken || 'oauth_token'
        return `Bearer ${token}`

      default:
        throw new Error('Invalid authentication type')
    }
  }

  private buildApiUrl(siteUrl: string): string {
    const cleanUrl = siteUrl.replace(/\/$/, '') // Remove trailing slash
    return `${cleanUrl}/wp-json/wp/v2`
  }

  private async formatForWordPress(content: string, config: WordPressConfig, options?: any): Promise<any> {
    const title = this.extractTitle(content)
    const bodyContent = this.extractBodyContent(content)
    const tags = this.extractTags(content, config)

    const postData: any = {
      title: title,
      content: this.formatContent(bodyContent),
      status: options?.status || config.configuration.defaultStatus,
      format: config.configuration.postFormat || 'standard',
      comment_status: config.configuration.allowComments ? 'open' : 'closed',
      ping_status: 'closed'
    }

    // Set categories
    if (config.configuration.defaultCategory) {
      const categoryId = await this.getCategoryId(config.configuration.defaultCategory, config)
      if (categoryId) {
        postData.categories = [categoryId]
      }
    }

    // Set tags
    if (tags.length > 0) {
      const tagIds = await this.getTagIds(tags, config)
      if (tagIds.length > 0) {
        postData.tags = tagIds
      }
    }

    // Set custom fields
    if (config.configuration.customFields) {
      postData.meta = config.configuration.customFields
    }

    // SEO optimization
    if (config.configuration.seoOptimization) {
      postData.excerpt = this.generateExcerpt(bodyContent)
    }

    return postData
  }

  private extractTitle(content: string): string {
    const lines = content.split('\n')
    const firstLine = lines[0].trim()
    
    // Remove markdown header syntax
    return firstLine.replace(/^#+\s*/, '').trim() || 'Untitled Post'
  }

  private extractBodyContent(content: string): string {
    const lines = content.split('\n')
    return lines.slice(1).join('\n').trim()
  }

  private extractTags(content: string, config: WordPressConfig): string[] {
    const hashtags = this.extractHashtags(content)
    const defaultTags = config.configuration.defaultTags || []
    
    return [...new Set([...hashtags, ...defaultTags])]
  }

  private formatContent(content: string): string {
    // Convert markdown-like syntax to WordPress content
    return content
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p>\n<p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p><h([1-6])>/g, '<h$1>')
      .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
  }

  private generateExcerpt(content: string): string {
    const plainText = content.replace(/<[^>]*>/g, '').replace(/\n/g, ' ')
    return plainText.substring(0, 155) + (plainText.length > 155 ? '...' : '')
  }

  private async getCategoryId(categoryName: string, config: WordPressConfig): Promise<number | null> {
    try {
      const authHeader = this.buildAuthHeader(config)
      const apiUrl = this.buildApiUrl(config.configuration.siteUrl)

      const response = await fetch(`${apiUrl}/categories?search=${encodeURIComponent(categoryName)}`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const categories = await response.json()
        return categories.length > 0 ? categories[0].id : null
      }
    } catch (error) {
      console.error('Error getting category ID:', error)
    }
    return null
  }

  private async getTagIds(tagNames: string[], config: WordPressConfig): Promise<number[]> {
    const tagIds: number[] = []
    
    try {
      const authHeader = this.buildAuthHeader(config)
      const apiUrl = this.buildApiUrl(config.configuration.siteUrl)

      for (const tagName of tagNames) {
        const response = await fetch(`${apiUrl}/tags?search=${encodeURIComponent(tagName)}`, {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const tags = await response.json()
          if (tags.length > 0) {
            tagIds.push(tags[0].id)
          } else {
            // Create new tag if it doesn't exist
            const createResponse = await fetch(`${apiUrl}/tags`, {
              method: 'POST',
              headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ name: tagName })
            })

            if (createResponse.ok) {
              const newTag = await createResponse.json()
              tagIds.push(newTag.id)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error getting tag IDs:', error)
    }

    return tagIds
  }
}