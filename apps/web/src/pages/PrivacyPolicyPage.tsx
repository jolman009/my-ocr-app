import { Link } from "react-router-dom";

export const PrivacyPolicyPage = () => (
  <div className="mx-auto max-w-3xl px-6 py-12">
    <Link to="/" className="text-sm font-semibold text-ember hover:opacity-80">&larr; Back</Link>

    <h1 className="mt-6 font-display text-3xl font-bold text-ink">Privacy Policy</h1>
    <p className="mt-2 text-sm text-slate-400">Effective date: March 18, 2026</p>

    <div className="mt-8 space-y-6 text-[15px] leading-7 text-slate-600">
      <p>
        Receipt Radar (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;) is a mobile application that helps you
        digitize and manage paper receipts using optical character recognition (OCR). This policy describes how we
        collect, use, and protect your information.
      </p>

      <h2 className="text-xl font-bold text-ink">1. Information We Collect</h2>
      <p>
        <strong>Account information:</strong> When you register, we collect your email address, name, and a hashed
        password. We never store your password in plain text.
      </p>
      <p>
        <strong>Receipt images:</strong> When you scan or upload a receipt, the image is sent to our server for OCR
        processing. We store the image and the extracted text data (merchant name, date, items, totals) in your account.
      </p>
      <p>
        <strong>Camera and photo access:</strong> The app requests camera permission to capture receipt photos and photo
        library access to upload existing images. These permissions are used solely for receipt scanning.
      </p>
      <p>
        <strong>Device information:</strong> We may collect basic device information (OS version, app version) for crash
        reporting and diagnostics via Sentry.
      </p>

      <h2 className="text-xl font-bold text-ink">2. How We Use Your Information</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>To process receipt images using Google Cloud Vision OCR and return structured data to you</li>
        <li>To store and display your receipt history within the app</li>
        <li>To enable CSV/Excel export of your receipt data</li>
        <li>To diagnose crashes and improve app stability (via Sentry crash reporting)</li>
        <li>To authenticate your account and protect your data</li>
      </ul>

      <h2 className="text-xl font-bold text-ink">3. Third-Party Services</h2>
      <p>We use the following third-party services:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Google Cloud Vision API:</strong> Receipt images are sent to Google&apos;s servers for text extraction.
          Google&apos;s privacy policy applies to this processing. Images are not retained by Google after processing.
        </li>
        <li>
          <strong>Sentry:</strong> Crash reports and error diagnostics may be sent to Sentry. These reports do not
          contain receipt images or personal financial data.
        </li>
        <li>
          <strong>Supabase:</strong> Our database is hosted on Supabase (PostgreSQL). Your data is stored securely with
          row-level security enabled.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-ink">4. Data Storage and Security</h2>
      <p>
        Your data is stored on secure servers with encrypted connections (HTTPS/TLS). Passwords are hashed using bcrypt.
        Authentication tokens are stored securely on your device using the platform&apos;s secure storage (Android
        Keystore).
      </p>
      <p>
        Receipt images are stored on our server infrastructure. We recommend not photographing sensitive information
        beyond what is printed on receipts (e.g., do not include credit card numbers in photos).
      </p>

      <h2 className="text-xl font-bold text-ink">5. Data Retention and Deletion</h2>
      <p>
        Your receipt data is retained as long as your account is active. You may delete individual receipts within the
        app at any time. To request complete account deletion, contact us at the email below.
      </p>

      <h2 className="text-xl font-bold text-ink">6. Data Sharing</h2>
      <p>
        We do not sell, rent, or share your personal information with third parties for marketing purposes. Your receipt
        images and data are only shared with Google Cloud Vision for OCR processing as described above.
      </p>

      <h2 className="text-xl font-bold text-ink">7. Children&apos;s Privacy</h2>
      <p>
        Receipt Radar is not intended for use by children under 13. We do not knowingly collect information from children
        under 13.
      </p>

      <h2 className="text-xl font-bold text-ink">8. Your Rights</h2>
      <p>You have the right to:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Access your receipt data (available through the app and export features)</li>
        <li>Delete your receipt data (available through the app)</li>
        <li>Request account deletion</li>
        <li>Opt out of crash reporting (by not granting analytics permissions)</li>
      </ul>

      <h2 className="text-xl font-bold text-ink">9. Changes to This Policy</h2>
      <p>
        We may update this privacy policy from time to time. We will notify users of material changes through the app or
        via email.
      </p>

      <h2 className="text-xl font-bold text-ink">10. Contact Us</h2>
      <p>If you have questions about this privacy policy or your data, please contact us at:</p>
      <p><strong>Email:</strong> jolman009@gmail.com</p>

      <div className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-400">
        &copy; 2026 Receipt Radar. All rights reserved.
      </div>
    </div>
  </div>
);
