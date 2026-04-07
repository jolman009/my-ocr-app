import { StyleSheet, Text, View } from "react-native";
import type { ReceiptStatus } from "@receipt-ocr/shared/types";
import { useTheme } from "../providers/ThemeProvider";

export const StatusBadge = ({ status }: { status: ReceiptStatus }) => {
  const { colors } = useTheme();

  const statusStyles: Record<ReceiptStatus, { backgroundColor: string; color: string }> = {
    processed: { backgroundColor: colors.successBg, color: colors.successText },
    needs_review: { backgroundColor: colors.warningBg, color: colors.warningText },
    failed: { backgroundColor: colors.failedBg, color: colors.failedText }
  };

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
