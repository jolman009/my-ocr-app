export type TabParamList = {
  Home: undefined;
  Scan: undefined;
  Exports: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  Camera: undefined;
  ReceiptDetail: { receiptId: string };
};
