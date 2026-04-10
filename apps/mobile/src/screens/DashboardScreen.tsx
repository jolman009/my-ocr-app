import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useReceipts } from "@receipt-ocr/shared/hooks";
import { RECEIPT_CATEGORIES } from "@receipt-ocr/shared/types";
import { ReceiptListItem } from "../components/ReceiptListItem";
import { useTheme } from "../providers/ThemeProvider";
import type { RootStackParamList, TabParamList } from "../types/navigation";
import { useIsRestoring, useMutationState } from "@tanstack/react-query";
import { useNetInfo } from "@react-native-community/netinfo";
import { useAuthContext } from "../providers/AuthProvider";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

export const DashboardScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();
  const { user } = useAuthContext();
  const netInfo = useNetInfo();
  const isHydrating = useIsRestoring();
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
        category: null,
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
  const [category, setCategory] = useState<string>("");
  const filters = useMemo(
    () => ({
      merchant: merchant || undefined,
      status: status || undefined,
      category: category || undefined
    }),
    [merchant, status, category]
  );
  const receiptsQuery = useReceipts(filters);

  const displayData = useMemo(() => {
    const serverData = receiptsQuery.data?.data ?? [];
    return [...inFlightReceipts, ...serverData];
  }, [inFlightReceipts, receiptsQuery.data?.data]);

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={receiptsQuery.isRefetching} onRefresh={() => void receiptsQuery.refetch()} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.eyebrow, { color: colors.accentSecondary }]}>
              {user?.name ? `Welcome, ${user.name}` : user?.email ? `Welcome, ${user.email}` : "Receipt Radar"}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>Your receipts</Text>

            {isOffline && (
              <View style={[styles.offlineBanner, { backgroundColor: colors.tipBg, borderColor: colors.tipBorder }]}>
                <Text style={[styles.offlineText, { color: colors.tipText }]}>
                  {pendingMutations.length > 0
                    ? `Offline: ${pendingMutations.length} upload(s) queued`
                    : "You are offline. Showing cached ledger."}
                </Text>
              </View>
            )}

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Filter, review, and track your scanned receipts.
            </Text>
            <TextInput
              value={merchant}
              onChangeText={setMerchant}
              placeholder="Search merchant"
              style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.inputText }]}
              placeholderTextColor={colors.placeholder}
            />
            <View style={styles.filterRow} accessibilityRole="radiogroup">
              {["", "processed", "needs_review", "failed"].map((value) => (
                <Pressable
                  key={value || "all"}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface },
                    status === value && { backgroundColor: colors.surfaceAlt }
                  ]}
                  onPress={() => setStatus(value as typeof status)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: status === value }}
                  accessibilityLabel={`Filter by ${value ? value.replace("_", " ") : "All"}`}
                  hitSlop={8}
                >
                  <Text style={[
                    styles.filterText,
                    { color: colors.text },
                    status === value && { color: colors.textOnSurface }
                  ]}>
                    {value ? value.replace("_", " ") : "All"}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.filterRow} accessibilityRole="radiogroup" accessibilityLabel="Filter by category">
              <Pressable
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.surface },
                  category === "" && { backgroundColor: colors.surfaceAlt }
                ]}
                onPress={() => setCategory("")}
                accessibilityRole="radio"
                accessibilityState={{ checked: category === "" }}
                accessibilityLabel="All categories"
                hitSlop={8}
              >
                <Text style={[
                  styles.filterText,
                  { color: colors.text },
                  category === "" && { color: colors.textOnSurface }
                ]}>
                  All categories
                </Text>
              </Pressable>
              {RECEIPT_CATEGORIES.map((value) => (
                <Pressable
                  key={value}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface },
                    category === value && { backgroundColor: colors.surfaceAlt }
                  ]}
                  onPress={() => setCategory(value)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: category === value }}
                  accessibilityLabel={`Filter by ${value}`}
                  hitSlop={8}
                >
                  <Text style={[
                    styles.filterText,
                    { color: colors.text },
                    category === value && { color: colors.textOnSurface }
                  ]}>
                    {value}
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
            <View style={{ gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.surface }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ gap: 6 }}>
                      <View style={[styles.skeletonLine, { backgroundColor: colors.skeleton }]} />
                      <View style={[styles.skeletonLine, { width: 100, backgroundColor: colors.skeleton }]} />
                    </View>
                    <View style={[styles.skeletonLine, { width: 70, height: 24, borderRadius: 12, backgroundColor: colors.skeleton }]} />
                  </View>
                  <View style={[styles.skeletonLine, { width: 180, marginTop: 8, backgroundColor: colors.skeleton }]} />
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                    <View style={[styles.skeletonLine, { width: 60, backgroundColor: colors.skeleton }]} />
                    <View style={[styles.skeletonLine, { width: 50, backgroundColor: colors.skeleton }]} />
                  </View>
                </View>
              ))}
            </View>
          ) : receiptsQuery.isError ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Could not load ledger</Text>
              <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>Check your connection and try again.</Text>
              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.surfaceAlt, marginTop: 12 }]}
                onPress={() => void receiptsQuery.refetch()}
              >
                <Text style={[styles.actionButtonText, { color: colors.textOnSurface }]}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyIcon, { color: colors.accent }]}>+</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No receipts yet</Text>
              <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>Tap below to scan your first receipt and start tracking expenses.</Text>
              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.surfaceAlt, marginTop: 16 }]}
                onPress={() => navigation.navigate("Scan")}
                accessibilityRole="button"
                accessibilityLabel="Scan your first receipt"
              >
                <Text style={[styles.actionButtonText, { color: colors.textOnSurface }]}>Scan a Receipt</Text>
              </Pressable>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
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
    fontWeight: "700",
    fontSize: 12
  },
  title: {
    fontSize: 30,
    fontWeight: "800"
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  filterText: {
    fontWeight: "600"
  },
  actionButton: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center"
  },
  actionButtonText: {
    fontWeight: "700"
  },
  emptyState: {
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 8
  },
  emptyIcon: {
    fontSize: 40,
    fontWeight: "800",
    marginBottom: 4
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  emptyBody: {
    fontSize: 14
  },
  skeletonCard: {
    borderRadius: 20,
    padding: 18,
    gap: 4
  },
  skeletonLine: {
    height: 14,
    width: 140,
    borderRadius: 8,
    opacity: 0.6
  },
  offlineBanner: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginTop: -4
  },
  offlineText: {
    fontWeight: "600",
    fontSize: 14
  }
});
