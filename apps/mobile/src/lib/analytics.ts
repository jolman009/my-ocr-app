/**
 * Analytics – lightweight event tracking for Receipt Radar.
 *
 * In development, events are logged to the console.
 * In production, swap the `track` implementation for your preferred
 * provider (Amplitude, Mixpanel, PostHog, etc.).
 */

type AnalyticsEvent =
  | { name: "receipt_uploaded"; properties?: { source: "camera" | "gallery" } }
  | { name: "receipt_viewed"; properties?: { receiptId: string } }
  | { name: "receipt_edited"; properties?: { receiptId: string } }
  | { name: "receipt_exported"; properties?: { format: "csv" | "xlsx" } }
  | { name: "login_success" }
  | { name: "logout" }
  | { name: "offline_upload_queued" }
  | { name: "offline_upload_synced" };

export const analytics = {
  track(event: AnalyticsEvent) {
    if (__DEV__) {
      console.log("[Analytics]", event.name, "properties" in event ? event.properties : "");
      return;
    }
    // TODO: Replace with your production analytics provider call, e.g.
    // Amplitude.logEvent(event.name, event.properties);
    // PostHog.capture(event.name, event.properties);
  },

  identify(userId: string) {
    if (__DEV__) {
      console.log("[Analytics] Identify:", userId);
      return;
    }
    // TODO: Amplitude.setUserId(userId); / PostHog.identify(userId);
  },

  reset() {
    if (__DEV__) {
      console.log("[Analytics] Reset user");
      return;
    }
    // TODO: Amplitude.setUserId(null); / PostHog.reset();
  }
};
