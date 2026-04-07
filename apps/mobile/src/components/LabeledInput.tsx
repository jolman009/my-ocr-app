import { forwardRef } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "../providers/ThemeProvider";

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
}, ref) => {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.placeholder}
        style={[
          styles.input,
          { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.inputText },
          lowConfidence && { borderColor: colors.accent, borderWidth: 2 },
          style
        ]}
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: 8
  },
  label: {
    fontSize: 13,
    fontWeight: "600"
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15
  }
});
