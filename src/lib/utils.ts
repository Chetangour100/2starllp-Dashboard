import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { BusinessAddress } from "@/api/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a business address object into a readable string
 */
export function formatAddress(address: BusinessAddress): string {
  const parts: string[] = [];
  
  if (address.line1) parts.push(address.line1);
  if (address.line2) parts.push(address.line2);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.country) parts.push(address.country);
  if (address.pinCode) parts.push(address.pinCode);
  
  return parts.join(', ');
}

/**
 * Formats a business address object into multiple lines for display
 */
export function formatAddressMultiline(address: BusinessAddress): string[] {
  const lines: string[] = [];
  
  if (address.line1) lines.push(address.line1);
  if (address.line2) lines.push(address.line2);
  
  const cityStateLine = [address.city, address.state].filter(Boolean).join(', ');
  if (cityStateLine) lines.push(cityStateLine);
  
  if (address.country) lines.push(address.country);
  if (address.pinCode) lines.push(address.pinCode);
  
  return lines;
}

/**
 * Validates if an address object has all required fields
 */
export function isAddressValid(address: BusinessAddress): boolean {
  return !!(
    address.line1?.trim() &&
    address.city?.trim() &&
    address.state?.trim() &&
    address.country?.trim() &&
    address.pinCode?.trim()
  );
}
