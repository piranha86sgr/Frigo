import { Refrigerator } from "lucide-react";

export function Header() {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
            <Refrigerator className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fridge Manager</h1>
            <p className="text-emerald-100 text-sm">
              Gestisci gli alimenti e riduci gli sprechi
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}