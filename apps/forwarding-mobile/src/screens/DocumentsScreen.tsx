import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
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

type Props = NativeStackScreenProps<RootStackParamList, "Documents">;

const SEARCH_DEBOUNCE_MS = 300;

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

const statusColor = (status: ShipmentDocumentRecord["status"]) => {
  if (status === "processed") return "#10b981";
  if (status === "needs_review") return "#f59e0b";
  return "#f87171";
};

export const DocumentsScreen = ({ navigation }: Props) => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query = useQuery({
    queryKey: ["forwarding", "documents", { q: debouncedQuery }],
    queryFn: () => listShipmentDocuments({ q: debouncedQuery || undefined, limit: 50 })
  });

  const documents = query.data?.data ?? [];
  const total = query.data?.pagination.total ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>DOCUMENTS</Text>
        <Text style={styles.title}>Recent intake</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Search by tracking number"
          placeholderTextColor="#64748b"
          style={styles.searchInput}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchInput ? (
          <Pressable onPress={() => setSearchInput("")} hitSlop={12}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      {query.isError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {query.error instanceof Error ? query.error.message : "Failed to load documents"}
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
              {total} {total === 1 ? "document" : "documents"}
              {debouncedQuery ? ` matching "${debouncedQuery}"` : ""}
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
              <Text style={styles.emptyTitle}>
                {debouncedQuery ? "No matches" : "No documents yet"}
              </Text>
              <Text style={styles.emptyMuted}>
                {debouncedQuery
                  ? "Try a shorter or different tracking number."
                  : "Scan a shipping label to capture your first document."}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate("DocumentDetail", { id: item.id })}
          >
            <View style={styles.rowMain}>
              <Text style={styles.rowTracking} numberOfLines={1}>
                {item.trackingNumber ?? "No tracking number"}
              </Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {item.carrier ?? "Unknown carrier"} · {formatDate(item.createdAt)}
              </Text>
            </View>
            <View style={[styles.statusPill, { borderColor: statusColor(item.status) }]}>
              <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                {item.status.replace("_", " ")}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 6
  },
  back: { color: "#94a3b8", fontSize: 14, fontWeight: "600", marginBottom: 4 },
  eyebrow: {
    color: "#f97316",
    fontSize: 12,
    letterSpacing: 5,
    fontWeight: "800"
  },
  title: { color: "#f8fafc", fontSize: 24, fontWeight: "800" },

  searchBox: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#334155"
  },
  searchInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 15,
    paddingVertical: 12
  },
  clear: { color: "#94a3b8", fontSize: 13, fontWeight: "700" },

  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 10,
    flexGrow: 1
  },
  countText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 4
  },

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
  rowMeta: { color: "#94a3b8", fontSize: 13 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1
  },
  statusText: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },

  center: {
    paddingVertical: 48,
    alignItems: "center",
    gap: 8
  },
  emptyTitle: { color: "#f8fafc", fontSize: 16, fontWeight: "700" },
  emptyMuted: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 24
  },

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
