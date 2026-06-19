import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  getShipmentDocument,
  updateShipmentDocument,
  type ShipmentDocumentPatch,
  type ShipmentDocumentRecord
} from "../api/forwardingClient";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "ReviewDocument">;

type DocType = NonNullable<ShipmentDocumentRecord["documentType"]>;
const DOC_TYPES: DocType[] = ["label", "invoice", "packing_slip", "customs", "unknown"];

const confidencePct = (c: number | null) => (c === null ? "—" : `${Math.round(c * 100)}%`);

export const ReviewDocumentScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["forwarding", "documents", id],
    queryFn: () => getShipmentDocument(id)
  });
  const doc = query.data?.document;

  // Editable form state — seeded from the document once it loads.
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [mailboxNumber, setMailboxNumber] = useState("");
  const [documentType, setDocumentType] = useState<DocType | null>(null);

  useEffect(() => {
    if (!doc) return;
    setTrackingNumber(doc.trackingNumber ?? "");
    setCarrier(doc.carrier ?? "");
    setRecipientName(doc.recipientName ?? "");
    setMailboxNumber(doc.mailboxNumber ?? "");
    setDocumentType(doc.documentType ?? null);
  }, [doc]);

  const mutation = useMutation({
    mutationFn: (patch: ShipmentDocumentPatch) => updateShipmentDocument(id, patch),
    onSuccess: () => {
      // Refresh both the queue and this document's detail caches.
      queryClient.invalidateQueries({ queryKey: ["forwarding", "documents"] });
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert(
        "Couldn't save",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  });

  // The operator's edits to the extracted fields. Empty text clears the field
  // (sent as null); the PATCH endpoint rejects empty strings.
  const fieldPatch = (): ShipmentDocumentPatch => ({
    trackingNumber: trackingNumber.trim() || null,
    carrier: carrier.trim() || null,
    recipientName: recipientName.trim() || null,
    mailboxNumber: mailboxNumber.trim() || null,
    documentType
  });

  const onAccept = () => mutation.mutate({ ...fieldPatch(), status: "processed" });

  const onReject = () =>
    Alert.alert("Reject document?", "It will be marked failed and leave the review queue.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reject", style: "destructive", onPress: () => mutation.mutate({ status: "failed" }) }
    ]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>REVIEW</Text>
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
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {doc.imageUrl ? (
              <Image
                source={{ uri: doc.imageUrl }}
                style={styles.image}
                contentFit="contain"
                transition={150}
              />
            ) : null}

            <View style={styles.card}>
              <Field label="Tracking number" value={trackingNumber} onChangeText={setTrackingNumber} autoCapitalize="characters" />
              <Field label="Carrier" value={carrier} onChangeText={setCarrier} />
              <Field label="Recipient" value={recipientName} onChangeText={setRecipientName} />
              <Field label="Mailbox / suite" value={mailboxNumber} onChangeText={setMailboxNumber} autoCapitalize="characters" />

              <Text style={styles.fieldLabel}>Document type</Text>
              <View style={styles.pillRow}>
                {DOC_TYPES.map((type) => {
                  const selected = documentType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => setDocumentType(type)}
                      style={[styles.pill, selected && styles.pillSelected]}
                    >
                      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                        {type.replace("_", " ")}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.card}>
              <ReadRow label="Extraction confidence" value={confidencePct(doc.confidence)} />
              <ReadRow
                label="Customer match"
                value={
                  doc.matchedCustomerId
                    ? `Matched (${confidencePct(doc.customerMatchConfidence)})`
                    : "No match"
                }
              />
              {doc.barcodeRaw ? <ReadRow label="Barcode" value={doc.barcodeRaw} /> : null}
            </View>

            {doc.ocrRawText ? (
              <View style={styles.card}>
                <Text style={styles.fieldLabel}>OCR TEXT</Text>
                <Text style={styles.ocrText}>{doc.ocrRawText}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              style={[styles.rejectButton, mutation.isPending && styles.disabled]}
              onPress={onReject}
              disabled={mutation.isPending}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </Pressable>
            <Pressable
              style={[styles.acceptButton, mutation.isPending && styles.disabled]}
              onPress={onAccept}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text style={styles.acceptText}>Save & accept</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      ) : null}
    </SafeAreaView>
  );
};

const Field = ({
  label,
  value,
  onChangeText,
  autoCapitalize
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  autoCapitalize?: "none" | "characters";
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
      placeholderTextColor="#64748b"
      autoCapitalize={autoCapitalize ?? "none"}
      autoCorrect={false}
    />
  </View>
);

const ReadRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.readRow}>
    <Text style={styles.readLabel}>{label}</Text>
    <Text style={styles.readValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  flex: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8, gap: 6 },
  back: { color: "#94a3b8", fontSize: 14, fontWeight: "600", marginBottom: 4 },
  eyebrow: { color: "#f97316", fontSize: 12, letterSpacing: 5, fontWeight: "800" },

  scrollContent: { padding: 24, gap: 16, paddingBottom: 24 },
  image: {
    width: "100%",
    height: 240,
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
  fieldGroup: { gap: 6 },
  fieldLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    color: "#f8fafc",
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 12
  },

  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#0f172a"
  },
  pillSelected: { borderColor: "#f97316", backgroundColor: "rgba(249, 115, 22, 0.15)" },
  pillText: { color: "#94a3b8", fontSize: 13, fontWeight: "700" },
  pillTextSelected: { color: "#f97316" },

  readRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  readLabel: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  readValue: { color: "#f8fafc", fontSize: 14, fontWeight: "700", maxWidth: "60%", textAlign: "right" },
  ocrText: { color: "#cbd5e1", fontSize: 13, lineHeight: 18, fontFamily: "monospace" },

  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#1e293b"
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f87171"
  },
  rejectText: { color: "#f87171", fontSize: 16, fontWeight: "800" },
  acceptButton: {
    flex: 2,
    backgroundColor: "#f97316",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center"
  },
  acceptText: { color: "#0f172a", fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.6 },

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
