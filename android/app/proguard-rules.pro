# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native core (required for native module lookup by name)
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keepclassmembers class * { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class * { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }
-keepclassmembers class * { native <methods>; }
-keep class * implements com.facebook.react.ReactPackage { *; }

# SQLite (Categories tab + inventory DB)
-keep class org.pgsqlite.** { *; }
-keep class io.liteglue.** { *; }

# AsyncStorage, FS, Image Picker, Vector Icons (used by Areas/Categories screen)
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keep class com.rnfs.** { *; }
-keep class com.imagepicker.** { *; }
-keep class com.oblador.vectoricons.** { *; }
-keep class fr.bamlab.rnimageresizer.** { *; }

# SafeArea, Screens, Gesture (navigation + AreasScreen)
-keep class com.th3rdwave.safeareacontext.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.reanimated.** { *; }
-keep class org.reactnative.maskedview.** { *; }

# ML Kit (if used elsewhere)
-keep class com.rnmlkit.imagelabeling.** { *; }

# HTML-to-PDF
-keep class com.htmltopdf.** { *; }

# PDFBox (react-native-html-to-pdf) – optional JPX/JP2 decoder not bundled
-dontwarn com.gemalto.jp2.JP2Decoder
-dontwarn com.tom_roush.pdfbox.**
