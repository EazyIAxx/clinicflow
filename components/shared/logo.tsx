import Image from "next/image";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex h-7 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-sm ring-1 ring-black/5">
        <Image
          src="/logo-mark.png"
          alt="ClinicFlow"
          width={866}
          height={577}
          className="h-full w-full object-contain"
        />
      </span>
      <span className="font-heading text-base font-semibold tracking-tight">ClinicFlow</span>
    </div>
  );
}
