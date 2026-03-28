import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './firebase'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email?: string
      image?: string | null
      role: string
      robloxUserId: string | null
      discordId: string
    }
  }
  interface User {
    role: string
    robloxUserId: string | null
    discordId: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    robloxUserId: string | null
    discordId: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Discord Verification',
      credentials: {
        code: { label: 'Verification Code', type: 'text', placeholder: 'Enter code from /verify' },
      },
      async authorize(credentials) {
        if (!credentials?.code) return null

        const code = credentials.code.trim().toUpperCase()

        try {
          // Look up the verification code in Firebase
          const snapshot = await db.ref(`verificationCodes/${code}`).once('value')
          const verificationData = snapshot.val()

          if (!verificationData) {
            return null
          }

          // Check expiry
          if (Date.now() > verificationData.expiresAt) {
            // Clean up expired code
            await db.ref(`verificationCodes/${code}`).remove()
            return null
          }

          // Delete the code (one-time use)
          await db.ref(`verificationCodes/${code}`).remove()

          // Return user object
          return {
            id: verificationData.discordId,
            name: verificationData.username,
            image: verificationData.avatar
              ? `https://cdn.discordapp.com/avatars/${verificationData.discordId}/${verificationData.avatar}.png`
              : null,
            role: verificationData.role,
            robloxUserId: verificationData.robloxUserId || null,
            discordId: verificationData.discordId,
          }
        } catch (error) {
          console.error('Verification error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.robloxUserId = user.robloxUserId
        token.discordId = user.discordId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.robloxUserId = token.robloxUserId as string | null
        session.user.discordId = token.discordId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
