import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useLogin, useRegister } from "@receipt-ocr/shared/hooks";
import { LabeledInput } from "../components/LabeledInput";
import { useTheme } from "../providers/ThemeProvider";
import { useAuthContext } from "../providers/AuthProvider";

export const AuthScreen = () => {
  const { colors } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthContext();
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: ""
    }
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const isPending = loginMutation.isPending || registerMutation.isPending;

  const onSubmit = async (data: any) => {
    try {
      if (isLogin) {
        const response = await loginMutation.mutateAsync({ email: data.email, password: data.password });
        await login(response.token, response.user);
      } else {
        const response = await registerMutation.mutateAsync({ email: data.email, password: data.password, name: data.name });
        await login(response.token, response.user);
      }
    } catch (e) {
      Alert.alert("Authentication failed", e instanceof Error ? e.message : "An error occurred.");
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome to Receipt Radar</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isLogin ? "Log in to view your ledger." : "Create an account to get started."}
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <Controller
                control={control}
                name="name"
                rules={{ required: !isLogin }}
                render={({ field }) => (
                  <LabeledInput
                    label="Name"
                    value={field.value}
                    onChangeText={field.onChange}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                )}
              />
            )}

            <Controller
              control={control}
              name="email"
              rules={{ required: true, pattern: /^\S+@\S+\.\S+$/ }}
              render={({ field }) => (
                <LabeledInput
                  label="Email"
                  value={field.value}
                  onChangeText={field.onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{ required: true, minLength: 8 }}
              render={({ field }) => (
                <View>
                  <LabeledInput
                    label="Password"
                    value={field.value}
                    onChangeText={field.onChange}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    hitSlop={8}
                  >
                    <Text style={[styles.eyeText, { color: colors.textTertiary }]}>{showPassword ? "Hide" : "Show"}</Text>
                  </Pressable>
                </View>
              )}
            />

            <Pressable
              style={[styles.submitButton, { backgroundColor: colors.accent }, isPending && { opacity: 0.7 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            >
              <Text style={[styles.submitButtonText, { color: colors.textOnAccent }]}>
                {isPending ? "Loading..." : isLogin ? "Log in" : "Sign up"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.toggleButton}
              onPress={() => {
                setIsLogin(!isLogin);
                reset();
              }}
            >
              <Text style={[styles.toggleButtonText, { color: colors.text }]}>
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Log in"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.privacyLink}
              onPress={() => void Linking.openURL("https://my-ocr-app-nu.vercel.app/privacy")}
              accessibilityRole="link"
              accessibilityLabel="View privacy policy"
            >
              <Text style={[styles.privacyLinkText, { color: colors.textTertiary }]}>Privacy Policy</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    padding: 24
  },
  content: {
    gap: 32
  },
  header: {
    gap: 12
  },
  title: {
    fontSize: 34,
    fontWeight: "800"
  },
  subtitle: {
    fontSize: 16
  },
  form: {
    gap: 16
  },
  submitButton: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "800"
  },
  toggleButton: {
    paddingVertical: 16,
    alignItems: "center"
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: "600"
  },
  eyeButton: {
    position: "absolute" as const,
    right: 16,
    top: 38,
  },
  eyeText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  privacyLink: {
    alignItems: "center",
    paddingVertical: 4
  },
  privacyLinkText: {
    fontSize: 13,
    textDecorationLine: "underline" as const
  }
});
