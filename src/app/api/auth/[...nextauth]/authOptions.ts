import SteamProvider, { PROVIDER_ID } from 'next-auth-steam'

import type { AuthOptions } from 'next-auth'
import type { NextRequest } from 'next/server'

export function getAuthOptions(req?: NextRequest): AuthOptions {
  return {
    providers: req
      ? [
          SteamProvider(req, {
            clientSecret: "835F4070BDF4C82BEAF49B3EBB06B093",
            callbackUrl: 'http://localhost:3000/api/auth/callback'
          })
        ]
      : [],
    callbacks: {
      jwt({ token, account, profile }) {
        if (account?.provider === PROVIDER_ID) {
          token.steam = profile
        }
        return token
      },
      session({ session, token }) {
        if ('steam' in token) {
          // @ts-expect-error
          session.user.steam = token.steam
        }
        return session
      }
    }
  }
}