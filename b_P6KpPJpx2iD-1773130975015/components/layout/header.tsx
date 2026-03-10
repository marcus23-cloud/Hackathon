'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Menu, X, Shield } from 'lucide-react';
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

export function Header() {
  const pathname = usePathname();
  const { address, isConnecting, isConnected, connect, disconnect, user } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const updateRole = async (role: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Role updated to ${role === 'certification_body' ? 'Certifier' : role}. Refreshing...`);
        // Force page reload to refresh user state
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('[v0] Role update error:', error);
      toast.error('Failed to update role');
    }
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
          {isConnected ? (
            <div className="hidden items-center gap-3 sm:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-end text-left hover:opacity-80">
                    <span className="text-sm font-medium text-foreground">
                      {user?.display_name || formatAddress(address!)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      {user?.role === 'certification_body' ? 'Certifier' : user?.role === 'producer' ? 'Producer' : 'Buyer'}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => updateRole('producer')}>
                    Producer (Seller)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateRole('buyer')}>
                    Buyer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateRole('certification_body')}>
                    Certifier
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={connect} disabled={isConnecting} className="hidden sm:flex">
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
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
            
            {isConnected ? (
              <div className="mt-4 border-t border-border pt-4">
                <p className="px-3 text-sm text-muted-foreground">
                  Connected: {formatAddress(address!)}
                </p>
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => {
                    disconnect();
                    setMobileMenuOpen(false);
                  }}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                className="mt-4 w-full"
                onClick={() => {
                  connect();
                  setMobileMenuOpen(false);
                }}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
