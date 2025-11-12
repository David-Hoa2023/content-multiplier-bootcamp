import Ajv, { JSONSchemaType } from 'ajv'

const ajv = new Ajv()

/**
 * Schema for a single idea object
 */
export interface IdeaItem {
  title: string
  description: string
  rationale: string
}

/**
 * Schema for array of ideas (10 ideas)
 */
export interface IdeasArray {
  ideas: IdeaItem[]
}

/**
 * JSON Schema for validating generated ideas
 */
const ideasArraySchema: JSONSchemaType<IdeasArray> = {
  type: 'object',
  properties: {
    ideas: {
      type: 'array',
      minItems: 10,
      maxItems: 10,
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1 },
          description: { type: 'string', minLength: 1 },
          rationale: { type: 'string', minLength: 1 },
        },
        required: ['title', 'description', 'rationale'],
        additionalProperties: false,
      },
    },
  },
  required: ['ideas'],
  additionalProperties: false,
}

/**
 * Alternative schema: array format (direct array of ideas)
 */
const ideasDirectArraySchema: JSONSchemaType<IdeaItem[]> = {
  type: 'array',
  minItems: 10,
  maxItems: 10,
  items: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: 'string', minLength: 1 },
      rationale: { type: 'string', minLength: 1 },
    },
    required: ['title', 'description', 'rationale'],
    additionalProperties: false,
  },
}

// Compile validators
const validateIdeasArray = ajv.compile(ideasArraySchema)
const validateDirectArray = ajv.compile(ideasDirectArraySchema)

/**
 * Validate and parse JSON response from LLM
 * Supports both { ideas: [...] } and [...] formats
 */
export function validateIdeasJSON(jsonString: string): {
  valid: boolean
  ideas?: IdeaItem[]
  error?: string
} {
  try {
    // Try to parse JSON
    const parsed = JSON.parse(jsonString)

    // Try object format first: { ideas: [...] }
    if (validateIdeasArray(parsed)) {
      return { valid: true, ideas: parsed.ideas }
    }

    // Try direct array format: [...]
    if (Array.isArray(parsed) && validateDirectArray(parsed)) {
      return { valid: true, ideas: parsed }
    }

    // If neither format works, return validation errors
    const errors = validateIdeasArray.errors || validateDirectArray.errors
    return {
      valid: false,
      error: `Validation failed: ${JSON.stringify(errors, null, 2)}`,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    }
  }
}

