import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.eyebrow}>MANIFEST 956</Text>
      <Text style={styles.title}>Forwarding center{"\n"}package intake</Text>
      <Text style={styles.subtitle}>
        Login + camera + scan flows land in the next commits.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16
  },
  eyebrow: {
    color: "#f97316",
    fontSize: 13,
    letterSpacing: 6,
    fontWeight: "800"
  },
  title: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 38
  },
  subtitle: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20
  }
});
