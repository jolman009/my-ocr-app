import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ReceiptListItem } from "../src/components/ReceiptListItem";

describe("ReceiptListItem", () => {
  it("renders the merchant and total", () => {
    render(
      <ReceiptListItem
        receipt={{
          id: "rcpt_1",
          imageUrl: "/uploads/mock.png",
          merchantName: "Cafe Central",
          receiptDate: "2026-03-09",
          address: "123 Main St",
          subtotal: 12.25,
          tax: 0.98,
          tip: 1.5,
          total: 14.73,
          currency: "USD",
          category: null,
          status: "processed",
          confidence: { total: 0.95 },
          rawText: "Cafe Central",
          items: [{ name: "Latte", totalPrice: 4.5 }],
          createdAt: "2026-03-09T00:00:00.000Z",
          updatedAt: "2026-03-09T00:00:00.000Z"
        }}
        onPress={jest.fn()}
      />
    );

    expect(screen.getByText("Cafe Central")).toBeTruthy();
    expect(screen.getByText("$14.73")).toBeTruthy();
  });
});
