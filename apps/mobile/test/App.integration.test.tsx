import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "../src/navigation/RootNavigator";
import { AuthProvider } from "../src/providers/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue("mock-token"),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

jest.mock("@receipt-ocr/shared/api", () => ({
  getReceiptImageUrl: jest.fn().mockReturnValue("file://test.jpg"),
  setAuthToken: jest.fn(),
  onUnauthorized: jest.fn().mockReturnValue(jest.fn())
}));

jest.mock("@receipt-ocr/shared/hooks", () => ({
  useReceipts: () => ({ data: { data: [] }, isLoading: false }),
  useReceipt: () => ({
    data: { id: "1", merchantName: "Test Merchant", total: 10, items: [] },
    isLoading: false
  }),
  useUploadReceipt: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useUpdateReceipt: () => ({ mutateAsync: jest.fn(), isPending: false })
}));

jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return { Ionicons: View, MaterialIcons: View, Feather: View };
});

jest.mock("expo-camera", () => ({
  CameraView: require("react-native").View,
  useCameraPermissions: () => [{ granted: true }, jest.fn()]
}));

jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn().mockResolvedValue({ uri: "file://compressed.jpg" }),
  SaveFormat: { JPEG: "jpeg" }
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn()
}));

const queryClient = new QueryClient();

describe("App E2E Integration", () => {
  it("navigates through the happy path when authenticated", async () => {
    const { getByText, getByLabelText } = render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </QueryClientProvider>
    );

    // 1. Should render the Dashboard Screen upon authentication
    await waitFor(() => expect(getByText("Mobile OCR")).toBeTruthy());
    
    // 2. Click the Floating Action Button to scan a new receipt
    const scanButton = getByLabelText("Scan new receipt");
    fireEvent.press(scanButton);

    // 3. Should switch navigation to the Camera screen view automatically
    await waitFor(() => expect(getByLabelText("Take picture of receipt")).toBeTruthy());
  });
});
