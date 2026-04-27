import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getShipmentDocument } from "../api/forwardingClient";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "DocumentDetail">;

const confidenceLabel = (c: number | null) => {
  if (c === null) return "Unknown";
  if (c >= 0.9) return "High";
  if (c >= 0.5) return "Medium";
  return "Low";
};

const confidenceColor = (c: number | null) => {
  if (c === null) return "#94a3b8";
  if (c >= 0.9) return "#10b981";
  if (c >= 0.5) return "#f59e0b";
  return "#f87171";
};

export const DocumentDetailScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;

  const query = useQuery({
    queryKey: ["forwarding", "documents", id],
    queryFn: () => getShipmentDocument(id)
  });

  const doc = query.data?.document;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>DOCUMENT</Text>
      </View>

      {query.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#f97316" size="large" />
        </View>
      ) : query.isError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {query.error instanceof Error ? query.error.message : "Failed to load document"}
          </Text>
          <Pressable onPress={() => query.refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : doc ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title} numberOfLines={2}>
            {doc.trackingNumber ?? "No tracking number"}
          </Text>

          {doc.imageUrl ? (
            <Image
              source={{ uri: doc.imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : null}

          <View style={styles.card}>
            <Row label="Carrier" value={doc.carrier ?? "Unknown"} />
            <Row label="Status" value={doc.status.replace("_", " ")} />
            <Row
              label="Confidence"
              value={`${confidenceLabel(doc.confidence)}${
                doc.confidence !== null ? ` (${Math.round(doc.confidence * 100)}%)` : ""
              }`}
              valueColor={confidenceColor(doc.confidence)}
            />
            {doc.barcodeFormat ? <Row label="Barcode format" value={doc.barcodeFormat} /> : null}
            {doc.barcodeRaw ? <Row label="Barcode raw" value={doc.barcodeRaw} /> : null}
            <Row label="Captured" value={new Date(doc.createdAt).toLocaleString()} />
          </View>

          {doc.ocrRawText ? (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>OCR TEXT</Text>
              <Text style={styles.ocrText}>{doc.ocrRawText}</Text>
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
};

const Row = ({
  label,
  value,
  valueColor
}: {
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text
      style={[styles.rowValue, valueColor ? { color: valueColor } : null]}
      numberOfLines={2}
    >
      {value}
    </Text>
  </View>
);

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

  scrollContent: { padding: 24, gap: 16, paddingBottom: 48 },
  title: { color: "#f8fafc", fontSize: 22, fontWeight: "800" },

  image: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155"
  },

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "#334155"
  },
  cardLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  rowLabel: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  rowValue: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
    maxWidth: "60%",
    textAlign: "right"
  },
  ocrText: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "monospace"
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorBox: {
    marginHorizontal: 24,
    marginTop: 24,
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
