'use client';

import { use } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { 
  ArrowLeft, 
  Leaf, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  ShoppingCart,
  Recycle,
  FileText,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/components/providers/wallet-provider';
import { createClient } from '@/lib/supabase/client';
import type { Credit, TimelineEvent, Retirement } from '@/lib/types';

interface CreditDetailData {
  credit: Credit & { 
    proposal: { title: string; project_type: string; location: string | null; description: string | null } | null;
    owner: { display_name: string | null; wallet_address: string } | null;
  };
  timeline: TimelineEvent[];
  retirement: Retirement | null;
}

async function fetchCreditDetail(id: string): Promise<CreditDetailData | null> {
  const supabase = createClient();

  const [
    { data: credit },
    { data: timeline },
    { data: retirement },
  ] = await Promise.all([
    supabase
      .from('credits')
      .select(`
        *,
        proposal:proposals(title, project_type, location, description),
        owner:users(display_name, wallet_address)
      `)
      .eq('id', id)
      .single(),
    supabase
      .from('timeline_events')
      .select('*')
      .eq('credit_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('retirements')
      .select('*')
      .eq('credit_id', id)
      .single(),
  ]);

  if (!credit) return null;

  return {
    credit: credit as CreditDetailData['credit'],
    timeline: timeline || [],
    retirement: retirement || null,
  };
}

const statusColors = {
  minted: 'bg-primary/10 text-primary',
  listed: 'bg-chart-4/10 text-chart-4',
  sold: 'bg-chart-2/10 text-chart-2',
  retired: 'bg-chart-3/10 text-chart-3',
};

const eventIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  proposal_submitted: FileText,
  proposal_approved: CheckCircle,
  credits_minted: Leaf,
  credit_listed: ShoppingCart,
  credit_traded: ShoppingCart,
  credit_retired: Recycle,
};

export default function CreditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useWallet();

  const { data, isLoading, error } = useSWR(
    id ? ['credit', id] : null,
    () => fetchCreditDetail(id)
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-xl bg-muted lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Leaf className="h-16 w-16 text-muted-foreground/50" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">Credit Not Found</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          The carbon credit you are looking for does not exist.
        </p>
        <Button asChild className="mt-6">
          <Link href="/credits">Back to My Credits</Link>
        </Button>
      </div>
    );
  }

  const { credit, timeline, retirement } = data;
  const isOwner = user?.id === credit.owner_id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button asChild variant="ghost" size="icon" className="mt-1">
          <Link href="/credits">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {credit.proposal?.title || `Carbon Credit #${credit.token_id}`}
            </h1>
            <Badge className={statusColors[credit.status]} variant="secondary">
              {credit.status.charAt(0).toUpperCase() + credit.status.slice(1)}
            </Badge>
          </div>
          {credit.token_id && (
            <p className="mt-1 text-muted-foreground">
              Token ID: #{credit.token_id}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Credit Details */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Leaf className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credit Amount</p>
                    <p className="font-medium text-foreground">
                      {credit.credit_amount} tCO2e
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                    <FileText className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vintage Year</p>
                    <p className="font-medium text-foreground">{credit.vintage_year}</p>
                  </div>
                </div>

                {credit.proposal?.project_type && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                      <Leaf className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Project Type</p>
                      <p className="font-medium capitalize text-foreground">
                        {credit.proposal.project_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                )}

                {credit.proposal?.location && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                      <Leaf className="h-5 w-5 text-chart-3" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium text-foreground">{credit.proposal.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {credit.proposal?.description && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">Project Description</p>
                  <p className="mt-1 text-foreground">{credit.proposal.description}</p>
                </div>
              )}

              {credit.contract_address && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">Contract Address</p>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="rounded bg-muted px-2 py-1 text-sm">
                      {credit.contract_address.slice(0, 10)}...{credit.contract_address.slice(-8)}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(credit.contract_address!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Retirement Certificate */}
          {retirement && (
            <Card className="border-chart-2/50 bg-gradient-to-br from-chart-2/5 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-chart-2" />
                  Retirement Certificate
                </CardTitle>
                <CardDescription>
                  This credit has been permanently retired
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-chart-2/30 bg-background p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-chart-2/20">
                    <Recycle className="h-8 w-8 text-chart-2" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground">
                    Carbon Credit Retired
                  </h3>
                  <p className="mt-2 text-2xl font-bold text-chart-2">
                    {credit.credit_amount} tCO2e
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {credit.proposal?.title}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate Number</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-foreground">{retirement.certificate_number}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(retirement.certificate_number!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Retirement Date</span>
                    <span className="text-foreground">
                      {new Date(retirement.retired_at).toLocaleDateString()}
                    </span>
                  </div>

                  {retirement.beneficiary_name && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Beneficiary</span>
                      <span className="text-foreground">{retirement.beneficiary_name}</span>
                    </div>
                  )}

                  {retirement.retirement_reason && (
                    <div className="border-t border-border pt-3">
                      <p className="text-sm text-muted-foreground">Retirement Reason</p>
                      <p className="mt-1 text-sm text-foreground">{retirement.retirement_reason}</p>
                    </div>
                  )}

                  {retirement.transaction_hash && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Transaction</span>
                      <a
                        href={`https://etherscan.io/tx/${retirement.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        View on Etherscan
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Lifecycle</CardTitle>
              <CardDescription>Full history and provenance</CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length > 0 ? (
                <div className="relative space-y-4">
                  <div className="absolute bottom-0 left-3 top-0 w-px bg-border" />
                  {timeline.map((event, index) => {
                    const EventIcon = eventIcons[event.event_type] || FileText;
                    return (
                      <div key={event.id} className="relative flex gap-4 pl-8">
                        <div className={`absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background ${
                          index === 0 ? 'bg-primary' : 'bg-muted'
                        }`}>
                          <EventIcon className={`h-3 w-3 ${index === 0 ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium capitalize text-foreground">
                            {event.event_type.replace(/_/g, ' ')}
                          </p>
                          {event.description && (
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          )}
                          {event.transaction_hash && (
                            <a
                              href={`https://etherscan.io/tx/${event.transaction_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              View transaction
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(event.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  No timeline events recorded
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {credit.owner?.display_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-foreground">
                    {credit.owner?.display_name || 'Unknown'}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {credit.owner?.wallet_address}
                  </p>
                </div>
              </div>
              {isOwner && (
                <Badge variant="secondary" className="mt-3">
                  This is your credit
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {isOwner && credit.status === 'minted' && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/credits">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    List for Sale
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/credits">
                    <Recycle className="mr-2 h-4 w-4" />
                    Retire Credit
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {credit.metadata_uri && (
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={credit.metadata_uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View NFT Metadata
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
