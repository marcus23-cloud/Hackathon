'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Leaf,
  TrendingUp,
  ShoppingCart,
  FileCheck,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Coins,
  BarChart3,
  Plus,
  Eye,
} from 'lucide-react';
import { useWallet } from '@/components/providers/wallet-provider';
import { useCarbonStore } from '@/lib/store';
import { formatEthPrice, calculatePricePerTon } from '@/lib/eth-utils';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  submitted: { label: 'Submitted', variant: 'outline' },
  under_review: { label: 'Under Review', variant: 'default' },
  approved: { label: 'Approved', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

const creditStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  minted: { label: 'Minted', variant: 'secondary' },
  listed: { label: 'Listed', variant: 'default' },
  transferred: { label: 'Transferred', variant: 'outline' },
  retired: { label: 'Retired', variant: 'destructive' },
  revoked: { label: 'Revoked', variant: 'destructive' },
};

export default function DashboardPage() {
  const { user, isConnected } = useWallet();
  
  // Get data from store
  const proposals = useCarbonStore((state) => state.proposals);
  const credits = useCarbonStore((state) => state.credits);
  const users = useCarbonStore((state) => state.users);
  const getDashboardStats = useCarbonStore((state) => state.getDashboardStats);
  const getOpenSellOrders = useCarbonStore((state) => state.getOpenSellOrders);
  
  const stats = getDashboardStats();

  // Role-specific data
  const myProposals = user?.role === 'producer' 
    ? proposals.filter(p => p.producer_id === user.id).slice(0, 3)
    : proposals.slice(0, 3);
  const myCredits = user 
    ? credits.filter(c => c.owner_id === user.id).slice(0, 4)
    : credits.slice(0, 4);
  const openListings = getOpenSellOrders().slice(0, 3);
  const pendingReviews = proposals.filter(
    (p) => p.status === 'submitted' || p.status === 'under_review'
  );

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Leaf className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">Connect Your Wallet</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Connect your MetaMask wallet to access your dashboard and manage your carbon credits.
        </p>
      </div>
    );
  }

  // Producer Dashboard
  const renderProducerDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Proposals</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals.filter(p => p.producer_id === user?.id).length}</div>
            <p className="text-xs text-muted-foreground">{stats.approvedProposals} approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Credits</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCredits}</div>
            <p className="text-xs text-muted-foreground">{stats.totalCO2Tonnage} tCO2e total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listed for Sale</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingProposals}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Proposals</CardTitle>
              <CardDescription>Recent carbon credit proposals</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/proposals/new">
                <Plus className="mr-1 h-4 w-4" />
                New Proposal
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myProposals.map((proposal) => {
                const config = statusConfig[proposal.status];
                return (
                  <div key={proposal.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{proposal.title}</p>
                      <p className="text-sm text-muted-foreground">{proposal.credit_quantity} tCO2e</p>
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                );
              })}
            </div>
            <Button variant="ghost" className="mt-4 w-full" asChild>
              <Link href="/proposals">View All Proposals<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Credits</CardTitle>
            <CardDescription>Your carbon credit NFTs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {myCredits.map((credit) => {
                const config = creditStatusConfig[credit.status];
                return (
                  <div key={credit.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Leaf className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{credit.metadata.name}</p>
                        <p className="text-sm text-muted-foreground">{credit.metadata.co2_tonnage} tCO2e | Token #{credit.token_id}</p>
                      </div>
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                );
              })}
            </div>
            <Button variant="ghost" className="mt-4 w-full" asChild>
              <Link href="/credits">View All Credits<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );

  // Buyer Dashboard
  const renderBuyerDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <p className="text-xs text-muted-foreground">Open sell orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTradeVolume.toFixed(2)} ETH</div>
            <p className="text-xs text-muted-foreground">{stats.totalTraded} trades</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Credits</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCredits}</div>
            <p className="text-xs text-muted-foreground">Owned NFTs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retired</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRetired}</div>
            <p className="text-xs text-muted-foreground">Credits burned</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Marketplace</CardTitle>
              <CardDescription>Available carbon credits for purchase</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/marketplace">Browse All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {openListings.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Leaf className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{order.credit.metadata.name}</p>
                      <p className="text-sm text-muted-foreground">{order.credit.metadata.co2_tonnage} tCO2e</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{formatEthPrice(order.asking_price_eth, 2)} ETH</p>
                    <p className="text-xs text-muted-foreground">
                      {calculatePricePerTon(order.asking_price_eth, order.credit.metadata.co2_tonnage)} ETH/ton
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="mt-4 w-full" asChild>
              <Link href="/marketplace">View Marketplace<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Price Analytics</CardTitle>
              <CardDescription>Market trends and insights</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/analytics"><BarChart3 className="mr-1 h-4 w-4" />Full Analytics</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Average Price</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(stats.totalTradeVolume / Math.max(stats.totalTraded, 1)).toFixed(3)} ETH
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Total CO2 Traded</p>
                  <p className="text-lg font-bold text-foreground">{stats.totalCO2Tonnage} tCO2e</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Avg Price/Ton</p>
                  <p className="text-lg font-bold text-foreground">
                    {(stats.totalTradeVolume / Math.max(stats.totalCO2Tonnage, 1)).toFixed(4)} ETH
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  // Certifier Dashboard
  const renderCertifierDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReviews.length}</div>
            <p className="text-xs text-muted-foreground">Proposals awaiting verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals.length}</div>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedProposals}</div>
            <p className="text-xs text-muted-foreground">Credits minted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals.filter((p) => p.status === 'rejected').length}</div>
            <p className="text-xs text-muted-foreground">Did not meet criteria</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>Proposals requiring verification</CardDescription>
          </div>
          <Button asChild>
            <Link href="/verification">Review Portal</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {pendingReviews.length > 0 ? (
            <div className="space-y-4">
              {pendingReviews.map((proposal) => {
                const producer = users.find((u) => u.id === proposal.producer_id);
                return (
                  <div key={proposal.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{proposal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {proposal.credit_quantity} tCO2e | By {producer?.display_name || 'Unknown'}
                      </p>
                      {proposal.sensor_data && (
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline">NDVI: {proposal.sensor_data.ndvi_score.toFixed(3)}</Badge>
                          {proposal.sensor_data.ndvi_score >= 0.6 ? (
                            <Badge variant="default">Auto-Verify Eligible</Badge>
                          ) : (
                            <Badge variant="secondary">Manual Review Required</Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <Button asChild size="sm">
                      <Link href="/verification">Review</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="mb-2 h-12 w-12 text-primary" />
              <p className="text-muted-foreground">No pending reviews</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  const renderDashboard = () => {
    switch (user?.role) {
      case 'producer':
        return renderProducerDashboard();
      case 'buyer':
        return renderBuyerDashboard();
      case 'certification_body':
        return renderCertifierDashboard();
      default:
        return renderBuyerDashboard();
    }
  };

  const getRoleDisplayName = (role: string | undefined) => {
    switch (role) {
      case 'producer': return 'Producer';
      case 'buyer': return 'Buyer';
      case 'certification_body': return 'Certifier';
      default: return 'User';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {user?.display_name || 'Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            Welcome back! You are logged in as a{' '}
            <span className="font-medium text-primary">{getRoleDisplayName(user?.role)}</span>
          </p>
        </div>
        {user?.role === 'producer' && (
          <Button asChild>
            <Link href="/proposals/new"><Plus className="mr-2 h-4 w-4" />Submit Proposal</Link>
          </Button>
        )}
        {user?.role === 'buyer' && (
          <Button asChild>
            <Link href="/marketplace"><ShoppingCart className="mr-2 h-4 w-4" />Browse Marketplace</Link>
          </Button>
        )}
        {user?.role === 'certification_body' && (
          <Button asChild>
            <Link href="/verification"><FileCheck className="mr-2 h-4 w-4" />Review Portal</Link>
          </Button>
        )}
      </div>
      {renderDashboard()}
    </div>
  );
}
