'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Leaf,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  Layers,
  Percent,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useWallet } from '@/components/providers/wallet-provider';
import { useCarbonStore } from '@/lib/store';
import type { TradeOrder, Credit, User } from '@/lib/types';
import { formatEthPrice, calculatePricePerTon, calculateFractionalPrice, calculateFractionalTonnage } from '@/lib/eth-utils';

export default function MarketplacePage() {
  const { user, isConnected } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [projectTypeFilter, setProjectTypeFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<(TradeOrder & { credit: Credit; seller: User }) | null>(
    null
  );
  const [purchaseMode, setPurchaseMode] = useState<'full' | 'fractional'>('full');
  const [fractionalPercent, setFractionalPercent] = useState(25);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [retireOnPurchase, setRetireOnPurchase] = useState(false);

  // Get data from store
  const getDashboardStats = useCarbonStore((state) => state.getDashboardStats);
  const getOpenSellOrders = useCarbonStore((state) => state.getOpenSellOrders);
  const credits = useCarbonStore((state) => state.credits);
  const purchaseCredit = useCarbonStore((state) => state.purchaseCredit);
  const retireCredit = useCarbonStore((state) => state.retireCredit);
  const users = useCarbonStore((state) => state.users);

  const stats = getDashboardStats();
  const openOrders = getOpenSellOrders();

  // Get owned credits for retirement (credits owned by current user)
  const ownedCredits = credits.filter(
    (c) => c.owner_id === user?.id && (c.status === 'minted' || c.status === 'transferred')
  );

  // Filter and sort listings
  const filteredOrders = openOrders
    .filter((order) => {
      const matchesSearch = order.credit.metadata.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return parseFloat(a.asking_price_eth) - parseFloat(b.asking_price_eth);
        case 'price_high':
          return parseFloat(b.asking_price_eth) - parseFloat(a.asking_price_eth);
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Handle full or fractional purchase
  const handlePurchase = async () => {
    if (!selectedOrder || !user) return;

    setIsPurchasing(true);

    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const amount =
      purchaseMode === 'full'
        ? selectedOrder.credit.metadata.co2_tonnage
        : calculateFractionalTonnage(selectedOrder.credit.metadata.co2_tonnage, fractionalPercent);

    const price =
      purchaseMode === 'full'
        ? formatEthPrice(selectedOrder.asking_price_eth, 4)
        : calculateFractionalPrice(selectedOrder.asking_price_eth, fractionalPercent);

    // Actually execute the purchase
    const trade = purchaseCredit(selectedOrder.id, user.id, retireOnPurchase);

    if (trade) {
      if (retireOnPurchase) {
        toast.success(
          `Successfully purchased and retired ${amount.toFixed(2)} tCO2e for ${price} ETH. Certificate generated!`
        );
      } else {
        toast.success(
          `Successfully purchased ${amount.toFixed(2)} tCO2e for ${price} ETH! Credit transferred to your wallet.`
        );
      }
    } else {
      toast.error('Failed to complete purchase. Please try again.');
    }

    setSelectedOrder(null);
    setPurchaseMode('full');
    setFractionalPercent(25);
    setRetireOnPurchase(false);
    setIsPurchasing(false);
  };

  // Handle credit retirement
  const handleRetire = (credit: Credit) => {
    retireCredit(credit.id);
    toast.success(
      `Successfully retired ${credit.metadata.co2_tonnage} tCO2e! Credit has been burned and retirement certificate generated.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
          <p className="mt-1 text-muted-foreground">
            Browse, trade, and retire verified carbon credits
          </p>
        </div>
        {user?.role === 'buyer' && isConnected && (
          <Button asChild variant="outline">
            <Link href="/credits">
              <Leaf className="mr-2 h-4 w-4" />
              My Credits
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.activeListings}</p>
              <p className="text-sm text-muted-foreground">Active Listings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalTradeVolume.toFixed(2)} ETH
              </p>
              <p className="text-sm text-muted-foreground">Total Volume</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10 text-chart-4">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalCO2Tonnage.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total tCO2e</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalRetired}</p>
              <p className="text-sm text-muted-foreground">Credits Retired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Browse vs My Credits for Retirement */}
      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Browse Listings
          </TabsTrigger>
          {isConnected && (
            <TabsTrigger value="retire">
              <Flame className="mr-2 h-4 w-4" />
              Retire Credits
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by project name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Listings Grid */}
          {filteredOrders.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((order) => {
                const seller = order.seller || users.find((u) => u.id === order.seller_id);
                const pricePerTon = calculatePricePerTon(order.asking_price_eth, order.credit.metadata.co2_tonnage);
                const isSeller = order.seller_id === user?.id;

                return (
                  <Card
                    key={order.id}
                    className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-background/80 backdrop-blur">
                          <Leaf className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="line-clamp-1 font-semibold text-foreground">
                          {order.credit.metadata.name}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            {order.credit.metadata.co2_tonnage} tCO2e
                          </Badge>
                          <Badge variant="outline">#{order.credit.token_id}</Badge>
                          <Badge variant="outline">
                            <Layers className="mr-1 h-3 w-3" />
                            Fractional OK
                          </Badge>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Seller: {seller?.display_name || 'Unknown'}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-primary">
                              {formatEthPrice(order.asking_price_eth, 2)} ETH
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {pricePerTon} ETH/ton
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            disabled={isSeller}
                          >
                            {isSeller ? 'Your Listing' : 'Buy'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No listings found</h3>
                <p className="mt-2 max-w-sm text-muted-foreground">
                  {searchQuery
                    ? 'Try adjusting your search to find listings.'
                    : 'No carbon credits are currently listed for sale.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="retire" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-destructive" />
                Retire Carbon Credits
              </CardTitle>
              <CardDescription>
                Permanently retire your carbon credits to claim offset benefits. Retired credits are
                burned and cannot be transferred.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ownedCredits.length > 0 ? (
                <div className="space-y-4">
                  {ownedCredits.map((credit) => (
                    <div
                      key={credit.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Leaf className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{credit.metadata.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {credit.metadata.co2_tonnage} tCO2e | Token #{credit.token_id}
                          </p>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleRetire(credit)}>
                        <Flame className="mr-1 h-4 w-4" />
                        Retire
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Leaf className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    You don't have any credits to retire. Purchase credits from the marketplace
                    first.
                  </p>
                  <Button className="mt-4" variant="outline" asChild>
                    <Link href="/marketplace">Browse Marketplace</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Purchase Dialog with Fractional Support */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Purchase Carbon Credits</DialogTitle>
            <DialogDescription>Choose to buy the full credit or a fractional share</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-semibold text-foreground">
                  {selectedOrder.credit.metadata.name}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>{selectedOrder.credit.metadata.co2_tonnage} tCO2e total</span>
                  <span>Token #{selectedOrder.credit.token_id}</span>
                </div>
              </div>

              {/* Purchase Mode Selection */}
              <div className="space-y-4">
                <Label>Purchase Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPurchaseMode('full')}
                    className={`rounded-lg border p-4 text-left transition-all ${
                      purchaseMode === 'full'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">Full Credit</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Buy the entire carbon credit NFT
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurchaseMode('fractional')}
                    className={`rounded-lg border p-4 text-left transition-all ${
                      purchaseMode === 'fractional'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Percent className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">Fractional</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Buy a percentage of the credit
                    </p>
                  </button>
                </div>
              </div>

              {/* Fractional Slider */}
              {purchaseMode === 'fractional' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Percentage to Purchase</Label>
                    <Badge variant="outline">{fractionalPercent}%</Badge>
                  </div>
                  <Slider
                    value={[fractionalPercent]}
                    onValueChange={([val]) => setFractionalPercent(val)}
                    min={5}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    You'll receive{' '}
                    {((selectedOrder.credit.metadata.co2_tonnage * fractionalPercent) / 100).toFixed(
                      2
                    )}{' '}
                    tCO2e
                  </p>
                </div>
              )}

              {/* Retire on Purchase Option */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <Flame className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-foreground">Retire on Purchase</p>
                    <p className="text-sm text-muted-foreground">
                      Immediately burn credits for offset certificate
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={retireOnPurchase}
                  onChange={(e) => setRetireOnPurchase(e.target.checked)}
                  className="h-5 w-5 rounded border-border"
                />
              </div>

              {/* Price Summary */}
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      {purchaseMode === 'full'
                        ? formatEthPrice(selectedOrder.asking_price_eth, 4)
                        : calculateFractionalPrice(selectedOrder.asking_price_eth, fractionalPercent)}{' '}
                      ETH
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {purchaseMode === 'fractional' &&
                        `${fractionalPercent}% of ${formatEthPrice(selectedOrder.asking_price_eth, 4)} ETH`}
                    </p>
                  </div>
                </div>
              </div>

              {!isConnected && (
                <p className="text-sm text-destructive">
                  Please connect your wallet to complete this purchase.
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={!isConnected || isPurchasing}>
              {isPurchasing
                ? 'Processing...'
                : retireOnPurchase
                  ? 'Buy & Retire'
                  : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
