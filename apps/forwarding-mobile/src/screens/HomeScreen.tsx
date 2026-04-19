import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuthContext } from "@receipt-radar/mobile/providers/AuthProvider";
import { useOrgContext } from "../providers/OrgProvider";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export const HomeScreen = ({ navigation }: Props) => {
  const { user, logout } = useAuthContext();
  const { organization, isBootstrapping, error, retry } = useOrgContext();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>MANIFEST 956</Text>
          <Text style={styles.hello}>
            {user?.name ? `Hi, ${user.name}` : user?.email ? `Hi, ${user.email}` : "Welcome"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>WORKSPACE</Text>
          {isBootstrapping ? (
            <View style={styles.row}>
              <ActivityIndicator color="#f97316" />
              <Text style={styles.cardMuted}>Setting up your workspace...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={retry} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : organization ? (
            <>
              <Text style={styles.cardTitle}>{organization.name}</Text>
              <Text style={styles.cardMuted}>Slug: {organization.slug}</Text>
            </>
          ) : (
            <Text style={styles.cardMuted}>No workspace yet.</Text>
          )}
        </View>

        <Pressable
          style={styles.scanCard}
          onPress={() => navigation.navigate("Camera")}
        >
          <Text style={styles.cardLabel}>INTAKE</Text>
          <Text style={styles.cardTitle}>Scan a package</Text>
          <Text style={styles.cardMuted}>
            Point the camera at a shipping label to capture it.
          </Text>
          <View style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Open scanner</Text>
          </View>
        </Pressable>

        <View style={styles.footer}>
          <Pressable onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>
        </View>
      </View>
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
    padding: 24,
    gap: 20
  },
  header: {
    gap: 6,
    marginTop: 12
  },
  eyebrow: {
    color: "#f97316",
    fontSize: 12,
    letterSpacing: 5,
    fontWeight: "800"
  },
  hello: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800"
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "#334155"
  },
  cardLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2
  },
  cardTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700"
  },
  cardMuted: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  errorBox: {
    gap: 10
  },
  errorText: {
    color: "#f87171",
    fontSize: 14
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#334155",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  retryText: {
    color: "#f8fafc",
    fontWeight: "700"
  },
  scanCard: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "#f97316"
  },
  primaryButton: {
    backgroundColor: "#f97316",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8
  },
  primaryButtonText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800"
  },
  footer: {
    marginTop: "auto",
    alignItems: "center"
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  logoutText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600"
  }
});
