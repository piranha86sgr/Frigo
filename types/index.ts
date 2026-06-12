export interface FridgeItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  addedDate: string;
  notes?: string;
  used?: boolean;
  barcode?: string;
}

export type ExpiryStatus = "expired" | "expiring" | "ok";

export interface ScannedProduct {
  barcode: string;
  name?: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
}

export interface ScanResult {
  barcode?: string;
  productName?: string;
  category?: string;
  expiryDate?: string;
}