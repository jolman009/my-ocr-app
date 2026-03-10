import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ApiConfigProvider } from "./src/providers/ApiConfigProvider";
import { RootNavigator } from "./src/navigation/RootNavigator";

const queryClient = new QueryClient();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#f8fafc",
    card: "#0f172a",
    primary: "#f97316",
    text: "#0f172a",
    border: "#e2e8f0"
  }
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ApiConfigProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer theme={navTheme}>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </ApiConfigProvider>
    </SafeAreaProvider>
  );
}
