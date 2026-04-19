import "react-native-gesture-handler";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  AuthProvider,
  useAuthContext
} from "@receipt-radar/mobile/providers/AuthProvider";
import { ApiConfigProvider } from "./src/providers/ApiConfigProvider";
import { OrgProvider } from "./src/providers/OrgProvider";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { LoginScreen } from "./src/screens/LoginScreen";

const queryClient = new QueryClient();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0f172a",
    card: "#1e293b",
    primary: "#f97316",
    text: "#f8fafc",
    border: "#334155"
  }
};

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
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
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
