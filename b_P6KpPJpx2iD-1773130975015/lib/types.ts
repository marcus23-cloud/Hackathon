// Database types for Carbon Credit Trading Platform
// Matches the Backend API Reference enums

export type UserRole = 'producer' | 'buyer' | 'certification_body';

export type ProposalStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export type CreditStatus = 'minted' | 'listed' | 'transferred' | 'retired' | 'revoked';

export type OrderStatus = 'open' | 'partially_filled' | 'filled' | 'cancelled';

export type TradeStatus = 'matched' | 'settling' | 'settled' | 'failed';

export interface User {
  id: string;
  wallet_address: string;
  role: UserRole;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CertificationBody {
  id: string;
  user_id: string;
  organization_name: string;
  accreditation_authority: string;
  registry_contract_address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SensorData {
  device_id: string;
  co2_sequestered_tons: number;
  temperature_c: number;
  humidity_pct: number;
  ndvi_score: number;
  recorded_at: string;
}

export interface SupportingDocuments {
  land_ownership?: string;
  intent_certificate?: string;
  financial_history?: string;
}

export interface Proposal {
  id: string;
  producer_id: string;
  title: string;
  description: string | null;
  commodity_type: string;
  credit_quantity: number;
  supporting_documents: SupportingDocuments | null;
  proof_of_intent: string | null;
  proof_of_value: string | null;
  sensor_data: SensorData | null;
  status: ProposalStatus;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  producer?: User;
}

export interface ProposalReview {
  id: string;
  proposal_id: string;
  certifier_id: string;
  decision: 'approved' | 'rejected';
  remarks: string | null;
  reviewed_at: string;
  proposal?: Proposal;
  certifier?: CertificationBody;
}

export interface CreditMetadata {
  name: string;
  description: string;
  ipfs_cid: string;
  ndvi_score: number;
  co2_tonnage: number;
  location: string;
  issued_at: string;
}

export interface Credit {
  id: string;
  proposal_id: string;
  owner_id: string;
  token_id: string;
  contract_address: string;
  metadata: CreditMetadata;
  status: CreditStatus;
  minted_at: string;
  retired_at: string | null;
  created_at: string;
  updated_at: string;
  proposal?: Proposal;
  owner?: User;
}

export interface SellOrder {
  id: string;
  seller_id: string;
  credit_id: string;
  asking_price_eth: string; // String for 18-decimal precision
  quantity: number;
  status: OrderStatus;
  listed_at: string;
  created_at: string;
  updated_at: string;
  credit?: Credit;
  seller?: User;
}

export interface BuyOrder {
  id: string;
  buyer_id: string;
  credit_id: string;
  bid_price_eth: string; // String for 18-decimal precision
  quantity: number;
  status: OrderStatus;
  escrow_tx_hash: string | null;
  placed_at: string;
  created_at: string;
  updated_at: string;
  credit?: Credit;
  buyer?: User;
}

export interface Trade {
  id: string;
  sell_order_id: string;
  buy_order_id: string;
  credit_id: string;
  execution_price_eth: string; // String for 18-decimal precision
  quantity: number;
  status: TradeStatus;
  settlement_tx_hash: string | null;
  matched_at: string;
  settled_at: string | null;
  sell_order?: SellOrder;
  buy_order?: BuyOrder;
  credit?: Credit;
}

// Contract addresses
export const CARBON_CREDIT_NFT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const MARKETPLACE_ESCROW_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

// Dashboard stats
export interface DashboardStats {
  totalCredits: number;
  totalCO2Tonnage: number;
  activeListings: number;
  totalTraded: number;
  totalRetired: number;
  pendingProposals: number;
  approvedProposals: number;
  totalTradeVolume: number;
}

// Alias for backwards compatibility - TradeOrder is used for marketplace listings
export type TradeOrder = SellOrder;
