import Image from "next/image";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="ClinicFlow"
        width={866}
        height={577}
        unoptimized
        className="h-7 w-auto shrink-0 object-contain"
      />
      <span className="font-heading text-base font-semibold tracking-tight">ClinicFlow</span>
    </div>
  );
}
