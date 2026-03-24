import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useReceipts } from "@receipt-ocr/shared/hooks";
import { ReceiptListItem } from "../components/ReceiptListItem";
import { colors } from "../lib/theme";
import type { RootStackParamList, TabParamList } from "../types/navigation";
import { useIsRestoring, useMutationState } from "@tanstack/react-query";
import { useNetInfo } from "@react-native-community/netinfo";
import { useAuthContext } from "../providers/AuthProvider";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

export const DashboardScreen = ({ navigation }: Props) => {
  const { user } = useAuthContext();
  const netInfo = useNetInfo();
  const isHydrating = useIsRestoring();
  // Extract pending uploads from the paused background mutations queue
  const pendingMutations = useMutationState({ filters: { status: "pending", mutationKey: ["uploadReceipt"] } });
  
  const inFlightReceipts = useMemo(() => {
    return pendingMutations.map((mutation: any, index: number) => {
      const input = mutation?.variables as any;
      return {
        id: `pending-${index}`,
        userId: "local",
        imageUrl: input?.uri ?? "",
        merchantName: "Pending Scan (Offline)",
        receiptDate: null,
        address: null,
        subtotal: null,
        tax: null,
        tip: null,
        total: null,
        currency: null,
        status: "needs_review" as any,
        confidence: {},
        items: [],
        rawText: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
  }, [pendingMutations]);

  const isOffline = netInfo.isConnected === false;

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

  // Merge the standard server cache with local-only pending creations
  const displayData = useMemo(() => {
    const serverData = receiptsQuery.data?.data ?? [];
    return [...inFlightReceipts, ...serverData];
  }, [inFlightReceipts, receiptsQuery.data?.data]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={receiptsQuery.isRefetching} onRefresh={() => void receiptsQuery.refetch()} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>
              {user?.name ? `Welcome, ${user.name}` : user?.email ? `Welcome, ${user.email}` : "Receipt Radar"}
            </Text>
            <Text style={styles.title}>Your receipts</Text>
            
            {isOffline && (
              <View style={styles.offlineBanner}>
                <Text style={styles.offlineText}>
                  {pendingMutations.length > 0
                    ? `Offline: ${pendingMutations.length} upload(s) queued`
                    : "You are offline. Showing cached ledger."}
                </Text>
              </View>
            )}

            <Text style={styles.subtitle}>
              Filter, review, and track your scanned receipts.
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
                style={[styles.actionButton, { marginTop: 12 }]}
                onPress={() => void receiptsQuery.refetch()}
              >
                <Text style={styles.actionButtonText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>+</Text>
              <Text style={styles.emptyTitle}>No receipts yet</Text>
              <Text style={styles.emptyBody}>Tap below to scan your first receipt and start tracking expenses.</Text>
              <Pressable
                style={[styles.actionButton, { marginTop: 16 }]}
                onPress={() => navigation.navigate("Scan")}
                accessibilityRole="button"
                accessibilityLabel="Scan your first receipt"
              >
                <Text style={styles.actionButtonText}>Scan a Receipt</Text>
              </Pressable>
            </View>
          )
        }
      />
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
  actionButton: {
    borderRadius: 18,
    backgroundColor: colors.ink,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center"
  },
  actionButtonText: {
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
  emptyIcon: {
    fontSize: 40,
    fontWeight: "800",
    color: colors.ember,
    marginBottom: 4,
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
  offlineBanner: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginTop: -4
  },
  offlineText: {
    color: "#b45309",
    fontWeight: "600",
    fontSize: 14
  }
});
