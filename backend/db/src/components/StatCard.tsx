import clsx from "clsx";
import Link from "next/link";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: LucideIcon;
  color: string;
  href?: string;
}

export default function StatCard({
  title,
  value,
  change,
  positive,
  icon: Icon,
  color,
  href,
}: StatCardProps) {
  const inner = (
    <div className="group relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(16,185,129,0.03) 100%)" }} />
      <div className="flex items-start justify-between mb-4">
        <div className={clsx("w-11 h-11 rounded-xl flex items-center justify-center shadow-sm", color)}>
          <Icon size={20} className="text-white" />
        </div>
        <span className={clsx(
          "inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg",
          positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
        )}>
          {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-sm text-gray-500 mt-1 font-medium">{title}</p>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
