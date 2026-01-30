/**
 * Donation Service
 *
 * Business logic for recording donations, logging distributions,
 * and generating reports. Keeps the route handlers thin.
 */

import { randomUUID as uuid } from 'node:crypto';
import { InMemoryStore } from './storage';
import {
  Donation,
  CreateDonationDto,
  Distribution,
  CreateDistributionDto,
  InventoryItem,
  DonorSummary,
  DonationType,
} from '../models/donation';

export class DonationService {
  private donations: InMemoryStore<Donation>;
  private distributions: InMemoryStore<Distribution>;

  constructor(
    donationStore?: InMemoryStore<Donation>,
    distributionStore?: InMemoryStore<Distribution>,
  ) {
    this.donations = donationStore ?? new InMemoryStore<Donation>();
    this.distributions = distributionStore ?? new InMemoryStore<Distribution>();
  }

  // ─── Donations ──────────────────────────────────────────────

  /** Record a new donation. */
  createDonation(dto: CreateDonationDto): Donation {
    const donation: Donation = {
      id: uuid(),
      donorName: dto.donorName.trim(),
      type: dto.type,
      quantity: dto.quantity,
      unit: dto.unit.trim().toLowerCase(),
      date: dto.date ?? new Date().toISOString(),
      notes: dto.notes?.trim(),
      createdAt: new Date().toISOString(),
    };
    return this.donations.create(donation);
  }

  /** Get all recorded donations. */
  getAllDonations(): Donation[] {
    return this.donations.findAll();
  }

  /** Get a single donation by ID. */
  getDonation(id: string): Donation | undefined {
    return this.donations.findById(id);
  }

  // ─── Distributions ──────────────────────────────────────────

  /**
   * Log a distribution event.
   * Validates that enough inventory exists before distributing.
   */
  createDistribution(dto: CreateDistributionDto): Distribution | { error: string } {
    // Check available inventory for this type + unit combo
    const available = this.getAvailableStock(dto.type, dto.unit.trim().toLowerCase());

    if (available < dto.quantity) {
      return {
        error: `Insufficient inventory. Available: ${available} ${dto.unit} of ${dto.type}. Requested: ${dto.quantity}`,
      };
    }

    const distribution: Distribution = {
      id: uuid(),
      type: dto.type,
      quantity: dto.quantity,
      unit: dto.unit.trim().toLowerCase(),
      recipientDescription: dto.recipientDescription?.trim(),
      date: dto.date ?? new Date().toISOString(),
      notes: dto.notes?.trim(),
      createdAt: new Date().toISOString(),
    };
    return this.distributions.create(distribution);
  }

  /** Get all logged distributions. */
  getAllDistributions(): Distribution[] {
    return this.distributions.findAll();
  }

  // ─── Reports ────────────────────────────────────────────────

  /**
   * Inventory Report
   *
   * Groups donations and distributions by type + unit,
   * calculates received, distributed, and current stock.
   */
  getInventoryReport(): InventoryItem[] {
    const received = new Map<string, { total: number; unit: string; type: DonationType }>();
    const distributed = new Map<string, number>();

    // Sum up all donations by type+unit
    for (const d of this.donations.findAll()) {
      const key = `${d.type}:${d.unit}`;
      const entry = received.get(key) ?? { total: 0, unit: d.unit, type: d.type };
      entry.total += d.quantity;
      received.set(key, entry);
    }

    // Sum up all distributions by type+unit
    for (const d of this.distributions.findAll()) {
      const key = `${d.type}:${d.unit}`;
      distributed.set(key, (distributed.get(key) ?? 0) + d.quantity);
    }

    // Build the report
    const report: InventoryItem[] = [];
    for (const [key, { total, unit, type }] of received) {
      const dist = distributed.get(key) ?? 0;
      report.push({
        type,
        totalReceived: total,
        totalDistributed: dist,
        currentStock: total - dist,
        unit,
      });
    }

    return report.sort((a, b) => a.type.localeCompare(b.type));
  }

  /**
   * Donor Report
   *
   * Aggregates contributions per donor, broken down by type.
   */
  getDonorReport(): DonorSummary[] {
    const donors = new Map<string, Map<string, { type: DonationType; qty: number; unit: string }>>();

    for (const d of this.donations.findAll()) {
      const name = d.donorName;
      if (!donors.has(name)) donors.set(name, new Map());
      const typeMap = donors.get(name)!;

      const key = `${d.type}:${d.unit}`;
      const entry = typeMap.get(key) ?? { type: d.type, qty: 0, unit: d.unit };
      entry.qty += d.quantity;
      typeMap.set(key, entry);
    }

    const report: DonorSummary[] = [];
    for (const [donorName, typeMap] of donors) {
      const contributions = Array.from(typeMap.values()).map((e) => ({
        type: e.type,
        totalQuantity: e.qty,
        unit: e.unit,
      }));

      report.push({
        donorName,
        totalDonations: contributions.reduce((sum, c) => sum + c.totalQuantity, 0),
        contributions: contributions.sort((a, b) => a.type.localeCompare(b.type)),
      });
    }

    return report.sort((a, b) => a.donorName.localeCompare(b.donorName));
  }

  // ─── Helpers ────────────────────────────────────────────────

  /** Calculate available stock for a given type and unit. */
  private getAvailableStock(type: DonationType, unit: string): number {
    const totalReceived = this.donations
      .findAll()
      .filter((d) => d.type === type && d.unit === unit)
      .reduce((sum, d) => sum + d.quantity, 0);

    const totalDistributed = this.distributions
      .findAll()
      .filter((d) => d.type === type && d.unit === unit)
      .reduce((sum, d) => sum + d.quantity, 0);

    return totalReceived - totalDistributed;
  }

  /** Reset all data (for testing). */
  reset(): void {
    this.donations.clear();
    this.distributions.clear();
  }
}

/** Singleton instance for the application */
export const donationService = new DonationService();
