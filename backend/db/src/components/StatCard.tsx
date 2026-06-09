import clsx from "clsx";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

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
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div
        className={clsx(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          color
        )}
      >
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p
          className={clsx(
            "text-xs font-medium mt-0.5",
            positive ? "text-green-600" : "text-red-500"
          )}
        >
          {positive ? "▲" : "▼"} {change} vs last month
        </p>
      </div>
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
