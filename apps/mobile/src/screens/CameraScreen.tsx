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
import { colors } from "../lib/theme";
import type { RootStackParamList } from "../types/navigation";

export const CameraScreen = () => {
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
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.ember} size="large" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.permissionTitle}>Camera access is required to scan receipts.</Text>
        <Pressable style={styles.primaryButton} onPress={() => void requestPermission()}>
          <Text style={styles.primaryButtonText}>Allow camera</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (previewUri) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>Preview receipt</Text>
          <Text style={styles.previewBody}>Use the image or retake before uploading.</Text>
        </View>
        <Image source={{ uri: previewUri }} style={styles.previewImage} />
        <View style={styles.previewActions}>
          <Pressable style={styles.secondaryButton} onPress={() => setPreviewUri(null)}>
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={() => void handleUsePhoto()}>
            <Text style={styles.primaryButtonText}>
              {uploadMutation.isPending ? "Uploading..." : "Use Photo"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.cameraSafeArea}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" flash={flash}>
        <View style={styles.overlay}>
          <View style={styles.topControls}>
            <Pressable
              style={styles.overlayButton}
              onPress={() => setFlash((current) => (current === "off" ? "on" : "off"))}
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel={`Toggle flash. Currently ${flash}`}
              hitSlop={16}
            >
              <Text style={styles.overlayButtonText}>{flash === "off" ? "Flash off" : "Flash on"}</Text>
            </Pressable>
            <Pressable 
              style={[styles.overlayButton, isProcessing && { opacity: 0.5 }]} 
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
              style={[styles.captureButton, isProcessing && { opacity: 0.5 }]} 
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
    backgroundColor: colors.mist,
    padding: 20,
    gap: 20
  },
  cameraSafeArea: {
    flex: 1,
    backgroundColor: colors.ink
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.mist,
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
    backgroundColor: "rgba(15,23,42,0.68)",
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  overlayButtonText: {
    color: colors.white,
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
    backgroundColor: colors.white,
    borderWidth: 8,
    borderColor: colors.ember
  },
  previewHeader: {
    gap: 8
  },
  previewTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "800"
  },
  previewBody: {
    color: "#475569",
    fontSize: 15
  },
  previewImage: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "#e2e8f0"
  },
  previewActions: {
    flexDirection: "row",
    gap: 12
  },
  primaryButton: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: colors.ember,
    paddingVertical: 16,
    alignItems: "center"
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: "800"
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: colors.white,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1"
  },
  secondaryButtonText: {
    color: colors.ink,
    fontWeight: "700"
  },
  permissionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center"
  }
});
