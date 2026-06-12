import { ExpiryStatus } from "../types";

export function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(days: number): ExpiryStatus {
  if (days < 0) return "expired";
  if (days <= 3) return "expiring";
  return "ok";
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const CATEGORIES = [
  { value: "latticini", label: "Latticini", icon: "🧀" },
  { value: "carne", label: "Carne", icon: "🥩" },
  { value: "pesce", label: "Pesce", icon: "🐟" },
  { value: "verdure", label: "Verdure", icon: "🥬" },
  { value: "frutta", label: "Frutta", icon: "🍎" },
  { value: "condimenti", label: "Condimenti", icon: "🫒" },
  { value: "bevande", label: "Bevande", icon: "🥤" },
  { value: "dolci", label: "Dolci", icon: "🍰" },
  { value: "avanzi", label: "Avanzi", icon: "🍱" },
  { value: "altro", label: "Altro", icon: "📦" },
];

export const UNITS = [
  { value: "pezzi", label: "pezzi" },
  { value: "grammi", label: "grammi" },
  { value: "kg", label: "kg" },
  { value: "litri", label: "litri" },
  { value: "ml", label: "ml" },
  { value: "confezioni", label: "confezioni" },
];

// Database locale di prodotti comuni (simula Open Food Facts)
export const PRODUCT_DATABASE: Record<string, { name: string; category: string; brand?: string }> = {
  "8000500111113": { name: "Latte Parzialmente Scremato", category: "latticini", brand: "Parmalat" },
  "8000500222220": { name: "Yogurt Bianco", category: "latticini", brand: "Muller" },
  "8000500333337": { name: "Mozzarella", category: "latticini", brand: "Galbani" },
  "8000500444444": { name: "Petto di Pollo", category: "carne", brand: "Aia" },
  "8000500555551": { name: "Prosciutto Cotto", category: "carne", brand: "Citterio" },
  "8000500666668": { name: "Salmone Affumicato", category: "pesce", brand: "Mare" },
  "8000500777775": { name: "Tonno in Scatola", category: "pesce", brand: "Rio Mare" },
  "8000500888882": { name: "Pomodori Ciliegino", category: "verdure", brand: "Pomì" },
  "8000500999999": { name: "Mele Golden", category: "frutta", brand: "Melinda" },
  "8000501000006": { name: "Pasta Barilla", category: "altro", brand: "Barilla" },
  "8000501111113": { name: "Olio Extra Vergine", category: "condimenti", brand: "Carapelli" },
  "8000501222220": { name: "Acqua Minerale", category: "bevande", brand: "San Pellegrino" },
  "8000501333337": { name: "Tiramisù", category: "dolci", brand: "Loacker" },
  "8000501444444": { name: "Parmigiano Reggiano", category: "latticini", brand: "Parmigiano" },
  "8000501555551": { name: "Bresaola", category: "carne", brand: "Bormioli" },
  "8000501666668": { name: "Gelato", category: "dolci", brand: "Algida" },
  "8000501777775": { name: "Succo d'Arancia", category: "bevande", brand: "Pfanner" },
  "8000501888882": { name: "Insalata Mista", category: "verdure", brand: "Ferrara" },
  "8000501999999": { name: "Biscotti", category: "dolci", brand: "Mulino Bianco" },
  "8000502000006": { name: "Uova", category: "latticini", brand: "Aia" },
};

export function lookupProduct(barcode: string): { name: string; category: string; brand?: string } | null {
  return PRODUCT_DATABASE[barcode] || null;
}

export function generateDemoBarcode(): string {
  const keys = Object.keys(PRODUCT_DATABASE);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return randomKey;
}