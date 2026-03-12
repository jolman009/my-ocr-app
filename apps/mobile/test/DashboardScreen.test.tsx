import React from "react";
import { render } from "@testing-library/react-native";
import { DashboardScreen } from "../src/screens/DashboardScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn() })
}));

jest.mock("../src/providers/AuthProvider", () => ({
  useAuthContext: () => ({ logout: jest.fn() })
}));

jest.mock("@receipt-ocr/shared/hooks", () => ({
  useReceipts: jest.fn().mockReturnValue({
    data: { data: [] },
    isLoading: false
  })
}));

// Mock Expo vector icons to avoid missing font issues in Jest
jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return {
    Ionicons: View,
    MaterialIcons: View
  };
});

describe("DashboardScreen", () => {
  it("renders the empty state correctly", () => {
    const mockProps = {
      navigation: { navigate: jest.fn(), goBack: jest.fn() } as any,
      route: { key: "1", name: "Dashboard" } as any,
    };
    const { getByText } = render(<DashboardScreen {...mockProps} />);
    
    // Ensure the app title or the empty state text renders
    expect(getByText("Mobile OCR")).toBeTruthy();
    expect(getByText("No receipts yet")).toBeTruthy();
  });
});
