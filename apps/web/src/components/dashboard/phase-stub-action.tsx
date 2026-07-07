import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PhaseStubAction({
  label,
  phase,
}: {
  label: string;
  phase: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Button type="button" disabled>
        {label}
      </Button>
      <Badge variant="outline">Available in {phase}</Badge>
    </div>
  );
}
