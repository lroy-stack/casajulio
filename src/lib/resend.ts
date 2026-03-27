import { Resend } from 'resend';

// Lazy initialization — the Resend client is only created when getResend()
// is called at runtime, never at module import / build time.
export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(key);
}
