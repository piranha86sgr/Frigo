import { Button } from "./ui/button";
import { CATEGORIES } from "../utils/helpers";

interface FilterBarProps {
  filter: "all" | "expired" | "expiring" | "ok";
  setFilter: (filter: "all" | "expired" | "expiring" | "ok") => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
}

export function FilterBar({
  filter,
  setFilter,
  categoryFilter,
  setCategoryFilter,
}: FilterBarProps) {
  const statusFilters = [
    { value: "all", label: "Tutti" },
    { value: "expired", label: "Scaduti" },
    { value: "expiring", label: "In scadenza" },
    { value: "ok", label: "Ok" },
  ] as const;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-600 mb-2 block">
          Stato scadenza
        </label>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((sf) => (
            <button
              key={sf.value}
              onClick={() => setFilter(sf.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === sf.value
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600 mb-2 block">
          Categoria
        </label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full bg-slate-100 border-0 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
        >
          <option value="all">Tutte le categorie</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}