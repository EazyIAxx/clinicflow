import { Logo } from "@/components/shared/logo";

export function MarketingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Logo />
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} ClinicFlow. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
