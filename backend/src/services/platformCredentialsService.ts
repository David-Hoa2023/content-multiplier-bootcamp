import crypto from 'crypto';
import { Pool } from 'pg';

// Encryption configuration (reuse from apiKeyService)
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || 'default-key-for-development-only-32-chars';
const IV_LENGTH = 16; // For AES, this is always 16

export interface PlatformCredentials {
  // Twitter
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;

  // Facebook
  appId?: string;
  appSecret?: string;
  pageId?: string;
  pageAccessToken?: string;

  // LinkedIn
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;

  // Instagram
  userId?: string;

  // TikTok
  appKey?: string;
  // Note: TikTok also uses appSecret, shared with Facebook field above

  // MailChimp
  mailchimpApiKey?: string;
  serverPrefix?: string;

  // WordPress
  siteUrl?: string;
  username?: string;
  applicationPassword?: string;

  // Generic fields
  [key: string]: any;
}

export interface PlatformConfig {
  id?: number;
  user_id?: number;
  platform_type: string;
  platform_name: string;
  configuration: Record<string, any>;
  credentials?: PlatformCredentials;
  is_active: boolean;
  is_connected?: boolean;
  last_tested_at?: Date;
  test_result?: string;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Encrypt credentials using AES-256-CBC
 */
function encryptCredentials(credentials: PlatformCredentials): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const credentialsJson = JSON.stringify(credentials);
  let encrypted = cipher.update(credentialsJson, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt credentials using AES-256-CBC
 */
function decryptCredentials(encryptedCredentials: string): PlatformCredentials {
  const textParts = encryptedCredentials.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = textParts.join(':');
  
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

export class PlatformCredentialsService {
  constructor(private db: Pool) {}

  /**
   * Store platform configuration with encrypted credentials
   */
  async storePlatformConfig(config: PlatformConfig): Promise<PlatformConfig> {
    let encryptedCredentials: string | null = null;

    if (config.credentials) {
      const encrypted = encryptCredentials(config.credentials);
      // Wrap encrypted string in JSON object for JSONB column
      encryptedCredentials = JSON.stringify({ encrypted });
    }

    const query = `
      INSERT INTO platform_configurations
      (user_id, platform_type, platform_name, configuration, credentials,
       is_active, is_connected, last_tested_at, test_result)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      config.user_id || 1, // Default user
      config.platform_type,
      config.platform_name,
      JSON.stringify(config.configuration),
      encryptedCredentials,
      config.is_active,
      config.is_connected || false,
      config.last_tested_at || null,
      config.test_result || 'Not tested'
    ]);
    
    const stored = result.rows[0];
    
    // Return config without decrypting credentials
    return {
      ...stored,
      configuration: stored.configuration,
      credentials: undefined // Don't return credentials in response
    };
  }

  /**
   * Update platform configuration with encrypted credentials
   */
  async updatePlatformConfig(
    id: number, 
    updates: Partial<PlatformConfig>
  ): Promise<PlatformConfig> {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updates.platform_name) {
      updateFields.push(`platform_name = $${paramIndex}`);
      params.push(updates.platform_name);
      paramIndex++;
    }

    if (updates.configuration) {
      updateFields.push(`configuration = $${paramIndex}`);
      params.push(JSON.stringify(updates.configuration));
      paramIndex++;
    }

    if (updates.credentials) {
      const encrypted = encryptCredentials(updates.credentials);
      // Wrap encrypted string in JSON object for JSONB column
      const encryptedCredentials = JSON.stringify({ encrypted });
      updateFields.push(`credentials = $${paramIndex}`);
      params.push(encryptedCredentials);
      paramIndex++;
    }

    if (updates.is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`);
      params.push(updates.is_active);
      paramIndex++;
    }

    if (updates.is_connected !== undefined) {
      updateFields.push(`is_connected = $${paramIndex}`);
      params.push(updates.is_connected);
      paramIndex++;
    }

    if (updates.test_result) {
      updateFields.push(`test_result = $${paramIndex}`);
      params.push(updates.test_result);
      paramIndex++;
    }

    updateFields.push(`updated_at = NOW()`);
    
    params.push(id);
    const whereClause = `WHERE id = $${paramIndex}`;

    const query = `
      UPDATE platform_configurations 
      SET ${updateFields.join(', ')}
      ${whereClause}
      RETURNING *
    `;

    const result = await this.db.query(query, params);
    
    if (result.rows.length === 0) {
      throw new Error('Platform configuration not found');
    }

    const updated = result.rows[0];
    return {
      ...updated,
      configuration: updated.configuration,
      credentials: undefined // Don't return credentials in response
    };
  }

  /**
   * Get platform configuration with decrypted credentials
   */
  async getPlatformConfigWithCredentials(id: number): Promise<PlatformConfig | null> {
    const query = `
      SELECT * FROM platform_configurations 
      WHERE id = $1
    `;
    
    const result = await this.db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const config = result.rows[0];
    let credentials: any = null;

    if (config.credentials) {
      try {
        // Unwrap the JSON object to get the encrypted string
        const encryptedString = typeof config.credentials === 'string'
          ? config.credentials
          : config.credentials.encrypted;
        credentials = decryptCredentials(encryptedString);
      } catch (error) {
        console.error('Failed to decrypt credentials for platform config:', id, error);
        // Continue without credentials rather than failing entirely
      }
    }
    
    return {
      ...config,
      configuration: config.configuration,
      credentials
    };
  }

  /**
   * Get platform configurations without credentials (safe for frontend)
   */
  async getPlatformConfigs(filters?: {
    platform_type?: string;
    is_active?: boolean;
    user_id?: number;
  }): Promise<Omit<PlatformConfig, 'credentials'>[]> {
    let query = `
      SELECT id, user_id, platform_type, platform_name, configuration,
             is_active, is_connected, last_tested_at, test_result,
             created_at, updated_at
      FROM platform_configurations
      WHERE user_id = $1
    `;

    const params: any[] = [filters?.user_id || 1];

    if (filters?.platform_type) {
      query += ` AND platform_type = $${params.length + 1}`;
      params.push(filters.platform_type);
    }

    if (filters?.is_active !== undefined) {
      query += ` AND is_active = $${params.length + 1}`;
      params.push(filters.is_active);
    }
    
    query += ' ORDER BY platform_type, platform_name';
    
    const result = await this.db.query(query, params);
    
    return result.rows.map(row => ({
      ...row,
      configuration: row.configuration
    }));
  }

  /**
   * Delete platform configuration
   */
  async deletePlatformConfig(id: number): Promise<boolean> {
    const query = `
      DELETE FROM platform_configurations 
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await this.db.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Test if platform has valid credentials
   */
  async hasValidCredentials(id: number): Promise<boolean> {
    const config = await this.getPlatformConfigWithCredentials(id);
    return config !== null && config.credentials !== null && config.credentials !== undefined;
  }

  /**
   * Update connection test results
   */
  async updateTestResults(
    id: number, 
    isConnected: boolean, 
    testResult: string
  ): Promise<void> {
    const query = `
      UPDATE platform_configurations 
      SET is_connected = $1, last_tested_at = NOW(), test_result = $2 
      WHERE id = $3
    `;
    
    await this.db.query(query, [isConnected, testResult, id]);
  }

  /**
   * Get platform-specific credential requirements
   */
  getPlatformCredentialRequirements(platformType: string): string[] {
    const requirements: Record<string, string[]> = {
      twitter: ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret'],
      facebook: ['appId', 'appSecret', 'pageId', 'pageAccessToken'],
      linkedin: ['clientId', 'clientSecret', 'accessToken'],
      instagram: ['appId', 'appSecret', 'accessToken', 'userId'],
      tiktok: ['appKey', 'appSecret', 'accessToken'],
      mailchimp: ['mailchimpApiKey', 'serverPrefix'],
      wordpress: ['siteUrl', 'username', 'applicationPassword']
    };
    
    return requirements[platformType] || [];
  }

  /**
   * Validate platform credentials
   */
  validateCredentials(platformType: string, credentials: PlatformCredentials): {
    valid: boolean;
    missing: string[];
  } {
    const required = this.getPlatformCredentialRequirements(platformType);
    const missing = required.filter(field => !credentials[field]);
    
    return {
      valid: missing.length === 0,
      missing
    };
  }
}