import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

async function getUser(email: string): Promise<User | null> {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;

          // Check if password matches (bcrypt)
          // NOTE: If your DB has plain text passwords (legacy), this will fail.
          // For the requested "admin@sistema.com" / "password123", we need to ensure it's hashed in DB
          // OR we temporarily allow plain text comparison (NOT RECOMMENDED FOR PROD but useful for migration).
          
          // Let's try bcrypt first.
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;

          // FALLBACK: If bcrypt fails, check plain text (ONLY FOR MIGRATION/DEV)
          if (password === user.password) {
             // Optional: Hash it now and save it? 
             // await db.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(password, 10) } });
             return user;
          }
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
