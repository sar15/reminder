import { cn } from "@/lib/utils";

type Variant = "default" | "red" | "amber" | "green" | "blue" | "violet" | "outline";

const variants: Record<Variant, string> = {
  default: "bg-[#F5F5F4] text-[#57534E]",
  red:     "bg-[#FEF2F2] text-[#991B1B]",
  amber:   "bg-[#FFFBEB] text-[#92400E]",
  green:   "bg-[#ECFDF5] text-[#065F46]",
  blue:    "bg-[#EFF6FF] text-[#1E40AF]",
  violet:  "bg-[#EDE9FE] text-[#5B21B6]",
  outline: "bg-white border border-[#E8E6E3] text-[#57534E]",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium leading-none",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
