import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { AIQuoteResponse } from "@/types/quote";

// Register a clean sans-serif (bundled with @react-pdf/renderer)
Font.register({
  family: "Helvetica",
  fonts: [],
});

const C = {
  blue: "#1d4ed8",
  lightBlue: "#eff6ff",
  gray900: "#111827",
  gray600: "#4b5563",
  gray400: "#9ca3af",
  gray100: "#f3f4f6",
  amber50: "#fffbeb",
  amber700: "#b45309",
  border: "#e5e7eb",
};

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: C.gray900, padding: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  companyName: { fontSize: 18, fontWeight: "bold", color: C.blue },
  companyMeta: { fontSize: 8, color: C.gray600, marginTop: 2 },
  quoteTitle: { fontSize: 22, fontWeight: "bold", color: C.gray900, textAlign: "right" },
  quoteMeta: { fontSize: 8, color: C.gray600, textAlign: "right", marginTop: 2 },

  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 8, fontWeight: "bold", color: C.gray600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },

  pricingBox: { backgroundColor: C.lightBlue, borderRadius: 6, padding: 14, marginBottom: 18 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  priceLabel: { fontSize: 8, color: C.blue },
  priceValue: { fontSize: 14, fontWeight: "bold", color: "#1e3a8a" },
  priceSubLabel: { fontSize: 8, color: C.gray600, marginTop: 8 },
  priceSubValue: { fontSize: 9, fontWeight: "bold", color: C.gray900 },

  table: { borderRadius: 4, overflow: "hidden", borderWidth: 1, borderColor: C.border },
  tableHead: { flexDirection: "row", backgroundColor: C.gray100, paddingVertical: 5, paddingHorizontal: 8 },
  tableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: C.border },
  colWide: { flex: 3 },
  colNarrow: { flex: 1, textAlign: "right" },
  thText: { fontSize: 7.5, fontWeight: "bold", color: C.gray600 },
  tdText: { fontSize: 8, color: C.gray900 },
  tdMuted: { fontSize: 7.5, color: C.gray600 },

  phaseCard: { borderWidth: 1, borderColor: C.border, borderRadius: 4, padding: 8, marginBottom: 6 },
  phaseHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  phaseName: { fontSize: 9, fontWeight: "bold" },
  phaseHours: { fontSize: 8, color: C.gray600 },
  taskItem: { fontSize: 8, color: C.gray600, marginBottom: 1.5 },

  noteBox: { backgroundColor: C.amber50, borderRadius: 4, padding: 8 },
  noteTitle: { fontSize: 7.5, fontWeight: "bold", color: C.amber700, textTransform: "uppercase", marginBottom: 4 },
  noteItem: { fontSize: 8, color: C.amber700, marginBottom: 1.5 },

  footer: { marginTop: 24, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10 },
  footerText: { fontSize: 7.5, color: C.gray400, textAlign: "center" },
});

const fmt = (n: number) =>
  new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(n);

const today = () =>
  new Date().toLocaleDateString("nb-NO", { day: "2-digit", month: "long", year: "numeric" });

interface Props {
  quote: AIQuoteResponse;
  quoteNumber: string;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  customerName?: string;
}

export function QuotePDF({
  quote,
  quoteNumber,
  companyName = "Ditt Snekker Firma",
  companyEmail,
  companyPhone,
  customerName,
}: Props) {
  const totalHoursMin = quote.phases.reduce((s, p) => s + p.hours_min, 0);
  const totalHoursMax = quote.phases.reduce((s, p) => s + p.hours_max, 0);
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + quote.validity_days);

  return (
    <Document title={`Tilbud ${quoteNumber}`} author={companyName}>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.companyName}>{companyName}</Text>
            {companyPhone && <Text style={s.companyMeta}>{companyPhone}</Text>}
            {companyEmail && <Text style={s.companyMeta}>{companyEmail}</Text>}
          </View>
          <View>
            <Text style={s.quoteTitle}>TILBUD</Text>
            <Text style={s.quoteMeta}>Nr: {quoteNumber}</Text>
            <Text style={s.quoteMeta}>Dato: {today()}</Text>
            <Text style={s.quoteMeta}>Gyldig til: {validUntil.toLocaleDateString("nb-NO")}</Text>
            {customerName && <Text style={s.quoteMeta}>Kunde: {customerName}</Text>}
          </View>
        </View>

        {/* Project summary */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Prosjekt</Text>
          <Text style={{ fontSize: 10, fontWeight: "bold" }}>{quote.project_summary}</Text>
          <Text style={{ fontSize: 8, color: C.gray600, marginTop: 3 }}>
            Estimert arbeidstid: {totalHoursMin}–{totalHoursMax} timer
          </Text>
        </View>

        {/* Pricing box */}
        <View style={s.pricingBox}>
          <View style={s.priceRow}>
            <View>
              <Text style={s.priceLabel}>TOTALSUM EKS. MVA</Text>
              <Text style={s.priceValue}>
                {fmt(quote.pricing.total_min_excl_mva)} – {fmt(quote.pricing.total_max_excl_mva)}
              </Text>
            </View>
            <View>
              <Text style={[s.priceLabel, { textAlign: "right" }]}>TOTALSUM INKL. MVA</Text>
              <Text style={[s.priceValue, { textAlign: "right" }]}>
                {fmt(quote.pricing.total_min_incl_mva)} – {fmt(quote.pricing.total_max_incl_mva)}
              </Text>
            </View>
          </View>
          <View style={[s.priceRow, { marginTop: 8 }]}>
            <View>
              <Text style={s.priceSubLabel}>Arbeid</Text>
              <Text style={s.priceSubValue}>
                {fmt(quote.pricing.labor_min_nok)} – {fmt(quote.pricing.labor_max_nok)}
              </Text>
            </View>
            <View>
              <Text style={[s.priceSubLabel, { textAlign: "right" }]}>Materialer</Text>
              <Text style={[s.priceSubValue, { textAlign: "right" }]}>
                {fmt(quote.pricing.materials_min_nok)} – {fmt(quote.pricing.materials_max_nok)}
              </Text>
            </View>
          </View>
        </View>

        {/* Materials table */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Materialer</Text>
          <View style={s.table}>
            <View style={s.tableHead}>
              <Text style={[s.thText, s.colWide]}>Vare</Text>
              <Text style={[s.thText, s.colNarrow]}>Ant.</Text>
              <Text style={[s.thText, s.colNarrow]}>Enhet</Text>
              <Text style={[s.thText, s.colNarrow]}>Enhetspris</Text>
              <Text style={[s.thText, s.colNarrow]}>Sum</Text>
            </View>
            {quote.materials.map((m, i) => (
              <View key={i} style={s.tableRow}>
                <View style={s.colWide}>
                  <Text style={s.tdText}>{m.item}</Text>
                  {m.note && <Text style={s.tdMuted}>{m.note}</Text>}
                </View>
                <Text style={[s.tdText, s.colNarrow]}>{m.quantity}</Text>
                <Text style={[s.tdMuted, s.colNarrow]}>{m.unit}</Text>
                <Text style={[s.tdText, s.colNarrow]}>{fmt(m.unit_price_nok)}</Text>
                <Text style={[s.tdText, s.colNarrow]}>{fmt(m.quantity * m.unit_price_nok)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Work phases */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Arbeidsfaser</Text>
          {quote.phases.map((phase, i) => (
            <View key={i} style={s.phaseCard}>
              <View style={s.phaseHeader}>
                <Text style={s.phaseName}>{phase.name}</Text>
                <Text style={s.phaseHours}>{phase.hours_min}–{phase.hours_max} timer</Text>
              </View>
              {phase.tasks.map((task, j) => (
                <Text key={j} style={s.taskItem}>– {task}</Text>
              ))}
            </View>
          ))}
        </View>

        {/* Assumptions */}
        {quote.assumptions.length > 0 && (
          <View style={[s.section, s.noteBox]}>
            <Text style={s.noteTitle}>Forutsetninger</Text>
            {quote.assumptions.map((a, i) => (
              <Text key={i} style={s.noteItem}>• {a}</Text>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            Prisene er veiledende og gjelder i {quote.validity_days} dager fra tilbudsdato. Alle priser i NOK.
          </Text>
        </View>

      </Page>
    </Document>
  );
}
