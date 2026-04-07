import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBadge } from "./StatusBadge";
import type { ReceiptRecord } from "@receipt-ocr/shared/types";
import { useTheme } from "../providers/ThemeProvider";

const formatMoney = (value: number | null) => (value === null ? "-" : `$${value.toFixed(2)}`);

interface ReceiptListItemProps {
  receipt: ReceiptRecord;
  onPress: () => void;
}

export const ReceiptListItem = ({ receipt, onPress }: ReceiptListItemProps) => {
  const { colors } = useTheme();

  return (
    <Pressable style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]} onPress={onPress}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{receipt.merchantName ?? "Untitled receipt"}</Text>
        <StatusBadge status={receipt.status} />
      </View>
      <Text style={[styles.meta, { color: colors.textSecondary }]}>{receipt.receiptDate ?? "No date"}</Text>
      <Text style={[styles.meta, { color: colors.textSecondary }]}>{receipt.address ?? "No address captured"}</Text>
      <View style={styles.footer}>
        <Text style={[styles.total, { color: colors.accent }]}>{formatMoney(receipt.total)}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{receipt.items.length} items</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    gap: 8,
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
    fontSize: 18,
    fontWeight: "700",
    flex: 1
  },
  meta: {
    fontSize: 14
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center"
  },
  total: {
    fontSize: 18,
    fontWeight: "700"
  }
});
