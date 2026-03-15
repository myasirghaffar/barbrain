# Building release APK for Barlytics

Use this to build an APK that talks to the **live backend** (`https://barlytics-backend.techverseo.com`). In release builds the app uses the live URL by default.

## Prerequisites

- **Node.js** (v20+)
- **JDK 17** (e.g. from [Adoptium](https://adoptium.net/) or Android Studio’s bundled JDK at `C:\Program Files\Android\Android Studio\jbr`)
- **Android SDK** – install via [Android Studio](https://developer.android.com/studio) and set `ANDROID_HOME` if needed
- **Internet** – Gradle must be able to reach Maven (`repo.maven.apache.org`)

## Option 1: PowerShell script (Windows)

From the `barlytics` folder (project root):

```powershell
.\scripts\build-release-apk.ps1
```

The script will try to find a JDK (including Android Studio’s) and then bundle JS and run `assembleRelease`.

## Option 2: Manual steps

1. **Set JDK (Windows)**  
   If you don’t have `JAVA_HOME` set, use Android Studio’s JDK:
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
   ```

2. **Bundle JavaScript**
   ```powershell
   npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
   ```

3. **Build APK**
   ```powershell
   cd android
   .\gradlew.bat assembleRelease
   ```

## Output

The APK is generated at:

```
android/app/build/outputs/apk/release/app-release.apk
```

Copy this file to your Android device and install it (enable “Install from unknown sources” if required). The app will use the live backend by default in this build.

## Troubleshooting

- **“No Java compiler found”** – Install a full **JDK 17** (not only JRE) and set `JAVA_HOME` to its root, or use Android Studio’s JDK as above.
- **“No such host is known (repo.maven.apache.org)”** – Check internet, firewall, proxy, or VPN so Gradle can reach Maven.
- **Gradle cache errors** – Stop daemons and clear cache:
  ```powershell
  cd android; .\gradlew.bat --stop
  Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches\8.13\transforms" -ErrorAction SilentlyContinue
  ```
