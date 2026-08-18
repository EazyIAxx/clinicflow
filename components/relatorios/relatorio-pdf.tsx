import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { statusMeta, type AppointmentStatus } from "@/lib/agenda-status";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  subtitle: { fontSize: 10, color: "#64748b", marginBottom: 20 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  statCard: {
    width: "31%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 10,
  },
  statLabel: { fontSize: 8, color: "#64748b", marginBottom: 4 },
  statValue: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 8, marginBottom: 8 },
  table: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableRowLast: { borderBottomWidth: 0 },
  tableHeaderRow: { backgroundColor: "#f8fafc" },
  tableCell: { flex: 1 },
  tableCellRight: { flex: 1, textAlign: "right" },
  footer: { position: "absolute", bottom: 24, left: 32, right: 32, fontSize: 8, color: "#94a3b8" },
});

export function RelatorioPdfDocument({
  generatedAt,
  stats,
  statusBreakdown,
  categoryBreakdown,
}: {
  generatedAt: string;
  stats: {
    appointmentsThisMonth: number;
    confirmationRate: number;
    lowStockCount: number;
    expiringCount: number;
    documentsThisWeek: number;
    activePatients: number;
  };
  statusBreakdown: { status: AppointmentStatus; count: number }[];
  categoryBreakdown: { label: string; count: number }[];
}) {
  const statCards = [
    { label: "Consultas no mês", value: stats.appointmentsThisMonth },
    { label: "Taxa de confirmação", value: `${stats.confirmationRate}%` },
    { label: "Abaixo do mínimo", value: stats.lowStockCount },
    { label: "Vencendo ou vencidos", value: stats.expiringCount },
    { label: "Documentos essa semana", value: stats.documentsThisWeek },
    { label: "Pacientes ativos", value: stats.activePatients },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Relatório de métricas — ClinicFlow</Text>
        <Text style={styles.subtitle}>Gerado em {generatedAt}</Text>

        <View style={styles.statsGrid}>
          {statCards.map((card) => (
            <View key={card.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{card.label}</Text>
              <Text style={styles.statValue}>{card.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Consultas por status</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={styles.tableCell}>Status</Text>
            <Text style={styles.tableCellRight}>Quantidade</Text>
          </View>
          {statusBreakdown.map((row, index) => (
            <View
              key={row.status}
              style={[
                styles.tableRow,
                index === statusBreakdown.length - 1 ? styles.tableRowLast : {},
              ]}
            >
              <Text style={styles.tableCell}>{statusMeta[row.status].label}</Text>
              <Text style={styles.tableCellRight}>{row.count}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Itens de estoque por categoria</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={styles.tableCell}>Categoria</Text>
            <Text style={styles.tableCellRight}>Quantidade</Text>
          </View>
          {categoryBreakdown.map((row, index) => (
            <View
              key={row.label}
              style={[
                styles.tableRow,
                index === categoryBreakdown.length - 1 ? styles.tableRowLast : {},
              ]}
            >
              <Text style={styles.tableCell}>{row.label}</Text>
              <Text style={styles.tableCellRight}>{row.count}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>ClinicFlow — relatório gerado automaticamente.</Text>
      </Page>
    </Document>
  );
}
