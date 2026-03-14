import { Context, Next } from 'hono'
import { eq } from 'drizzle-orm'
import { users } from '../db/schema'
import type { Env, Variables } from '../types'

/**
 * Privy JWT verification middleware.
 *
 * Verifies the JWT from the Authorization header against Privy's API,
 * extracts the wallet address, and ensures the user exists in DB.
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

  // Verify token with Privy API
  let privyUser: any
  try {
    const res = await fetch('https://auth.privy.io/api/v1/token/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'privy-app-id': appId,
        Authorization: `Basic ${btoa(`${appId}:${appSecret}`)}`,
      },
      body: JSON.stringify({ token }),
    })

    if (!res.ok) {
      return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, 401)
    }

    privyUser = await res.json()
  } catch {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Token verification failed' } }, 401)
  }

  // Extract wallet address from Privy user
  const wallet = privyUser?.user?.wallet?.address
    || privyUser?.user?.linked_accounts?.find((a: any) => a.type === 'wallet')?.address

  if (!wallet) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'No wallet linked' } }, 401)
  }

  const walletAddress = wallet.toLowerCase()
  const db = c.get('db')

  // Upsert user — create on first login
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.walletAddress, walletAddress))
    .limit(1)

  if (!user) {
    const id = crypto.randomUUID()
    await db.insert(users).values({ id, walletAddress })
    user = { id, walletAddress, createdAt: new Date().toISOString() }
  }

  c.set('userId', user.id)
  c.set('walletAddress', walletAddress)

  await next()
}
