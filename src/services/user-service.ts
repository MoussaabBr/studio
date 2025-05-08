
'use server';
import { prisma } from '@/lib/db';
import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

export type UserProfile = Omit<User, 'password'>; // Exclude password from profile type

export interface CreateUserInput {
  email: string;
  username: string;
  password_DO_NOT_LOG: string; // Raw password, ensure not logged
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
}

export async function createUser(data: CreateUserInput): Promise<UserProfile> {
  const hashedPassword = await bcrypt.hash(data.password_DO_NOT_LOG, 10);

  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return newUser;
}

export async function updateUserProfile(uid: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'password'>>): Promise<UserProfile | null> {
  const updatedUser = await prisma.user.update({
    where: { id: uid },
    data: {
      ...data,
      // password should be updated via a separate "change password" flow
    },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return updatedUser;
}
