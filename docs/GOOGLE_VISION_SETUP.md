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

### 2. Enable the Vision API

```bash
# Enable the Vision API for your project
gcloud services enable vision.googleapis.com
```

Or via Console:
- Go to APIs & Services → Library
- Search for "Cloud Vision API"
- Click on it and press "ENABLE"

### 3. Create a Service Account

```bash
# Create a service account
gcloud iam service-accounts create receipt-ocr-app \
  --display-name="Receipt OCR Application"

# Verify it was created
gcloud iam service-accounts list
```

Or via Console:
- Go to APIs & Services → Service Accounts
- Click "CREATE SERVICE ACCOUNT"
- Fill in details:
  - Service account name: `receipt-ocr-app`
  - Display name: `Receipt OCR Application`
- Click "CREATE AND CONTINUE"

### 4. Grant Vision API Permissions

```bash
# Get your GCP project ID
export PROJECT_ID=$(gcloud config get-value project)

# Grant the Vision API User role to the service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:receipt-ocr-app@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/vision.documentAnalyzer"
```

Or via Console:
- Go to APIs & Services → Service Accounts
- Click on `receipt-ocr-app`
- Go to "IAM & Admin" → click "Grant Access"
- Add principal: `receipt-ocr-app@PROJECT_ID.iam.gserviceaccount.com`
- Role: `Cloud Vision API User` or `Document Analyzer`
- Click "SAVE"

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
- Go to APIs & Services → Service Accounts
- Click on `receipt-ocr-app`
- Go to "Keys" tab
- Click "Add Key" → "Create new key"
- Select "JSON"
- Click "CREATE" (file downloads automatically)

### 6. Configure Environment Variables

Move the key file to a secure location (recommended: outside the repository):

```bash
# Linux/macOS
mv receipt-ocr-key.json ~/.config/gcp/receipt-ocr-key.json
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/gcp/receipt-ocr-key.json"

# Windows PowerShell
mv receipt-ocr-key.json "$env:APPDATA\gcp\receipt-ocr-key.json"
$env:GOOGLE_APPLICATION_CREDENTIALS = "$env:APPDATA\gcp\receipt-ocr-key.json"
```

### 7. Update Your `.env` File

Edit `apps/api/.env` and set:

```env
OCR_PROVIDER="google-vision"
GOOGLE_APPLICATION_CREDENTIALS="/path/to/receipt-ocr-key.json"
GOOGLE_CLOUD_PROJECT="your-project-id-here"
```

Replace:
- `/path/to/receipt-ocr-key.json` with the absolute path to your downloaded key
- `your-project-id-here` with your actual GCP project ID (from `gcloud config get-value project`)

### 8. Test the Setup

Start the API server:

```bash
npm run -w api dev
```

Test with a receipt image:

```bash
curl -X POST http://localhost:4000/api/receipts \
  -F "file=@/path/to/receipt-image.jpg"
```

You should see extracted receipt data in the response.

## Troubleshooting

### Error: `GOOGLE_APPLICATION_CREDENTIALS not found`
- Verify the file path in `.env` is correct and absolute
- Ensure the file exists: `ls "$GOOGLE_APPLICATION_CREDENTIALS"`
- Try running: `gcloud auth application-default login` for alternative authentication

### Error: `Vision API not enabled`
- Re-run: `gcloud services enable vision.googleapis.com`
- Wait a few minutes for API to fully activate
- Check in Console: APIs & Services → Enabled APIs & Services

### Error: `Permission denied` when calling Vision API
- Verify service account has `roles/vision.documentAnalyzer` role
- Check: `gcloud projects get-iam-policy $PROJECT_ID | grep receipt-ocr-app`
- Re-grant permissions using step 4 above

### Error: `Invalid project ID`
- Verify `GOOGLE_CLOUD_PROJECT` matches your actual GCP project ID
- Check: `gcloud config get-value project`

### Testing Locally Without GCP
If you want to test without setting up GCP yet, keep `OCR_PROVIDER="mock"` in `.env`. The mock provider returns test receipt data without needing credentials.

## Security Best Practices

⚠️ **Never commit the service account key file to version control!**

1. Add to `.gitignore`:
   ```
   receipt-ocr-key.json
   apps/api/.env
   ```

2. Store the key file outside your repository (e.g., `~/.config/gcp/`)

3. Rotate keys periodically:
   ```bash
   # List existing keys
   gcloud iam service-accounts keys list \
     --iam-account=receipt-ocr-app@${PROJECT_ID}.iam.gserviceaccount.com

   # Delete old keys (keep only active ones)
   gcloud iam service-accounts keys delete KEY_ID \
     --iam-account=receipt-ocr-app@${PROJECT_ID}.iam.gserviceaccount.com
   ```

## Cost Estimation

Google Cloud Vision API pricing (as of 2024):
- **Free tier:** 1,000 requests/month included
- **Pay-as-you-go:** $0.60 per 1,000 requests after free tier

For production, consider:
- Setting up budget alerts: GCP Console → Billing → Budgets
- Using the `receipt_ocr` project only for this application

## References

- [Google Cloud Vision API Documentation](https://cloud.google.com/vision/docs)
- [Service Account Setup](https://cloud.google.com/docs/authentication#service-accounts)
- [Vision API Python Client Library](https://github.com/googleapis/python-client-libraries)
- [GCP Pricing Calculator](https://cloud.google.com/products/calculator)
