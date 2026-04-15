import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  AuthProvider,
  useAuthContext
} from "@receipt-radar/mobile/providers/AuthProvider";
import { ApiConfigProvider } from "./src/providers/ApiConfigProvider";
import { OrgProvider } from "./src/providers/OrgProvider";
import { LoginScreen } from "./src/screens/LoginScreen";
import { HomeScreen } from "./src/screens/HomeScreen";

const queryClient = new QueryClient();

const RootRouter = () => {
  const { isAuthenticated, isHydrating } = useAuthContext();

  if (isHydrating) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color="#f97316" size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <OrgProvider>
      <HomeScreen />
    </OrgProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ApiConfigProvider>
          <AuthProvider>
            <StatusBar style="light" />
            <RootRouter />
          </AuthProvider>
        </ApiConfigProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center"
  }
});
