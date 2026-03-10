'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, FileText, Search, Filter, MapPin, Calendar, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWallet } from '@/components/providers/wallet-provider';
import { mockProposals, mockUsers } from '@/lib/mock-data';
import type { ProposalStatus } from '@/lib/types';

const statusConfig: Record<
  ProposalStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  submitted: { label: 'Submitted', variant: 'outline' },
  under_review: { label: 'Under Review', variant: 'default' },
  approved: { label: 'Approved', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

export default function ProposalsPage() {
  const { user, isConnected } = useWallet();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  console.log('[v0] ProposalsPage - isConnected:', isConnected, 'user:', user, 'mockProposals count:', mockProposals.length);

  // Filter proposals based on search and status
  const filteredProposals = mockProposals.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <FileText className="h-16 w-16 text-muted-foreground/50" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">Connect Your Wallet</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Connect your wallet to view and manage carbon credit proposals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {user?.role === 'producer' ? 'My Proposals' : 'All Proposals'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {user?.role === 'producer'
              ? 'Submit and track your carbon credit project proposals'
              : 'Browse all carbon credit project proposals'}
          </p>
        </div>
        {user?.role === 'producer' && (
          <Button asChild>
            <Link href="/proposals/new">
              <Plus className="mr-2 h-4 w-4" />
              New Proposal
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-5">
        {['all', 'draft', 'submitted', 'under_review', 'approved'].map((status) => {
          const count =
            status === 'all'
              ? mockProposals.length
              : mockProposals.filter((p) => p.status === status).length;
          const config =
            status === 'all'
              ? { label: 'Total', variant: 'outline' as const }
              : statusConfig[status as ProposalStatus];

          return (
            <button
              type="button"
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg border p-4 text-left transition-all hover:border-primary/50 ${
                statusFilter === status ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <p className="text-sm text-muted-foreground">{config.label}</p>
            </button>
          );
        })}
      </div>

      {/* Proposals List */}
      {filteredProposals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProposals.map((proposal) => {
            const producer = mockUsers.find((u) => u.id === proposal.producer_id);
            const config = statusConfig[proposal.status];

            return (
              <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <h3 className="mt-4 line-clamp-2 text-lg font-semibold text-foreground">
                      {proposal.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {proposal.description || 'No description provided'}
                    </p>

                    <div className="mt-auto space-y-3 pt-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{proposal.credit_quantity} tCO2e</Badge>
                        {proposal.sensor_data && (
                          <Badge variant="outline">
                            NDVI: {proposal.sensor_data.ndvi_score.toFixed(2)}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(proposal.created_at).toLocaleDateString()}
                        </span>
                        {user?.role !== 'producer' && producer && (
                          <span className="truncate">By {producer.display_name}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No proposals found</h3>
            <p className="mt-2 max-w-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters to find proposals.'
                : 'Get started by creating your first carbon credit project proposal.'}
            </p>
            {!searchQuery && statusFilter === 'all' && user?.role === 'producer' && (
              <Button asChild className="mt-4">
                <Link href="/proposals/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Proposal
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
