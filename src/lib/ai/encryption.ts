import crypto from 'crypto';

// Use a server-side secret for encryption
// In production, this should be an environment variable
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_SECRET || 'dnd-lazydm-default-key-32bytes!';

// Ensure key is 32 bytes for AES-256
function getKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

/**
 * Encrypt a string (e.g., API key)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a string
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(':');
  if (!ivHex || !encrypted) {
    throw new Error('Invalid encrypted format');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', getKey(), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Mask an API key for display (show first 8 and last 4 chars)
 */
export function maskApiKey(key: string): string {
  if (key.length <= 12) {
    return '****';
  }
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

/**
 * Validate Claude API key format
 */
export function isValidClaudeApiKey(key: string): boolean {
  // Claude API keys start with 'sk-ant-' and are typically longer
  return key.startsWith('sk-ant-') && key.length > 20;
}

/**
 * Validate OpenRouter API key format
 */
export function isValidOpenRouterApiKey(key: string): boolean {
  // OpenRouter API keys can start with 'sk-or-' or 'sk-or-v1-' and are fairly long
  return (key.startsWith('sk-or-') || key.startsWith('sk-or-v1-')) && key.length > 20;
}

/**
 * Validate OpenAI API key format
 */
export function isValidOpenAIApiKey(key: string): boolean {
  // OpenAI API keys start with 'sk-' and are typically 51 characters
  return key.startsWith('sk-') && key.length >= 40;
}
