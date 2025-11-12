import { BasePlatform, PlatformConfig, AuthResult, PublishResult, ScheduleResult, ValidationResult, ContentResult, DeleteResult, PlatformCapabilities } from '../base/BasePlatform'

interface TwitterConfig extends PlatformConfig {
  apiKey: string
  apiSecret: string
  accessToken: string
  accessTokenSecret: string
  bearerToken?: string
}

export class TwitterPlatform extends BasePlatform {
  readonly type: string = 'twitter'
  readonly name: string = 'Twitter'
  readonly capabilities: PlatformCapabilities = {
    supportsScheduling: true,
    supportsImages: true,
    supportsVideos: true,
    supportsHashtags: true,
    supportsMentions: true,
    supportsThreads: true,
    maxContentLength: 280,
    imageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    videoFormats: ['mp4', 'mov']
  }

  private config: TwitterConfig | null = null

  async authenticate(config: PlatformConfig): Promise<AuthResult> {
    try {
      // Extract credentials from config
      const credentials = config.credentials || {}
      const configData = config.configuration || {}
      
      const apiKey = credentials.apiKey || configData.apiKey
      const apiSecret = credentials.apiSecret || configData.apiSecret
      const accessToken = credentials.accessToken || configData.accessToken
      const accessTokenSecret = credentials.accessTokenSecret || configData.accessTokenSecret
      
      // Create TwitterConfig for internal use
      this.config = {
        ...config,
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret,
        bearerToken: credentials.bearerToken || configData.bearerToken
      } as TwitterConfig

      // Validate required credentials
      if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
        return {
          success: false,
          message: 'Missing required Twitter API credentials',
          data: null
        }
      }

      // In a real implementation, you would verify credentials with Twitter API
      // For now, we'll simulate a successful authentication
      return {
        success: true,
        message: 'Twitter authentication successful',
        data: {
          userId: 'twitter_user_id',
          username: 'twitter_username'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Twitter authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null
      }
    }
  }

  async testConnection(config: PlatformConfig): Promise<AuthResult> {
    try {
      // Extract credentials from config
      const credentials = config.credentials || {}
      const configData = config.configuration || {}
      
      // Check both credentials and configuration for API keys
      const apiKey = credentials.apiKey || configData.apiKey
      const apiSecret = credentials.apiSecret || configData.apiSecret
      
      // Basic validation
      if (!apiKey || !apiSecret) {
        return {
          success: false,
          message: 'Missing Twitter API credentials'
        }
      }

      // Validate API key format
      if (apiKey.length < 10 || apiSecret.length < 10) {
        return {
          success: false,
          message: 'Invalid Twitter API key format'
        }
      }

      // In a real implementation, make a test API call to Twitter
      // For simulation, we'll check if credentials look valid
      return {
        success: true,
        message: 'Twitter connection test successful'
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
      if (content.length > 280) {
        return {
          success: false,
          message: 'Content exceeds Twitter character limit (280)',
          data: null
        }
      }

      // In a real implementation, use Twitter API v2 to post tweet
      // For simulation, return success with mock data
      return {
        success: true,
        message: 'Tweet published successfully',
        data: {
          id: `tweet_${Date.now()}`,
          url: `https://twitter.com/user/status/${Date.now()}`,
          publishedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to publish tweet: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null
      }
    }
  }

  async scheduleContent(content: string, scheduledTime: Date, config: PlatformConfig, options?: any): Promise<ScheduleResult> {
    try {
      if (!this.config) {
        await this.authenticate(config)
      }

      // Twitter API doesn't support native scheduling
      // In a real implementation, you'd use a third-party service or internal queue
      return {
        success: true,
        message: 'Tweet scheduled successfully',
        data: {
          scheduleId: `schedule_${Date.now()}`,
          scheduledTime: scheduledTime.toISOString(),
          platform: 'twitter'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to schedule tweet: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null
      }
    }
  }

  formatContent(content: string): string {
    // Format content for Twitter
    let formattedContent = content.trim()
    
    // Truncate if too long
    if (formattedContent.length > 250) {
      formattedContent = formattedContent.substring(0, 247) + '...'
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
    const requiredFields = ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret']
    const configErrors = this.validateRequired(allData, requiredFields)
    errors.push(...configErrors)

    // Validate API key format
    if (allData.apiKey && allData.apiKey.length < 25) {
      warnings.push('API key seems unusually short')
    }

    // Validate tokens are not empty
    if (allData.accessToken && allData.accessToken.length < 10) {
      errors.push('Access token appears to be invalid')
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }

  async cancelScheduledContent(scheduleId: string, config: PlatformConfig): Promise<DeleteResult> {
    try {
      // In a real implementation, cancel the scheduled tweet
      // This might involve calling Twitter API or internal scheduling service
      return {
        success: true,
        message: `Scheduled Twitter content ${scheduleId} cancelled successfully`
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
      // In a real implementation, fetch tweet details using Twitter API v2
      // GET /2/tweets/{id}
      return {
        success: true,
        content: {
          id: platformId,
          text: 'Sample tweet content',
          created_at: new Date().toISOString(),
          author_id: 'twitter_user_id',
          public_metrics: {
            retweet_count: 0,
            like_count: 0,
            reply_count: 0,
            quote_count: 0
          }
        },
        metrics: {
          impressions: 100,
          engagements: 5,
          engagement_rate: 0.05
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
      // In a real implementation, delete tweet using Twitter API v2
      // DELETE /2/tweets/{id}
      return {
        success: true,
        message: `Twitter content ${platformId} deleted successfully`
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
      // Twitter doesn't support editing tweets (as of current API)
      // This would typically require deleting and reposting
      return {
        success: false,
        error: 'Twitter does not support editing published tweets',
        message: 'Consider deleting and reposting with new content'
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to update content: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}