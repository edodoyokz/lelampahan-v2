import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  TICKET_TOKEN_SECRET: z.string().min(16),
  PAYMENT_WEBHOOK_SECRET: z.string().min(16).default('dev-webhook-secret-for-local'),
  CRON_SECRET: z.string().min(16).default('dev-cron-secret-for-local'),
  APP_BASE_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const firstIssue = parsed.error.issues[0];
  const key = firstIssue?.path.join('.') || 'unknown';
  throw new Error(`Missing required environment variable: ${key}`);
}

export const env = parsed.data;
