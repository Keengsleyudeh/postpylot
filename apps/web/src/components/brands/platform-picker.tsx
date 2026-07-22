"use client";

import { PLATFORM_OPTIONS } from "@/lib/brands/schemas";
import { cn } from "@/lib/utils";

export function PlatformPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(platform: string) {
    if (value.includes(platform)) {
      onChange(value.filter((item) => item !== platform));
    } else {
      onChange([...value, platform]);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {PLATFORM_OPTIONS.map((option) => {
        const checked = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={() => toggle(option.value)}
            className={cn(
              "flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              checked
                ? "border-primary bg-primary/10 text-foreground"
                : "border-input bg-input/30 text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
