import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBadge } from "./StatusBadge";
import type { ReceiptRecord } from "@receipt-ocr/shared/types";
import { colors } from "../lib/theme";

const formatMoney = (value: number | null) => (value === null ? "-" : `$${value.toFixed(2)}`);

interface ReceiptListItemProps {
  receipt: ReceiptRecord;
  onPress: () => void;
}

export const ReceiptListItem = ({ receipt, onPress }: ReceiptListItemProps) => (
  <Pressable style={styles.card} onPress={onPress}>
    <View style={styles.header}>
      <Text style={styles.title}>{receipt.merchantName ?? "Untitled receipt"}</Text>
      <StatusBadge status={receipt.status} />
    </View>
    <Text style={styles.meta}>{receipt.receiptDate ?? "No date"}</Text>
    <Text style={styles.meta}>{receipt.address ?? "No address captured"}</Text>
    <View style={styles.footer}>
      <Text style={styles.total}>{formatMoney(receipt.total)}</Text>
      <Text style={styles.meta}>{receipt.items.length} items</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: colors.white,
    padding: 18,
    gap: 8,
    shadowColor: colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "700",
    flex: 1
  },
  meta: {
    color: "#64748b",
    fontSize: 14
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center"
  },
  total: {
    color: colors.ember,
    fontSize: 18,
    fontWeight: "700"
  }
});
