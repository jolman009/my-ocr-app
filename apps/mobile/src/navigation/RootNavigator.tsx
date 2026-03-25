import { ActivityIndicator, SafeAreaView, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "../lib/theme";
import type { RootStackParamList, TabParamList } from "../types/navigation";
import { useAuthContext } from "../providers/AuthProvider";
import { AuthScreen } from "../screens/AuthScreen";
import { CameraScreen } from "../screens/CameraScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ExportsScreen } from "../screens/ExportsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { ReceiptDetailScreen } from "../screens/ReceiptDetailScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.ink },
      headerTintColor: colors.white,
      headerTitleStyle: { fontWeight: "700" },
      tabBarStyle: {
        backgroundColor: colors.white,
        borderTopColor: "#e2e8f0",
        borderTopWidth: 1,
        paddingTop: 10,
        height: 60
      },
      tabBarActiveTintColor: colors.ember,
      tabBarInactiveTintColor: "#94a3b8",
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: "600"
      }
    }}
  >
    <Tab.Screen
      name="Home"
      component={DashboardScreen}
      options={{ title: "Receipt Radar", tabBarLabel: "Home" }}
    />
    <Tab.Screen
      name="Scan"
      component={CameraScreen}
      options={{ title: "Scan Receipt", tabBarLabel: "Scan" }}
    />
    <Tab.Screen
      name="Exports"
      component={ExportsScreen}
      options={{ title: "Exports", tabBarLabel: "Exports" }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: "Settings", tabBarLabel: "Settings" }}
    />
  </Tab.Navigator>
);

export const RootNavigator = () => {
  const { isHydrating, isAuthenticated } = useAuthContext();

  if (isHydrating) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={colors.ember} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.mist }
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Camera" component={CameraScreen} options={{ title: "Scan Receipt" }} />
          <Stack.Screen name="ReceiptDetail" component={ReceiptDetailScreen} options={{ title: "Review Receipt" }} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.mist,
    justifyContent: "center",
    alignItems: "center"
  }
});
