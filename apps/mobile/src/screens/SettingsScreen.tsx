import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useChangePassword, useReceipts } from "@receipt-ocr/shared/hooks";
import { useAuthContext } from "../providers/AuthProvider";
import { useTheme } from "../providers/ThemeProvider";
import type { ThemeMode } from "../lib/theme";

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" },
  { value: "system", label: "System", icon: "phone-portrait-outline" },
];

export const SettingsScreen = () => {
  const { user, logout } = useAuthContext();
  const { mode, setMode, colors } = useTheme();
  const changePasswordMutation = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const totalsQuery = useReceipts({ page: 1, limit: 1 });
  const totalReceipts = totalsQuery.data?.pagination?.total ?? 0;

  const onChangePassword = async () => {
    setPasswordMessage(null);
    if (newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }
    try {
      const res = await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      setPasswordMessage(res.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setPasswordMessage(e instanceof Error ? e.message : "Password update failed.");
    }
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.accentSecondary }]}>Settings</Text>
        <Text style={[styles.title, { color: colors.text }]}>Your account</Text>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>Name</Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>{user?.name || "Receipt Radar user"}</Text>
          <View style={[styles.divider, { borderColor: colors.borderLight }]} />
          <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>Email</Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>{user?.email || "Signed in"}</Text>
        </View>

        <View style={[styles.darkCard, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.darkCardLabel, { color: colors.textTertiary }]}>Current plan</Text>
          <Text style={[styles.darkCardValue, { color: colors.textOnSurface }]}>Free</Text>
          <View style={[styles.divider, { borderColor: "rgba(255,255,255,0.1)" }]} />
          <Text style={[styles.darkCardLabel, { color: colors.textTertiary }]}>Receipt library</Text>
          <Text style={[styles.darkCardValue, { color: colors.textOnSurface }]}>
            {totalsQuery.isLoading ? "..." : totalReceipts} receipts
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.themeOption,
                  { borderColor: colors.border },
                  mode === opt.value && { borderColor: colors.accent, backgroundColor: colors.accent + "18" }
                ]}
                onPress={() => setMode(opt.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: mode === opt.value }}
                accessibilityLabel={`${opt.label} theme`}
              >
                <Ionicons
                  name={opt.icon}
                  size={20}
                  color={mode === opt.value ? colors.accent : colors.textTertiary}
                />
                <Text style={[
                  styles.themeLabel,
                  { color: mode === opt.value ? colors.accent : colors.textSecondary }
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Change password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.inputText }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry={!showCurrent}
            />
            <Pressable onPress={() => setShowCurrent(!showCurrent)} hitSlop={8}>
              <Text style={[styles.showHide, { color: colors.textTertiary }]}>{showCurrent ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.inputText }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password (min 8 chars)"
              placeholderTextColor={colors.placeholder}
              secureTextEntry={!showNew}
            />
            <Pressable onPress={() => setShowNew(!showNew)} hitSlop={8}>
              <Text style={[styles.showHide, { color: colors.textTertiary }]}>{showNew ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>
          {passwordMessage && <Text style={[styles.message, { color: colors.accentSecondary }]}>{passwordMessage}</Text>}
          <Pressable
            style={[styles.button, { backgroundColor: colors.surfaceAlt }, changePasswordMutation.isPending && { opacity: 0.7 }]}
            onPress={onChangePassword}
            disabled={changePasswordMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Update password"
          >
            <Text style={[styles.buttonText, { color: colors.textOnSurface }]}>
              {changePasswordMutation.isPending ? "Saving..." : "Update password"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.danger }]}
          onPress={() => {
            Alert.alert("Log out", "Are you sure you want to log out?", [
              { text: "Cancel", style: "cancel" },
              { text: "Log out", style: "destructive", onPress: () => logout() }
            ]);
          }}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Text style={[styles.logoutText, { color: colors.danger }]}>Log out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 2,
    fontWeight: "700",
    fontSize: 12
  },
  title: { fontSize: 28, fontWeight: "800" },
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 8
  },
  darkCard: {
    borderRadius: 20,
    padding: 20,
    gap: 8
  },
  cardLabel: { fontSize: 13, fontWeight: "600" },
  cardValue: { fontSize: 17, fontWeight: "700" },
  darkCardLabel: { fontSize: 13, fontWeight: "600" },
  darkCardValue: { fontSize: 22, fontWeight: "800" },
  divider: { borderBottomWidth: 1, marginVertical: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  themeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4
  },
  themeOption: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 8
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: "600"
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  input: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15
  },
  showHide: { fontSize: 13, fontWeight: "600" },
  message: { fontSize: 13 },
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4
  },
  buttonText: { fontWeight: "700", fontSize: 15 },
  logoutButton: {
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1
  },
  logoutText: { fontWeight: "700", fontSize: 15 }
});
