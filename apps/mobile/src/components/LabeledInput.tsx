import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../lib/theme";

interface LabeledInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric";
}

export const LabeledInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default"
}: LabeledInputProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      style={styles.input}
      placeholderTextColor="#94a3b8"
    />
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: 8
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "600"
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.ink
  }
});
