# CredifyU TWA (Trusted Web Activity) Setup Guide

## Overview
This guide will help you convert the CredifyU PWA to a TWA for Android distribution through Google Play Store.

## Prerequisites

### 1. Install Node.js and npm
- Download and install Node.js from https://nodejs.org/
- Verify installation: `node --version` and `npm --version`

### 2. Install Android Studio
- Download from https://developer.android.com/studio
- Install Android SDK and build tools
- Set up ANDROID_HOME environment variable

### 3. Install Java JDK 8 or higher
- Download from https://www.oracle.com/java/technologies/downloads/
- Set up JAVA_HOME environment variable

### 4. Install Bubblewrap CLI
```bash
npm install -g @bubblewrap/cli
```

## TWA Build Process

### Step 1: Initialize TWA Project
```bash
cd twa
bubblewrap init --manifest=twa-manifest.json
```

### Step 2: Build the TWA
```bash
bubblewrap build
```

### Step 3: Generate Signing Key (for production)
```bash
keytool -genkey -v -keystore credifyu-release-key.keystore -alias credifyu-key -keyalg RSA -keysize 2048 -validity 10000
```

### Step 4: Sign the APK
```bash
bubblewrap build --signingKeyPath=./credifyu-release-key.keystore --signingKeyAlias=credifyu-key
```

## Digital Asset Links

### 1. Create .well-known directory on your server
Create the following file at `https://credifyu.com/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.credifyu.app",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
```

### 2. Get your SHA256 fingerprint
```bash
keytool -list -v -keystore credifyu-release-key.keystore -alias credifyu-key
```

## App Store Preparation

### 1. App Name: CredifyU
### 2. Package Name: com.credifyu.app
### 3. Version: 1.0.0 (Version Code: 1)

### 4. App Description
"CredifyU is a secure digital identity platform that enables students, colleges, and third-party authorities to store, issue, and verify academic credentials through QR-based verification. Store your transcripts, IDs, and certificates securely while maintaining full control over your digital identity."

### 5. App Category
- Primary: Education
- Secondary: Productivity

### 6. Content Rating
- Target Audience: 13+ (suitable for teens and adults)
- No sensitive content

### 7. Privacy Policy
Ensure you have a privacy policy URL: https://credifyu.com/privacy

## Features for Play Store Listing

### Key Features:
- 🔐 Secure credential storage with end-to-end encryption
- 📱 QR code-based verification system
- 🎓 Role-based access (Student, College, Authority)
- 📄 Support for transcripts, IDs, and certificates
- 🌐 Cross-platform compatibility (PWA + Android)
- ⚡ Offline functionality with data sync
- 🔒 Privacy-first approach with local data control

### Screenshots Required:
- Mobile phone screenshots (1080x1920 minimum)
- Tablet screenshots (optional but recommended)
- Feature graphic (1024x500)

## Build Commands

### Development Build
```bash
npm run build:twa:dev
```

### Production Build
```bash
npm run build:twa:prod
```

### Install on Device
```bash
bubblewrap install
```

## Testing

### 1. Test on physical device
```bash
adb install app-release-signed.apk
```

### 2. Test Digital Asset Links
Verify at: https://developers.google.com/digital-asset-links/tools/generator

### 3. Test PWA functionality
Ensure all PWA features work in the TWA wrapper

## Distribution

### 1. Upload to Google Play Console
- Sign in to https://play.google.com/console
- Create new app
- Upload the signed APK
- Fill out store listing
- Submit for review

### 2. Update Process
- Increment version code in twa-manifest.json
- Rebuild and sign
- Upload to Play Console as an update

## Troubleshooting

### Common Issues:
1. **Digital Asset Links not working**
   - Verify assetlinks.json is accessible
   - Check SHA256 fingerprint matches

2. **Build failures**
   - Ensure all dependencies are installed
   - Check Android SDK configuration

3. **App not opening URLs**
   - Verify intent filters in AndroidManifest.xml
   - Test with adb commands

## Support
For technical support, contact: support@credifyu.com
