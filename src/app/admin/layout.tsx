'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Menu, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setIsAuthenticated(true);
      } else if (pathname !== '/admin/login') {
        router.replace('/admin/login');
        return;
      }

      setAuthChecked(true);
    }

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session && pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Login page renders without the sidebar shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-terracota" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-crema">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 z-30">
        <AdminSidebar />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-carbon flex items-center justify-between px-4 h-14">
        <h2 className="font-heading text-lg text-crema-light">Casa Julio</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="text-crema-light hover:bg-white/10"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/30"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-64">
            <AdminSidebar onNavigate={() => setMobileMenuOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-56 min-h-screen">
        <div className="pt-14 md:pt-0">{children}</div>
      </main>
    </div>
  );
}
