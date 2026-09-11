'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  List,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/team-members', label: 'Team Members', icon: Users },
  { href: '/collections', label: 'Collections', icon: Wallet },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/transactions', label: 'Transactions', icon: List },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/export-pdf', label: 'Export PDF', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <DashboardShell>{children}</DashboardShell>
    </AuthGate>
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    router.replace('/sign-in');
  };

  const NavLinks = ({ onNavigate, mobile }: { onNavigate?: () => void; mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-2.5 text-sm font-medium transition-all relative',
              mobile ? 'rounded-lg px-3 py-2.5' : 'px-1 py-1.5',
              active
                ? mobile
                  ? 'bg-primary/10 text-primary rounded-lg'
                  : 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
            {!mobile && active && (
              <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-yellow-50/50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-2xl">🙏</span>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-sm font-bold text-foreground">Ganesh Chavithi</span>
                <span className="text-[10px] text-muted-foreground">Fund Manager 2026</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLinks />
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden md:flex flex-col text-right leading-tight">
                <span className="text-xs font-medium text-foreground">{profile?.name || 'Admin'}</span>
                <span className="text-[10px] text-muted-foreground">{profile?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                className="gap-1.5 text-muted-foreground hover:text-destructive"
              >
                {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                <span className="hidden sm:inline">Logout</span>
              </Button>
              {/* Mobile menu trigger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <SheetHeader className="border-b border-border px-5 py-4">
                    <SheetTitle className="flex items-center gap-2">
                      <span className="text-2xl">🙏</span>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold">Ganesh Chavithi</span>
                        <span className="text-xs text-muted-foreground font-normal">Fund Manager 2026</span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 p-3">
                    <NavLinks onNavigate={() => setMobileOpen(false)} mobile />
                  </nav>
                  <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
                    <div className="mb-2 px-3">
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="text-sm font-medium text-foreground truncate">{profile?.name || 'Admin'}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full gap-1.5"
                    >
                      {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
