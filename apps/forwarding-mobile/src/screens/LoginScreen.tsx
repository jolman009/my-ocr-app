import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login as loginApi } from "@receipt-ocr/shared/api";
import { useAuthContext } from "@receipt-radar/mobile/providers/AuthProvider";

export const LoginScreen = () => {
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const response = await loginApi({ email: email.trim(), password });
      await login(response.token, response.user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not sign in. Try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>MANIFEST 956</Text>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>
            Use your Receipt Radar account. Both apps share the same login.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#475569"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            style={styles.input}
            editable={!submitting}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#475569"
            secureTextEntry
            textContentType="password"
            style={styles.input}
            editable={!submitting}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.button,
              !canSubmit && styles.buttonDisabled,
              pressed && canSubmit && styles.buttonPressed
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f172a"
  },
  container: {
    flex: 1,
    padding: 28,
    justifyContent: "center",
    gap: 32
  },
  header: {
    gap: 8
  },
  eyebrow: {
    color: "#f97316",
    fontSize: 12,
    letterSpacing: 5,
    fontWeight: "800"
  },
  title: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "800"
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20
  },
  form: {
    gap: 10
  },
  label: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 8
  },
  input: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#334155"
  },
  error: {
    color: "#f87171",
    fontSize: 14,
    marginTop: 4
  },
  button: {
    backgroundColor: "#f97316",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16
  },
  buttonPressed: {
    backgroundColor: "#ea580c"
  },
  buttonDisabled: {
    backgroundColor: "#475569"
  },
  buttonText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800"
  }
});
