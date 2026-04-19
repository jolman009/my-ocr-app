import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "ScanResult">;

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

export const ScanResultScreen = ({ navigation, route }: Props) => {
  const { document: doc } = route.params;

  const done = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.popToTop();
  };

  const scanAnother = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.replace("Camera");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SCAN COMPLETE</Text>
          <Text style={styles.title}>
            {doc.trackingNumber ?? "No tracking number found"}
          </Text>
        </View>

        <View style={styles.card}>
          <Row label="Carrier" value={doc.carrier ?? "Unknown"} />
          <Row label="Status" value={doc.status.replace("_", " ")} />
          <Row
            label="Confidence"
            value={`${confidenceLabel(doc.confidence)}${doc.confidence !== null ? ` (${Math.round(doc.confidence * 100)}%)` : ""}`}
            valueColor={confidenceColor(doc.confidence)}
          />
          {doc.barcodeRaw ? (
            <Row label="Barcode raw" value={doc.barcodeRaw} />
          ) : null}
          {doc.barcodeFormat ? (
            <Row label="Barcode format" value={doc.barcodeFormat} />
          ) : null}
        </View>

        {doc.status === "needs_review" ? (
          <View style={styles.reviewBanner}>
            <Text style={styles.reviewText}>
              Marked for review — a human should verify this tracking number.
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable style={styles.scanAnotherButton} onPress={scanAnother}>
            <Text style={styles.scanAnotherText}>Scan another</Text>
          </Pressable>
          <Pressable style={styles.doneButton} onPress={done}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </View>
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
    <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1, padding: 24, gap: 20, justifyContent: "center" },
  header: { gap: 8 },
  eyebrow: {
    color: "#10b981",
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: "800"
  },
  title: { color: "#f8fafc", fontSize: 24, fontWeight: "800" },

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: "#334155"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  rowLabel: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  rowValue: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
    maxWidth: "60%",
    textAlign: "right"
  },

  reviewBanner: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)"
  },
  reviewText: { color: "#f59e0b", fontSize: 13, lineHeight: 18 },

  actions: { gap: 12 },
  scanAnotherButton: {
    backgroundColor: "#1e293b",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155"
  },
  scanAnotherText: { color: "#f8fafc", fontSize: 16, fontWeight: "700" },
  doneButton: {
    backgroundColor: "#f97316",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center"
  },
  doneButtonText: { color: "#0f172a", fontSize: 16, fontWeight: "800" }
});
