import crypto from 'crypto';
import { Pool } from 'pg';

// Encryption configuration
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || 'default-key-for-development-only-32-chars';
const IV_LENGTH = 16; // For AES, this is always 16

export interface APIKey {
  id: number;
  provider_name: string;
  api_key_encrypted: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface APIKeyData {
  provider_name: string;
  api_key: string;
  is_active?: boolean;
}

/**
 * Encrypt API key using AES-256-CBC
 */
function encryptApiKey(apiKey: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  // Create a 32-byte key from the encryption key
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt API key using AES-256-CBC
 */
function decryptApiKey(encryptedApiKey: string): string {
  const textParts = encryptedApiKey.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = textParts.join(':');
  // Create a 32-byte key from the encryption key
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export class APIKeyService {
  constructor(private db: Pool) {}

  /**
   * Store API key in database with encryption
   */
  async storeApiKey(keyData: APIKeyData): Promise<APIKey> {
    const encryptedKey = encryptApiKey(keyData.api_key);
    
    const query = `
      INSERT INTO api_keys (provider_name, api_key_encrypted, is_active)
      VALUES ($1, $2, $3)
      ON CONFLICT (provider_name) 
      DO UPDATE SET 
        api_key_encrypted = EXCLUDED.api_key_encrypted,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await this.db.query(query, [
      keyData.provider_name,
      encryptedKey,
      keyData.is_active ?? true
    ]);
    
    return result.rows[0];
  }

  /**
   * Retrieve and decrypt API key for a provider
   */
  async getApiKey(providerName: string): Promise<string | null> {
    const query = `
      SELECT api_key_encrypted 
      FROM api_keys 
      WHERE provider_name = $1 AND is_active = true
    `;
    
    const result = await this.db.query(query, [providerName]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return decryptApiKey(result.rows[0].api_key_encrypted);
  }

  /**
   * Get all active API key providers (without decrypting keys)
   */
  async getActiveProviders(): Promise<string[]> {
    const query = `
      SELECT provider_name 
      FROM api_keys 
      WHERE is_active = true
      ORDER BY provider_name
    `;
    
    const result = await this.db.query(query);
    return result.rows.map(row => row.provider_name);
  }

  /**
   * Get all API key configurations (without decrypting keys)
   */
  async getAllApiKeys(): Promise<Omit<APIKey, 'api_key_encrypted'>[]> {
    const query = `
      SELECT id, provider_name, is_active, created_at, updated_at 
      FROM api_keys 
      ORDER BY provider_name
    `;
    
    const result = await this.db.query(query);
    return result.rows;
  }

  /**
   * Update API key status (activate/deactivate)
   */
  async updateApiKeyStatus(providerName: string, isActive: boolean): Promise<boolean> {
    const query = `
      UPDATE api_keys 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE provider_name = $2
      RETURNING id
    `;
    
    const result = await this.db.query(query, [isActive, providerName]);
    return result.rows.length > 0;
  }

  /**
   * Delete API key for a provider
   */
  async deleteApiKey(providerName: string): Promise<boolean> {
    const query = `
      DELETE FROM api_keys 
      WHERE provider_name = $1
      RETURNING id
    `;
    
    const result = await this.db.query(query, [providerName]);
    return result.rows.length > 0;
  }

  /**
   * Test if API key exists and is active
   */
  async hasActiveApiKey(providerName: string): Promise<boolean> {
    const query = `
      SELECT 1 
      FROM api_keys 
      WHERE provider_name = $1 AND is_active = true
    `;
    
    const result = await this.db.query(query, [providerName]);
    return result.rows.length > 0;
  }
}