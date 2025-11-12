import { PublishingService, PublishingJob, PublishingResult, EmailContent } from './types.ts'
import { q } from '../../db.ts'

export class SendGridService implements PublishingService {
    platform = 'sendgrid' as const

    async authenticate(credentials: any): Promise<boolean> {
        try {
            const apiKey = credentials.api_key
            const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            })
            return response.ok
        } catch {
            return false
        }
    }

    async publish(job: PublishingJob): Promise<PublishingResult> {
        const credentials = await this.getCredentials(job.pack_id)
        const content = job.content_data as EmailContent

        const emailData = {
            personalizations: [{
                to: content.to.map(email => ({ email })),
                cc: content.cc?.map(email => ({ email })),
                bcc: content.bcc?.map(email => ({ email }))
            }],
            from: {
                email: content.from_email,
                name: content.from_name || 'Content Multiplier'
            },
            subject: content.subject,
            content: [
                {
                    type: 'text/plain',
                    value: content.text_content
                },
                {
                    type: 'text/html',
                    value: content.html_content
                }
            ]
        }

        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${credentials.api_key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`SendGrid API error: ${error}`)
        }

        // SendGrid doesn't return a message ID in the response, so we generate one
        const messageId = `sg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        return {
            result_id: 0,
            queue_id: job.queue_id,
            platform: 'sendgrid',
            external_id: messageId,
            external_url: `https://app.sendgrid.com/email_activity/${messageId}`,
            published_at: new Date()
        }
    }

    async getMetrics(result: PublishingResult): Promise<Record<string, any>> {
        if (!result.external_id) return {}

        const credentials = await this.getCredentials('')
        const response = await fetch(`https://api.sendgrid.com/v3/messages?query=${result.external_id}`, {
            headers: {
                'Authorization': `Bearer ${credentials.api_key}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) return {}

        const data = await response.json()
        return data.messages?.[0] || {}
    }

    async validateContent(content: any): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = []

        if (!content.subject || content.subject.length === 0) {
            errors.push('Email subject is required')
        }

        if (!content.html_content && !content.text_content) {
            errors.push('Email content (HTML or text) is required')
        }

        if (!content.to || content.to.length === 0) {
            errors.push('Email recipients are required')
        }

        if (!content.from_email) {
            errors.push('From email address is required')
        }

        if (content.subject && content.subject.length > 998) {
            errors.push('Email subject exceeds 998 character limit')
        }

        return { valid: errors.length === 0, errors }
    }

    private async getCredentials(packId: string): Promise<any> {
        const [cred] = await q(
            'SELECT encrypted_credentials FROM publishing_credentials WHERE platform = $1 AND is_active = true LIMIT 1',
            ['sendgrid']
        )

        if (!cred) {
            throw new Error('SendGrid credentials not configured')
        }

        // Decrypt credentials (simplified for this example)
        return JSON.parse(cred.encrypted_credentials)
    }
}

export class MailchimpService implements PublishingService {
    platform = 'mailchimp' as const

    async authenticate(credentials: any): Promise<boolean> {
        try {
            const apiKey = credentials.api_key
            const dc = apiKey.split('-')[1] // Extract datacenter from API key
            const response = await fetch(`https://${dc}.api.mailchimp.com/3.0/ping`, {
                headers: {
                    'Authorization': `apikey ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            })
            return response.ok
        } catch {
            return false
        }
    }

    async publish(job: PublishingJob): Promise<PublishingResult> {
        const credentials = await this.getCredentials(job.pack_id)
        const content = job.content_data as EmailContent

        // Mailchimp requires a campaign to be created first
        const campaignData = {
            type: 'regular',
            recipients: {
                list_id: credentials.list_id
            },
            settings: {
                subject_line: content.subject,
                from_name: content.from_name || 'Content Multiplier',
                reply_to: content.from_email,
                to_name: '*|FNAME|*'
            }
        }

        // Create campaign
        const campaignResponse = await fetch(`https://${credentials.dc}.api.mailchimp.com/3.0/campaigns`, {
            method: 'POST',
            headers: {
                'Authorization': `apikey ${credentials.api_key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(campaignData)
        })

        if (!campaignResponse.ok) {
            const error = await campaignResponse.text()
            throw new Error(`Mailchimp campaign creation error: ${error}`)
        }

        const campaign = await campaignResponse.json()

        // Set campaign content
        const contentData = {
            html: content.html_content,
            text: content.text_content
        }

        const contentResponse = await fetch(`https://${credentials.dc}.api.mailchimp.com/3.0/campaigns/${campaign.id}/content`, {
            method: 'PUT',
            headers: {
                'Authorization': `apikey ${credentials.api_key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contentData)
        })

        if (!contentResponse.ok) {
            const error = await contentResponse.text()
            throw new Error(`Mailchimp content setting error: ${error}`)
        }

        // Send the campaign
        const sendResponse = await fetch(`https://${credentials.dc}.api.mailchimp.com/3.0/campaigns/${campaign.id}/actions/send`, {
            method: 'POST',
            headers: {
                'Authorization': `apikey ${credentials.api_key}`,
                'Content-Type': 'application/json'
            }
        })

        if (!sendResponse.ok) {
            const error = await sendResponse.text()
            throw new Error(`Mailchimp send error: ${error}`)
        }

        return {
            result_id: 0,
            queue_id: job.queue_id,
            platform: 'mailchimp',
            external_id: campaign.id,
            external_url: `https://${credentials.dc}.admin.mailchimp.com/campaigns/show?id=${campaign.id}`,
            published_at: new Date()
        }
    }

    async getMetrics(result: PublishingResult): Promise<Record<string, any>> {
        if (!result.external_id) return {}

        const credentials = await this.getCredentials('')
        const response = await fetch(`https://${credentials.dc}.api.mailchimp.com/3.0/campaigns/${result.external_id}`, {
            headers: {
                'Authorization': `apikey ${credentials.api_key}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) return {}

        const data = await response.json()
        return {
            opens: data.report_summary?.unique_opens || 0,
            clicks: data.report_summary?.unique_clicks || 0,
            subscribers: data.recipients?.recipient_count || 0
        }
    }

    async validateContent(content: any): Promise<{ valid: boolean; errors: string[] }> {
        console.log('MailchimpService validateContent called with:', JSON.stringify(content, null, 2))
        const errors: string[] = []

        if (!content.subject || content.subject.length === 0) {
            errors.push('Email subject is required')
        }

        if (!content.html_content && !content.text_content) {
            errors.push('Email content (HTML or text) is required')
        }

        if (!content.from_email) {
            errors.push('From email address is required')
        }

        console.log('MailchimpService validation result:', { valid: errors.length === 0, errors })
        return { valid: errors.length === 0, errors }
    }

    private async getCredentials(packId: string): Promise<any> {
        const [cred] = await q(
            'SELECT encrypted_credentials FROM publishing_credentials WHERE platform = $1 AND is_active = true LIMIT 1',
            ['mailchimp']
        )

        if (!cred) {
            throw new Error('Mailchimp credentials not configured')
        }

        console.log('Raw credentials from DB:', typeof cred.encrypted_credentials, cred.encrypted_credentials)

        // Handle both encrypted (OAuth) and plain JSON credentials (API key)
        if (typeof cred.encrypted_credentials === 'string') {
            // Plain JSON string
            return JSON.parse(cred.encrypted_credentials)
        } else if (cred.encrypted_credentials && typeof cred.encrypted_credentials === 'object') {
            if (cred.encrypted_credentials.encrypted) {
                // Encrypted format from OAuth - need to decrypt
                // For now, we don't have the decrypt function imported here
                throw new Error('Encrypted credentials not supported in MailchimpService yet')
            } else {
                // Direct object format
                return cred.encrypted_credentials
            }
        } else {
            throw new Error('Invalid credentials format')
        }
    }
}

