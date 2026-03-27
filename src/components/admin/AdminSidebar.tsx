'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  UtensilsCrossed,
  FileText,
  LogOut,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/reservas', label: 'Reservas', icon: CalendarDays },
  { href: '/admin/carta', label: 'Carta', icon: UtensilsCrossed },
  { href: '/admin/contenido', label: 'Contenido', icon: FileText },
] as const;

interface AdminSidebarProps {
  readonly onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  }

  return (
    <div className="flex flex-col h-full bg-carbon text-crema-light">
      <div className="p-4 border-b border-white/10">
        <h2 className="font-heading text-xl text-crema-light">Casa Julio</h2>
        <p className="text-xs text-crema-light/50 mt-0.5">Administración</p>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-terracota text-white'
                  : 'text-crema-light/70 hover:bg-white/10 hover:text-crema-light'
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-crema-light/70 hover:bg-white/10 hover:text-crema-light transition-colors w-full"
        >
          <LogOut className="size-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
