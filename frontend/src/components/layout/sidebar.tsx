'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  UserCircle,
  Handshake,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'divider', href: '', icon: null },
  { name: 'ATS', href: '', icon: null, isSection: true },
  { name: 'Candidatos', href: '/ats/candidates', icon: Users },
  { name: 'Ofertas', href: '/ats/jobs', icon: Briefcase },
  { name: 'divider', href: '', icon: null },
  { name: 'CRM', href: '', icon: null, isSection: true },
  { name: 'Empresas', href: '/crm/companies', icon: Building2 },
  { name: 'Contactos', href: '/crm/contacts', icon: UserCircle },
  { name: 'Oportunidades', href: '/crm/opportunities', icon: Handshake },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-bold text-indigo-400">Business OS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item, index) => {
          if (item.name === 'divider') {
            return <Separator key={index} className="my-3 bg-slate-700" />;
          }

          if (item.isSection) {
            return (
              <div key={item.name} className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {item.name}
              </div>
            );
          }

          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600">
            <span className="text-sm font-medium">
              {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-slate-300 hover:bg-slate-800 hover:text-white"
            asChild
          >
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Config
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
