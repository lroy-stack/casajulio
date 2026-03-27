import { type NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes: skip i18n entirely ──────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Login page: serve as-is, no auth check, no i18n
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // All other /admin/* routes: require session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ── Public routes: i18n handling ─────────────────────────────────────
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|favicon\\.ico|.*\\..*).*)', '/'],
};
