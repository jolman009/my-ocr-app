import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { CameraView, FlashMode, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { SaveFormat, manipulateAsync } from "expo-image-manipulator";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { uploadDocument } from "../api/forwardingClient";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Camera">;

export const CameraScreen = ({ navigation }: Props) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [flash, setFlash] = useState<FlashMode>("off");
  const [uploading, setUploading] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);

  // ---- Permission handling ----
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#f97316" size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permText}>
          Manifest 956 needs camera access to scan shipping labels.
        </Text>
        <Pressable style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Grant access</Text>
        </Pressable>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  // ---- Capture ----
  const capture = async () => {
    if (!cameraRef.current || previewUri || uploading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
    if (!photo?.uri) return;

    // Resize large images to keep upload under ~3 MB
    const resized = await manipulateAsync(
      photo.uri,
      [{ resize: { width: 1800 } }],
      { compress: 0.8, format: SaveFormat.JPEG }
    );
    setPreviewUri(resized.uri);
  };

  // ---- Upload ----
  const upload = async () => {
    if (!previewUri || uploading) return;
    setUploading(true);
    try {
      const result = await uploadDocument(previewUri);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace("ScanResult", { document: result.document });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Try again.";
      Alert.alert("Upload error", message);
    } finally {
      setUploading(false);
    }
  };

  // ---- Retake ----
  const retake = () => {
    setPreviewUri(null);
    setLastBarcode(null);
  };

  // ---- Preview mode ----
  if (previewUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: previewUri }} style={styles.preview} />
        {uploading ? (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator color="#f97316" size="large" />
            <Text style={styles.uploadText}>Processing label...</Text>
          </View>
        ) : (
          <View style={styles.previewActions}>
            <Pressable style={styles.retakeButton} onPress={retake}>
              <Text style={styles.retakeText}>Retake</Text>
            </Pressable>
            <Pressable style={styles.useButton} onPress={upload}>
              <Text style={styles.useButtonText}>Use Photo</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  // ---- Live camera ----
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        flash={flash}
        onBarcodeScanned={(result) => {
          if (result.data && result.data !== lastBarcode) {
            setLastBarcode(result.data);
          }
        }}
        barcodeScannerSettings={{
          barcodeTypes: [
            "code128",
            "qr",
            "datamatrix",
            "code39",
            "ean13",
            "pdf417"
          ]
        }}
      >
        {/* Barcode detection badge */}
        {lastBarcode ? (
          <View style={styles.barcodeBadge}>
            <Text style={styles.barcodeBadgeText} numberOfLines={1}>
              Detected: {lastBarcode.slice(0, 30)}
              {lastBarcode.length > 30 ? "..." : ""}
            </Text>
          </View>
        ) : null}

        {/* Bottom controls */}
        <View style={styles.controls}>
          <Pressable
            style={styles.flashButton}
            onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
          >
            <Text style={styles.flashText}>{flash === "off" ? "Flash" : "Flash ON"}</Text>
          </Pressable>

          <Pressable style={styles.captureButton} onPress={capture}>
            <View style={styles.captureInner} />
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16
  },
  permText: { color: "#94a3b8", fontSize: 16, textAlign: "center", lineHeight: 24 },
  permButton: {
    backgroundColor: "#f97316",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12
  },
  permButtonText: { color: "#0f172a", fontWeight: "800", fontSize: 16 },
  backButton: { paddingVertical: 10 },
  backText: { color: "#94a3b8", fontSize: 14 },

  camera: { flex: 1, justifyContent: "space-between" },

  barcodeBadge: {
    alignSelf: "center",
    marginTop: 60,
    backgroundColor: "rgba(16, 185, 129, 0.85)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    maxWidth: "90%"
  },
  barcodeBadgeText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingBottom: 48
  },
  flashButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999
  },
  flashText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f97316"
  },
  cancelButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999
  },
  cancelText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  preview: { flex: 1 },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    gap: 16
  },
  uploadText: { color: "#f8fafc", fontSize: 16, fontWeight: "700" },
  previewActions: {
    position: "absolute",
    bottom: 48,
    left: 24,
    right: 24,
    flexDirection: "row",
    gap: 16
  },
  retakeButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center"
  },
  retakeText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  useButton: {
    flex: 1,
    backgroundColor: "#f97316",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center"
  },
  useButtonText: { color: "#0f172a", fontWeight: "800", fontSize: 16 }
});
