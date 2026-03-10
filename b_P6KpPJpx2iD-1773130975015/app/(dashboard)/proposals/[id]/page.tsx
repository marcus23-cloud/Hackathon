'use client';

import { use } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  FileText,
  MapPin,
  Calendar,
  Leaf,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Satellite,
  Thermometer,
  Droplets,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWallet } from '@/components/providers/wallet-provider';
import { mockProposals, mockProposalReviews, mockUsers } from '@/lib/mock-data';

const statusConfig = {
  draft: { icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Draft' },
  submitted: { icon: Clock, color: 'text-chart-2', bg: 'bg-chart-2/10', label: 'Submitted' },
  under_review: {
    icon: AlertCircle,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    label: 'Under Review',
  },
  approved: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10', label: 'Approved' },
  rejected: {
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    label: 'Rejected',
  },
};

// Timeline events based on proposal status
function getTimelineEvents(proposalId: string, status: string, createdAt: string) {
  const events = [
    {
      id: '1',
      event_type: 'proposal_created',
      description: 'Proposal submitted for review',
      created_at: createdAt,
    },
  ];

  if (status === 'under_review' || status === 'approved' || status === 'rejected') {
    events.push({
      id: '2',
      event_type: 'sensor_data_uploaded',
      description: 'IoT sensor readings uploaded',
      created_at: new Date(new Date(createdAt).getTime() + 86400000).toISOString(),
    });
    events.push({
      id: '3',
      event_type: 'mrv_analysis_started',
      description: 'Automated MRV analysis initiated',
      created_at: new Date(new Date(createdAt).getTime() + 172800000).toISOString(),
    });
  }

  if (status === 'approved') {
    events.push({
      id: '4',
      event_type: 'proposal_approved',
      description: 'Proposal verified and approved',
      created_at: new Date(new Date(createdAt).getTime() + 259200000).toISOString(),
    });
    events.push({
      id: '5',
      event_type: 'credits_minted',
      description: 'Carbon credits minted as NFT',
      created_at: new Date(new Date(createdAt).getTime() + 345600000).toISOString(),
    });
  }

  if (status === 'rejected') {
    events.push({
      id: '4',
      event_type: 'proposal_rejected',
      description: 'Proposal did not meet verification criteria',
      created_at: new Date(new Date(createdAt).getTime() + 259200000).toISOString(),
    });
  }

  return events.reverse();
}

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isConnected } = useWallet();

  // Find proposal by ID
  const proposal = mockProposals.find((p) => p.id === id);
  const reviews = mockProposalReviews.filter((r) => r.proposal_id === id);
  const producer = proposal ? mockUsers.find((u) => u.id === proposal.producer_id) : null;

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <FileText className="h-16 w-16 text-muted-foreground/50" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">Connect Your Wallet</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Connect your wallet to view proposal details.
        </p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <XCircle className="h-16 w-16 text-destructive/50" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">Proposal Not Found</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          The proposal you are looking for does not exist or has been removed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/proposals">Back to Proposals</Link>
        </Button>
      </div>
    );
  }

  const timeline = getTimelineEvents(proposal.id, proposal.status, proposal.created_at);
  const StatusIcon = statusConfig[proposal.status].icon;

  const handleSubmitForReview = () => {
    toast.success('Proposal submitted for verification!');
  };

  const handleMintCredits = () => {
    toast.success(`${proposal.credit_quantity} carbon credits minted as NFT!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button asChild variant="ghost" size="icon" className="mt-1">
          <Link href="/proposals">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{proposal.title}</h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${statusConfig[proposal.status].bg} ${statusConfig[proposal.status].color}`}
            >
              <StatusIcon className="h-4 w-4" />
              {statusConfig[proposal.status].label}
            </span>
          </div>
          <p className="mt-1 text-muted-foreground">
            Created {new Date(proposal.created_at).toLocaleDateString()}
            {producer && ` by ${producer.display_name}`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {proposal.description && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">Description</h4>
                  <p className="text-foreground">{proposal.description}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Leaf className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credit Quantity</p>
                    <p className="font-medium text-foreground">
                      {proposal.credit_quantity.toLocaleString()} tCO2e
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-medium text-foreground">
                      {new Date(proposal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sensor Data / MRV Analysis */}
          {proposal.sensor_data && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="h-5 w-5 text-primary" />
                  MRV Oracle Data
                </CardTitle>
                <CardDescription>
                  Automated verification results from IoT sensors and satellite imagery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* NDVI Score */}
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">NDVI Score</p>
                      <p className="text-3xl font-bold text-foreground">
                        {proposal.sensor_data.ndvi_score.toFixed(3)}
                      </p>
                    </div>
                    <Badge
                      variant={proposal.sensor_data.ndvi_score >= 0.6 ? 'default' : 'secondary'}
                    >
                      {proposal.sensor_data.ndvi_score >= 0.6
                        ? 'Above Threshold'
                        : 'Below Threshold'}
                    </Badge>
                  </div>
                  <Progress
                    value={proposal.sensor_data.ndvi_score * 100}
                    className="mt-3 h-2"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Threshold for auto-verification: 0.6 | Current: {proposal.sensor_data.ndvi_score.toFixed(3)}
                  </p>
                </div>

                {/* Sensor Readings */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Thermometer className="h-4 w-4" />
                      <span className="text-sm">Temperature</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-foreground">
                      {proposal.sensor_data.temperature_c}°C
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Droplets className="h-4 w-4" />
                      <span className="text-sm">Humidity</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-foreground">
                      {proposal.sensor_data.humidity_pct}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Leaf className="h-4 w-4" />
                      <span className="text-sm">Soil Moisture</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-foreground">
                      {proposal.sensor_data.soil_moisture_pct}%
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Sensor reading recorded: {new Date(proposal.sensor_data.recorded_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((review) => {
                  const reviewer = mockUsers.find((u) => u.id === review.reviewer_id);
                  return (
                    <div key={review.id} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            review.decision === 'approved'
                              ? 'default'
                              : review.decision === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {review.decision === 'approved' && (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}
                          {review.decision === 'rejected' && <XCircle className="mr-1 h-3 w-3" />}
                          {review.decision.charAt(0).toUpperCase() + review.decision.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.reviewed_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.remarks && (
                        <p className="mt-2 text-sm text-foreground">{review.remarks}</p>
                      )}
                      {reviewer && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Reviewed by {reviewer.display_name}
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {proposal.status === 'draft' && (
                <Button className="w-full" onClick={handleSubmitForReview}>
                  Submit for Verification
                </Button>
              )}
              {proposal.status === 'submitted' && (
                <div className="rounded-lg bg-chart-2/10 p-3 text-center text-sm text-chart-2">
                  <Clock className="mx-auto mb-1 h-5 w-5" />
                  Awaiting review
                </div>
              )}
              {proposal.status === 'under_review' && (
                <div className="rounded-lg bg-chart-4/10 p-3 text-center text-sm text-chart-4">
                  <AlertCircle className="mx-auto mb-1 h-5 w-5" />
                  Under verification
                </div>
              )}
              {proposal.status === 'approved' && (
                <Button className="w-full" onClick={handleMintCredits}>
                  <Leaf className="mr-2 h-4 w-4" />
                  Mint Credits
                </Button>
              )}
              {proposal.status === 'rejected' && (
                <>
                  <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
                    <XCircle className="mx-auto mb-1 h-5 w-5" />
                    Proposal rejected
                  </div>
                  <Button variant="outline" className="w-full">
                    Edit & Resubmit
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length > 0 ? (
                <div className="relative space-y-4">
                  <div className="absolute bottom-0 left-3 top-0 w-px bg-border" />
                  {timeline.map((event, index) => (
                    <div key={event.id} className="relative flex gap-4 pl-8">
                      <div
                        className={`absolute left-0 top-1 h-6 w-6 rounded-full border-2 border-background ${
                          index === 0 ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium capitalize text-foreground">
                          {event.event_type.replace(/_/g, ' ')}
                        </p>
                        {event.description && (
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">No activity yet</p>
              )}
            </CardContent>
          </Card>

          {/* Producer Info (for certifiers) */}
          {user?.role === 'certification_body' && producer && (
            <Card>
              <CardHeader>
                <CardTitle>Producer Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">{producer.display_name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {producer.wallet_address}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
