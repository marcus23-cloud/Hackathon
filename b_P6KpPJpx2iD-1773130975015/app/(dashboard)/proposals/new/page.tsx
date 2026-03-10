'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWallet } from '@/components/providers/wallet-provider';
import { useCarbonStore } from '@/lib/store';

const projectTypes = [
  { value: 'reforestation', label: 'Reforestation' },
  { value: 'afforestation', label: 'Afforestation' },
  { value: 'renewable_energy', label: 'Renewable Energy' },
  { value: 'energy_efficiency', label: 'Energy Efficiency' },
  { value: 'methane_capture', label: 'Methane Capture' },
  { value: 'blue_carbon', label: 'Blue Carbon' },
  { value: 'soil_carbon', label: 'Soil Carbon' },
  { value: 'other', label: 'Other' },
];

const methodologies = [
  { value: 'vcs', label: 'Verified Carbon Standard (VCS)' },
  { value: 'gold_standard', label: 'Gold Standard' },
  { value: 'car', label: 'Climate Action Reserve (CAR)' },
  { value: 'acr', label: 'American Carbon Registry (ACR)' },
  { value: 'plan_vivo', label: 'Plan Vivo' },
  { value: 'other', label: 'Other' },
];

export default function NewProposalPage() {
  const router = useRouter();
  const { user, isConnected } = useWallet();
  const submitProposal = useCarbonStore((state) => state.submitProposal);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    project_type: '',
    estimated_credits: '',
    methodology: '',
    start_date: '',
    end_date: '',
    documentation_url: '',
    // Sensor data fields
    device_id: '',
    co2_tons: '',
    temperature: '',
    humidity: '',
    ndvi_score: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.title || !formData.project_type || !formData.estimated_credits) {
      toast.error('Please fill in the required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create sensor data object if provided
      const sensorData = formData.device_id ? {
        device_id: formData.device_id,
        co2_sequestered_tons: parseFloat(formData.co2_tons) || parseFloat(formData.estimated_credits),
        temperature_c: parseFloat(formData.temperature) || 25,
        humidity_pct: parseFloat(formData.humidity) || 70,
        ndvi_score: parseFloat(formData.ndvi_score) || 0.6,
        recorded_at: new Date().toISOString(),
      } : null;

      // Submit to store
      const newProposal = submitProposal({
        producer_id: user.id,
        title: formData.title,
        description: formData.description || null,
        commodity_type: formData.project_type,
        credit_quantity: parseInt(formData.estimated_credits) || 0,
        supporting_documents: formData.documentation_url ? {
          land_ownership: formData.documentation_url,
        } : null,
        proof_of_intent: formData.methodology ? `Methodology: ${formData.methodology}` : null,
        proof_of_value: formData.location ? `Location: ${formData.location}` : null,
        sensor_data: sensorData,
        submitted_at: isDraft ? null : new Date().toISOString(),
      });

      toast.success(
        isDraft 
          ? 'Draft saved successfully' 
          : `Proposal "${newProposal.title}" submitted for verification!`
      );
      router.push('/proposals');
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error('Failed to create proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <FileText className="h-16 w-16 text-muted-foreground/50" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">Connect Your Wallet</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Connect your wallet to create a new proposal.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/proposals">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Proposal</h1>
          <p className="text-muted-foreground">
            Submit a new carbon credit project for verification
          </p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)}>
        {/* Project Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Basic information about your carbon credit project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Project Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Amazon Reforestation Initiative"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your project, its goals, and expected environmental impact..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project_type">
                  Project Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.project_type}
                  onValueChange={(value) => handleChange('project_type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="methodology">Verification Methodology</Label>
                <Select
                  value={formData.methodology}
                  onValueChange={(value) => handleChange('methodology', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select methodology" />
                  </SelectTrigger>
                  <SelectContent>
                    {methodologies.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Project Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Para State, Brazil"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_credits">Estimated Credits</Label>
                <Input
                  id="estimated_credits"
                  type="number"
                  placeholder="e.g., 10000"
                  min="1"
                  value={formData.estimated_credits}
                  onChange={(e) => handleChange('estimated_credits', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Provide supporting documentation for your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="documentation_url">Documentation URL</Label>
              <Input
                id="documentation_url"
                type="url"
                placeholder="https://example.com/project-docs.pdf"
                value={formData.documentation_url}
                onChange={(e) => handleChange('documentation_url', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Link to project documentation, reports, or supporting evidence
              </p>
            </div>

            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium text-foreground">
                Drag and drop files here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, DOC, or image files up to 10MB
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                (File upload feature coming soon)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save as Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Submit for Verification
          </Button>
        </div>
      </form>
    </div>
  );
}
