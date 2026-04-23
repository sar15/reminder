import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:   "bg-[#6D28D9] text-white hover:bg-[#5B21B6] shadow-[0_1px_2px_rgba(109,40,217,0.3)]",
  secondary: "bg-[#F5F5F4] text-[#1C1917] hover:bg-[#E8E6E3]",
  ghost:     "bg-transparent text-[#57534E] hover:bg-[#F5F5F4]",
  danger:    "bg-[#FEF2F2] text-[#991B1B] hover:bg-[#FEE2E2]",
  outline:   "bg-white border border-[#E8E6E3] text-[#1C1917] hover:bg-[#F5F5F4]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[11px] gap-1.5",
  md: "px-4 py-2 text-[12px] gap-2",
  lg: "px-5 py-2.5 text-[13px] gap-2",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </button>
  );
}
