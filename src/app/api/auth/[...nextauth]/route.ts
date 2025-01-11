import NextAuth from 'next-auth'
import type { NextAuthOptions, Session, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import { SiweMessage } from 'siwe'

interface ExtendedSession extends Session {
  user: {
    address?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

interface ExtendedUser extends User {
  address: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'siwe',
      name: 'SIWE',
      credentials: {
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' }
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        try {
          if (!credentials?.message || !credentials?.signature) {
            throw new Error('Missing message or signature')
          }

          const siweMessage = new SiweMessage(JSON.parse(credentials.message))
          const fields = await siweMessage.verify({
            signature: credentials.signature,
            domain: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).host : '',
            time: new Date().toISOString()
          })

          if (!fields.success) {
            throw new Error('Invalid signature')
          }

          return {
            id: fields.data.address,
            address: fields.data.address,
            name: null,
            email: null,
            image: null
          }
        } catch (error) {
          console.error('SIWE error:', error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async session({ session, token }): Promise<ExtendedSession> {
      return {
        ...session,
        user: {
          ...session.user,
          address: token.sub
        },
        expires: session.expires
      }
    }
  },
  pages: {
    signIn: '/auth/login'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 