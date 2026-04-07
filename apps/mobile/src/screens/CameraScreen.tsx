import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { CameraView, FlashMode, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { SaveFormat, manipulateAsync } from "expo-image-manipulator";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useUploadReceipt } from "@receipt-ocr/shared/hooks";
import { useTheme } from "../providers/ThemeProvider";
import type { RootStackParamList } from "../types/navigation";

export const CameraScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const uploadMutation = useUploadReceipt();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [flash, setFlash] = useState<FlashMode>("off");

  const optimizeImage = async (uri: string) => {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: 2048 } }],
      { compress: 0.8, format: SaveFormat.JPEG }
    );

    return {
      uri: result.uri,
      name: `receipt-${Date.now()}.jpg`,
      type: "image/jpeg"
    };
  };

  const handleUsePhoto = async () => {
    if (!previewUri) {
      return;
    }

    try {
      const optimized = await optimizeImage(previewUri);

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      uploadMutation.mutate(optimized, {
        onSuccess: (data) => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          navigation.navigate("ReceiptDetail", { receiptId: data.id });
        },
        onError: (error) => {
          Alert.alert("Upload failed", error.message || "Unable to upload receipt.");
        }
      });
    } catch (error) {
      Alert.alert("Preprocessing failed", "Unable to prepare the image for upload.");
    }
  };

  const handleCapture = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) {
      setPreviewUri(photo.uri);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleLibraryPick = async () => {
    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setPreviewUri(result.assets[0].uri);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera access is required to scan receipts.</Text>
        <Pressable style={[styles.primaryButton, { backgroundColor: colors.accent }]} onPress={() => void requestPermission()}>
          <Text style={[styles.primaryButtonText, { color: colors.textOnAccent }]}>Allow camera</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (previewUri) {
    const isUploading = uploadMutation.isPending;

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.previewHeader}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>
            {isUploading ? "Processing receipt..." : "Preview receipt"}
          </Text>
          <Text style={[styles.previewBody, { color: colors.textSecondary }]}>
            {isUploading
              ? "Uploading image and running OCR. This may take a moment."
              : "Use the image or retake before uploading."}
          </Text>
        </View>

        {isUploading && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: colors.skeleton }]}>
              <View style={[styles.progressBar, { backgroundColor: colors.accent }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>Uploading and extracting receipt data...</Text>
          </View>
        )}

        <Image source={{ uri: previewUri }} style={[styles.previewImage, { backgroundColor: colors.skeleton }, isUploading && { opacity: 0.5 }]} />
        <View style={styles.previewActions}>
          <Pressable
            style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }, isUploading && { opacity: 0.4 }]}
            onPress={() => setPreviewUri(null)}
            disabled={isUploading}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Retake</Text>
          </Pressable>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.accent }, isUploading && { opacity: 0.7 }]}
            onPress={() => void handleUsePhoto()}
            disabled={isUploading}
          >
            <Text style={[styles.primaryButtonText, { color: colors.textOnAccent }]}>
              {isUploading ? "Uploading..." : "Use Photo"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.cameraSafeArea, { backgroundColor: colors.headerBg }]}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" flash={flash}>
        <View style={styles.overlay}>
          <View style={styles.topControls}>
            <Pressable
              style={[styles.overlayButton, { backgroundColor: colors.overlay }]}
              onPress={() => setFlash((current) => (current === "off" ? "on" : "off"))}
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel={`Toggle flash. Currently ${flash}`}
              hitSlop={16}
            >
              <Text style={styles.overlayButtonText}>{flash === "off" ? "Flash off" : "Flash on"}</Text>
            </Pressable>
            <Pressable
              style={[styles.overlayButton, { backgroundColor: colors.overlay }, isProcessing && { opacity: 0.5 }]}
              onPress={() => void handleLibraryPick()}
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel="Pick image from gallery"
              hitSlop={16}
            >
              <Text style={styles.overlayButtonText}>
                {isProcessing ? "Loading..." : "Gallery"}
              </Text>
            </Pressable>
          </View>
          <View style={styles.captureContainer}>
            <Pressable
              style={[styles.captureButton, { borderColor: colors.accent }]}
              onPress={() => void handleCapture()}
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel="Take picture of receipt"
              hitSlop={24}
            />
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 20,
    gap: 20
  },
  progressContainer: {
    gap: 8
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden" as const
  },
  progressBar: {
    width: "60%",
    height: "100%",
    borderRadius: 3
  },
  progressText: {
    fontSize: 13,
    fontWeight: "500" as const,
    textAlign: "center" as const
  },
  cameraSafeArea: {
    flex: 1
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16
  },
  camera: {
    flex: 1
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  overlayButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  overlayButtonText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  captureContainer: {
    alignItems: "center",
    marginBottom: 24
  },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#ffffff",
    borderWidth: 8
  },
  previewHeader: {
    gap: 8
  },
  previewTitle: {
    fontSize: 28,
    fontWeight: "800"
  },
  previewBody: {
    fontSize: 15
  },
  previewImage: {
    flex: 1,
    borderRadius: 24
  },
  previewActions: {
    flexDirection: "row",
    gap: 12
  },
  primaryButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center"
  },
  primaryButtonText: {
    fontWeight: "800"
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1
  },
  secondaryButtonText: {
    fontWeight: "700"
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center"
  }
});
