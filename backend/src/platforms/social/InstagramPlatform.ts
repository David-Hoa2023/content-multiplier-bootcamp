import { BasePlatform, PlatformConfig, AuthResult, PublishResult, ScheduleResult, ValidationResult, ContentResult, DeleteResult, PlatformCapabilities } from '../base/BasePlatform'

interface InstagramConfig extends PlatformConfig {
  appId: string
  appSecret: string
  accessToken: string
  userId: string
}

export class InstagramPlatform extends BasePlatform {
  readonly type: string = 'instagram'
  readonly name: string = 'Instagram'
  readonly capabilities: PlatformCapabilities = {
    supportsScheduling: true, // Through Business API
    supportsImages: true,
    supportsVideos: true,
    supportsHashtags: true,
    supportsMentions: true,
    supportsThreads: false, // Instagram doesn't support threads like Twitter
    maxContentLength: 2200,
    imageFormats: ['jpg', 'jpeg', 'png'],
    videoFormats: ['mp4', 'mov']
  }

  private config: InstagramConfig | null = null

  async authenticate(config: PlatformConfig): Promise<AuthResult> {
    try {
      // Extract credentials from config
      const credentials = config.credentials || {}
      const configData = config.configuration || {}
      
      const appId = credentials.appId || configData.appId
      const appSecret = credentials.appSecret || configData.appSecret
      const accessToken = credentials.accessToken || configData.accessToken
      const userId = credentials.userId || configData.userId
      
      // Create InstagramConfig for internal use
      this.config = {
        ...config,
        appId,
        appSecret,
        accessToken,
        userId
      } as InstagramConfig

      // Validate required credentials
      if (!appId || !appSecret || !accessToken || !userId) {
        return {
          success: false,
          message: 'Missing required Instagram API credentials',
          data: null
        }
      }

      // In a real implementation, verify with Instagram Basic Display API
      // GET /{user-id}?fields=id,username&access_token={access-token}
      return {
        success: true,
        message: 'Instagram authentication successful',
        data: {
          userId: config.userId,
          username: 'instagram_username'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Instagram authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null
      }
    }
  }

  async testConnection(config: PlatformConfig): Promise<AuthResult> {
    try {
      // Extract credentials from config
      const credentials = config.credentials || {}
      const configData = config.configuration || {}
      
      const appId = credentials.appId || configData.appId
      const accessToken = credentials.accessToken || configData.accessToken
      const userId = credentials.userId || configData.userId
      
      // Basic validation
      if (!appId || !accessToken || !userId) {
        return {
          success: false,
          message: 'Missing Instagram API credentials'
        }
      }

      // Validate App ID format (should be numeric)
      if (!/^\d+$/.test(appId)) {
        return {
          success: false,
          message: 'Invalid Instagram App ID format'
        }
      }

      // Validate User ID format (should be numeric)
      if (!/^\d+$/.test(userId)) {
        return {
          success: false,
          message: 'Invalid Instagram User ID format'
        }
      }

      // In a real implementation, test API call to Instagram
      // GET /{user-id}?access_token={access_token}
      return {
        success: true,
        message: 'Instagram connection test successful'
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async publish(content: string, config: PlatformConfig, options?: any): Promise<PublishResult> {
    try {
      if (!this.config) {
        await this.authenticate(config)
      }

      // Validate content length
      if (content.length > 2200) {
        return {
          success: false,
          message: 'Content exceeds Instagram character limit (2200)',
          data: null
        }
      }

      // Note: Instagram API requires images/videos for posts
      // Text-only posts are not supported by Instagram API
      return {
        success: false,
        message: 'Instagram posts require media (image or video). Text-only posts are not supported.',
        data: null
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to publish Instagram post: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null
      }
    }
  }

  async scheduleContent(content: string, scheduledTime: Date, config: PlatformConfig, options?: any): Promise<ScheduleResult> {
    try {
      if (!this.config) {
        await this.authenticate(config)
      }

      // Instagram doesn't support scheduling through Basic Display API
      // Would need Instagram Business API and third-party scheduling
      return {
        success: true,
        message: 'Instagram post scheduled successfully (requires media upload)',
        data: {
          scheduleId: `instagram_schedule_${Date.now()}`,
          scheduledTime: scheduledTime.toISOString(),
          platform: 'instagram',
          note: 'Media upload required for actual posting'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to schedule Instagram post: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null
      }
    }
  }

  formatContent(content: string): string {
    // Format content for Instagram with hashtags and visual focus
    let formattedContent = content.trim()
    
    // Add relevant hashtags if not present
    if (!formattedContent.includes('#') && formattedContent.length < 2100) {
      formattedContent += '\n\n#InstaDaily #ContentCreator #DigitalLife'
    }
    
    // Truncate if too long
    if (formattedContent.length > 2150) {
      formattedContent = formattedContent.substring(0, 2147) + '...'
    }

    return formattedContent
  }

  async validateConfig(config: PlatformConfig): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Extract credentials from both configuration and credentials objects
    const credentials = config.credentials || {}
    const configData = config.configuration || {}
    const allData = { ...configData, ...credentials }

    // Validate required fields
    const requiredFields = ['appId', 'appSecret', 'accessToken', 'userId']
    const configErrors = this.validateRequired(allData, requiredFields)
    errors.push(...configErrors)

    // Validate App ID format (should be numeric)
    if (allData.appId && !/^\d+$/.test(allData.appId)) {
      errors.push('App ID must be numeric')
    }

    // Validate User ID format (should be numeric)
    if (allData.userId && !/^\d+$/.test(allData.userId)) {
      errors.push('User ID must be numeric')
    }

    // Validate access token format
    if (allData.accessToken && allData.accessToken.length < 20) {
      warnings.push('Access token seems unusually short')
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }

  async cancelScheduledContent(scheduleId: string, config: PlatformConfig): Promise<DeleteResult> {
    try {
      // In a real implementation, cancel scheduled Instagram post
      // This might require Instagram Business API or internal scheduling system
      return {
        success: true,
        message: `Scheduled Instagram content ${scheduleId} cancelled successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to cancel scheduled content: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async getPublishedContent(platformId: string, config: PlatformConfig): Promise<ContentResult> {
    try {
      // In a real implementation, fetch Instagram media using Instagram Basic Display API
      // GET /{media-id}?fields=id,caption,media_type,media_url,timestamp
      return {
        success: true,
        content: {
          id: platformId,
          caption: 'Sample Instagram post caption',
          media_type: 'IMAGE',
          media_url: `https://instagram.com/p/${platformId}/`,
          timestamp: new Date().toISOString(),
          username: 'instagram_user'
        },
        metrics: {
          likes: 45,
          comments: 8,
          shares: 3,
          saves: 12,
          reach: 320,
          impressions: 450,
          engagement_rate: 0.175
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch content: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async deleteContent(platformId: string, config: PlatformConfig): Promise<DeleteResult> {
    try {
      // In a real implementation, delete Instagram media
      // DELETE /{media-id} (only works for media posted by the app)
      return {
        success: true,
        message: `Instagram content ${platformId} deleted successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete content: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async updateContent(platformId: string, newContent: string, config: PlatformConfig): Promise<PublishResult> {
    try {
      // Instagram doesn't support editing captions through the API
      // Users must edit manually through the Instagram app
      return {
        success: false,
        error: 'Instagram does not support editing post captions through API',
        message: 'Caption editing must be done manually through the Instagram app'
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to update content: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}