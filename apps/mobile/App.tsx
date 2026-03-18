import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import * as Sentry from "@sentry/react-native";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ApiConfigProvider } from "./src/providers/ApiConfigProvider";
import { AuthProvider } from "./src/providers/AuthProvider";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { RootNavigator } from "./src/navigation/RootNavigator";

// ---------- Sentry Crash Reporting ----------
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? "",
  debug: __DEV__,
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  enabled: !__DEV__, // Disable in development builds to avoid noise
});

// ---------- Network-aware Query Client ----------
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected && !!state.isInternetReachable);
  });
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
      staleTime: 1000 * 60 * 5, // 5 minutes (avoids rapid re-fetching)
    },
    mutations: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // Mutations must also be preserved for offline retry
    }
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

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

function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ApiConfigProvider>
          <AuthProvider>
            <PersistQueryClientProvider
              client={queryClient}
              persistOptions={{ persister: asyncStoragePersister }}
            >
              <NavigationContainer theme={navTheme}>
                <StatusBar style="dark" />
                <RootNavigator />
              </NavigationContainer>
            </PersistQueryClientProvider>
          </AuthProvider>
        </ApiConfigProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(App);
