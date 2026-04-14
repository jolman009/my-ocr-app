#Requires -Version 5.1
<#
.SYNOPSIS
    End-to-end smoke test for the forwarding-api Phase 2 endpoints.

.DESCRIPTION
    Logs in via apps/api on :4000, then exercises the forwarding-api
    shipment-document pipeline on :4001: upload, list, detail, search.

.PARAMETER Email
    Login email. Defaults to jolman009@yahoo.com.

.PARAMETER Password
    Login password. Prompted securely if not provided.

.PARAMETER ImagePath
    Path to a local JPEG/PNG to upload. A real shipping label makes the
    barcode-decode step meaningful; any image works to smoke-test wiring.

.EXAMPLE
    .\apps\forwarding-api\scripts\smoke-test.ps1 -ImagePath "C:\Users\Jolma\Downloads\test-label.png"
#>

param(
    [string]$Email = "jolman009@yahoo.com",
    [SecureString]$Password,
    [Parameter(Mandatory = $true)]
    [string]$ImagePath,
    [string]$ApiBaseUrl = "http://localhost:4000/api",
    [string]$ForwardingBaseUrl = "http://localhost:4001/forwarding"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ImagePath)) {
    throw "ImagePath '$ImagePath' does not exist."
}

if (-not $Password) {
    $Password = Read-Host -AsSecureString -Prompt "Password for $Email"
}

$plainPassword = [System.Net.NetworkCredential]::new("", $Password).Password

Write-Host "`n--- 1. Login ---" -ForegroundColor Cyan
$loginBody = @{ email = $Email; password = $plainPassword } | ConvertTo-Json
$login = Invoke-RestMethod `
    -Uri "$ApiBaseUrl/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody
$token = $login.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "  OK. Token length: $($token.Length)" -ForegroundColor Green

Write-Host "`n--- 2. Upload ---" -ForegroundColor Cyan
# Invoke-RestMethod -Form requires PowerShell 7+. Use curl.exe (built into
# Windows 10+) for the multipart upload so Windows PowerShell 5.1 works too.
$uploadJson = & curl.exe `
    --silent `
    --show-error `
    --fail-with-body `
    -X POST `
    -H "Authorization: Bearer $token" `
    -F "image=@$ImagePath" `
    "$ForwardingBaseUrl/documents"

if ($LASTEXITCODE -ne 0) {
    Write-Host "  Upload failed. curl exit $LASTEXITCODE. Response body:" -ForegroundColor Red
    Write-Host $uploadJson
    throw "Upload failed."
}

$uploadResult = $uploadJson | ConvertFrom-Json
$doc = $uploadResult.document
"  id:             $($doc.id)"
"  trackingNumber: $($doc.trackingNumber)"
"  carrier:        $($doc.carrier)"
"  barcodeRaw:     $($doc.barcodeRaw)"
"  barcodeFormat:  $($doc.barcodeFormat)"
"  confidence:     $($doc.confidence)"
"  status:         $($doc.status)"
$docId = $doc.id

Write-Host "`n--- 3. List (id | trackingNumber | carrier | status) ---" -ForegroundColor Cyan
$list = Invoke-RestMethod -Uri "$ForwardingBaseUrl/documents" -Headers $headers
$list.data | ForEach-Object { "  $($_.id) | $($_.trackingNumber) | $($_.carrier) | $($_.status)" }
"  (total: $($list.pagination.total))"

Write-Host "`n--- 4. Detail (just tracking fields) ---" -ForegroundColor Cyan
$detail = Invoke-RestMethod -Uri "$ForwardingBaseUrl/documents/$docId" -Headers $headers
"  trackingNumber: $($detail.document.trackingNumber)"
"  carrier:        $($detail.document.carrier)"
"  status:         $($detail.document.status)"
"  confidence:     $($detail.document.confidence)"

Write-Host "`n--- 5. Search for '1Z' ---" -ForegroundColor Cyan
$search = Invoke-RestMethod -Uri "$ForwardingBaseUrl/documents?q=1Z" -Headers $headers
"  total: $($search.pagination.total)"
$search.data | ForEach-Object { "  $($_.id) | $($_.trackingNumber)" }

Write-Host "`nAll checks complete." -ForegroundColor Green
