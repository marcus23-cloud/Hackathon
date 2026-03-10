'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Leaf,
  ShoppingCart,
  Recycle,
  History,
  MoreHorizontal,
  Flame,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/components/providers/wallet-provider';
import { useCarbonStore } from '@/lib/store';
import type { Credit } from '@/lib/types';

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  minted: { label: 'Minted', variant: 'secondary' },
  listed: { label: 'Listed', variant: 'default' },
  transferred: { label: 'Transferred', variant: 'outline' },
  retired: { label: 'Retired', variant: 'destructive' },
  revoked: { label: 'Revoked', variant: 'destructive' },
};

export default function CreditsPage() {
  const { user, isConnected } = useWallet();
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [dialogMode, setDialogMode] = useState<'list' | 'retire' | 'view' | null>(null);
  const [listingPrice, setListingPrice] = useState('');
  const [retirementData, setRetirementData] = useState({ beneficiary: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get data from store
  const credits = useCarbonStore((state) => state.credits);
  const trades = useCarbonStore((state) => state.trades);
  const sellOrders = useCarbonStore((state) => state.sellOrders);
  const getDashboardStats = useCarbonStore((state) => state.getDashboardStats);
  const listCreditForSale = useCarbonStore((state) => state.listCreditForSale);
  const cancelListing = useCarbonStore((state) => state.cancelListing);
  const retireCredit = useCarbonStore((state) => state.retireCredit);

  const stats = getDashboardStats();

  // Filter credits owned by current user
  const userCredits = credits.filter((c) => c.owner_id === user?.id);
  
  // Filter credits by status (only user's credits)
  const availableCredits = userCredits.filter((c) => c.status === 'minted' || c.status === 'transferred');
  const listedCredits = userCredits.filter((c) => c.status === 'listed');
  const retiredCredits = userCredits.filter((c) => c.status === 'retired');

  // Handle listing a credit
  const handleListCredit = async () => {
    if (!selectedCredit || !listingPrice || !user) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const order = listCreditForSale(selectedCredit.id, user.id, listingPrice);
    
    if (order) {
      toast.success(`Credit listed for ${listingPrice} ETH on the marketplace!`);
    } else {
      toast.error('Failed to list credit. Please try again.');
    }
    
    setDialogMode(null);
    setSelectedCredit(null);
    setListingPrice('');
    setIsSubmitting(false);
  };

  // Handle retiring a credit
  const handleRetireCredit = async () => {
    if (!selectedCredit) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    retireCredit(selectedCredit.id);
    
    const certificateNumber = `CC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    toast.success(
      `Credit retired successfully! Certificate: ${certificateNumber}. ${selectedCredit.metadata.co2_tonnage} tCO2e permanently offset and burned.`
    );
    setDialogMode(null);
    setSelectedCredit(null);
    setRetirementData({ beneficiary: '', reason: '' });
    setIsSubmitting(false);
  };

  // Handle canceling a listing
  const handleCancelListing = async (credit: Credit) => {
    // Find the sell order for this credit
    const order = sellOrders.find((o) => o.credit_id === credit.id && o.status === 'open');
    if (order) {
      cancelListing(order.id);
      toast.success('Listing cancelled. Credit is now available again.');
    } else {
      toast.error('Could not find the listing to cancel.');
    }
  };

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Leaf className="h-16 w-16 text-muted-foreground/50" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">Connect Your Wallet</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Connect your wallet to view and manage your carbon credits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Credits</h1>
          <p className="mt-1 text-muted-foreground">Manage your verified carbon credit NFTs</p>
        </div>
        {user?.role === 'producer' && (
          <Button asChild>
            <Link href="/proposals/new">Submit New Proposal</Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalCredits}</p>
              <p className="text-sm text-muted-foreground">Total Credits</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/50 text-secondary-foreground">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{availableCredits.length}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10 text-chart-4">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{listedCredits.length}</p>
              <p className="text-sm text-muted-foreground">Listed for Sale</p>
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
              <p className="text-sm text-muted-foreground">Retired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="available">
        <TabsList>
          <TabsTrigger value="available">Available ({availableCredits.length})</TabsTrigger>
          <TabsTrigger value="listed">Listed ({listedCredits.length})</TabsTrigger>
          <TabsTrigger value="retired">Retired ({retiredCredits.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          {availableCredits.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableCredits.map((credit) => (
                <Card key={credit.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background/80">
                          <Leaf className="h-6 w-6 text-primary" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCredit(credit);
                                setDialogMode('view');
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCredit(credit);
                                setDialogMode('list');
                              }}
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              List for Sale
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCredit(credit);
                                setDialogMode('retire');
                              }}
                            >
                              <Flame className="mr-2 h-4 w-4" />
                              Retire Credit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-1 font-semibold text-foreground">
                        {credit.metadata.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Token #{credit.token_id}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="secondary">{credit.metadata.co2_tonnage} tCO2e</Badge>
                        <Badge variant="outline">{credit.vintage_year}</Badge>
                        <Badge variant={statusConfig[credit.status].variant}>
                          {statusConfig[credit.status].label}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Leaf className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No available credits</h3>
                <p className="mt-2 max-w-sm text-muted-foreground">
                  {user?.role === 'producer'
                    ? 'Submit a project proposal to get verified and mint carbon credits.'
                    : 'Purchase credits from the marketplace to see them here.'}
                </p>
                <Button asChild className="mt-4">
                  <Link href={user?.role === 'producer' ? '/proposals/new' : '/marketplace'}>
                    {user?.role === 'producer' ? 'Submit Proposal' : 'Browse Marketplace'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="listed" className="mt-6">
          {listedCredits.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listedCredits.map((credit) => (
                <Card key={credit.id} className="overflow-hidden border-chart-4/50">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-chart-4/20 to-chart-2/20 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background/80">
                          <ShoppingCart className="h-6 w-6 text-chart-4" />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelListing(credit)}
                        >
                          Cancel Listing
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-1 font-semibold text-foreground">
                        {credit.metadata.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {credit.metadata.co2_tonnage} tCO2e - {credit.vintage_year}
                      </p>
                      <p className="mt-2 text-lg font-bold text-chart-4">0.5 ETH</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No listed credits</h3>
                <p className="mt-2 text-muted-foreground">
                  List your available credits on the marketplace to sell them.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="retired" className="mt-6">
          {retiredCredits.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {retiredCredits.map((credit) => (
                <Card key={credit.id} className="overflow-hidden border-destructive/30">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-destructive/20 to-destructive/10 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background/80">
                        <Flame className="h-6 w-6 text-destructive" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-1 font-semibold text-foreground">
                        {credit.metadata.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {credit.metadata.co2_tonnage} tCO2e permanently retired
                      </p>
                      <Badge variant="destructive" className="mt-3">
                        <Flame className="mr-1 h-3 w-3" />
                        Retired
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Flame className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No retired credits</h3>
                <p className="mt-2 text-muted-foreground">
                  Retire credits to permanently offset carbon emissions.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your trading and retirement history</CardDescription>
            </CardHeader>
            <CardContent>
              {trades.length > 0 ? (
                <div className="space-y-4">
                  {trades.slice(-10).reverse().map((trade) => {
                    const credit = credits.find((c) => c.id === trade.credit_id);
                    // Find if user was buyer or seller
                    const buyOrder = useCarbonStore.getState().buyOrders.find(o => o.id === trade.buy_order_id);
                    const sellOrder = useCarbonStore.getState().sellOrders.find(o => o.id === trade.sell_order_id);
                    const isBuyer = buyOrder?.buyer_id === user?.id;
                    const isSeller = sellOrder?.seller_id === user?.id;
                    
                    // Only show trades involving the current user
                    if (!isBuyer && !isSeller) return null;

                    return (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              isBuyer
                                ? 'bg-primary/10 text-primary'
                                : 'bg-chart-4/10 text-chart-4'
                            }`}
                          >
                            {isBuyer ? (
                              <Leaf className="h-5 w-5" />
                            ) : (
                              <ShoppingCart className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {isBuyer ? 'Purchased Credit' : 'Sold Credit'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {credit?.metadata.name || 'Carbon Credit'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{trade.execution_price_eth} ETH</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(trade.settled_at || trade.matched_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <History className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">No activity yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Credit Dialog */}
      <Dialog
        open={dialogMode === 'view'}
        onOpenChange={() => {
          setDialogMode(null);
          setSelectedCredit(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Credit Details</DialogTitle>
            <DialogDescription>On-chain carbon credit NFT information</DialogDescription>
          </DialogHeader>

          {selectedCredit && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-semibold text-foreground">{selectedCredit.metadata.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedCredit.metadata.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Token ID</p>
                  <p className="font-mono font-medium text-foreground">
                    #{selectedCredit.token_id}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">CO2 Tonnage</p>
                  <p className="font-medium text-foreground">
                    {selectedCredit.metadata.co2_tonnage} tCO2e
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Vintage Year</p>
                  <p className="font-medium text-foreground">{selectedCredit.vintage_year}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={statusConfig[selectedCredit.status].variant}>
                    {statusConfig[selectedCredit.status].label}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Contract Address</p>
                <p className="truncate font-mono text-sm text-foreground">
                  {selectedCredit.contract_address}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogMode(null);
                setSelectedCredit(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* List Credit Dialog */}
      <Dialog
        open={dialogMode === 'list'}
        onOpenChange={() => {
          setDialogMode(null);
          setSelectedCredit(null);
          setListingPrice('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>List Credit for Sale</DialogTitle>
            <DialogDescription>Set your asking price for this carbon credit</DialogDescription>
          </DialogHeader>

          {selectedCredit && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-semibold text-foreground">{selectedCredit.metadata.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedCredit.metadata.co2_tonnage} tCO2e | Token #{selectedCredit.token_id}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Asking Price (ETH)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.5"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                />
                {listingPrice && (
                  <p className="text-sm text-muted-foreground">
                    Price per ton: {(parseFloat(listingPrice) / selectedCredit.metadata.co2_tonnage).toFixed(4)} ETH/tCO2e
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogMode(null);
                setSelectedCredit(null);
                setListingPrice('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleListCredit} disabled={!listingPrice || isSubmitting}>
              {isSubmitting ? 'Listing...' : 'List for Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retire Credit Dialog */}
      <Dialog
        open={dialogMode === 'retire'}
        onOpenChange={() => {
          setDialogMode(null);
          setSelectedCredit(null);
          setRetirementData({ beneficiary: '', reason: '' });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retire Carbon Credit</DialogTitle>
            <DialogDescription>
              Permanently retire this credit to claim your carbon offset
            </DialogDescription>
          </DialogHeader>

          {selectedCredit && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-semibold text-foreground">{selectedCredit.metadata.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedCredit.metadata.co2_tonnage} tCO2e will be permanently retired
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="beneficiary">Beneficiary Name (Optional)</Label>
                <Input
                  id="beneficiary"
                  placeholder="Your name or organization"
                  value={retirementData.beneficiary}
                  onChange={(e) =>
                    setRetirementData({ ...retirementData, beneficiary: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Retirement Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Why are you retiring this credit?"
                  value={retirementData.reason}
                  onChange={(e) =>
                    setRetirementData({ ...retirementData, reason: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <p className="text-sm text-destructive">
                  <strong>Warning:</strong> This action is irreversible. The credit will be burned
                  and cannot be transferred or sold.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogMode(null);
                setSelectedCredit(null);
                setRetirementData({ beneficiary: '', reason: '' });
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRetireCredit} disabled={isSubmitting}>
              <Flame className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Retiring...' : 'Retire Credit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
