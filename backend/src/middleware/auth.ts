import { Context, Next } from 'hono'
import { eq } from 'drizzle-orm'
import { PrivyClient } from '@privy-io/server-auth'
import { users } from '../db/schema'
import type { Env, Variables } from '../types'

/**
 * Privy JWT verification middleware.
 *
 * Uses @privy-io/server-auth to verify the access token,
 * then fetches the user's linked accounts to get their wallet address.
 *
 * Sets c.var.userId and c.var.walletAddress for downstream handlers.
 */
export async function authMiddleware(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Missing auth token' } }, 401)
  }

  const token = authHeader.slice(7)
  const appId = c.env.PRIVY_APP_ID
  const appSecret = c.env.PRIVY_APP_SECRET

  if (!appId || !appSecret) {
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Auth not configured' } }, 500)
  }

  const privy = new PrivyClient(appId, appSecret)

  // 1. Verify the access token
  let verifiedClaims: any
  try {
    verifiedClaims = await privy.verifyAuthToken(token)
  } catch (err) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, 401)
  }

  const privyDid = verifiedClaims.userId
  if (!privyDid) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token payload' } }, 401)
  }

  // 2. Get user's wallet address from Privy
  let walletAddress: string | null = null
  try {
    const privyUser = await privy.getUser(privyDid)
    const wallet = privyUser?.wallet
      || privyUser?.linkedAccounts?.find((a: any) => a.type === 'wallet')
    walletAddress = (wallet as any)?.address?.toLowerCase() || null
  } catch {
    // Non-fatal — wallet may not exist for email-only users
  }

  // Use Privy DID as fallback identifier if no wallet
  const userIdentifier = walletAddress || privyDid.replace('did:privy:', '')
  const db = c.get('db')

  // Upsert user — create on first login
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.walletAddress, userIdentifier))
    .limit(1)

  if (!user) {
    const id = crypto.randomUUID()
    await db.insert(users).values({ id, walletAddress: userIdentifier })
    user = { id, walletAddress: userIdentifier, createdAt: new Date().toISOString() }
  }

  c.set('userId', user.id)
  c.set('walletAddress', walletAddress || '')

  await next()
}
