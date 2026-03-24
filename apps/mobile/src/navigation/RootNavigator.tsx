import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from "react-native";
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

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{ fontSize: 11, fontWeight: focused ? "800" : "600", color: focused ? colors.ember : "#94a3b8" }}>
    {label}
  </Text>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.ink },
      headerTintColor: colors.white,
      headerTitleStyle: { fontWeight: "700" },
      tabBarStyle: {
        backgroundColor: colors.white,
        borderTopColor: "#e2e8f0",
        paddingTop: 8,
        paddingBottom: 8,
        height: 64
      },
      tabBarActiveTintColor: colors.ember,
      tabBarInactiveTintColor: "#94a3b8",
      tabBarShowLabel: false
    }}
  >
    <Tab.Screen
      name="Home"
      component={DashboardScreen}
      options={{
        title: "Receipt Radar",
        tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />
      }}
    />
    <Tab.Screen
      name="Scan"
      component={CameraScreen}
      options={{
        title: "Scan Receipt",
        tabBarIcon: ({ focused }) => <TabIcon label="Scan" focused={focused} />
      }}
    />
    <Tab.Screen
      name="Exports"
      component={ExportsScreen}
      options={{
        title: "Exports",
        tabBarIcon: ({ focused }) => <TabIcon label="Exports" focused={focused} />
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        title: "Settings",
        tabBarIcon: ({ focused }) => <TabIcon label="Settings" focused={focused} />
      }}
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
