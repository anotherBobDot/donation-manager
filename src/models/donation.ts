/**
 * Donation Models
 *
 * Core domain types for the donation management system.
 * Using TypeScript enums and interfaces for strong type safety.
 */

/** Supported donation categories */
export enum DonationType {
  MONEY = 'money',
  FOOD = 'food',
  CLOTHING = 'clothing',
  HYGIENE = 'hygiene',
  MEDICAL = 'medical',
  BEDDING = 'bedding',
  OTHER = 'other',
}

/** A single donation record */
export interface Donation {
  id: string;
  donorName: string;
  type: DonationType;
  quantity: number;
  unit: string; // e.g., "dollars", "lbs", "items"
  date: string; // ISO 8601
  notes?: string;
  createdAt: string;
}

/** Payload for creating a new donation */
export interface CreateDonationDto {
  donorName: string;
  type: DonationType;
  quantity: number;
  unit: string;
  date?: string; // defaults to now
  notes?: string;
}

/** A distribution event — items leaving inventory */
export interface Distribution {
  id: string;
  type: DonationType;
  quantity: number;
  unit: string;
  recipientDescription?: string;
  date: string;
  notes?: string;
  createdAt: string;
}

/** Payload for logging a new distribution */
export interface CreateDistributionDto {
  type: DonationType;
  quantity: number;
  unit: string;
  recipientDescription?: string;
  date?: string;
  notes?: string;
}

/** Inventory snapshot for a single donation type */
export interface InventoryItem {
  type: DonationType;
  totalReceived: number;
  totalDistributed: number;
  currentStock: number;
  unit: string;
}

/** Aggregated contribution totals for one donor */
export interface DonorSummary {
  donorName: string;
  totalDonations: number;
  contributions: {
    type: DonationType;
    totalQuantity: number;
    unit: string;
  }[];
}
