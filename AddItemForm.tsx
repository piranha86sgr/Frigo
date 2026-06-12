import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Camera, X, Barcode, Calendar, Package, Loader2 } from "lucide-react";
import { FridgeItem, ScanResult } from "../types";
import { CATEGORIES as CAT, UNITS as UNIT } from "../utils/helpers";
import { ProductScanner } from "./ProductScanner";

interface AddItemFormProps {
  onAdd: (item: Omit<FridgeItem, "id" | "addedDate">) => void;
  onClose: () => void;
  scannedData: ScanResult | null;
}

export function AddItemForm({ onAdd, onClose, scannedData }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("altro");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("pezzi");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [barcode, setBarcode] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  useEffect(() => {
    if (scannedData) {
      if (scannedData.productName) {
        setName(scannedData.productName);
        setIsAutoFilled(true);
      }
      if (scannedData.category) {
        setCategory(scannedData.category);
      }
      if (scannedData.expiryDate) {
        setExpiryDate(scannedData.expiryDate);
      }
      if (scannedData.barcode) {
        setBarcode(scannedData.barcode);
      }
    }
  }, [scannedData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !expiryDate) return;

    onAdd({
      name,
      category,
      quantity,
      unit,
      expiryDate,
      notes: notes || undefined,
      barcode: barcode || undefined,
    });

    resetForm();
  };

  const resetForm = () => {
    setName("");
    setCategory("altro");
    setQuantity(1);
    setUnit("pezzi");
    setExpiryDate("");
    setNotes("");
    setBarcode("");
    setIsAutoFilled(false);
  };

  const handleScanComplete = (data: ScanResult) => {
    if (data.productName) {
      setName(data.productName);
      setIsAutoFilled(true);
    }
    if (data.category) {
      setCategory(data.category);
    }
    if (data.expiryDate) {
      setExpiryDate(data.expiryDate);
    }
    if (data.barcode) {
      setBarcode(data.barcode);
    }
    setShowScanner(false);
  };

  return (
    <div className="space-y-4">
      {showScanner && (
        <ProductScanner
          onScanComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Nuovo Alimento</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Pulsante Scanner */}
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-200"
        >
          <Barcode className="w-5 h-5" />
          <span>Scansiona Codice a Barre + Data</span>
          <Calendar className="w-5 h-5" />
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-slate-400">oppure inserisci manualmente</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="name" className="text-slate-600">
              Nome *
            </Label>
            <div className="relative mt-1">
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setIsAutoFilled(false);
                }}
                placeholder="es. Latte parzialmente scremato"
                required
                className={isAutoFilled ? "border-emerald-300 bg-emerald-50" : ""}
              />
              {isAutoFilled && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Package className="w-4 h-4 text-emerald-500" />
                </div>
              )}
            </div>
            {isAutoFilled && (
              <p className="text-xs text-emerald-600 mt-1">Riconosciuto automaticamente</p>
            )}
          </div>

          <div>
            <Label htmlFor="category" className="text-slate-600">
              Categoria
            </Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {CAT.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="quantity" className="text-slate-600">
              Quantità
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-24"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-emerald-500"
              >
                {UNIT.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="expiry" className="text-slate-600">
              Data di scadenza *
            </Label>
            <Input
              id="expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="barcode" className="text-slate-600">
              Codice a barre (opzionale)
            </Label>
            <Input
              id="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="es. 8000500111113"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="text-slate-600">
            Note (opzionali)
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="es. Scaffale in alto, aperto il..."
            className="mt-1"
            rows={2}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl"
          >
            Aggiungi al Frigo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl"
          >
            Annulla
          </Button>
        </div>
      </form>
    </div>
  );
}