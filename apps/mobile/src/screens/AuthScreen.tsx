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
import { colors } from "../lib/theme";
import { useAuthContext } from "../providers/AuthProvider";

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
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
        await login(response.token);
      } else {
        const response = await registerMutation.mutateAsync({ email: data.email, password: data.password, name: data.name });
        await login(response.token);
      }
    } catch (e) {
      Alert.alert("Authentication failed", e instanceof Error ? e.message : "An error occurred.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Receipt Radar</Text>
            <Text style={styles.subtitle}>
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
                <LabeledInput
                  label="Password"
                  value={field.value}
                  onChangeText={field.onChange}
                  secureTextEntry
                  returnKeyType="done"
                />
              )}
            />

            <Pressable
              style={[styles.submitButton, isPending && { opacity: 0.7 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            >
              <Text style={styles.submitButtonText}>
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
              <Text style={styles.toggleButtonText}>
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Log in"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.privacyLink}
              onPress={() => void Linking.openURL("https://receipt-radar-api.onrender.com/privacy")}
              accessibilityRole="link"
              accessibilityLabel="View privacy policy"
            >
              <Text style={styles.privacyLinkText}>Privacy Policy</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.mist
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
    color: colors.ink,
    fontSize: 34,
    fontWeight: "800"
  },
  subtitle: {
    color: "#475569",
    fontSize: 16
  },
  form: {
    gap: 16
  },
  submitButton: {
    backgroundColor: colors.ember,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800"
  },
  toggleButton: {
    paddingVertical: 16,
    alignItems: "center"
  },
  toggleButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "600"
  },
  privacyLink: {
    alignItems: "center",
    paddingVertical: 4
  },
  privacyLinkText: {
    color: "#94a3b8",
    fontSize: 13,
    textDecorationLine: "underline" as const
  }
});
