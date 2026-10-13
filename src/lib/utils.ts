import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatCurrency(amount: number) {
  if (amount == null) return "0.00";
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Universal Fixed Phase 2 Target Launch Date: 25 Days Fixed Period
// Universal timestamp (UTC) ensures every user across all devices, logins, and refreshes sees the exact same countdown
export const PHASE_2_TOTAL_DAYS = 25;
export const PHASE_2_LAUNCH_TARGET_MS = new Date("2026-11-07T05:00:00Z").getTime();
export const PHASE_2_LAUNCH_DATE_STRING = "November 7, 2026";

export interface Phase2Countdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  totalMs: number;
}

export function getPhase2Countdown(): Phase2Countdown {
  const diff = Math.max(0, PHASE_2_LAUNCH_TARGET_MS - Date.now());
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return {
    days: d.toString().padStart(2, '0'),
    hours: h.toString().padStart(2, '0'),
    minutes: m.toString().padStart(2, '0'),
    seconds: s.toString().padStart(2, '0'),
    totalMs: diff,
  };
}

// Universal Global Maintenance End Time
export const UNIVERSAL_MAINTENANCE_END_MS = PHASE_2_LAUNCH_TARGET_MS;

