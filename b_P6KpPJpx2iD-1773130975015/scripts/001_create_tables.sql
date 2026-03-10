-- Carbon Credit Trading Platform Database Schema

-- Users table (wallet-based authentication)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'buyer',
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposals table (carbon credit project proposals)
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  project_type TEXT NOT NULL,
  estimated_credits INTEGER NOT NULL DEFAULT 0,
  methodology TEXT,
  start_date DATE,
  end_date DATE,
  documentation_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  rejection_reason TEXT,
  ndvi_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carbon Credits table (minted NFTs)
CREATE TABLE IF NOT EXISTS public.credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_id INTEGER UNIQUE,
  contract_address TEXT,
  vintage_year INTEGER NOT NULL,
  credit_amount INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'minted',
  metadata_uri TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_id UUID NOT NULL REFERENCES public.credits(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  price_wei TEXT NOT NULL,
  price_eth DECIMAL(18,8) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades table (completed transactions)
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  credit_id UUID NOT NULL REFERENCES public.credits(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  price_wei TEXT NOT NULL,
  price_eth DECIMAL(18,8) NOT NULL,
  transaction_hash TEXT,
  traded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retirements table (burned/retired credits)
CREATE TABLE IF NOT EXISTS public.retirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_id UUID NOT NULL REFERENCES public.credits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  beneficiary_name TEXT,
  retirement_reason TEXT,
  transaction_hash TEXT,
  certificate_number TEXT UNIQUE,
  retired_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Reviews table
CREATE TABLE IF NOT EXISTS public.verification_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  decision TEXT NOT NULL,
  comments TEXT,
  auto_mrv_score DECIMAL(5,2),
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline Events table (for transparency tracking)
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_id UUID REFERENCES public.credits(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT,
  transaction_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
