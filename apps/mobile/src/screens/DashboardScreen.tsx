import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import * as Haptics from "expo-haptics";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useReceipts } from "@receipt-ocr/shared/hooks";
import { ReceiptListItem } from "../components/ReceiptListItem";
import { colors } from "../lib/theme";
import type { RootStackParamList } from "../types/navigation";
import { downloadAndShareExport } from "../lib/export";
import { useAuthContext } from "../providers/AuthProvider";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export const DashboardScreen = ({ navigation }: Props) => {
  const { logout } = useAuthContext();
  const [merchant, setMerchant] = useState("");
  const [status, setStatus] = useState<"" | "processed" | "needs_review" | "failed">("");
  const filters = useMemo(
    () => ({
      merchant: merchant || undefined,
      status: status || undefined
    }),
    [merchant, status]
  );
  const receiptsQuery = useReceipts(filters);

  const [isExporting, setIsExporting] = useState<"csv" | "xlsx" | null>(null);

  const handleExport = async (format: "csv" | "xlsx") => {
    if (isExporting) return;
    setIsExporting(format);
    try {
      await Haptics.selectionAsync();
      await downloadAndShareExport(format, filters);
    } catch (e) {
      Alert.alert("Export Error", e instanceof Error ? e.message : "Failed to generate export");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={receiptsQuery.data?.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={receiptsQuery.isRefetching} onRefresh={() => void receiptsQuery.refetch()} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.eyebrow}>Mobile OCR</Text>
              <Pressable onPress={() => logout()} hitSlop={8}>
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>
            </View>
            <Text style={styles.title}>Receipt ledger on the move</Text>
            <Text style={styles.subtitle}>
              Capture, review, and export receipts from Android using the same backend contract as the web app.
            </Text>
            <TextInput
              value={merchant}
              onChangeText={setMerchant}
              placeholder="Search merchant"
              style={styles.input}
              placeholderTextColor="#94a3b8"
            />
            <View style={styles.filterRow} accessibilityRole="radiogroup">
              {["", "processed", "needs_review", "failed"].map((value) => (
                <Pressable
                  key={value || "all"}
                  style={[styles.filterChip, status === value && styles.filterChipActive]}
                  onPress={() => setStatus(value as typeof status)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: status === value }}
                  accessibilityLabel={`Filter by ${value ? value.replace("_", " ") : "All"}`}
                  hitSlop={8}
                >
                  <Text style={[styles.filterText, status === value && styles.filterTextActive]}>
                    {value ? value.replace("_", " ") : "All"}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.exportRow}>
              <Pressable 
                style={[styles.exportButtonPrimary, isExporting && { opacity: 0.5 }]} 
                onPress={() => void handleExport("csv")}
                disabled={!!isExporting}
              >
                <Text style={styles.exportTextPrimary}>
                  {isExporting === "csv" ? "Exporting..." : "Share CSV"}
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.exportButtonSecondary, isExporting && { opacity: 0.5 }]} 
                onPress={() => void handleExport("xlsx")}
                disabled={!!isExporting}
              >
                <Text style={styles.exportTextSecondary}>
                  {isExporting === "xlsx" ? "Exporting..." : "Share XLSX"}
                </Text>
              </Pressable>
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={({ item }) => (
          <ReceiptListItem receipt={item} onPress={() => navigation.navigate("ReceiptDetail", { receiptId: item.id })} />
        )}
        ListEmptyComponent={
          receiptsQuery.isLoading ? (
            <ActivityIndicator color={colors.ember} size="large" />
          ) : receiptsQuery.isError ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Could not load ledger</Text>
              <Text style={styles.emptyBody}>Check your connection and try again.</Text>
              <Pressable
                style={[styles.exportButtonPrimary, { marginTop: 12, paddingHorizontal: 24 }]}
                onPress={() => void receiptsQuery.refetch()}
              >
                <Text style={styles.exportTextPrimary}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No receipts yet</Text>
              <Text style={styles.emptyBody}>Capture one to populate the mobile ledger.</Text>
            </View>
          )
        }
      />
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("Camera")}
        accessibilityRole="button"
        accessibilityLabel="Scan new receipt"
        hitSlop={12}
      >
        <Text style={styles.fabText}>Scan</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.mist
  },
  content: {
    padding: 20,
    paddingBottom: 120
  },
  header: {
    gap: 14,
    marginBottom: 18
  },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 2,
    color: colors.tide,
    fontWeight: "700",
    fontSize: 12
  },
  logoutText: {
    color: colors.ember,
    fontWeight: "600",
    fontSize: 14
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "800"
  },
  subtitle: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 22
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.ink
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.white
  },
  filterChipActive: {
    backgroundColor: colors.ink
  },
  filterText: {
    color: colors.ink,
    fontWeight: "600"
  },
  filterTextActive: {
    color: colors.white
  },
  exportRow: {
    flexDirection: "row",
    gap: 12
  },
  exportButtonPrimary: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.ink,
    paddingVertical: 14,
    alignItems: "center"
  },
  exportButtonSecondary: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.ember,
    paddingVertical: 14,
    alignItems: "center"
  },
  exportTextPrimary: {
    color: colors.white,
    fontWeight: "700"
  },
  exportTextSecondary: {
    color: colors.white,
    fontWeight: "700"
  },
  emptyState: {
    borderRadius: 24,
    backgroundColor: colors.white,
    padding: 28,
    alignItems: "center",
    gap: 8
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "700"
  },
  emptyBody: {
    color: "#64748b",
    fontSize: 14
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 28,
    borderRadius: 999,
    backgroundColor: colors.ember,
    paddingHorizontal: 22,
    paddingVertical: 18,
    elevation: 4
  },
  fabText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 16
  }
});
