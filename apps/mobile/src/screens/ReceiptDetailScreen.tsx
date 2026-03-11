import { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Image } from "expo-image";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getReceiptImageUrl } from "@receipt-ocr/shared/api";
import { useReceipt, useUpdateReceipt } from "@receipt-ocr/shared/hooks";
import type { ReceiptRecord } from "@receipt-ocr/shared/types";
import { LabeledInput } from "../components/LabeledInput";
import { colors } from "../lib/theme";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "ReceiptDetail">;

interface ReceiptFormValues {
  merchantName: string;
  receiptDate: string;
  address: string;
  subtotal: string;
  tax: string;
  tip: string;
  total: string;
  currency: string;
  items: Array<{
    name: string;
    quantity: string;
    unitPrice: string;
    totalPrice: string;
  }>;
}

const toInputString = (value: string | number | null | undefined) =>
  value === null || value === undefined ? "" : String(value);

const toNullableNumber = (value: string) => {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const toFormValues = (receipt: ReceiptRecord): ReceiptFormValues => ({
  merchantName: toInputString(receipt.merchantName),
  receiptDate: toInputString(receipt.receiptDate),
  address: toInputString(receipt.address),
  subtotal: toInputString(receipt.subtotal),
  tax: toInputString(receipt.tax),
  tip: toInputString(receipt.tip),
  total: toInputString(receipt.total),
  currency: toInputString(receipt.currency),
  items: receipt.items.map((item) => ({
    name: item.name,
    quantity: toInputString(item.quantity),
    unitPrice: toInputString(item.unitPrice),
    totalPrice: toInputString(item.totalPrice)
  }))
});

export const ReceiptDetailScreen = ({ route, navigation }: Props) => {
  const receiptId = route.params.receiptId;
  const receiptQuery = useReceipt(receiptId);
  const updateMutation = useUpdateReceipt();

  const form = useForm<ReceiptFormValues>({
    defaultValues: receiptQuery.data ? toFormValues(receiptQuery.data) : undefined
  });
  
  const itemsFieldArray = useFieldArray({
    control: form.control,
    name: "items"
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (!isDirty || updateMutation.isSuccess) {
        return;
      }
      e.preventDefault();
      Alert.alert(
        "Discard changes?",
        "You have unsaved edits. Are you sure you want to leave?",
        [
          { text: "Keep editing", style: "cancel", onPress: () => {} },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action)
          }
        ]
      );
    });
    return unsubscribe;
  }, [navigation, isDirty, updateMutation.isSuccess]);

  // Sync data to form when query loads/updates initially
  useEffect(() => {
    if (receiptQuery.data && !isDirty) {
      form.reset(toFormValues(receiptQuery.data));
    }
  }, [receiptQuery.data, isDirty, form]);

  const confidenceEntries = useMemo(
    () => Object.entries(receiptQuery.data?.confidence ?? {}),
    [receiptQuery.data?.confidence]
  );

  if (receiptQuery.isLoading || !receiptQuery.data) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.ember} size="large" />
      </SafeAreaView>
    );
  }

  const receipt = receiptQuery.data;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={getReceiptImageUrl(receipt.imageUrl)}
          style={styles.receiptImage}
          contentFit="cover"
        />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidence</Text>
          <View style={styles.confidenceGrid}>
            {confidenceEntries.map(([key, value]) => (
              <View key={key} style={styles.confidenceCard}>
                <Text style={styles.confidenceKey}>{key}</Text>
                <Text style={styles.confidenceValue}>{Math.round(value * 100)}%</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipt fields</Text>
          <Controller
            control={form.control}
            name="merchantName"
            render={({ field }) => <LabeledInput label="Merchant" value={field.value} onChangeText={field.onChange} lowConfidence={(receiptQuery.data?.confidence.merchantName || 1) < 0.6} />}
          />
          <Controller
            control={form.control}
            name="receiptDate"
            render={({ field }) => <LabeledInput label="Receipt Date" value={field.value} onChangeText={field.onChange} placeholder="YYYY-MM-DD" lowConfidence={(receiptQuery.data?.confidence.receiptDate || 1) < 0.6} />}
          />
          <Controller
            control={form.control}
            name="address"
            render={({ field }) => <LabeledInput label="Address" value={field.value} onChangeText={field.onChange} lowConfidence={(receiptQuery.data?.confidence.address || 1) < 0.6} />}
          />
          <Controller
            control={form.control}
            name="subtotal"
            render={({ field }) => <LabeledInput label="Subtotal" value={field.value} onChangeText={field.onChange} keyboardType="numeric" lowConfidence={(receiptQuery.data?.confidence.subtotal || 1) < 0.6} />}
          />
          <Controller
            control={form.control}
            name="tax"
            render={({ field }) => <LabeledInput label="Tax" value={field.value} onChangeText={field.onChange} keyboardType="numeric" lowConfidence={(receiptQuery.data?.confidence.tax || 1) < 0.6} />}
          />
          <Controller
            control={form.control}
            name="tip"
            render={({ field }) => <LabeledInput label="Tip" value={field.value} onChangeText={field.onChange} keyboardType="numeric" lowConfidence={(receiptQuery.data?.confidence.tip || 1) < 0.6} />}
          />
          <Controller
            control={form.control}
            name="total"
            render={({ field }) => <LabeledInput label="Total" value={field.value} onChangeText={field.onChange} keyboardType="numeric" lowConfidence={(receiptQuery.data?.confidence.total || 1) < 0.6} />}
          />
          <Controller
            control={form.control}
            name="currency"
            render={({ field }) => <LabeledInput label="Currency" value={field.value} onChangeText={field.onChange} lowConfidence={(receiptQuery.data?.confidence.currency || 1) < 0.6} />}
          />
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Line items</Text>
            <Pressable
              style={styles.addButton}
              onPress={() =>
                itemsFieldArray.append({
                  name: "",
                  quantity: "",
                  unitPrice: "",
                  totalPrice: "0"
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Add new line item"
              hitSlop={8}
            >
              <Text style={styles.addButtonText}>Add item</Text>
            </Pressable>
          </View>
          {itemsFieldArray.fields.map((field, index) => {
            const isLast = index === itemsFieldArray.fields.length - 1;
            // The API doesn't currently provide structured confidence per-line-item 
            // inside the Record<string, number>. Defaulting Line Item lowConfidence to false.
            const isItemLowConfidence = false;
            return (
              <View key={field.id} style={styles.lineItemCard}>
                <Controller
                  control={form.control}
                  name={`items.${index}.name`}
                  render={({ field }) => (
                    <LabeledInput 
                      label="Name" 
                      value={field.value} 
                      onChangeText={field.onChange} 
                      returnKeyType="next"
                      lowConfidence={isItemLowConfidence}
                    />
                  )}
                />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Controller
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <LabeledInput 
                          label="Qty" 
                          value={field.value} 
                          onChangeText={field.onChange} 
                          keyboardType="numeric" 
                          returnKeyType="next"
                          lowConfidence={isItemLowConfidence}
                        />
                      )}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Controller
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <LabeledInput 
                          label="Unit Price" 
                          value={field.value} 
                          onChangeText={field.onChange} 
                          keyboardType="numeric" 
                          returnKeyType="next"
                          lowConfidence={isItemLowConfidence}
                        />
                      )}
                    />
                  </View>
                </View>
                <Controller
                  control={form.control}
                  name={`items.${index}.totalPrice`}
                  render={({ field }) => (
                    <LabeledInput 
                      label="Total Price" 
                      value={field.value} 
                      onChangeText={field.onChange} 
                      keyboardType="numeric" 
                      returnKeyType={isLast ? "done" : "next"}
                      lowConfidence={isItemLowConfidence}
                    />
                  )}
                />
                <Pressable 
                  style={styles.removeButton} 
                  onPress={() => itemsFieldArray.remove(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove line item ${index + 1}`}
                  hitSlop={12}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
        <Pressable
          style={styles.saveButton}
          onPress={form.handleSubmit(async (values) => {
            await updateMutation.mutateAsync({
              ...receipt,
              merchantName: values.merchantName.trim() || null,
              receiptDate: values.receiptDate.trim() || null,
              address: values.address.trim() || null,
              subtotal: toNullableNumber(values.subtotal),
              tax: toNullableNumber(values.tax),
              tip: toNullableNumber(values.tip),
              total: toNullableNumber(values.total),
              currency: values.currency.trim() || null,
              items: values.items
                .map((item) => ({
                  name: item.name.trim(),
                  quantity: toNullableNumber(item.quantity) ?? undefined,
                  unitPrice: toNullableNumber(item.unitPrice) ?? undefined,
                  totalPrice: toNullableNumber(item.totalPrice) ?? 0
                }))
                .filter((item) => item.name.length > 0)
            });
          })}
          accessibilityRole="button"
          accessibilityLabel={updateMutation.isPending ? "Saving receipt" : "Save receipt"}
        >
          <Text style={styles.saveButtonText}>
            {updateMutation.isPending ? "Saving..." : "Save receipt"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mist
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.mist
  },
  content: {
    padding: 20,
    gap: 18
  },
  receiptImage: {
    width: "100%",
    height: 320,
    borderRadius: 24,
    backgroundColor: "#e2e8f0"
  },
  section: {
    borderRadius: 24,
    backgroundColor: colors.white,
    padding: 18,
    gap: 14
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800"
  },
  confidenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  confidenceCard: {
    borderRadius: 18,
    backgroundColor: colors.mist,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: "47%"
  },
  confidenceKey: {
    color: "#475569",
    fontSize: 12,
    textTransform: "capitalize"
  },
  confidenceValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4
  },
  addButton: {
    borderRadius: 999,
    backgroundColor: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  addButtonText: {
    color: colors.white,
    fontWeight: "700"
  },
  lineItemCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 12
  },
  removeButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  removeButtonText: {
    color: colors.danger,
    fontWeight: "700"
  },
  saveButton: {
    borderRadius: 22,
    backgroundColor: colors.ember,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 40
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800"
  }
});
