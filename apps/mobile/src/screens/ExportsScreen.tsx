import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import * as Haptics from "expo-haptics";
import { useReceipts } from "@receipt-ocr/shared/hooks";
import { useTheme } from "../providers/ThemeProvider";
import { downloadAndShareExport } from "../lib/export";

export const ExportsScreen = () => {
  const { colors } = useTheme();
  const [isExporting, setIsExporting] = useState<"csv" | "xlsx" | null>(null);
  const receiptsQuery = useReceipts({});
  const totalReceipts = receiptsQuery.data?.pagination?.total ?? 0;

  const handleExport = async (format: "csv" | "xlsx") => {
    if (isExporting) return;
    setIsExporting(format);
    try {
      await Haptics.selectionAsync();
      await downloadAndShareExport(format, {});
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Export Error", e instanceof Error ? e.message : "Failed to generate export");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.accentSecondary }]}>Exports</Text>
        <Text style={[styles.title, { color: colors.text }]}>Share your receipt data</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Export your receipts as CSV or Excel files. Share them with your bookkeeper, import into a spreadsheet, or save for tax season.
        </Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.statValue, { color: colors.textOnSurface }]}>{receiptsQuery.isLoading ? "..." : totalReceipts}</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Total receipts</Text>
          </View>
        </View>

        <View style={styles.exportSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Export format</Text>

          <Pressable
            style={[styles.exportCard, { backgroundColor: colors.surface }, isExporting === "csv" && { opacity: 0.7 }]}
            onPress={() => void handleExport("csv")}
            disabled={!!isExporting}
            accessibilityRole="button"
            accessibilityLabel="Export as CSV"
          >
            <View>
              <Text style={[styles.exportCardTitle, { color: colors.text }]}>CSV</Text>
              <Text style={[styles.exportCardDesc, { color: colors.textSecondary }]}>Comma-separated values. Works with any spreadsheet app.</Text>
            </View>
            <Text style={[styles.exportCardAction, { color: colors.accent }]}>
              {isExporting === "csv" ? "Exporting..." : "Share"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.exportCard, { backgroundColor: colors.surface }, isExporting === "xlsx" && { opacity: 0.7 }]}
            onPress={() => void handleExport("xlsx")}
            disabled={!!isExporting}
            accessibilityRole="button"
            accessibilityLabel="Export as Excel"
          >
            <View>
              <Text style={[styles.exportCardTitle, { color: colors.text }]}>Excel (XLSX)</Text>
              <Text style={[styles.exportCardDesc, { color: colors.textSecondary }]}>Full workbook with receipts and line items on separate sheets.</Text>
            </View>
            <Text style={[styles.exportCardAction, { color: colors.accent }]}>
              {isExporting === "xlsx" ? "Exporting..." : "Share"}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.tipCard, { backgroundColor: colors.tipBg, borderColor: colors.tipBorder }]}>
          <Text style={[styles.tipTitle, { color: colors.tipTitle }]}>Export templates</Text>
          <Text style={[styles.tipBody, { color: colors.tipText }]}>
            Column selection, header renaming, and date/currency formatting are available in the web app at my-ocr-app-nu.vercel.app. Template support for mobile is coming soon.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 2,
    fontWeight: "700",
    fontSize: 12
  },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 15, lineHeight: 22 },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: "center"
  },
  statValue: { fontSize: 32, fontWeight: "800" },
  statLabel: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  exportSection: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  exportCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  exportCardTitle: { fontSize: 16, fontWeight: "700" },
  exportCardDesc: { fontSize: 13, marginTop: 4, maxWidth: 220 },
  exportCardAction: { fontWeight: "700", fontSize: 14 },
  tipCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20
  },
  tipTitle: { fontWeight: "700", fontSize: 14 },
  tipBody: { fontSize: 13, lineHeight: 20, marginTop: 6 }
});
