/**
 * In-Memory Storage Service
 *
 * Provides a typed, generic in-memory store with basic CRUD operations.
 * Designed to be easily swapped for a real database later — all access
 * goes through this abstraction layer.
 */

export class InMemoryStore<T extends { id: string }> {
  private items: Map<string, T> = new Map();

  /** Insert a new item. */
  create(item: T): T {
    this.items.set(item.id, item);
    return item;
  }

  /** Retrieve a single item by ID, or undefined if not found. */
  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  /** Return all items as an array. */
  findAll(): T[] {
    return Array.from(this.items.values());
  }

  /** Update an existing item. Returns the updated item or undefined. */
  update(id: string, updates: Partial<T>): T | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, id }; // id is immutable
    this.items.set(id, updated);
    return updated;
  }

  /** Remove an item. Returns true if it existed. */
  delete(id: string): boolean {
    return this.items.delete(id);
  }

  /** Number of stored items. */
  get size(): number {
    return this.items.size;
  }

  /** Wipe all data (useful for testing). */
  clear(): void {
    this.items.clear();
  }
}
