import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/40 flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-12">
      <Logo />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
