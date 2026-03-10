'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Menu, X, Shield, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWallet } from '@/components/providers/wallet-provider';
import { cn } from '@/lib/utils';

// Role-based navigation
const getNavigation = (role: string | undefined) => {
  const base = [{ name: 'Dashboard', href: '/dashboard' }];
  
  switch (role) {
    case 'producer':
      return [
        ...base,
        { name: 'Submit Proposal', href: '/proposals/new' },
        { name: 'My Proposals', href: '/proposals' },
        { name: 'My Credits', href: '/credits' },
      ];
    case 'buyer':
      return [
        ...base,
        { name: 'Marketplace', href: '/marketplace' },
        { name: 'Price Analytics', href: '/analytics' },
        { name: 'My Credits', href: '/credits' },
      ];
    case 'certification_body':
      return [
        ...base,
        { name: 'Review Portal', href: '/verification' },
        { name: 'All Proposals', href: '/proposals' },
      ];
    default:
      return [
        ...base,
        { name: 'Marketplace', href: '/marketplace' },
        { name: 'My Credits', href: '/credits' },
        { name: 'Proposals', href: '/proposals' },
      ];
  }
};

const roleLabels: Record<string, string> = {
  producer: 'Seller',
  buyer: 'Buyer',
  certification_body: 'Certifier',
};

export function Header() {
  const pathname = usePathname();
  const { user, isConnecting, isConnected, login, logout, switchRole } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleSwitch = (role: 'producer' | 'buyer' | 'certification_body') => {
    switchRole(role);
    toast.success(`Switched to ${roleLabels[role]} role`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CarbonX</span>
          </Link>
          
          <div className="hidden lg:flex lg:gap-1">
            {getNavigation(user?.role).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isConnected && user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-accent">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {user.display_name}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        {roleLabels[user.role] || user.role}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleRoleSwitch('producer')}
                    className={cn(user.role === 'producer' && 'bg-accent')}
                  >
                    <Leaf className="mr-2 h-4 w-4" />
                    Seller (Producer)
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleRoleSwitch('buyer')}
                    className={cn(user.role === 'buyer' && 'bg-accent')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Buyer
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleRoleSwitch('certification_body')}
                    className={cn(user.role === 'certification_body' && 'bg-accent')}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Certifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isConnecting} className="hidden sm:flex">
                  {isConnecting ? 'Signing in...' : 'Sign In'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Choose your role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => login('producer')}>
                  <Leaf className="mr-2 h-4 w-4" />
                  Sign in as Seller
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => login('buyer')}>
                  <User className="mr-2 h-4 w-4" />
                  Sign in as Buyer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => login('certification_body')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign in as Certifier
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-4 pb-4">
            {getNavigation(user?.role).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block rounded-md px-3 py-2 text-base font-medium',
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
            
            {isConnected && user ? (
              <div className="mt-4 border-t border-border pt-4">
                <div className="mb-3 flex items-center gap-3 px-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.display_name}</p>
                    <p className="text-sm text-muted-foreground">{roleLabels[user.role]}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => { handleRoleSwitch('producer'); setMobileMenuOpen(false); }}
                    className={cn(
                      'block w-full rounded-md px-3 py-2 text-left text-sm',
                      user.role === 'producer' ? 'bg-accent' : 'hover:bg-accent'
                    )}
                  >
                    Switch to Seller
                  </button>
                  <button
                    onClick={() => { handleRoleSwitch('buyer'); setMobileMenuOpen(false); }}
                    className={cn(
                      'block w-full rounded-md px-3 py-2 text-left text-sm',
                      user.role === 'buyer' ? 'bg-accent' : 'hover:bg-accent'
                    )}
                  >
                    Switch to Buyer
                  </button>
                  <button
                    onClick={() => { handleRoleSwitch('certification_body'); setMobileMenuOpen(false); }}
                    className={cn(
                      'block w-full rounded-md px-3 py-2 text-left text-sm',
                      user.role === 'certification_body' ? 'bg-accent' : 'hover:bg-accent'
                    )}
                  >
                    Switch to Certifier
                  </button>
                </div>
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <p className="px-3 text-sm font-medium text-muted-foreground">Sign in as:</p>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    login('producer');
                    setMobileMenuOpen(false);
                  }}
                  disabled={isConnecting}
                >
                  <Leaf className="mr-2 h-4 w-4" />
                  Seller (Producer)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    login('buyer');
                    setMobileMenuOpen(false);
                  }}
                  disabled={isConnecting}
                >
                  <User className="mr-2 h-4 w-4" />
                  Buyer
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    login('certification_body');
                    setMobileMenuOpen(false);
                  }}
                  disabled={isConnecting}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Certifier
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
