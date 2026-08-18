import { AgendaSummaryCard } from "@/components/dashboard-home/agenda-summary-card";
import { ModulePendenciesCard } from "@/components/dashboard-home/module-pendencies-card";
import { QuickActions } from "@/components/dashboard-home/quick-actions";
import { RecentActivityCard } from "@/components/dashboard-home/recent-activity-card";
import type { Appointment, Professional } from "@/lib/agenda-types";
import type { Interaction, Lead } from "@/lib/crm-types";
import { getModulePendencies, getRecentActivity } from "@/lib/dashboard-metrics";
import type { StockItem, StockMovement } from "@/lib/estoque-types";
import type { Budget } from "@/lib/orcamentos-types";
import type { Patient } from "@/lib/patient-types";

export function DashboardHomeView({
  appointments,
  professionals,
  patients,
  budgets,
  stockItems,
  movements,
  leads,
  interactions,
  referenceDate,
}: {
  appointments: Appointment[];
  professionals: Professional[];
  patients: Patient[];
  budgets: Budget[];
  stockItems: StockItem[];
  movements: StockMovement[];
  leads: Lead[];
  interactions: Interaction[];
  referenceDate: Date;
}) {
  const patientsById = Object.fromEntries(patients.map((patient) => [patient.id, patient]));
  const stockItemsById = Object.fromEntries(stockItems.map((item) => [item.id, item]));

  const pendencies = getModulePendencies({
    budgets,
    stockItems,
    leads,
    interactions,
    referenceDate,
  });
  const activity = getRecentActivity(
    { patients, budgets, leads, movements, patientsById, stockItemsById },
    8,
  );

  return (
    <div className="flex flex-col gap-4">
      <QuickActions />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AgendaSummaryCard
          appointments={appointments}
          professionals={professionals}
          referenceDate={referenceDate}
        />
        <ModulePendenciesCard pendencies={pendencies} />
      </div>

      <RecentActivityCard activity={activity} referenceDate={referenceDate} />
    </div>
  );
}
