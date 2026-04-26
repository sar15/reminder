import { cn } from "@/lib/utils";

type BadgeTone = "blue" | "green" | "amber" | "rose" | "slate";
type BadgeVariant = "solid" | "subtle" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, tone = "slate", variant = "subtle", className, dot = false }: BadgeProps) {
  const tones = {
    blue: {
      subtle: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
      solid: "bg-[#1d4ed8] text-white border-[#1d4ed8]",
      outline: "bg-transparent text-[#1d4ed8] border-[#bfdbfe]",
      dot: "bg-[#2563eb]"
    },
    green: {
      subtle: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",
      solid: "bg-[#166534] text-white border-[#166534]",
      outline: "bg-transparent text-[#166534] border-[#bbf7d0]",
      dot: "bg-[#16a34a]"
    },
    amber: {
      subtle: "bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]",
      solid: "bg-[#ea580c] text-white border-[#ea580c]",
      outline: "bg-transparent text-[#9a3412] border-[#fed7aa]",
      dot: "bg-[#f59e0b]"
    },
    rose: {
      subtle: "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]",
      solid: "bg-[#e11d48] text-white border-[#e11d48]",
      outline: "bg-transparent text-[#be123c] border-[#fecdd3]",
      dot: "bg-[#e11d48]"
    },
    slate: {
      subtle: "bg-[#f8fafc] text-[#475569] border-[#e2e8f0]",
      solid: "bg-[#475569] text-white border-[#475569]",
      outline: "bg-transparent text-[#475569] border-[#e2e8f0]",
      dot: "bg-[#64748b]"
    }
  };

  const style = tones[tone][variant];
  const dotColor = tones[tone].dot;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors",
        style,
        className
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}
