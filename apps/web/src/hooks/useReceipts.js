import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReceipt, listReceipts, updateReceipt, uploadReceipt } from "../api/client";
export const receiptKeys = {
    all: ["receipts"],
    list: (filters) => [...receiptKeys.all, "list", filters],
    detail: (id) => [...receiptKeys.all, "detail", id]
};
export const useReceipts = (filters) => {
    return useQuery({
        queryKey: receiptKeys.list(filters),
        queryFn: () => listReceipts(filters)
    });
};
export const useReceipt = (id) => {
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
        mutationFn: (receipt) => updateReceipt(receipt),
        onSuccess: (receipt) => {
            queryClient.setQueryData(receiptKeys.detail(receipt.id), receipt);
            queryClient.invalidateQueries({ queryKey: receiptKeys.all });
        }
    });
};
