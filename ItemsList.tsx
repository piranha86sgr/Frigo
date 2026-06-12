import { Trash2, Check, Package } from "lucide-react";
import { FridgeItem } from "../types";
import { getDaysUntilExpiry, getExpiryStatus, formatDate, CATEGORIES } from "../utils/helpers";

interface ItemsListProps {
  items: FridgeItem[];
  onDelete: (id: string) => void;
  onToggleUsed: (id: string) => void;
}

export function ItemsList({ items, onDelete, onToggleUsed }: ItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Nessun alimento trovato</p>
        <p className="text-slate-400 text-sm mt-1">
          Aggiungi il primo alimento al tuo frigo!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const days = getDaysUntilExpiry(item.expiryDate);
        const status = getExpiryStatus(days);
        const category = CATEGORIES.find((c) => c.value === item.category);

        const statusConfig = {
          expired: {
            bg: "bg-red-50",
            border: "border-red-300",
            badge: "bg-red-500",
            text: "text-red-700",
            label: "Scaduto",
          },
          expiring: {
            bg: "bg-amber-50",
            border: "border-amber-300",
            badge: "bg-amber-500",
            text: "text-amber-700",
            label: "In scadenza",
          },
          ok: {
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            badge: "bg-emerald-500",
            text: "text-emerald-700",
            label: "Ok",
          },
        };

        const config = statusConfig[status];

        return (
          <div
            key={item.id}
            className={`${config.bg} ${config.border} border-2 rounded-2xl p-4 transition-all duration-300 hover:shadow-md ${
              item.used ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-2xl">{category?.icon || "📦"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-bold text-slate-800 ${item.used ? "line-through" : ""}`}>
                      {item.name}
                    </h3>
                    <span
                      className={`${config.badge} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}
                    >
                      {days < 0
                        ? `${Math.abs(days)}gg fa`
                        : days === 0
                        ? "Oggi"
                        : `${days}gg`}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">
                    {item.quantity} {item.unit} • Scade: {formatDate(item.expiryDate)}
                  </p>
                  {item.notes && (
                    <p className="text-slate-400 text-sm mt-1 italic">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleUsed(item.id)}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    item.used
                      ? "bg-emerald-500 text-white"
                      : "bg-white border-2 border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-500"
                  }`}
                  title={item.used ? "Segna come non usato" : "Segna come usato"}
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 bg-white border-2 border-slate-200 text-slate-400 rounded-xl hover:border-red-400 hover:text-red-500 transition-all duration-200"
                  title="Elimina"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}