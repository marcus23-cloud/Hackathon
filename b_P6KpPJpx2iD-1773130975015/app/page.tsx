'use client';

import Link from 'next/link';
import {
  Leaf,
  Shield,
  BarChart3,
  Globe,
  ArrowRight,
  Zap,
  Lock,
  RefreshCw,
  Satellite,
  Thermometer,
  Droplets,
  CheckCircle,
  Flame,
  Layers,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWallet } from '@/components/providers/wallet-provider';

const features = [
  {
    icon: Shield,
    title: 'Verified Credits',
    description:
      'Every carbon credit is verified through our MRV Oracle with NDVI satellite analysis and IoT sensor data.',
  },
  {
    icon: Lock,
    title: 'Blockchain Secured',
    description:
      'Credits are minted as ERC-721 NFTs on the blockchain, ensuring transparency and preventing double counting.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Trading',
    description:
      'Trade verified carbon credits instantly on our decentralized marketplace with fractional ownership support.',
  },
  {
    icon: RefreshCw,
    title: 'Full Lifecycle',
    description:
      'Track credits from project proposal through verification, trading, and retirement with complete transparency.',
  },
];

const stats = [
  { value: '2.5M+', label: 'Tons CO2 Offset' },
  { value: '1,200+', label: 'Verified Projects' },
  { value: '$45M', label: 'Credits Traded' },
  { value: '50+', label: 'Countries' },
];

const mrvFeatures = [
  {
    icon: Satellite,
    title: 'Satellite Imagery',
    description:
      'NDVI (Normalized Difference Vegetation Index) analysis from satellite data measures vegetation health and carbon sequestration potential.',
  },
  {
    icon: Thermometer,
    title: 'IoT Sensors',
    description:
      'Real-time environmental data from ground sensors including temperature, humidity, and soil moisture readings.',
  },
  {
    icon: CheckCircle,
    title: 'Auto-Verification',
    description:
      'Proposals with NDVI scores above 0.6 threshold can be automatically verified, speeding up the approval process.',
  },
];

const roles = [
  {
    title: 'Carbon Producers',
    description:
      'Submit environmental projects like reforestation or renewable energy, get verified, and mint carbon credit NFTs.',
    cta: 'Submit a Project',
    href: '/proposals/new',
  },
  {
    title: 'Carbon Buyers',
    description:
      'Purchase verified carbon credits to offset your footprint. Buy full credits or fractional shares.',
    cta: 'Browse Marketplace',
    href: '/marketplace',
  },
  {
    title: 'Certification Bodies',
    description:
      'Review and verify proposals using MRV data. Ensure quality and integrity of carbon credits.',
    cta: 'Learn More',
    href: '/verification',
  },
];

export default function Home() {
  const { login, isConnecting, isConnected } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">CarbonX</span>
          </div>
          <div className="flex items-center gap-4">
            {isConnected ? (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={isConnecting}>
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
          </div>
        </nav>

        <div className="relative mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Web3 Carbon Trading Platform</span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Trade Verified Carbon Credits on the Blockchain
            </h1>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              CarbonX brings transparency and trust to carbon markets. Submit environmental
              projects, get verified through our MRV Oracle, mint carbon credits as NFTs, and trade
              them on our decentralized marketplace.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {isConnected ? (
                <>
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/dashboard">
                      View Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/marketplace">Browse Marketplace</Link>
                  </Button>
                </>
              ) : (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="lg" disabled={isConnecting} className="gap-2">
                        {isConnecting ? 'Signing in...' : 'Get Started'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56">
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
                  <Button asChild variant="outline" size="lg">
                    <Link href="/marketplace">Explore Marketplace</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary lg:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MRV Oracle Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
              <Satellite className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">MRV Oracle Technology</span>
            </div>
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Automated Verification with Real Data
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Our MRV (Measurement, Reporting, Verification) Oracle combines satellite imagery with
              IoT sensor data to automatically verify carbon credit proposals. No more relying
              solely on manual audits.
            </p>

            <div className="mt-8 space-y-6">
              {mrvFeatures.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-foreground">Sample MRV Data</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time verification data from an approved project
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">NDVI Score</span>
                  <span className="font-mono text-xl font-bold text-primary">0.723</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[72.3%] rounded-full bg-primary" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Above 0.6 threshold - Auto-verification eligible
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-border p-3 text-center">
                  <Thermometer className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-2 text-lg font-bold text-foreground">24C</p>
                  <p className="text-xs text-muted-foreground">Temperature</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <Droplets className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-2 text-lg font-bold text-foreground">65%</p>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <Leaf className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-2 text-lg font-bold text-foreground">42%</p>
                  <p className="text-xs text-muted-foreground">Soil Moisture</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Verification Status: Approved
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
          <div className="text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Complete Carbon Credit Lifecycle
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
              From project submission to credit retirement, CarbonX provides a transparent,
              verifiable, and efficient carbon trading experience.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Built for Everyone in Carbon Markets
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Whether you are creating carbon credits, buying them, or verifying projects, CarbonX
            has the tools you need.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {roles.map((role) => (
            <Card
              key={role.title}
              className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground">{role.title}</h3>
                <p className="mt-2 text-muted-foreground">{role.description}</p>
                <Button asChild className="mt-6 w-full" variant="outline">
                  <Link href={role.href}>{role.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Fractional Ownership</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Buy partial shares of carbon credits. Purchase exactly the amount you need, from 5%
                to 100% of any listed credit.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <Flame className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Credit Retirement</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Permanently retire credits to claim your carbon offset. Receive an on-chain
                certificate proving your environmental impact.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/10">
                <BarChart3 className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Price Analytics</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Track carbon credit prices, trading volume, and market trends with real-time
                analytics and historical data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Get started with CarbonX in four simple steps
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-4">
          {[
            {
              step: '01',
              title: 'Sign In',
              desc: 'Choose your role: Seller, Buyer, or Certifier',
            },
            {
              step: '02',
              title: 'Submit Proposal',
              desc: 'Create a carbon credit project with sensor data',
            },
            {
              step: '03',
              title: 'MRV Verification',
              desc: 'Oracle analyzes NDVI and sensor data automatically',
            },
            {
              step: '04',
              title: 'Trade or Retire',
              desc: 'List on marketplace or retire for offset certificate',
            },
          ].map((item, index) => (
            <div key={item.step} className="relative">
              {index < 3 && (
                <div className="absolute right-0 top-8 hidden h-0.5 w-full bg-border lg:block" />
              )}
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
          <div className="rounded-3xl bg-primary p-8 text-center lg:p-16">
            <Globe className="mx-auto h-12 w-12 text-primary-foreground/80" />
            <h2 className="mt-6 text-balance text-3xl font-bold text-primary-foreground sm:text-4xl">
              Join the Carbon Revolution
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-primary-foreground/80">
              Be part of the solution. Whether you are a project developer, investor, or
              organization looking to offset your carbon footprint, CarbonX provides the tools you
              need.
            </p>
            <div className="mt-8">
              {isConnected ? (
                <Button asChild size="lg" variant="secondary" className="gap-2">
                  <Link href="/proposals/new">
                    Submit Your Project
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="lg"
                      variant="secondary"
                      disabled={isConnecting}
                      className="gap-2"
                    >
                      {isConnecting ? 'Signing in...' : 'Get Started Now'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
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
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">CarbonX</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Building transparent carbon markets for a sustainable future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
