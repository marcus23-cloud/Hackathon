'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Shield,
  FileSearch,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Leaf,
  BarChart3,
  Zap,
  Satellite,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWallet } from '@/components/providers/wallet-provider';
import { mockProposals, mockUsers, mockProposalReviews } from '@/lib/mock-data';
import type { Proposal } from '@/lib/types';

// NDVI threshold for auto-approval
const NDVI_THRESHOLD = 0.6;

export default function VerificationPage() {
  const { user, isConnected } = useWallet();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoVerifyResult, setAutoVerifyResult] = useState<{
    ndviScore: number;
    passed: boolean;
    message: string;
  } | null>(null);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);

  // Filter pending proposals
  const pendingProposals = mockProposals.filter(
    (p) => p.status === 'submitted' || p.status === 'under_review'
  );

  const isCertifier = user?.role === 'certification_body';

  // Simulate MRV Oracle auto-verification
  const handleAutoVerify = async (proposal: Proposal) => {
    setIsAutoVerifying(true);
    setAutoVerifyResult(null);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const ndviScore = proposal.sensor_data?.ndvi_score || Math.random() * 0.4 + 0.4;
    const passed = ndviScore >= NDVI_THRESHOLD;

    setAutoVerifyResult({
      ndviScore,
      passed,
      message: passed
        ? `NDVI score ${ndviScore.toFixed(3)} meets threshold (>= ${NDVI_THRESHOLD}). Proposal auto-approved!`
        : `NDVI score ${ndviScore.toFixed(3)} below threshold (${NDVI_THRESHOLD}). Manual review required.`,
    });

    setIsAutoVerifying(false);

    if (passed) {
      toast.success('Auto-verification passed! Proposal approved and credit minted.');
    } else {
      toast.info('Auto-verification: Manual review required.');
    }
  };

  // Handle manual review decision
  const handleReview = async (decision: 'approved' | 'rejected') => {
    if (!selectedProposal || !user) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (decision === 'approved') {
      toast.success(
        `Proposal approved! ${selectedProposal.credit_quantity} carbon credits minted as NFT.`
      );
    } else {
      toast.info('Proposal rejected. Producer has been notified.');
    }

    setSelectedProposal(null);
    setReviewComments('');
    setAutoVerifyResult(null);
    setIsSubmitting(false);
  };

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Shield className="h-16 w-16 text-muted-foreground/50" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">Connect Your Wallet</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Connect your wallet to access the verification dashboard.
        </p>
      </div>
    );
  }

  if (!isCertifier) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Shield className="h-16 w-16 text-muted-foreground/50" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">Certifier Access Required</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Only certification bodies can access the review portal. Switch your role to Certifier in
          the header to access this feature.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Review Portal</h1>
        <p className="mt-1 text-muted-foreground">
          Verify carbon credit proposals using MRV Oracle auto-verification or manual review
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10 text-chart-4">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {pendingProposals.filter((p) => p.status === 'submitted').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileSearch className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {pendingProposals.filter((p) => p.status === 'under_review').length}
              </p>
              <p className="text-sm text-muted-foreground">Under Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {mockProposalReviews.filter((r) => r.decision === 'approved').length}
              </p>
              <p className="text-sm text-muted-foreground">Approved Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proposals Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Queue</CardTitle>
          <CardDescription>Proposals awaiting verification review</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingProposals.length > 0 ? (
            <div className="space-y-4">
              {pendingProposals.map((proposal) => {
                const producer = mockUsers.find((u) => u.id === proposal.producer_id);
                const canAutoVerify =
                  proposal.sensor_data && proposal.sensor_data.ndvi_score >= NDVI_THRESHOLD;

                return (
                  <div
                    key={proposal.id}
                    className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Leaf className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{proposal.title}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span>By {producer?.display_name || 'Unknown'}</span>
                          <span>{proposal.credit_quantity.toLocaleString()} tCO2e</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge
                            variant={proposal.status === 'submitted' ? 'secondary' : 'outline'}
                            className="capitalize"
                          >
                            {proposal.status.replace('_', ' ')}
                          </Badge>
                          {proposal.sensor_data && (
                            <Badge variant="outline">
                              NDVI: {proposal.sensor_data.ndvi_score.toFixed(3)}
                            </Badge>
                          )}
                          {canAutoVerify && (
                            <Badge variant="default" className="bg-primary">
                              <Zap className="mr-1 h-3 w-3" />
                              Auto-Verify Eligible
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canAutoVerify && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAutoVerify(proposal)}
                          disabled={isAutoVerifying}
                        >
                          <Satellite className="mr-1 h-4 w-4" />
                          Auto-Verify
                        </Button>
                      )}
                      <Button size="sm" onClick={() => setSelectedProposal(proposal)}>
                        Manual Review
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-primary/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">All caught up!</h3>
              <p className="mt-2 text-muted-foreground">
                No proposals are currently awaiting verification.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>Your completed verification decisions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockProposalReviews.slice(0, 5).map((review) => {
              const proposal = mockProposals.find((p) => p.id === review.proposal_id);
              return (
                <div
                  key={review.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{proposal?.title || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.reviewed_at).toLocaleDateString()} - {review.remarks?.slice(0, 50)}...
                    </p>
                  </div>
                  <Badge
                    variant={review.decision === 'approved' ? 'default' : 'destructive'}
                    className="capitalize"
                  >
                    {review.decision === 'approved' ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {review.decision}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog
        open={!!selectedProposal}
        onOpenChange={() => {
          setSelectedProposal(null);
          setAutoVerifyResult(null);
          setReviewComments('');
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Proposal</DialogTitle>
            <DialogDescription>Verify this carbon credit project proposal</DialogDescription>
          </DialogHeader>

          {selectedProposal && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-semibold text-foreground">{selectedProposal.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedProposal.description || 'No description provided'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline">{selectedProposal.credit_quantity} tCO2e</Badge>
                  {selectedProposal.sensor_data && (
                    <>
                      <Badge variant="outline">
                        Temp: {selectedProposal.sensor_data.temperature_c}C
                      </Badge>
                      <Badge variant="outline">
                        Humidity: {selectedProposal.sensor_data.humidity_pct}%
                      </Badge>
                      <Badge
                        variant={
                          selectedProposal.sensor_data.ndvi_score >= NDVI_THRESHOLD
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        NDVI: {selectedProposal.sensor_data.ndvi_score.toFixed(3)}
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Auto-Verify Section */}
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Satellite className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">MRV Oracle Auto-Verification</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAutoVerify(selectedProposal)}
                    disabled={isAutoVerifying}
                  >
                    {isAutoVerifying ? 'Analyzing...' : 'Run Auto-Verify'}
                  </Button>
                </div>

                {isAutoVerifying && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Analyzing satellite data...</p>
                    <Progress value={66} className="h-2" />
                  </div>
                )}

                {autoVerifyResult && (
                  <div
                    className={`mt-4 rounded-lg p-3 ${
                      autoVerifyResult.passed ? 'bg-primary/10' : 'bg-destructive/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {autoVerifyResult.passed ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <span
                        className={`font-medium ${
                          autoVerifyResult.passed ? 'text-primary' : 'text-destructive'
                        }`}
                      >
                        {autoVerifyResult.passed ? 'Verification Passed' : 'Below Threshold'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{autoVerifyResult.message}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Review Comments</Label>
                <Textarea
                  id="comments"
                  placeholder="Add comments about your review decision..."
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Approving this proposal will:
                </p>
                <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                  <li>
                    Mint {selectedProposal.credit_quantity.toLocaleString()} carbon credits as
                    ERC-721 NFT
                  </li>
                  <li>Transfer credits to the producer wallet</li>
                  <li>Record verification on the blockchain</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="destructive"
              onClick={() => handleReview('rejected')}
              disabled={isSubmitting}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={() => handleReview('approved')} disabled={isSubmitting}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve & Mint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
