/**
 * Security utilities for sanitizing user input and preventing path traversal attacks
 */

/**
 * Sanitizes a slug for use in file paths
 * - Removes path traversal sequences (.., /, \)
 * - Converts to lowercase
 * - Only allows alphanumeric characters and hyphens
 * - Prevents directory traversal attacks
 *
 * @param slug - User-provided slug
 * @returns Sanitized slug safe for use in file paths
 */
export function sanitizeSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Invalid slug: must be a non-empty string')
  }

  // Remove any path traversal attempts
  let sanitized = slug.replace(/\.\./g, '')

  // Remove forward and back slashes
  sanitized = sanitized.replace(/[/\\]/g, '-')

  // Convert to lowercase
  sanitized = sanitized.toLowerCase()

  // Only allow alphanumeric characters and hyphens
  sanitized = sanitized.replace(/[^a-z0-9-]/g, '-')

  // Remove consecutive hyphens
  sanitized = sanitized.replace(/-+/g, '-')

  // Remove leading/trailing hyphens
  sanitized = sanitized.replace(/^-|-$/g, '')

  // Ensure it's not empty after sanitization
  if (!sanitized) {
    throw new Error('Invalid slug: contains no valid characters')
  }

  // Prevent reserved names
  const reserved = ['api', 'admin', '_next', 'public', 'static', 'node_modules']
  if (reserved.includes(sanitized)) {
    throw new Error(`Invalid slug: '${sanitized}' is a reserved name`)
  }

  return sanitized
}

/**
 * Validates a campaign ID to prevent path traversal
 * More strict than slug sanitization - throws on invalid input
 *
 * @param campaignId - Campaign ID from URL/request
 * @returns Validated campaign ID
 * @throws Error if campaign ID is invalid
 */
export function validateCampaignId(campaignId: string): string {
  if (!campaignId || typeof campaignId !== 'string') {
    throw new Error('Invalid campaign ID')
  }

  // Must match slug pattern
  if (!/^[a-z0-9-]+$/.test(campaignId)) {
    throw new Error('Invalid campaign ID format')
  }

  // No path traversal
  if (campaignId.includes('..') || campaignId.includes('/') || campaignId.includes('\\')) {
    throw new Error('Invalid campaign ID: path traversal detected')
  }

  return campaignId
}

/**
 * Validates and sanitizes a scene slug
 *
 * @param sceneSlug - Scene slug from URL/request
 * @returns Validated scene slug
 */
export function validateSceneSlug(sceneSlug: string): string {
  return validateCampaignId(sceneSlug) // Same validation rules
}

/**
 * Validates a character ID (can be alphanumeric with some special chars)
 *
 * @param characterId - Character ID
 * @returns Validated character ID
 */
export function validateCharacterId(characterId: string | number): string {
  const id = String(characterId)

  if (!id || id.length === 0) {
    throw new Error('Invalid character ID: empty')
  }

  // Allow alphanumeric, hyphens, and underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error('Invalid character ID format')
  }

  return id
}

/**
 * Sanitizes a filename for safe storage
 * Removes path traversal and dangerous characters
 *
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename')
  }

  // Get file extension
  const lastDot = filename.lastIndexOf('.')
  const name = lastDot > 0 ? filename.substring(0, lastDot) : filename
  const ext = lastDot > 0 ? filename.substring(lastDot) : ''

  // Sanitize name part
  let sanitized = name
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (!sanitized) {
    sanitized = 'file'
  }

  // Validate extension (whitelist)
  const allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.pdf', '.json', '.mdx', '.md', '.txt'
  ]

  const safeExt = ext.toLowerCase()
  if (ext && !allowedExtensions.includes(safeExt)) {
    throw new Error(`Invalid file extension: ${ext}`)
  }

  return sanitized + safeExt
}

/**
 * Validates and sanitizes a URL to prevent XSS and injection
 *
 * @param url - URL to validate
 * @param allowedProtocols - Allowed URL protocols (default: http, https)
 * @returns Validated URL
 */
export function validateUrl(
  url: string,
  allowedProtocols: string[] = ['http:', 'https:']
): string {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL')
  }

  try {
    const parsed = new URL(url)

    if (!allowedProtocols.includes(parsed.protocol)) {
      throw new Error(`Invalid URL protocol: ${parsed.protocol}`)
    }

    return url
  } catch (error) {
    throw new Error('Invalid URL format')
  }
}

/**
 * Validates a hex color code
 *
 * @param color - Hex color code
 * @returns Validated color code
 */
export function validateColor(color: string): string {
  if (!color || typeof color !== 'string') {
    throw new Error('Invalid color')
  }

  // Must be valid hex color (#RGB or #RRGGBB)
  if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    throw new Error('Invalid color format. Use hex format (#RGB or #RRGGBB)')
  }

  return color.toLowerCase()
}

/**
 * Validates a number is within a range
 *
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param name - Name of the field (for error messages)
 * @returns Validated number
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  name: string = 'value'
): number {
  const num = Number(value)

  if (isNaN(num)) {
    throw new Error(`Invalid ${name}: not a number`)
  }

  if (num < min || num > max) {
    throw new Error(`Invalid ${name}: must be between ${min} and ${max}`)
  }

  return num
}
