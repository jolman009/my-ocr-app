import { ActivityIndicator, SafeAreaView, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../lib/theme";
import type { RootStackParamList } from "../types/navigation";
import { useAuthContext } from "../providers/AuthProvider";
import { AuthScreen } from "../screens/AuthScreen";
import { CameraScreen } from "../screens/CameraScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ReceiptDetailScreen } from "../screens/ReceiptDetailScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

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
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Receipt Radar" }} />
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
