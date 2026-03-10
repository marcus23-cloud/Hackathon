import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Proposal,
  ProposalReview,
  Credit,
  SellOrder,
  BuyOrder,
  Trade,
  User,
  ProposalStatus,
  CreditStatus,
} from './types';
import {
  mockProposals,
  mockProposalReviews,
  mockCredits,
  mockSellOrders,
  mockBuyOrders,
  mockTrades,
  mockUsers,
} from './mock-data';

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface CarbonStore {
  // Data
  proposals: Proposal[];
  proposalReviews: ProposalReview[];
  credits: Credit[];
  sellOrders: SellOrder[];
  buyOrders: BuyOrder[];
  trades: Trade[];
  users: User[];

  // Proposal Actions (Seller)
  submitProposal: (proposal: Omit<Proposal, 'id' | 'status' | 'created_at' | 'updated_at'>) => Proposal;
  updateProposalStatus: (proposalId: string, status: ProposalStatus) => void;

  // Review Actions (Certifier)
  reviewProposal: (
    proposalId: string,
    certifierId: string,
    decision: 'approved' | 'rejected',
    remarks: string
  ) => ProposalReview | null;

  // Credit Actions
  mintCredit: (proposalId: string, ownerId: string) => Credit | null;
  updateCreditStatus: (creditId: string, status: CreditStatus) => void;
  transferCredit: (creditId: string, newOwnerId: string) => void;
  retireCredit: (creditId: string) => void;

  // Market Actions (Seller lists, Buyer purchases)
  listCreditForSale: (creditId: string, sellerId: string, priceEth: string) => SellOrder | null;
  cancelListing: (orderId: string) => void;
  purchaseCredit: (
    sellOrderId: string,
    buyerId: string,
    retireAfterPurchase?: boolean
  ) => Trade | null;

  // Helpers
  getProposalById: (id: string) => Proposal | undefined;
  getCreditById: (id: string) => Credit | undefined;
  getCreditsByOwner: (ownerId: string) => Credit[];
  getProposalsByProducer: (producerId: string) => Proposal[];
  getPendingProposals: () => Proposal[];
  getOpenSellOrders: () => (SellOrder & { credit: Credit; seller: User })[];
  getUserById: (id: string) => User | undefined;

  // Stats
  getDashboardStats: () => {
    totalCredits: number;
    totalCO2Tonnage: number;
    activeListings: number;
    totalTraded: number;
    totalRetired: number;
    pendingProposals: number;
    approvedProposals: number;
    totalTradeVolume: number;
  };

  // Reset to initial mock data
  resetStore: () => void;
}

const initialState = {
  proposals: [...mockProposals],
  proposalReviews: [...mockProposalReviews],
  credits: [...mockCredits],
  sellOrders: [...mockSellOrders],
  buyOrders: [...mockBuyOrders],
  trades: [...mockTrades],
  users: [...mockUsers],
};

export const useCarbonStore = create<CarbonStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Submit a new proposal (Seller action)
      submitProposal: (proposalData) => {
        const now = new Date().toISOString();
        const newProposal: Proposal = {
          ...proposalData,
          id: `prop-${generateId()}`,
          status: 'submitted',
          submitted_at: now,
          created_at: now,
          updated_at: now,
        };

        set((state) => ({
          proposals: [...state.proposals, newProposal],
        }));

        return newProposal;
      },

      // Update proposal status
      updateProposalStatus: (proposalId, status) => {
        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === proposalId
              ? { ...p, status, updated_at: new Date().toISOString() }
              : p
          ),
        }));
      },

      // Review a proposal (Certifier action)
      reviewProposal: (proposalId, certifierId, decision, remarks) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal) return null;

        const now = new Date().toISOString();
        const review: ProposalReview = {
          id: `rev-${generateId()}`,
          proposal_id: proposalId,
          certifier_id: certifierId,
          decision,
          remarks,
          reviewed_at: now,
        };

        const newStatus: ProposalStatus = decision === 'approved' ? 'approved' : 'rejected';

        set((state) => ({
          proposalReviews: [...state.proposalReviews, review],
          proposals: state.proposals.map((p) =>
            p.id === proposalId
              ? { ...p, status: newStatus, updated_at: now }
              : p
          ),
        }));

        // If approved, automatically mint the credit
        if (decision === 'approved') {
          get().mintCredit(proposalId, proposal.producer_id);
        }

        return review;
      },

      // Mint a new credit (called when proposal is approved)
      mintCredit: (proposalId, ownerId) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal) return null;

        const existingCreditsCount = get().credits.length;
        const now = new Date().toISOString();

        const newCredit: Credit = {
          id: `cc-${generateId()}`,
          proposal_id: proposalId,
          owner_id: ownerId,
          token_id: String(existingCreditsCount + 1),
          contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          metadata: {
            name: `Carbon Credit - ${proposal.title}`,
            description: `${proposal.credit_quantity} tCO2e. ${proposal.description || proposal.title}`,
            ipfs_cid: `Qm${generateId()}`,
            ndvi_score: proposal.sensor_data?.ndvi_score || 0.6,
            co2_tonnage: proposal.credit_quantity,
            location: proposal.sensor_data?.device_id || 'Unknown',
            issued_at: now,
          },
          status: 'minted',
          minted_at: now,
          retired_at: null,
          created_at: now,
          updated_at: now,
        };

        set((state) => ({
          credits: [...state.credits, newCredit],
        }));

        return newCredit;
      },

      // Update credit status
      updateCreditStatus: (creditId, status) => {
        set((state) => ({
          credits: state.credits.map((c) =>
            c.id === creditId
              ? { ...c, status, updated_at: new Date().toISOString() }
              : c
          ),
        }));
      },

      // Transfer credit ownership
      transferCredit: (creditId, newOwnerId) => {
        set((state) => ({
          credits: state.credits.map((c) =>
            c.id === creditId
              ? {
                  ...c,
                  owner_id: newOwnerId,
                  status: 'transferred' as CreditStatus,
                  updated_at: new Date().toISOString(),
                }
              : c
          ),
        }));
      },

      // Retire (burn) a credit
      retireCredit: (creditId) => {
        const now = new Date().toISOString();
        set((state) => ({
          credits: state.credits.map((c) =>
            c.id === creditId
              ? {
                  ...c,
                  status: 'retired' as CreditStatus,
                  retired_at: now,
                  updated_at: now,
                }
              : c
          ),
        }));
      },

      // List a credit for sale (Seller action)
      listCreditForSale: (creditId, sellerId, priceEth) => {
        const credit = get().credits.find((c) => c.id === creditId);
        if (!credit || credit.status !== 'minted') return null;

        const now = new Date().toISOString();
        const sellOrder: SellOrder = {
          id: `so-${generateId()}`,
          seller_id: sellerId,
          credit_id: creditId,
          asking_price_eth: priceEth,
          quantity: 1,
          status: 'open',
          listed_at: now,
          created_at: now,
          updated_at: now,
        };

        set((state) => ({
          sellOrders: [...state.sellOrders, sellOrder],
          credits: state.credits.map((c) =>
            c.id === creditId
              ? { ...c, status: 'listed' as CreditStatus, updated_at: now }
              : c
          ),
        }));

        return sellOrder;
      },

      // Cancel a listing
      cancelListing: (orderId) => {
        const order = get().sellOrders.find((o) => o.id === orderId);
        if (!order) return;

        set((state) => ({
          sellOrders: state.sellOrders.map((o) =>
            o.id === orderId
              ? { ...o, status: 'cancelled', updated_at: new Date().toISOString() }
              : o
          ),
          credits: state.credits.map((c) =>
            c.id === order.credit_id
              ? { ...c, status: 'minted' as CreditStatus, updated_at: new Date().toISOString() }
              : c
          ),
        }));
      },

      // Purchase a credit (Buyer action)
      purchaseCredit: (sellOrderId, buyerId, retireAfterPurchase = false) => {
        const sellOrder = get().sellOrders.find((o) => o.id === sellOrderId);
        if (!sellOrder || sellOrder.status !== 'open') return null;

        const credit = get().credits.find((c) => c.id === sellOrder.credit_id);
        if (!credit) return null;

        const now = new Date().toISOString();

        // Create buy order
        const buyOrder: BuyOrder = {
          id: `bo-${generateId()}`,
          buyer_id: buyerId,
          credit_id: sellOrder.credit_id,
          bid_price_eth: sellOrder.asking_price_eth,
          quantity: 1,
          status: 'filled',
          escrow_tx_hash: `0x${generateId()}`,
          placed_at: now,
          created_at: now,
          updated_at: now,
        };

        // Create trade
        const trade: Trade = {
          id: `tr-${generateId()}`,
          sell_order_id: sellOrderId,
          buy_order_id: buyOrder.id,
          credit_id: sellOrder.credit_id,
          execution_price_eth: sellOrder.asking_price_eth,
          quantity: 1,
          status: 'settled',
          settlement_tx_hash: `0x${generateId()}`,
          matched_at: now,
          settled_at: now,
        };

        // Determine new credit status
        const newCreditStatus: CreditStatus = retireAfterPurchase ? 'retired' : 'transferred';

        set((state) => ({
          buyOrders: [...state.buyOrders, buyOrder],
          trades: [...state.trades, trade],
          sellOrders: state.sellOrders.map((o) =>
            o.id === sellOrderId
              ? { ...o, status: 'filled', updated_at: now }
              : o
          ),
          credits: state.credits.map((c) =>
            c.id === sellOrder.credit_id
              ? {
                  ...c,
                  owner_id: buyerId,
                  status: newCreditStatus,
                  retired_at: retireAfterPurchase ? now : null,
                  updated_at: now,
                }
              : c
          ),
        }));

        return trade;
      },

      // Helper functions
      getProposalById: (id) => get().proposals.find((p) => p.id === id),

      getCreditById: (id) => get().credits.find((c) => c.id === id),

      getCreditsByOwner: (ownerId) =>
        get().credits.filter((c) => c.owner_id === ownerId),

      getProposalsByProducer: (producerId) =>
        get().proposals.filter((p) => p.producer_id === producerId),

      getPendingProposals: () =>
        get().proposals.filter(
          (p) => p.status === 'submitted' || p.status === 'under_review'
        ),

      getOpenSellOrders: () => {
        const state = get();
        return state.sellOrders
          .filter((order) => order.status === 'open')
          .map((order) => {
            const credit = state.credits.find((c) => c.id === order.credit_id)!;
            const seller = state.users.find((u) => u.id === order.seller_id)!;
            return { ...order, credit, seller };
          })
          .filter((order) => order.credit && order.seller);
      },

      getUserById: (id) => get().users.find((u) => u.id === id),

      getDashboardStats: () => {
        const state = get();
        const totalCredits = state.credits.length;
        const totalCO2Tonnage = state.credits.reduce(
          (sum, c) => sum + c.metadata.co2_tonnage,
          0
        );
        const activeListings = state.sellOrders.filter((o) => o.status === 'open').length;
        const totalTraded = state.trades.filter((t) => t.status === 'settled').length;
        const totalRetired = state.credits.filter((c) => c.status === 'retired').length;
        const pendingProposals = state.proposals.filter(
          (p) => p.status === 'submitted' || p.status === 'under_review'
        ).length;
        const approvedProposals = state.proposals.filter(
          (p) => p.status === 'approved'
        ).length;
        const totalTradeVolume = state.trades
          .filter((t) => t.status === 'settled')
          .reduce((sum, t) => sum + parseFloat(t.execution_price_eth), 0);

        return {
          totalCredits,
          totalCO2Tonnage,
          activeListings,
          totalTraded,
          totalRetired,
          pendingProposals,
          approvedProposals,
          totalTradeVolume,
        };
      },

      resetStore: () => set(initialState),
    }),
    {
      name: 'carbon-credit-store',
    }
  )
);
