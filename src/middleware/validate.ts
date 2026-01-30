/**
 * Request Validation Middleware
 *
 * Validates incoming DTOs before they reach the service layer.
 * Returns 400 with clear error messages for malformed requests.
 */

import { Request, Response, NextFunction } from 'express';
import { DonationType } from '../models/donation';

const VALID_TYPES = Object.values(DonationType);

/** Collect all validation errors instead of failing on the first one. */
type ValidationError = { field: string; message: string };

function collectErrors(body: Record<string, unknown>, rules: ValidationRule[]): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const rule of rules) {
    const error = rule(body);
    if (error) errors.push(error);
  }
  return errors;
}

type ValidationRule = (body: Record<string, unknown>) => ValidationError | null;

// ─── Shared Rules ──────────────────────────────────────────────

const requireString = (field: string, label?: string): ValidationRule => (body) => {
  const val = body[field];
  if (typeof val !== 'string' || val.trim().length === 0) {
    return { field, message: `${label ?? field} is required and must be a non-empty string` };
  }
  return null;
};

const requireValidType: ValidationRule = (body) => {
  if (!VALID_TYPES.includes(body.type as DonationType)) {
    return {
      field: 'type',
      message: `type must be one of: ${VALID_TYPES.join(', ')}`,
    };
  }
  return null;
};

const requirePositiveNumber = (field: string): ValidationRule => (body) => {
  const val = body[field];
  if (typeof val !== 'number' || val <= 0 || !isFinite(val)) {
    return { field, message: `${field} must be a positive number` };
  }
  return null;
};

const optionalIsoDate: ValidationRule = (body) => {
  if (body.date !== undefined) {
    const d = new Date(body.date as string);
    if (isNaN(d.getTime())) {
      return { field: 'date', message: 'date must be a valid ISO 8601 date string' };
    }
  }
  return null;
};

// ─── Exported Middleware ────────────────────────────────────────

export function validateDonation(req: Request, res: Response, next: NextFunction): void {
  const errors = collectErrors(req.body, [
    requireString('donorName', 'Donor name'),
    requireValidType,
    requirePositiveNumber('quantity'),
    requireString('unit'),
    optionalIsoDate,
  ]);

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }
  next();
}

export function validateDistribution(req: Request, res: Response, next: NextFunction): void {
  const errors = collectErrors(req.body, [
    requireValidType,
    requirePositiveNumber('quantity'),
    requireString('unit'),
    optionalIsoDate,
  ]);

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }
  next();
}
