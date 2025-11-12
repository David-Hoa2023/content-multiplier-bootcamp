import crypto from 'crypto'
import { q } from '../../db.ts'
import { PublishingCredentials } from './types.ts'

// OAuth configuration for each platform
const OAUTH_CONFIGS = {
    twitter: {
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        scope: 'tweet.write users.read',
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        redirectUri: process.env.TWITTER_REDIRECT_URI
    },
    linkedin: {
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        scope: 'r_liteprofile r_emailaddress w_member_social',
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        redirectUri: process.env.LINKEDIN_REDIRECT_URI
    },
    facebook: {
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        scope: 'pages_manage_posts,pages_read_engagement',
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        redirectUri: process.env.FACEBOOK_REDIRECT_URI
    },
    instagram: {
        authUrl: 'https://api.instagram.com/oauth/authorize',
        tokenUrl: 'https://api.instagram.com/oauth/access_token',
        scope: 'user_profile,user_media',
        clientId: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        redirectUri: process.env.INSTAGRAM_REDIRECT_URI
    }
}

// Encryption utilities
const ENCRYPTION_KEY = process.env.PUBLISHING_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const ALGORITHM = 'aes-256-gcm'

function encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const key = Buffer.from(ENCRYPTION_KEY, 'hex')
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return iv.toString('hex') + ':' + encrypted
}

function decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const key = Buffer.from(ENCRYPTION_KEY, 'hex')

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}

export class OAuthService {
    // Generate OAuth authorization URL
    static async getAuthUrl(platform: string, userId: string): Promise<string> {
        const config = OAUTH_CONFIGS[platform as keyof typeof OAUTH_CONFIGS]
        if (!config) {
            throw new Error(`Unsupported platform: ${platform}`)
        }

        const state = crypto.randomBytes(32).toString('hex')
        
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: config.clientId!,
            redirect_uri: config.redirectUri!,
            scope: config.scope,
            state
        })

        let codeVerifier: string | null = null

        // Only use PKCE for Twitter OAuth 2.0
        if (platform === 'twitter') {
            codeVerifier = crypto.randomBytes(32).toString('base64url')
            const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
            params.append('code_challenge', codeChallenge)
            params.append('code_challenge_method', 'S256')
        }

        // Store state and code verifier for verification
        await q(
            'INSERT INTO oauth_states (state, user_id, platform, expires_at, code_verifier) VALUES ($1, $2, $3, $4, $5)',
            [state, userId, platform, new Date(Date.now() + 10 * 60 * 1000), codeVerifier] // 10 minutes
        )

        return `${config.authUrl}?${params.toString()}`
    }

    // Exchange authorization code for access token
    static async exchangeCode(platform: string, code: string, state: string, userId: string): Promise<PublishingCredentials> {
        console.log('OAuth exchangeCode called:', { platform, userId, state: state?.substring(0, 10) + '...' })
        
        const config = OAUTH_CONFIGS[platform as keyof typeof OAUTH_CONFIGS]
        if (!config) {
            throw new Error(`Unsupported platform: ${platform}`)
        }

        // Verify state
        const [storedState] = await q(
            'SELECT * FROM oauth_states WHERE state = $1 AND user_id = $2 AND platform = $3 AND expires_at > NOW()',
            [state, userId, platform]
        )

        console.log('OAuth state check:', { found: !!storedState, state: state?.substring(0, 10) + '...', userId, platform })

        if (!storedState) {
            throw new Error('Invalid or expired OAuth state')
        }

        // Exchange code for token with PKCE
        const tokenParams = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: config.redirectUri!,
            client_id: config.clientId!
        })

        // Add PKCE code_verifier for Twitter
        if (platform === 'twitter' && storedState.code_verifier) {
            tokenParams.append('code_verifier', storedState.code_verifier)
        } else {
            // For non-PKCE platforms, include client_secret in body
            tokenParams.append('client_secret', config.clientSecret!)
        }

        // Prepare headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }

        // For Twitter OAuth 2.0 with PKCE, use Basic Auth header
        if (platform === 'twitter') {
            const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
            headers['Authorization'] = `Basic ${basicAuth}`
        }

        console.log('Token exchange headers:', Object.keys(headers))

        const tokenResponse = await fetch(config.tokenUrl, {
            method: 'POST',
            headers,
            body: tokenParams
        })

        console.log('Token exchange response status:', tokenResponse.status)

        if (!tokenResponse.ok) {
            const error = await tokenResponse.text()
            console.log('Token exchange failed:', error)
            throw new Error(`OAuth token exchange failed: ${error}`)
        }

        const tokenData = await tokenResponse.json()
        console.log('Token exchange successful, received:', Object.keys(tokenData))

        // Encrypt and store credentials
        const credentialId = `cred_${crypto.randomUUID()}`
        console.log('Encrypting credentials for storage...')
        
        const credentialData = {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_in: tokenData.expires_in,
            scope: tokenData.scope
        }
        
        const encryptedCredentials = encrypt(JSON.stringify(credentialData))
        console.log('Credentials encrypted successfully')

        const expiresAt = tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null

        console.log('Storing credentials in database...', { credentialId, userId, platform })
        
        // Store encrypted string inside JSON object for jsonb column
        const encryptedJson = JSON.stringify({ encrypted: encryptedCredentials })
        
        try {
            console.log('Starting database operations...')
            
            // Delete existing credentials for this user/platform, then insert new ones
            const deleteResult = await q('DELETE FROM publishing_credentials WHERE user_id = $1 AND platform = $2', [userId, platform])
            console.log('Delete operation completed:', { deletedRows: deleteResult.length })
            
            const insertResult = await q(`
                INSERT INTO publishing_credentials 
                (credential_id, user_id, platform, credential_type, encrypted_credentials, expires_at, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING credential_id, created_at
            `, [credentialId, userId, platform, 'oauth', encryptedJson, expiresAt, true])
            
            console.log('Insert operation completed:', insertResult[0])
            console.log('Credentials stored successfully in database')
            
        } catch (dbError) {
            console.error('Database operation failed:', dbError)
            throw new Error(`Failed to store credentials: ${dbError.message}`)
        }

        // Clean up state
        await q('DELETE FROM oauth_states WHERE state = $1', [state])

        // Final verification - check that credentials were stored
        const verification = await q(
            'SELECT credential_id, created_at FROM publishing_credentials WHERE user_id = $1 AND platform = $2 AND is_active = true',
            [userId, platform]
        )
        
        if (verification.length > 0) {
            console.log('Verification successful - credentials found in database:', verification[0])
        } else {
            console.error('Verification failed - credentials not found in database!')
        }

        return {
            credential_id: credentialId,
            user_id: userId,
            platform: platform as any,
            credential_type: 'oauth',
            encrypted_credentials: { encrypted: encryptedCredentials },
            is_active: true,
            expires_at: expiresAt
        }
    }

    // Get decrypted credentials for a platform
    static async getCredentials(userId: string, platform: string): Promise<any> {
        const [cred] = await q(
            'SELECT encrypted_credentials, expires_at FROM publishing_credentials WHERE user_id = $1 AND platform = $2 AND is_active = true',
            [userId, platform]
        )

        if (!cred) {
            throw new Error(`No credentials found for platform: ${platform}`)
        }

        // Check if token is expired
        if (cred.expires_at && new Date(cred.expires_at) < new Date()) {
            throw new Error(`Credentials expired for platform: ${platform}`)
        }

        const decrypted = decrypt(cred.encrypted_credentials.encrypted)
        return JSON.parse(decrypted)
    }

    // Refresh expired OAuth token
    static async refreshToken(userId: string, platform: string): Promise<void> {
        const config = OAUTH_CONFIGS[platform as keyof typeof OAUTH_CONFIGS]
        if (!config) {
            throw new Error(`Unsupported platform: ${platform}`)
        }

        const credentials = await this.getCredentials(userId, platform)
        if (!credentials.refresh_token) {
            throw new Error('No refresh token available')
        }

        const refreshResponse = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: credentials.refresh_token,
                client_id: config.clientId!,
                client_secret: config.clientSecret!
            })
        })

        if (!refreshResponse.ok) {
            throw new Error('Token refresh failed')
        }

        const tokenData = await refreshResponse.json()

        // Update stored credentials
        const encryptedCredentials = encrypt(JSON.stringify({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || credentials.refresh_token,
            expires_in: tokenData.expires_in,
            scope: tokenData.scope
        }))

        const expiresAt = tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null

        await q(`
            UPDATE publishing_credentials 
            SET encrypted_credentials = $1, expires_at = $2, updated_at = NOW()
            WHERE user_id = $3 AND platform = $4
        `, [encryptedCredentials, expiresAt, userId, platform])
    }

    // Revoke OAuth credentials
    static async revokeCredentials(userId: string, platform: string): Promise<void> {
        await q(
            'UPDATE publishing_credentials SET is_active = false, updated_at = NOW() WHERE user_id = $1 AND platform = $2',
            [userId, platform]
        )
    }
}

// OAuth states table (temporary storage for OAuth flow)
const createOAuthStatesTable = `
CREATE TABLE IF NOT EXISTS oauth_states (
    state TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
`

