"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search...", className = "" }: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);

  // Update parent when debounced value changes
  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  // Sync from parent if value changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-[#94a3b8]" />
      </div>
      <input
        type="text"
        className="block w-full rounded-xl border border-[#e2e8f0] bg-white py-2.5 pl-10 pr-10 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#bfdbfe] focus:outline-none focus:ring-4 focus:ring-[#eff6ff] transition-all shadow-sm"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      {localValue && (
        <button
          type="button"
          onClick={() => setLocalValue("")}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#94a3b8] hover:text-[#0f172a]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
