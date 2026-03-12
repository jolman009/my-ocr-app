import React from "react";
import { render } from "@testing-library/react-native";
import { ReceiptDetailScreen } from "../src/screens/ReceiptDetailScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn().mockReturnValue(jest.fn()), // Mock beforeRemove hook
    dispatch: jest.fn()
  }),
  useRoute: () => ({ params: { id: "1" } })
}));

const MOCK_RECEIPT = {
  id: "1",
  merchantName: "Test Merchant",
  total: 15.0,
  receiptDate: "2024-01-01",
  status: "processed",
  confidence: {},
  items: []
};

jest.mock("@receipt-ocr/shared/hooks", () => ({
  useReceipt: () => ({
    data: MOCK_RECEIPT,
    isLoading: false
  }),
  useUpdateReceipt: () => ({ mutateAsync: jest.fn(), isPending: false })
}));

jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return { Ionicons: View, MaterialIcons: View, Feather: View };
});

describe("ReceiptDetailScreen", () => {
  it("renders the receipt details correctly from external hooks", () => {
    const mockProps = {
      navigation: { 
        navigate: jest.fn(), 
        goBack: jest.fn(),
        addListener: jest.fn().mockReturnValue(jest.fn()),
        dispatch: jest.fn()
      } as any,
      route: { key: "1", name: "ReceiptDetail", params: { id: "1" } } as any
    };

    const { getByDisplayValue, getByText } = render(<ReceiptDetailScreen {...mockProps} />);
    
    // React Hook Form inputs populate as defaultValues/values
    expect(getByDisplayValue("Test Merchant")).toBeTruthy();
    expect(getByDisplayValue("15")).toBeTruthy();
  });
});
