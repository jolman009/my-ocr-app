import { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import * as Haptics from "expo-haptics";
import { useReceipts } from "@receipt-ocr/shared/hooks";
import { colors } from "../lib/theme";
import { downloadAndShareExport } from "../lib/export";

export const ExportsScreen = () => {
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Exports</Text>
        <Text style={styles.title}>Share your receipt data</Text>
        <Text style={styles.subtitle}>
          Export your receipts as CSV or Excel files. Share them with your bookkeeper, import into a spreadsheet, or save for tax season.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{receiptsQuery.isLoading ? "..." : totalReceipts}</Text>
            <Text style={styles.statLabel}>Total receipts</Text>
          </View>
        </View>

        <View style={styles.exportSection}>
          <Text style={styles.sectionTitle}>Export format</Text>

          <Pressable
            style={[styles.exportCard, isExporting === "csv" && { opacity: 0.7 }]}
            onPress={() => void handleExport("csv")}
            disabled={!!isExporting}
            accessibilityRole="button"
            accessibilityLabel="Export as CSV"
          >
            <View>
              <Text style={styles.exportCardTitle}>CSV</Text>
              <Text style={styles.exportCardDesc}>Comma-separated values. Works with any spreadsheet app.</Text>
            </View>
            <Text style={styles.exportCardAction}>
              {isExporting === "csv" ? "Exporting..." : "Share"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.exportCard, isExporting === "xlsx" && { opacity: 0.7 }]}
            onPress={() => void handleExport("xlsx")}
            disabled={!!isExporting}
            accessibilityRole="button"
            accessibilityLabel="Export as Excel"
          >
            <View>
              <Text style={styles.exportCardTitle}>Excel (XLSX)</Text>
              <Text style={styles.exportCardDesc}>Full workbook with receipts and line items on separate sheets.</Text>
            </View>
            <Text style={styles.exportCardAction}>
              {isExporting === "xlsx" ? "Exporting..." : "Share"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Export templates</Text>
          <Text style={styles.tipBody}>
            Column selection, header renaming, and date/currency formatting are available in the web app at my-ocr-app-nu.vercel.app. Template support for mobile is coming soon.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.mist },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 2,
    color: colors.tide,
    fontWeight: "700",
    fontSize: 12
  },
  title: { color: colors.ink, fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#475569", fontSize: 15, lineHeight: 22 },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: colors.ink,
    borderRadius: 20,
    padding: 20,
    alignItems: "center"
  },
  statValue: { color: colors.white, fontSize: 32, fontWeight: "800" },
  statLabel: { color: "#94a3b8", fontSize: 13, fontWeight: "600", marginTop: 4 },
  exportSection: { gap: 12 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "700" },
  exportCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  exportCardTitle: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  exportCardDesc: { color: "#64748b", fontSize: 13, marginTop: 4, maxWidth: 220 },
  exportCardAction: { color: colors.ember, fontWeight: "700", fontSize: 14 },
  tipCard: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 20,
    padding: 20
  },
  tipTitle: { color: "#92400e", fontWeight: "700", fontSize: 14 },
  tipBody: { color: "#b45309", fontSize: 13, lineHeight: 20, marginTop: 6 }
});
