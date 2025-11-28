import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

export interface AIConfig {
  claudeApiKey?: string;       // Encrypted API key for Claude (direct)
  openRouterApiKey?: string;   // Encrypted API key for OpenRouter
  aiProvider?: 'claude' | 'openrouter';  // Which AI provider to use
  openRouterModel?: string;    // Model to use with OpenRouter (e.g., 'anthropic/claude-3.5-sonnet')
  imageApiKey?: string;        // Encrypted API key for image generation
  imageProvider?: 'openai' | 'stability' | 'none';
}

export interface UserSettings {
  aiConfig?: AIConfig;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  isAdmin?: boolean;
  settings?: UserSettings;
}

interface UsersData {
  users: User[];
}

const USERS_FILE = path.join(process.cwd(), 'src', 'data', 'users.json');

/**
 * Read users from JSON file
 */
async function readUsers(): Promise<UsersData> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty structure
    return { users: [] };
  }
}

/**
 * Write users to JSON file
 */
async function writeUsers(data: UsersData): Promise<void> {
  await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Create a new user
 */
export async function createUser(email: string, password: string, name: string): Promise<User> {
  const data = await readUsers();

  // Check if user already exists
  if (data.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Check if this is the first user (make them admin)
  const isFirstUser = data.users.length === 0;

  // Create user object
  const user: User = {
    id: `user_${nanoid()}`,
    email: email.toLowerCase(),
    passwordHash,
    name,
    createdAt: new Date().toISOString(),
    isAdmin: isFirstUser, // First user is automatically admin
  };

  // Add to users array
  data.users.push(user);

  // Write to file
  await writeUsers(data);

  return user;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const data = await readUsers();
  return data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const data = await readUsers();
  return data.users.find(u => u.id === id) || null;
}

/**
 * Verify user password
 */
export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

/**
 * Get all users (without password hashes)
 */
export async function getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
  const data = await readUsers();
  return data.users.map(({ passwordHash, ...user }) => user);
}

/**
 * Update user
 */
export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'passwordHash'>>): Promise<User | null> {
  const data = await readUsers();
  const index = data.users.findIndex(u => u.id === id);

  if (index === -1) {
    return null;
  }

  data.users[index] = {
    ...data.users[index],
    ...updates,
  };

  await writeUsers(data);
  return data.users[index];
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<boolean> {
  const data = await readUsers();
  const initialLength = data.users.length;

  data.users = data.users.filter(u => u.id !== id);

  if (data.users.length === initialLength) {
    return false;
  }

  await writeUsers(data);
  return true;
}

/**
 * Get user settings
 */
export async function getUserSettings(id: string): Promise<UserSettings | null> {
  const user = await findUserById(id);
  if (!user) return null;
  return user.settings || {};
}

/**
 * Update user settings
 */
export async function updateUserSettings(id: string, settings: Partial<UserSettings>): Promise<UserSettings | null> {
  const data = await readUsers();
  const index = data.users.findIndex(u => u.id === id);

  if (index === -1) {
    return null;
  }

  // Merge settings
  data.users[index].settings = {
    ...data.users[index].settings,
    ...settings,
  };

  await writeUsers(data);
  return data.users[index].settings || {};
}

/**
 * Update AI config specifically
 */
export async function updateAIConfig(id: string, aiConfig: Partial<AIConfig>): Promise<AIConfig | null> {
  const data = await readUsers();
  const index = data.users.findIndex(u => u.id === id);

  if (index === -1) {
    return null;
  }

  // Initialize settings if needed
  if (!data.users[index].settings) {
    data.users[index].settings = {};
  }

  // Merge AI config
  data.users[index].settings!.aiConfig = {
    ...data.users[index].settings?.aiConfig,
    ...aiConfig,
  };

  await writeUsers(data);
  return data.users[index].settings?.aiConfig || {};
}
