import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  listShipmentDocuments,
  type ShipmentDocumentRecord
} from "../api/forwardingClient";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "ReviewQueue">;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

// Why is this document in the queue? Surface the most useful triage hint so an
// operator knows what to fix before opening it.
const reviewReason = (doc: ShipmentDocumentRecord): string => {
  if (doc.duplicateOfId) return "Possible duplicate";
  if (!doc.trackingNumber) return "No tracking number";
  if (doc.confidence !== null && doc.confidence < 0.5) return "Low extraction confidence";
  if (!doc.matchedCustomerId) return "No customer match";
  return "Needs review";
};

export const ReviewQueueScreen = ({ navigation }: Props) => {
  const query = useQuery({
    queryKey: ["forwarding", "documents", { status: "needs_review" }],
    queryFn: () => listShipmentDocuments({ status: "needs_review", limit: 50 })
  });

  const documents = query.data?.data ?? [];
  const total = query.data?.pagination.total ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>REVIEW QUEUE</Text>
        <Text style={styles.title}>Needs review</Text>
      </View>

      {query.isError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {query.error instanceof Error ? query.error.message : "Failed to load queue"}
          </Text>
          <Pressable onPress={() => query.refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching && !query.isLoading}
            onRefresh={() => query.refetch()}
            tintColor="#f97316"
          />
        }
        ListHeaderComponent={
          query.isLoading ? null : (
            <Text style={styles.countText}>
              {total} {total === 1 ? "item" : "items"} awaiting review
            </Text>
          )
        }
        ListEmptyComponent={
          query.isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color="#f97316" />
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>All clear</Text>
              <Text style={styles.emptyMuted}>
                Nothing needs review right now. Scanned documents that can't be
                read confidently will show up here.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate("ReviewDocument", { id: item.id })}
          >
            <View style={styles.rowMain}>
              <Text style={styles.rowTracking} numberOfLines={1}>
                {item.trackingNumber ?? "No tracking number"}
              </Text>
              <Text style={styles.rowReason} numberOfLines={1}>
                {reviewReason(item)}
              </Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {item.carrier ?? "Unknown carrier"} · {formatDate(item.createdAt)}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8, gap: 6 },
  back: { color: "#94a3b8", fontSize: 14, fontWeight: "600", marginBottom: 4 },
  eyebrow: { color: "#f97316", fontSize: 12, letterSpacing: 5, fontWeight: "800" },
  title: { color: "#f8fafc", fontSize: 24, fontWeight: "800" },

  listContent: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8, gap: 10, flexGrow: 1 },
  countText: { color: "#94a3b8", fontSize: 12, fontWeight: "600", letterSpacing: 1, marginBottom: 4 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#334155"
  },
  rowMain: { flex: 1, gap: 4 },
  rowTracking: { color: "#f8fafc", fontSize: 16, fontWeight: "700" },
  rowReason: { color: "#f59e0b", fontSize: 13, fontWeight: "700" },
  rowMeta: { color: "#94a3b8", fontSize: 13 },
  chevron: { color: "#64748b", fontSize: 28, fontWeight: "300" },

  center: { paddingVertical: 48, alignItems: "center", gap: 8 },
  emptyTitle: { color: "#f8fafc", fontSize: 16, fontWeight: "700" },
  emptyMuted: { color: "#94a3b8", fontSize: 13, textAlign: "center", paddingHorizontal: 24, lineHeight: 19 },

  errorBox: {
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(248, 113, 113, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.3)",
    gap: 10
  },
  errorText: { color: "#f87171", fontSize: 13 },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#334155",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  retryText: { color: "#f8fafc", fontWeight: "700" }
});
