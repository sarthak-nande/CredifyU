# Quick Java Installation Guide for CredifyU TWA

## Download and Install Java JDK

1. **Download Java JDK 11 or higher**:
   - Go to: https://www.oracle.com/java/technologies/downloads/
   - Choose "Windows" and "x64 Installer"
   - Download the .exe file

2. **Install Java**:
   - Run the downloaded .exe file
   - Follow the installation wizard
   - Default installation path: `C:\Program Files\Java\jdk-11.0.x`

3. **Set Environment Variables**:
   ```powershell
   # Run PowerShell as Administrator and execute:
   
   # Set JAVA_HOME (replace with your actual Java path)
   [System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-11.0.2", [System.EnvironmentVariableTarget]::Machine)
   
   # Get current PATH
   $currentPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::Machine)
   
   # Add Java to PATH
   $newPath = $currentPath + ";%JAVA_HOME%\bin"
   [System.Environment]::SetEnvironmentVariable("PATH", $newPath, [System.EnvironmentVariableTarget]::Machine)
   ```

4. **Restart PowerShell** and verify:
   ```powershell
   java -version
   javac -version
   echo $env:JAVA_HOME
   ```

## Alternative: Use OpenJDK (Free)

1. **Download OpenJDK**:
   - Go to: https://jdk.java.net/
   - Download the latest LTS version (Windows ZIP)

2. **Extract and Set Path**:
   - Extract to `C:\Java\jdk-11`
   - Set JAVA_HOME to `C:\Java\jdk-11`
   - Add `C:\Java\jdk-11\bin` to PATH

## After Java Installation

Run these commands to continue TWA setup:

```powershell
# Navigate to project
cd "C:\Users\91902\Desktop\vc-project"

# Initialize TWA
npm run twa:init

# Build TWA
npm run twa:build
```

## Troubleshooting

- **"java not recognized"**: Restart PowerShell after setting environment variables
- **Permission denied**: Run PowerShell as Administrator when setting environment variables
- **Path issues**: Verify JAVA_HOME points to JDK directory (not JRE)

## Quick Test Script

Save this as `test-java.bat`:

```batch
@echo off
echo Testing Java installation...
java -version
echo.
echo JAVA_HOME: %JAVA_HOME%
echo.
echo If Java version appears above, Java is properly installed.
pause
```
