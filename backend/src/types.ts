import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from './db/schema'

export type Env = {
  DB: D1Database
  UPLOADS: R2Bucket
  PRIVY_APP_ID: string
  PRIVY_APP_SECRET: string
  FRONTEND_URL: string
}

export type DbClient = DrizzleD1Database<typeof schema>

// Extends Hono's context variables
export type Variables = {
  userId: string
  walletAddress: string
  db: DbClient
}
