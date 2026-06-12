import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { AddItemForm } from "./components/AddItemForm";
import { ItemsList } from "./components/ItemsList";
import { StatsCards } from "./components/StatsCards";
import { FilterBar } from "./components/FilterBar";
import { FridgeItem } from "./types";
import { getDaysUntilExpiry, getExpiryStatus } from "./utils/helpers";

export default function App() {
  const [items, setItems] = useState<FridgeItem[]>(() => {
    const saved = localStorage.getItem("fridgeItems");
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "expired" | "expiring" | "ok">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [scannedData, setScannedData] = useState<{
    barcode?: string;
    productName?: string;
    category?: string;
    expiryDate?: string;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem("fridgeItems", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<FridgeItem, "id" | "addedDate">) => {
    const newItem: FridgeItem = {
      ...item,
      id: Date.now().toString(),
      addedDate: new Date().toISOString(),
    };
    setItems([newItem, ...items]);
    setShowForm(false);
    setScannedData(null);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const toggleUsed = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, used: !item.used } : item
      )
    );
  };

  const handleScanComplete = (data: {
    barcode?: string;
    productName?: string;
    category?: string;
    expiryDate?: string;
  }) => {
    setScannedData(data);
    setShowForm(true);
  };

  const filteredItems = items.filter((item) => {
    const status = getExpiryStatus(getDaysUntilExpiry(item.expiryDate));
    const matchesStatus =
      filter === "all" ||
      (filter === "expired" && status === "expired") ||
      (filter === "expiring" && status === "expiring") ||
      (filter === "ok" && status === "ok");
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const stats = {
    total: items.length,
    expired: items.filter(
      (i) => getExpiryStatus(getDaysUntilExpiry(i.expiryDate)) === "expired"
    ).length,
    expiring: items.filter(
      (i) => getExpiryStatus(getDaysUntilExpiry(i.expiryDate)) === "expiring"
    ).length,
    ok: items.filter(
      (i) => getExpiryStatus(getDaysUntilExpiry(i.expiryDate)) === "ok"
    ).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <StatsCards stats={stats} />
        
        <FilterBar
          filter={filter}
          setFilter={setFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />

        {showForm ? (
          <AddItemForm 
            onAdd={addItem} 
            onClose={() => {
              setShowForm(false);
              setScannedData(null);
            }}
            scannedData={scannedData}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => {
                setScannedData(null);
                setShowForm(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-xl"
            >
              <span>Aggiungi Manualmente</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:shadow-xl md:col-span-2"
            >
              <span>Scansiona Prodotto</span>
            </button>
          </div>
        )}

        <ItemsList
          items={filteredItems}
          onDelete={deleteItem}
          onToggleUsed={toggleUsed}
        />
      </main>
    </div>
  );
}