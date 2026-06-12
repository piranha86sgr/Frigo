import { AlertTriangle, Clock, CheckCircle, Package } from "lucide-react";

interface StatsCardsProps {
  stats: {
    total: number;
    expired: number;
    expiring: number;
    ok: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Totali",
      value: stats.total,
      icon: Package,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      label: "Scaduti",
      value: stats.expired,
      icon: AlertTriangle,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      borderColor: "border-red-200",
    },
    {
      label: "In scadenza",
      value: stats.expiring,
      icon: Clock,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      borderColor: "border-amber-200",
    },
    {
      label: "Ok",
      value: stats.ok,
      icon: CheckCircle,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bgColor} ${card.borderColor} border-2 rounded-2xl p-4 transition-all duration-300 hover:scale-105`}
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            <span className="text-sm font-medium text-slate-600">{card.label}</span>
          </div>
          <p className={`text-3xl font-bold ${card.iconColor}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}