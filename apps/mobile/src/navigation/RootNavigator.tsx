import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../lib/theme";
import type { RootStackParamList } from "../types/navigation";
import { CameraScreen } from "../screens/CameraScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ReceiptDetailScreen } from "../screens/ReceiptDetailScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.mist }
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Receipt Radar" }} />
      <Stack.Screen name="Camera" component={CameraScreen} options={{ title: "Scan Receipt" }} />
      <Stack.Screen name="ReceiptDetail" component={ReceiptDetailScreen} options={{ title: "Review Receipt" }} />
    </Stack.Navigator>
  );
};
