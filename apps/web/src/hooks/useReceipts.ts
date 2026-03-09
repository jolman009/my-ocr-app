import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReceipt, listReceipts, updateReceipt, uploadReceipt } from "../api/client";
import type { ReceiptFilters, ReceiptRecord } from "../types/receipt";

export const receiptKeys = {
  all: ["receipts"] as const,
  list: (filters?: ReceiptFilters) => [...receiptKeys.all, "list", filters] as const,
  detail: (id: string) => [...receiptKeys.all, "detail", id] as const
};

export const useReceipts = (filters?: ReceiptFilters) => {
  return useQuery({
    queryKey: receiptKeys.list(filters),
    queryFn: () => listReceipts(filters)
  });
};

export const useReceipt = (id: string) => {
  return useQuery({
    queryKey: receiptKeys.detail(id),
    queryFn: () => getReceipt(id),
    enabled: Boolean(id)
  });
};

export const useUploadReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
    }
  });
};

export const useUpdateReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (receipt: ReceiptRecord) => updateReceipt(receipt),
    onSuccess: (receipt) => {
      queryClient.setQueryData(receiptKeys.detail(receipt.id), receipt);
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
    }
  });
};