import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/firebase';
import type { UserRole } from '@/types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      discordId: string;
      username: string;
      avatar: string;
      role: UserRole;
      robloxUserId: string | null;
    };
  }

  interface User {
    discordId: string;
    username: string;
    avatar: string;
    role: UserRole;
    robloxUserId: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    discordId: string;
    username: string;
    avatar: string;
    role: UserRole;
    robloxUserId: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Verification Code',
      credentials: {
        code: {
          label: 'Verification Code',
          type: 'text',
          placeholder: 'Enter your verification code',
        },
      },

      async authorize(credentials) {
        if (!credentials?.code) return null;

        const code = credentials.code.trim().toUpperCase();
        const codeRef = db.ref(`verificationCodes/${code}`);
        const snapshot = await codeRef.once('value');

        if (!snapshot.exists()) return null;

        const data = snapshot.val();

        const now = Date.now();
        const expiresAt = data.expiresAt as number;
        if (now > expiresAt) {
          await codeRef.remove();
          return null;
        }

        await codeRef.remove();

        return {
          id: data.discordId || data.robloxUserId || 'unknown',
          discordId: data.discordId || '',
          username: data.username || 'Unknown',
          avatar: data.avatar || '',
          role: (data.role as UserRole) || 'user',
          robloxUserId: data.robloxUserId || null,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.discordId = user.discordId;
        token.username = user.username;
        token.avatar = user.avatar;
        token.role = user.role;
        token.robloxUserId = user.robloxUserId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.discordId = token.discordId;
        session.user.username = token.username;
        session.user.avatar = token.avatar;
        session.user.role = token.role;
        session.user.robloxUserId = token.robloxUserId;
      }
      return session;
    },
  },

  pages: {
    signIn: '/',
  },
};
