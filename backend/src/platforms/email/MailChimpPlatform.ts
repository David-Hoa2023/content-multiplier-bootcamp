import { BasePlatform, PlatformConfig, AuthResult, ValidationResult, PublishResult, ScheduleResult, ContentResult, DeleteResult, PlatformCapabilities } from '../base/BasePlatform'

interface MailChimpConfig extends PlatformConfig {
  configuration: {
    apiKey: string
    listId: string
    dataCenter: string // us1, us2, etc.
    fromName: string
    fromEmail: string
    replyTo: string
    trackOpens: boolean
    trackClicks: boolean
    templateId?: string
    segmentTags?: string[]
    subjectPrefix?: string
    footerText?: string
  }
}

interface MailChimpCampaign {
  id: string
  web_id: number
  type: string
  create_time: string
  archive_url: string
  status: string
  emails_sent: number
  send_time?: string
  settings: {
    subject_line: string
    preview_text?: string
    title: string
    from_name: string
    reply_to: string
  }
}

export class MailChimpPlatform extends BasePlatform {
  readonly type = 'mailchimp'
  readonly name = 'MailChimp'
  readonly capabilities: PlatformCapabilities = {
    supportsScheduling: true,
    supportsImages: true,
    supportsVideos: false,
    supportsHashtags: false,
    supportsMentions: false,
    supportsThreads: false,
    maxContentLength: 50000, // MailChimp email content limit
    imageFormats: ['jpg', 'jpeg', 'png', 'gif'],
    videoFormats: []
  }

  // Helper method to construct full API key from credentials
  private getFullApiKey(config: MailChimpConfig): string {
    const apiKeyBase = config.credentials?.mailchimpApiKey || config.credentials?.apiKey || config.configuration.apiKey
    const serverPrefix = config.credentials?.serverPrefix || config.configuration.dataCenter

    return apiKeyBase && serverPrefix ? `${apiKeyBase}-${serverPrefix}` : (apiKeyBase || '')
  }

  async authenticate(config: MailChimpConfig): Promise<AuthResult> {
    try {
      const apiKey = this.getFullApiKey(config)
      const dataCenter = this.extractDataCenter(apiKey)

      if (!dataCenter) {
        return {
          success: false,
          message: 'Invalid API key format. Expected format: key-dc (e.g., abc123-us1)'
        }
      }

      const response = await fetch(`https://${dataCenter}.api.mailchimp.com/3.0/ping`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json() as any
        return {
          success: true,
          message: 'Successfully authenticated with MailChimp',
          data: { health_status: data.health_status }
        }
      } else {
        const error = await response.json() as any as any
        return {
          success: false,
          message: error.detail || 'Authentication failed'
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  async validateConfig(config: MailChimpConfig): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Get API key components
    const apiKeyBase = config.credentials?.mailchimpApiKey || config.configuration.apiKey
    const serverPrefix = config.credentials?.serverPrefix || config.configuration.dataCenter
    const fullApiKey = this.getFullApiKey(config)

    // Required fields validation for credentials
    if (!apiKeyBase) {
      errors.push('apiKey is required')
    }
    if (!serverPrefix) {
      errors.push('serverPrefix (datacenter) is required')
    }

    // Required fields validation for configuration
    const requiredConfigFields = ['listId', 'fromName', 'fromEmail', 'replyTo']
    errors.push(...this.validateRequired(config.configuration, requiredConfigFields))

    // API key format validation
    if (fullApiKey && !this.extractDataCenter(fullApiKey)) {
      errors.push('API key must be in format: key-datacenter (e.g., abc123-us1)')
    }

    // Email validation
    if (config.configuration.fromEmail && !this.validateEmail(config.configuration.fromEmail)) {
      errors.push('From email must be a valid email address')
    }

    if (config.configuration.replyTo && !this.validateEmail(config.configuration.replyTo)) {
      errors.push('Reply-to email must be a valid email address')
    }

    // List ID validation
    if (config.configuration.listId && config.configuration.listId.length < 10) {
      warnings.push('List ID seems too short. Please verify the list ID.')
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }

  async testConnection(config: MailChimpConfig): Promise<AuthResult> {
    try {
      // First authenticate
      const authResult = await this.authenticate(config)
      if (!authResult.success) {
        return authResult
      }

      // Then test list access
      const apiKey = this.getFullApiKey(config)
      const dataCenter = this.extractDataCenter(apiKey)
      const listId = config.configuration.listId

      const listResponse = await fetch(`https://${dataCenter}.api.mailchimp.com/3.0/lists/${listId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (listResponse.ok) {
        const listData = await listResponse.json() as any
        return {
          success: true,
          message: `Connected successfully. List: "${listData.name}" (${listData.stats.member_count} subscribers)`,
          data: {
            list_name: listData.name,
            member_count: listData.stats.member_count,
            permission_reminder: listData.permission_reminder
          }
        }
      } else {
        const error = await listResponse.json() as any
        return {
          success: false,
          message: `List access failed: ${error.detail || 'Unknown error'}`
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  async publish(content: string, config: MailChimpConfig, options?: any): Promise<PublishResult> {
    try {
      // Create campaign
      const campaign = await this.createCampaign(content, config, options)
      if (!campaign) {
        return { success: false, error: 'Failed to create campaign' }
      }

      // Send campaign
      const sendResult = await this.sendCampaign(campaign.id, config)
      if (!sendResult.success) {
        return sendResult
      }

      return {
        success: true,
        platformId: campaign.id,
        url: campaign.archive_url,
        message: `Email campaign sent successfully to list`,
        metadata: {
          campaign_id: campaign.id,
          web_id: campaign.web_id,
          subject: campaign.settings.subject_line,
          send_time: new Date().toISOString()
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  async scheduleContent(content: string, scheduledTime: Date, config: MailChimpConfig, options?: any): Promise<ScheduleResult> {
    try {
      // Create campaign
      const campaign = await this.createCampaign(content, config, options)
      if (!campaign) {
        return { success: false, error: 'Failed to create campaign' }
      }

      // Schedule campaign
      const apiKey = this.getFullApiKey(config)
      const dataCenter = this.extractDataCenter(apiKey)

      const scheduleResponse = await fetch(`https://${dataCenter}.api.mailchimp.com/3.0/campaigns/${campaign.id}/actions/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          schedule_time: scheduledTime.toISOString()
        })
      })

      if (scheduleResponse.ok) {
        return {
          success: true,
          scheduleId: campaign.id,
          scheduledTime,
          message: `Email campaign scheduled for ${scheduledTime.toLocaleString()}`
        }
      } else {
        const error = await scheduleResponse.json() as any
        return {
          success: false,
          error: error.detail || 'Failed to schedule campaign'
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  async cancelScheduledContent(scheduleId: string, config: MailChimpConfig): Promise<DeleteResult> {
    try {
      const apiKey = this.getFullApiKey(config)
      const dataCenter = this.extractDataCenter(apiKey)

      const response = await fetch(`https://${dataCenter}.api.mailchimp.com/3.0/campaigns/${scheduleId}/actions/unschedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        return {
          success: true,
          message: 'Campaign unscheduled successfully'
        }
      } else {
        const error = await response.json() as any
        return {
          success: false,
          error: error.detail || 'Failed to unschedule campaign'
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  async getPublishedContent(platformId: string, config: MailChimpConfig): Promise<ContentResult> {
    try {
      const apiKey = this.getFullApiKey(config)
      const dataCenter = this.extractDataCenter(apiKey)

      const response = await fetch(`https://${dataCenter}.api.mailchimp.com/3.0/campaigns/${platformId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const campaign = await response.json() as MailChimpCampaign
        
        // Get campaign content
        const contentResponse = await fetch(`https://${dataCenter}.api.mailchimp.com/3.0/campaigns/${platformId}/content`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        })

        const content = contentResponse.ok ? await contentResponse.json() as any : null

        return {
          success: true,
          content: {
            campaign,
            content: content?.html
          },
          metrics: {
            status: campaign.status,
            emails_sent: campaign.emails_sent,
            send_time: campaign.send_time,
            archive_url: campaign.archive_url
          }
        }
      } else {
        const error = await response.json() as any
        return {
          success: false,
          error: error.detail || 'Failed to get campaign'
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  async deleteContent(platformId: string, config: MailChimpConfig): Promise<DeleteResult> {
    try {
      const apiKey = this.getFullApiKey(config)
      const dataCenter = this.extractDataCenter(apiKey)

      const response = await fetch(`https://${dataCenter}.api.mailchimp.com/3.0/campaigns/${platformId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        return {
          success: true,
          message: 'Campaign deleted successfully'
        }
      } else {
        const error = await response.json() as any
        return {
          success: false,
          error: error.detail || 'Failed to delete campaign'
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  async updateContent(platformId: string, newContent: string, config: MailChimpConfig): Promise<PublishResult> {
    // MailChimp doesn't support updating sent campaigns, only drafts
    return {
      success: false,
      error: 'MailChimp campaigns cannot be updated after creation. Create a new campaign instead.'
    }
  }

  // Platform-specific methods
  private async createCampaign(content: string, config: MailChimpConfig, options?: any): Promise<MailChimpCampaign | null> {
    try {
      const apiKey = this.getFullApiKey(config)
      const dataCenter = this.extractDataCenter(apiKey)
      
      const subject = options?.subject || this.extractSubjectLine(content, config)
      const htmlContent = this.formatEmailContent(content, config)

      const campaignData = {
        type: 'regular',
        recipients: {
          list_id: config.configuration.listId
        },
        settings: {
          subject_line: subject,
          preview_text: options?.previewText || this.extractPreviewText(content),
          title: options?.title || `Campaign ${new Date().toISOString()}`,
          from_name: config.configuration.fromName,
          reply_to: config.configuration.replyTo,
          to_name: '*|FNAME|* *|LNAME|*', // MailChimp merge tags
          folder_id: options?.folderId,
          authenticate: true,
          auto_footer: false,
          inline_css: true
        },
        tracking: {
          opens: config.configuration.trackOpens,
          html_clicks: config.configuration.trackClicks,
          text_clicks: config.configuration.trackClicks
        }
      }

      // Create campaign
      const createResponse = await fetch(`https://${dataCenter}.api.mailchimp.com/3.0/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      })

      if (!createResponse.ok) {
        const error = await createResponse.json() as any
        throw new Error(error.detail || 'Failed to create campaign')
      }

      const campaign = await createResponse.json() as MailChimpCampaign

      // Set campaign content
      const contentResponse = await fetch(`https://${dataCenter}.api.mailchimp.com/3.0/campaigns/${campaign.id}/content`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          html: htmlContent
        })
      })

      if (!contentResponse.ok) {
        const error = await contentResponse.json() as any
        throw new Error(error.detail || 'Failed to set campaign content')
      }

      return campaign
    } catch (error) {
      console.error('Failed to create MailChimp campaign:', error)
      return null
    }
  }

  private async sendCampaign(campaignId: string, config: MailChimpConfig): Promise<PublishResult> {
    try {
      const apiKey = this.getFullApiKey(config)
      const dataCenter = this.extractDataCenter(apiKey)

      const response = await fetch(`https://${dataCenter}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        return {
          success: true,
          message: 'Campaign sent successfully'
        }
      } else {
        const error = await response.json() as any
        return {
          success: false,
          error: error.detail || 'Failed to send campaign'
        }
      }
    } catch (error: any) {
      return this.handleApiError(error)
    }
  }

  private extractDataCenter(apiKey: string): string | null {
    const parts = apiKey.split('-')
    return parts.length === 2 ? (parts[1] ?? null) : null
  }

  private extractSubjectLine(content: string, config: MailChimpConfig): string {
    const lines = content.split('\n')
    let subject = (lines[0] ?? '').replace(/^#+\s*/, '').trim() // Remove markdown headers
    
    // Add prefix if configured
    if (config.configuration.subjectPrefix) {
      subject = `${config.configuration.subjectPrefix} ${subject}`
    }

    return subject.substring(0, 150) // MailChimp subject line limit
  }

  private extractPreviewText(content: string): string {
    const lines = content.split('\n').filter(line => line.trim())
    const secondLine = (lines.length > 1 ? lines[1] : lines[0]) ?? ''
    return secondLine.replace(/[#*_`]/g, '').trim().substring(0, 150)
  }

  private formatEmailContent(content: string, config: MailChimpConfig): string {
    // Convert markdown-style content to HTML
    let html = content
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')

    // Wrap in paragraphs
    html = `<p>${html}</p>`

    // Add footer if configured
    if (config.configuration.footerText) {
      html += `<hr><p style="font-size: 12px; color: #666;">${config.configuration.footerText}</p>`
    }

    // Wrap in basic email template
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${html}
      </body>
      </html>
    `
  }
}