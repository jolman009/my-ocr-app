import { Router } from "express";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy — Receipt Radar</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; background: #f8fafc; line-height: 1.7; }
    .container { max-width: 720px; margin: 0 auto; padding: 48px 24px; }
    h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
    .date { color: #64748b; font-size: 14px; margin-bottom: 32px; }
    h2 { font-size: 20px; font-weight: 700; margin-top: 32px; margin-bottom: 12px; }
    p, li { font-size: 15px; color: #334155; margin-bottom: 12px; }
    ul { padding-left: 20px; margin-bottom: 12px; }
    li { margin-bottom: 6px; }
    a { color: #f97316; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Privacy Policy</h1>
    <p class="date">Effective date: March 18, 2026</p>

    <p>Receipt Radar ("we", "our", or "the app") is a mobile application that helps you digitize and manage paper receipts using optical character recognition (OCR). This policy describes how we collect, use, and protect your information.</p>

    <h2>1. Information We Collect</h2>
    <p><strong>Account information:</strong> When you register, we collect your email address, name, and a hashed password. We never store your password in plain text.</p>
    <p><strong>Receipt images:</strong> When you scan or upload a receipt, the image is sent to our server for OCR processing. We store the image and the extracted text data (merchant name, date, items, totals) in your account.</p>
    <p><strong>Camera and photo access:</strong> The app requests camera permission to capture receipt photos and photo library access to upload existing images. These permissions are used solely for receipt scanning.</p>
    <p><strong>Device information:</strong> We may collect basic device information (OS version, app version) for crash reporting and diagnostics via Sentry.</p>

    <h2>2. How We Use Your Information</h2>
    <ul>
      <li>To process receipt images using Google Cloud Vision OCR and return structured data to you</li>
      <li>To store and display your receipt history within the app</li>
      <li>To enable CSV/Excel export of your receipt data</li>
      <li>To diagnose crashes and improve app stability (via Sentry crash reporting)</li>
      <li>To authenticate your account and protect your data</li>
    </ul>

    <h2>3. Third-Party Services</h2>
    <p>We use the following third-party services:</p>
    <ul>
      <li><strong>Google Cloud Vision API:</strong> Receipt images are sent to Google's servers for text extraction. Google's privacy policy applies to this processing. Images are not retained by Google after processing.</li>
      <li><strong>Sentry:</strong> Crash reports and error diagnostics may be sent to Sentry. These reports do not contain receipt images or personal financial data.</li>
      <li><strong>Supabase:</strong> Our database is hosted on Supabase (PostgreSQL). Your data is stored securely with row-level security enabled.</li>
    </ul>

    <h2>4. Data Storage and Security</h2>
    <p>Your data is stored on secure servers with encrypted connections (HTTPS/TLS). Passwords are hashed using bcrypt. Authentication tokens are stored securely on your device using the platform's secure storage (Android Keystore).</p>
    <p>Receipt images are stored on our server infrastructure. We recommend not photographing sensitive information beyond what is printed on receipts (e.g., do not include credit card numbers in photos).</p>

    <h2>5. Data Retention and Deletion</h2>
    <p>Your receipt data is retained as long as your account is active. You may delete individual receipts within the app at any time. To request complete account deletion, contact us at the email below.</p>

    <h2>6. Data Sharing</h2>
    <p>We do not sell, rent, or share your personal information with third parties for marketing purposes. Your receipt images and data are only shared with Google Cloud Vision for OCR processing as described above.</p>

    <h2>7. Children's Privacy</h2>
    <p>Receipt Radar is not intended for use by children under 13. We do not knowingly collect information from children under 13.</p>

    <h2>8. Your Rights</h2>
    <p>You have the right to:</p>
    <ul>
      <li>Access your receipt data (available through the app and export features)</li>
      <li>Delete your receipt data (available through the app)</li>
      <li>Request account deletion</li>
      <li>Opt out of crash reporting (by not granting analytics permissions)</li>
    </ul>

    <h2>9. Changes to This Policy</h2>
    <p>We may update this privacy policy from time to time. We will notify users of material changes through the app or via email.</p>

    <h2>10. Contact Us</h2>
    <p>If you have questions about this privacy policy or your data, please contact us at:</p>
    <p><strong>Email:</strong> jolman009@gmail.com</p>

    <div class="footer">
      <p>&copy; 2026 Receipt Radar. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

export const privacyRouter = Router();

privacyRouter.get("/", (_req, res) => {
  res.type("html").send(html);
});
