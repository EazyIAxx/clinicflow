import { Stethoscope } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
        <Stethoscope className="size-4" />
      </span>
      <span className="font-heading text-base font-semibold tracking-tight">ClinicFlow</span>
    </div>
  );
}
