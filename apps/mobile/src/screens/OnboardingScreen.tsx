import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from "../providers/ThemeProvider";
import type { RootStackParamList } from "../types/navigation";

const { width } = Dimensions.get("window");

const ONBOARDING_KEY = "receipt_radar_onboarding_done";

export const markOnboardingDone = () =>
  AsyncStorage.setItem(ONBOARDING_KEY, "true");

export const checkOnboardingDone = async () => {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val === "true";
};

interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    icon: "camera-outline",
    title: "Scan any receipt",
    body: "Point your camera at a receipt or pick one from your gallery. Our AI extracts merchant, date, totals, and line items automatically.",
  },
  {
    id: "2",
    icon: "create-outline",
    title: "Review and edit",
    body: "Verify the extracted data, correct any fields, and build a clean digital record of every purchase.",
  },
  {
    id: "3",
    icon: "download-outline",
    title: "Export your data",
    body: "Download your receipts as CSV or Excel. Share with your bookkeeper, import into a spreadsheet, or save for tax season.",
  },
];

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export const OnboardingScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const isLast = activeIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleDone();
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  const handleDone = async () => {
    await markOnboardingDone();
    navigation.replace("Auth");
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accent + "20" }]}>
        <Ionicons name={item.icon} size={64} color={colors.accent} />
      </View>
      <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.slideBody, { color: colors.textSecondary }]}>{item.body}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.skipRow}>
        <Pressable onPress={handleDone} hitSlop={12}>
          <Text style={[styles.skipText, { color: colors.textTertiary }]}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === activeIndex ? colors.accent : colors.border,
                  width: i === activeIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          style={[styles.nextButton, { backgroundColor: colors.accent }]}
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? "Get started" : "Next slide"}
        >
          <Text style={[styles.nextButtonText, { color: colors.textOnAccent }]}>
            {isLast ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipRow: {
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 24,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  slideBody: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 24,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    width: "100%",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "800",
  },
});
