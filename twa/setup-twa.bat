@echo off
echo CredifyU TWA Setup Script
echo =======================

echo.
echo Step 1: Checking Prerequisites...

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm not found. Please ensure Node.js is properly installed.
    pause
    exit /b 1
)

echo.
echo Step 2: Installing Java JDK...
echo Please install Java JDK 8 or higher from:
echo https://www.oracle.com/java/technologies/downloads/
echo.
echo After installation, set JAVA_HOME environment variable.
echo Example: JAVA_HOME=C:\Program Files\Java\jdk-11.0.2
echo.

echo.
echo Step 3: Installing Android SDK...
echo Android SDK found at: %ANDROID_HOME%
if "%ANDROID_HOME%"=="" (
    echo ERROR: ANDROID_HOME not set. Please install Android Studio or Android SDK.
    echo Download from: https://developer.android.com/studio
    pause
    exit /b 1
)

echo.
echo Step 4: Installing Bubblewrap CLI...
call npm install -g @bubblewrap/cli
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Bubblewrap CLI.
    echo Trying alternative installation method...
    call npm install --save-dev @bubblewrap/cli
)

echo.
echo Step 5: Initializing TWA Project...
cd ..\twa
call npx @bubblewrap/cli init --manifest=twa-manifest.json

echo.
echo Step 6: Building TWA...
call npx @bubblewrap/cli build

echo.
echo TWA Setup Complete!
echo The APK file should be generated in the twa directory.
echo.
pause
