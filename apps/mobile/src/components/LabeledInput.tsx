import { forwardRef } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors } from "../lib/theme";

interface LabeledInputProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  lowConfidence?: boolean;
}

export const LabeledInput = forwardRef<TextInput, LabeledInputProps>(({
  label,
  value,
  onChangeText,
  style,
  lowConfidence,
  ...props
}, ref) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      ref={ref}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#94a3b8"
      style={[
        styles.input,
        lowConfidence && styles.inputWarning,
        style
      ]}
      {...props}
    />
  </View>
));

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
  },
  inputWarning: {
    borderColor: colors.ember,
    borderWidth: 2
  }
});
