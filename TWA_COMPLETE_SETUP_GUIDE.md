# CredifyU Android TWA Setup Guide

## Prerequisites Setup

### 1. Java JDK Installation

1. **Download Java JDK 8 or higher**:
   - Go to [Oracle JDK Downloads](https://www.oracle.com/java/technologies/downloads/)
   - Download Java SE Development Kit for Windows

2. **Install Java JDK**:
   - Run the installer and follow the setup wizard
   - Note the installation path (usually `C:\Program Files\Java\jdk-11.0.x`)

3. **Set Environment Variables**:
   ```powershell
   # Set JAVA_HOME
   [System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-11.0.2", [System.EnvironmentVariableTarget]::Machine)
   
   # Add Java to PATH
   $currentPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::Machine)
   $newPath = $currentPath + ";%JAVA_HOME%\bin"
   [System.Environment]::SetEnvironmentVariable("PATH", $newPath, [System.EnvironmentVariableTarget]::Machine)
   ```

4. **Verify Installation**:
   ```powershell
   java -version
   javac -version
   ```

### 2. Android SDK Setup

Your Android SDK is already installed at: `C:\Users\91902\AppData\Local\Android\Sdk`

1. **Set ANDROID_HOME**:
   ```powershell
   [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\91902\AppData\Local\Android\Sdk", [System.EnvironmentVariableTarget]::Machine)
   ```

2. **Add Android tools to PATH**:
   ```powershell
   $currentPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::Machine)
   $newPath = $currentPath + ";%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin"
   [System.Environment]::SetEnvironmentVariable("PATH", $newPath, [System.EnvironmentVariableTarget]::Machine)
   ```

### 3. Bubblewrap CLI Installation

Choose one of these methods:

#### Method A: Global Installation
```powershell
npm install -g @bubblewrap/cli
```

#### Method B: Local Installation (Recommended)
```powershell
# In the project root
npm install --save-dev @bubblewrap/cli

# Use with npx
npx @bubblewrap/cli --help
```

## TWA Build Process

### Step 1: Initialize TWA Project
```powershell
cd twa
npx @bubblewrap/cli init --manifest=twa-manifest.json
```

### Step 2: Build TWA
```powershell
npx @bubblewrap/cli build
```

### Step 3: Generate Signed APK for Production
```powershell
# Generate signing key
keytool -genkey -v -keystore credifyu-release-key.keystore -alias credifyu -keyalg RSA -keysize 2048 -validity 10000

# Build signed APK
npx @bubblewrap/cli build --release
```

## Troubleshooting

### Common Issues

1. **"bubblewrap not recognized"**:
   - Use `npx @bubblewrap/cli` instead of `bubblewrap`
   - Ensure Node.js and npm are properly installed

2. **"JAVA_HOME not set"**:
   - Install Java JDK and set environment variables
   - Restart PowerShell/Command Prompt after setting variables

3. **"Android SDK not found"**:
   - Set ANDROID_HOME environment variable
   - Install Android Studio or standalone Android SDK

4. **Permission Errors**:
   - Run PowerShell as Administrator
   - Set execution policy: `Set-ExecutionPolicy RemoteSigned`

### Environment Variables Check
```powershell
# Check all required environment variables
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Java: $env:JAVA_HOME"
echo "Android: $env:ANDROID_HOME"
```

## Quick Setup Commands

If all prerequisites are installed, run these commands:

```powershell
# Navigate to TWA directory
cd twa

# Install Bubblewrap locally
npm install --save-dev @bubblewrap/cli

# Initialize TWA
npx @bubblewrap/cli init --manifest=twa-manifest.json

# Build TWA
npx @bubblewrap/cli build
```

## Final Steps for Google Play Store

1. **Test the APK**:
   - Install on Android device: `adb install app-release-signed.apk`
   - Test all functionality

2. **Prepare for Store**:
   - Generate signed APK with proper keystore
   - Create store listing with screenshots
   - Upload to Google Play Console

3. **Digital Asset Links**:
   - Upload `assetlinks.json` to your website root
   - Verify domain ownership in Google Play Console

## Package.json Scripts

The following scripts are already added to your package.json:

```json
{
  "scripts": {
    "twa:init": "cd twa && npx @bubblewrap/cli init --manifest=twa-manifest.json",
    "twa:build": "cd twa && npx @bubblewrap/cli build",
    "twa:install": "npm install --save-dev @bubblewrap/cli"
  }
}
```

Run with: `npm run twa:install && npm run twa:init && npm run twa:build`
