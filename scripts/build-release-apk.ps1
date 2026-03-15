# Build release APK for Barlytics (Windows)
# Requires: Node.js, JDK 17+, Android SDK (ANDROID_HOME)
# Usage: .\scripts\build-release-apk.ps1   (run from repo root: barlytics\)

$ErrorActionPreference = "Stop"
# Script lives in barlytics/scripts/ so app root is parent of scripts
$rootDir = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path "$rootDir\package.json")) {
    throw "Run this script from barlytics folder or ensure barlytics/scripts/build-release-apk.ps1 exists."
}
Set-Location $rootDir

# Find JDK (must have javac)
$jdkHome = $env:JAVA_HOME
if (-not $jdkHome -or -not (Test-Path "$jdkHome\bin\javac.exe")) {
    $candidates = @(
        "$env:LOCALAPPDATA\Programs\Eclipse Adoptium\jdk-17*",
        "$env:ProgramFiles\Microsoft\jdk-17*",
        "$env:ProgramFiles\Java\jdk-17*",
        "${env:ProgramFiles(x86)}\Android\Android Studio\jbr",
        "$env:ProgramFiles\Android\Android Studio\jbr"
    )
    foreach ($pattern in $candidates) {
        $dir = Get-Item $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($dir -and (Test-Path "$($dir.FullName)\bin\javac.exe")) {
            $jdkHome = $dir.FullName
            break
        }
    }
}
if (-not $jdkHome -or -not (Test-Path "$jdkHome\bin\javac.exe")) {
    Write-Host "JDK 17 not found. Please install JDK 17 and set JAVA_HOME, or install Android Studio (includes JDK)." -ForegroundColor Red
    Write-Host "Download: https://adoptium.net/ or use Android Studio's bundled JDK." -ForegroundColor Yellow
    exit 1
}
$env:JAVA_HOME = $jdkHome
Write-Host "Using JAVA_HOME=$jdkHome" -ForegroundColor Green

# Ensure assets dir exists for bundle
$assetsDir = "$rootDir\android\app\src\main\assets"
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force
}

# Bundle JS for release
Write-Host "Bundling JavaScript..." -ForegroundColor Cyan
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output "$assetsDir\index.android.bundle" --assets-dest "$rootDir\android\app\src\main\res"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Build release APK
Write-Host "Building release APK..." -ForegroundColor Cyan
Push-Location "$rootDir\android"
try {
    .\gradlew.bat assembleRelease
} finally {
    Pop-Location
}
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$apkPath = Get-ChildItem -Path "$rootDir\android\app\build\outputs\apk\release\*.apk" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($apkPath) {
    Write-Host ""
    Write-Host "APK built successfully:" -ForegroundColor Green
    Write-Host "  $($apkPath.FullName)" -ForegroundColor White
    Write-Host "Copy to your device and install to test with the live backend." -ForegroundColor Yellow
} else {
    Write-Host "APK not found in app/build/outputs/apk/release/" -ForegroundColor Yellow
}
