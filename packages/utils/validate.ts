/**
 * Simple validation utility
 * Validates data against JSON schema
 */

export function ensureValid(schema: any, data: any): void {
  // Simple validation - in production, use a library like Ajv
  if (!data) {
    throw new Error('Data is required')
  }

  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
  }

  // Type checking for properties
  if (schema.properties) {
    for (const [key, value] of Object.entries(schema.properties)) {
      if (key in data) {
        const prop = value as any
        const actualType = Array.isArray(data[key]) ? 'array' : typeof data[key]
        
        if (prop.type && actualType !== prop.type) {
          throw new Error(`Field ${key} should be ${prop.type}, got ${actualType}`)
        }
      }
    }
  }
}

export function validate(schema: any, data: any): { valid: boolean; errors: string[] } {
  try {
    ensureValid(schema, data)
    return { valid: true, errors: [] }
  } catch (error: any) {
    return { valid: false, errors: [error.message] }
  }
}

