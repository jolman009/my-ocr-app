import { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useChangePassword, useReceipts } from "@receipt-ocr/shared/hooks";
import { useAuthContext } from "../providers/AuthProvider";
import { colors } from "../lib/theme";

export const SettingsScreen = () => {
  const { user, logout } = useAuthContext();
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Settings</Text>
        <Text style={styles.title}>Your account</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Name</Text>
          <Text style={styles.cardValue}>{user?.name || "Receipt Radar user"}</Text>
          <View style={styles.divider} />
          <Text style={styles.cardLabel}>Email</Text>
          <Text style={styles.cardValue}>{user?.email || "Signed in"}</Text>
        </View>

        <View style={styles.darkCard}>
          <Text style={styles.darkCardLabel}>Current plan</Text>
          <Text style={styles.darkCardValue}>Free</Text>
          <View style={[styles.divider, { borderColor: "rgba(255,255,255,0.1)" }]} />
          <Text style={styles.darkCardLabel}>Receipt library</Text>
          <Text style={styles.darkCardValue}>
            {totalsQuery.isLoading ? "..." : totalReceipts} receipts
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Change password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showCurrent}
            />
            <Pressable onPress={() => setShowCurrent(!showCurrent)} hitSlop={8}>
              <Text style={styles.showHide}>{showCurrent ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password (min 8 chars)"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showNew}
            />
            <Pressable onPress={() => setShowNew(!showNew)} hitSlop={8}>
              <Text style={styles.showHide}>{showNew ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>
          {passwordMessage && <Text style={styles.message}>{passwordMessage}</Text>}
          <Pressable
            style={[styles.button, changePasswordMutation.isPending && { opacity: 0.7 }]}
            onPress={onChangePassword}
            disabled={changePasswordMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Update password"
          >
            <Text style={styles.buttonText}>
              {changePasswordMutation.isPending ? "Saving..." : "Update password"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert("Log out", "Are you sure you want to log out?", [
              { text: "Cancel", style: "cancel" },
              { text: "Log out", style: "destructive", onPress: () => logout() }
            ]);
          }}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.mist },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 2,
    color: colors.tide,
    fontWeight: "700",
    fontSize: 12
  },
  title: { color: colors.ink, fontSize: 28, fontWeight: "800" },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 8
  },
  darkCard: {
    backgroundColor: colors.ink,
    borderRadius: 20,
    padding: 20,
    gap: 8
  },
  cardLabel: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  cardValue: { color: colors.ink, fontSize: 17, fontWeight: "700" },
  darkCardLabel: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  darkCardValue: { color: colors.white, fontSize: 22, fontWeight: "800" },
  divider: { borderBottomWidth: 1, borderColor: "#e2e8f0", marginVertical: 4 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "700", marginBottom: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  input: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: colors.mist,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink
  },
  showHide: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  message: { color: colors.tide, fontSize: 13 },
  button: {
    backgroundColor: colors.ink,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4
  },
  buttonText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  logoutButton: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.danger
  },
  logoutText: { color: colors.danger, fontWeight: "700", fontSize: 15 }
});
