import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("glass-card rounded-xl", className)} {...props}>
      {children}
    </div>
  );
}
