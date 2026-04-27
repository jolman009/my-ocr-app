import type { ShipmentDocumentRecord } from "../api/forwardingClient";

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  ScanResult: { document: ShipmentDocumentRecord };
  Documents: undefined;
  DocumentDetail: { id: string };
};
