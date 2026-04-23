import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  padding = "p-5",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <div className={cn(
      "bg-white rounded-xl border border-[#E8E6E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
      padding,
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-[13px] font-semibold text-[#1C1917]">{title}</h3>
        {subtitle && <p className="text-[11px] text-[#A8A29E] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
