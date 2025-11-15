import { BasePlatform } from './base/BasePlatform'
import { MailChimpPlatform } from './email/MailChimpPlatform'
import { WordPressPlatform } from './cms/WordPressPlatform'
import { TwitterPlatform } from './social/TwitterPlatform'
import { FacebookPlatform } from './social/FacebookPlatform'
import { LinkedInPlatform } from './social/LinkedInPlatform'
import { InstagramPlatform } from './social/InstagramPlatform'
import { TikTokPlatform } from './social/TikTokPlatform'

// Platform Registry
type PlatformConstructor = new () => BasePlatform

export class PlatformRegistry {
  private static platforms = new Map<string, PlatformConstructor>([
    ['mailchimp', MailChimpPlatform],
    ['wordpress', WordPressPlatform],
    ['twitter', TwitterPlatform],
    ['linkedin', LinkedInPlatform],
    ['facebook', FacebookPlatform],
    ['instagram', InstagramPlatform],
    ['tiktok', TikTokPlatform]
  ])

  static create(type: string): BasePlatform {
    const PlatformClass = this.platforms.get(type.toLowerCase())
    if (!PlatformClass) {
      throw new Error(`Unsupported platform type: ${type}`)
    }
    return new PlatformClass()
  }

  static getSupportedPlatforms(): string[] {
    return Array.from(this.platforms.keys())
  }

  static getPlatformCapabilities(type: string) {
    try {
      const platform = this.create(type)
      return {
        type: platform.type,
        name: platform.name,
        capabilities: platform.capabilities
      }
    } catch {
      return null
    }
  }

  static getAllPlatformCapabilities() {
    return this.getSupportedPlatforms().map(type => this.getPlatformCapabilities(type)).filter(Boolean)
  }

  static registerPlatform(type: string, platformClass: PlatformConstructor) {
    this.platforms.set(type.toLowerCase(), platformClass)
  }

  static isPlatformSupported(type: string): boolean {
    return this.platforms.has(type.toLowerCase())
  }

  // Group platforms by category
  static getPlatformsByCategory() {
    const allPlatforms = this.getAllPlatformCapabilities()
    
    return {
      social: allPlatforms.filter(p => ['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok'].includes(p!.type)),
      email: allPlatforms.filter(p => ['mailchimp'].includes(p!.type)),
      cms: allPlatforms.filter(p => ['wordpress'].includes(p!.type))
    }
  }
}

// Export platform instances for direct use
export const createPlatform = (type: string): BasePlatform => PlatformRegistry.create(type)

// Export platform types
export const PLATFORM_TYPES = {
  // Social Media
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  
  // Email
  MAILCHIMP: 'mailchimp',
  
  // CMS
  WORDPRESS: 'wordpress'
} as const

export type PlatformType = typeof PLATFORM_TYPES[keyof typeof PLATFORM_TYPES]

// Platform categories for UI grouping
export const PLATFORM_CATEGORIES = {
  SOCIAL: 'social',
  EMAIL: 'email',
  CMS: 'cms'
} as const

export type PlatformCategory = typeof PLATFORM_CATEGORIES[keyof typeof PLATFORM_CATEGORIES]