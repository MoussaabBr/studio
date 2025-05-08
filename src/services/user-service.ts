'use server';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // For generating UUIDs

// Define User and UserProfile types locally
export interface User {
  id: string;
  email: string;
  username: string;
  password?: string; // Hashed password
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export type UserProfile = Omit<User, 'password'>;

export interface CreateUserInput {
  email: string;
  username: string;
  password_DO_NOT_LOG: string; // Raw password, ensure not logged
}

const dbPath = path.join(process.cwd(), 'database.json');

async function readDb(): Promise<User[]> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data) as User[];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array (or create it)
      await fs.writeFile(dbPath, JSON.stringify([]));
      return [];
    }
    console.error('Error reading database:', error);
    throw new Error('Could not read database');
  }
}

async function writeDb(users: User[]): Promise<void> {
  try {
    await fs.writeFile(dbPath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
    throw new Error('Could not write to database');
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const users = await readDb();
  const user = users.find(u => u.id === uid);
  if (!user) return null;
  const { password, ...userProfile } = user;
  return userProfile;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await readDb();
  const user = users.find(u => u.email === email);
  return user || null;
}

export async function createUser(data: CreateUserInput): Promise<UserProfile> {
  const users = await readDb();

  if (users.find(u => u.email === data.email)) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(data.password_DO_NOT_LOG, 10);
  const now = new Date().toISOString();

  const newUser: User = {
    id: crypto.randomUUID(),
    email: data.email,
    username: data.username,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);
  await writeDb(users);

  const { password, ...userProfile } = newUser;
  return userProfile;
}

export async function updateUserProfile(uid: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'password'>>): Promise<UserProfile | null> {
  const users = await readDb();
  const userIndex = users.findIndex(u => u.id === uid);

  if (userIndex === -1) {
    return null;
  }

  const updatedUser = {
    ...users[userIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  users[userIndex] = updatedUser;

  await writeDb(users);

  const { password, ...userProfile } = updatedUser;
  return userProfile;
}
