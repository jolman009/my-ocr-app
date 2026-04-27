# Google Cloud Vision API Setup Guide

This guide walks you through setting up Google Cloud Vision API for the OCR provider in the Receipt OCR application.

## Prerequisites

- A Google Cloud Platform (GCP) account ([create one here](https://cloud.google.com))
- `gcloud` CLI installed ([installation guide](https://cloud.google.com/sdk/docs/install))
- Permission to create GCP projects and service accounts

## Step-by-Step Setup

### 1. Create a GCP Project

```bash
# Set your desired project name
export PROJECT_NAME="receipt-ocr"

# Create the project
gcloud projects create $PROJECT_NAME --set-as-default
```

Or use the GCP Console:
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Click the project dropdown at the top
- Click "NEW PROJECT"
- Enter project name (e.g., "receipt-ocr")
- Click "CREATE"

### 2. Enable Billing

A billing account must be linked to your project before you can enable APIs.

- Go to [Billing](https://console.cloud.google.com/billing) in the Console
- Link a billing account to your project (the free tier covers 1,000 Vision API requests/month)

### 3. Enable the Vision API

```bash
# Enable the Vision API for your project
gcloud services enable vision.googleapis.com
```

Or via Console:
- Go to **APIs & Services → Library**
- Search for "Cloud Vision API"
- Click on it and press "ENABLE"

> **Note:** It may take a minute or two for the API to fully activate after enabling.

### 4. Create a Service Account

```bash
# Create a service account
gcloud iam service-accounts create receipt-ocr-app \
  --display-name="Receipt OCR Application"

# Verify it was created
gcloud iam service-accounts list
```

Or via Console:
- Go to **IAM & Admin → Service Accounts**
- Click "CREATE SERVICE ACCOUNT"
- Fill in details:
  - Service account name: `receipt-ocr-app`
  - Display name: `Receipt OCR Application`
- Click "CREATE AND CONTINUE"
- Skip the optional role/access steps (no special IAM role is needed — the Vision API is authorized at the API level, not via IAM roles)
- Click "DONE"

### 5. Create and Download Service Account Key

```bash
# Get your project ID
export PROJECT_ID=$(gcloud config get-value project)

# Create a JSON key for the service account
gcloud iam service-accounts keys create receipt-ocr-key.json \
  --iam-account=receipt-ocr-app@${PROJECT_ID}.iam.gserviceaccount.com

# Verify the key was created
ls receipt-ocr-key.json
```

Or via Console:
- Go to **IAM & Admin → Service Accounts**
- Click on `receipt-ocr-app`
- Go to the "Keys" tab
- Click "Add Key" → "Create new key"
- Select "JSON"
- Click "CREATE" (the file downloads automatically)

### 6. Store the Key File Securely

Move the key file to a secure location **outside the repository**:

**Linux/macOS:**
```bash
mkdir -p ~/.config/gcp
mv receipt-ocr-key.json ~/.config/gcp/receipt-ocr-key.json
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "$env:APPDATA\gcp"
Move-Item receipt-ocr-key.json "$env:APPDATA\gcp\receipt-ocr-key.json"
```

### 7. Update Your `.env` File

Edit `apps/api/.env` and set:

```env
OCR_PROVIDER="google-vision"
GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/receipt-ocr-key.json"
```

Replace `/absolute/path/to/receipt-ocr-key.json` with the actual absolute path to your key file:
- **Linux/macOS:** e.g., `/home/youruser/.config/gcp/receipt-ocr-key.json`
- **Windows:** e.g., `C:\Users\YourUser\AppData\Roaming\gcp\receipt-ocr-key.json`

> **Note:** `GOOGLE_CLOUD_PROJECT` is not required — the project ID is read from the key file automatically.

### 8. Test the Setup

Start the API server:

```bash
npm run dev:api
```

Test with a receipt image:

```bash
curl -X POST http://localhost:4000/api/receipts \
  -F "file=@/path/to/receipt-image.jpg"
```

You should see extracted receipt data in the response.

## Troubleshooting

### Error: `Could not load the default credentials`
- Verify `GOOGLE_APPLICATION_CREDENTIALS` in `apps/api/.env` is set to the correct **absolute** path
- Ensure the key file exists at that path
- Make sure the `.env` file is being loaded — check that `apps/api/.env` exists (not just the root `.env.example`)
- Alternative: run `gcloud auth application-default login` to authenticate with your user account instead of a service account

### Error: `Cloud Vision API has not been used in project ... before or it is disabled`
- Re-run: `gcloud services enable vision.googleapis.com`
- Wait a few minutes for the API to fully activate
- Verify in Console: **APIs & Services → Enabled APIs & Services**
- Ensure billing is enabled on the project

### Error: `Permission denied` or `403`
- Confirm the API is enabled (see above)
- Verify the service account key file belongs to the correct project
- Check: `gcloud services list --enabled | grep vision`

### Error: `Invalid value at 'image'`
- Ensure the uploaded file is a valid image (JPEG, PNG, or WebP)
- Check that the file isn't corrupted or empty

### Testing Locally Without GCP
If you want to test without setting up GCP, keep `OCR_PROVIDER="mock"` in `.env`. The mock provider returns test receipt data without needing any credentials.

## Security Best Practices

**Never commit the service account key file to version control!**

1. The `.gitignore` already excludes key files — verify it contains:
   ```
   *.json (service account keys)
   apps/api/.env
   ```

2. Store the key file outside your repository (e.g., `~/.config/gcp/`)

3. Rotate keys periodically:
   ```bash
   export PROJECT_ID=$(gcloud config get-value project)

   # List existing keys
   gcloud iam service-accounts keys list \
     --iam-account=receipt-ocr-app@${PROJECT_ID}.iam.gserviceaccount.com

   # Delete old keys (replace KEY_ID with the actual key ID)
   gcloud iam service-accounts keys delete KEY_ID \
     --iam-account=receipt-ocr-app@${PROJECT_ID}.iam.gserviceaccount.com
   ```

4. For production, consider [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation) instead of key files.

## Cost Estimation

Google Cloud Vision API pricing:
- **Free tier:** 1,000 requests/month included
- **Pay-as-you-go:** $1.50 per 1,000 requests (document text detection) after free tier

For production, consider:
- Setting up budget alerts: **GCP Console → Billing → Budgets & alerts**
- Using a dedicated project for this application to isolate costs

## References

- [Google Cloud Vision API Documentation](https://cloud.google.com/vision/docs)
- [Node.js Client Library for Vision](https://github.com/googleapis/nodejs-vision)
- [Service Account Authentication](https://cloud.google.com/docs/authentication/provide-credentials-adc#local-key)
- [GCP Pricing Calculator](https://cloud.google.com/products/calculator)
