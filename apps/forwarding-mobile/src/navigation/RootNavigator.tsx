import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { CameraScreen } from "../screens/CameraScreen";
import { ScanResultScreen } from "../screens/ScanResultScreen";
import { DocumentsScreen } from "../screens/DocumentsScreen";
import { DocumentDetailScreen } from "../screens/DocumentDetailScreen";
import type { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => (
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: "#0f172a" },
      animation: "slide_from_right"
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen
      name="Camera"
      component={CameraScreen}
      options={{ animation: "slide_from_bottom" }}
    />
    <Stack.Screen name="ScanResult" component={ScanResultScreen} />
    <Stack.Screen name="Documents" component={DocumentsScreen} />
    <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
  </Stack.Navigator>
);
