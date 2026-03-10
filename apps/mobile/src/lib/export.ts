import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { getExportUrl } from "@receipt-ocr/shared/api";
import type { ReceiptFilters } from "@receipt-ocr/shared/types";

export const downloadAndShareExport = async (
  format: "csv" | "xlsx",
  filters?: ReceiptFilters
) => {
  const directory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

  if (!directory) {
    throw new Error("No writable directory is available on this device.");
  }

  const extension = format === "csv" ? "csv" : "xlsx";
  const target = `${directory}receipt-export-${Date.now()}.${extension}`;
  const result = await FileSystem.downloadAsync(getExportUrl(format, filters), target);

  if (!(await Sharing.isAvailableAsync())) {
    return result.uri;
  }

  await Sharing.shareAsync(result.uri);
  return result.uri;
};
