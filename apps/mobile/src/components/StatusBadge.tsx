import { StyleSheet, Text, View } from "react-native";
import type { ReceiptStatus } from "@receipt-ocr/shared/types";
import { colors } from "../lib/theme";

const statusStyles: Record<ReceiptStatus, { backgroundColor: string; color: string }> = {
  processed: { backgroundColor: "#dcfce7", color: colors.tide },
  needs_review: { backgroundColor: "#fef3c7", color: "#92400e" },
  failed: { backgroundColor: "#fee2e2", color: colors.danger }
};

export const StatusBadge = ({ status }: { status: ReceiptStatus }) => {
  const style = statusStyles[status];

  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.text, { color: style.color }]}>{status.replace("_", " ")}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize"
  }
});
