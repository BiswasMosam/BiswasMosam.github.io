# Converting Your Portfolio Website to an Android APK

Your website is now configured as a **Progressive Web App (PWA)**! Here are multiple ways to convert it to an APK:

## ✅ What's Been Added

1. **manifest.json** - App configuration and metadata
2. **service-worker.js** - Offline functionality
3. **PWA meta tags** - Mobile app capabilities

## 📱 Method 1: PWABuilder (Recommended - Easiest)

1. Visit [https://www.pwabuilder.com/](https://www.pwabuilder.com/)
2. Enter your website URL: `https://www.mosambiswas.me/`
3. Click "Start" and wait for analysis
4. Click "Package For Stores"
5. Select "Android" and click "Generate"
6. Download the APK file
7. **Install on phone**: Transfer APK to your phone and install (enable "Install from unknown sources" in settings)

**Pros**: Fast, no coding required, automatic updates
**Cons**: Requires your site to be live on the internet

## 📱 Method 2: Bubblewrap (Google's Official Tool)

Install and run Bubblewrap CLI:

```bash
# Install Node.js first if you haven't
npm install -g @bubblewrap/cli

# Initialize your project
bubblewrap init --manifest=https://www.mosambiswas.me/manifest.json

# Build the APK
bubblewrap build

# The APK will be in the app-release-signed.apk file
```

**Pros**: Official Google tool, trusted, customizable
**Cons**: Requires Node.js and some technical knowledge

## 📱 Method 3: Android Studio WebView App

Create a native Android app with WebView:

1. Install [Android Studio](https://developer.android.com/studio)
2. Create a new project: "Empty Activity"
3. Replace MainActivity content with WebView code
4. Build APK: Build → Build Bundle(s) / APK(s) → Build APK(s)

**Sample WebView Code (MainActivity.java)**:

```java
WebView webView = findViewById(R.id.webview);
webView.setWebViewClient(new WebViewClient());
webView.getSettings().setJavaScriptEnabled(true);
webView.loadUrl("https://www.mosambiswas.me/");
```

**Pros**: Full control, native features
**Cons**: Most complex, requires Android development knowledge

## 📱 Method 4: Apache Cordova

```bash
# Install Cordova
npm install -g cordova

# Create project
cordova create MosamPortfolio com.mosambiswas.portfolio "Mosam Biswas"

# Copy your website files to www/ folder
# Add Android platform
cordova platform add android

# Build APK
cordova build android

# APK location: platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

## 🎯 Quick Start (For Testing)

If you want to test the PWA right now without creating an APK:

1. Deploy your website to GitHub Pages (it's already configured)
2. Open the website on your Android phone using Chrome
3. Tap the menu (⋮) → "Add to Home Screen"
4. The website will install like an app!

## 📋 Requirements Before Building APK

- ✅ Your website must be served over HTTPS (already done via GitHub Pages)
- ✅ manifest.json must be accessible (already added)
- ✅ Service worker must be registered (already added)
- ✅ Icons should be 192x192 and 512x512 (update `/favicon.png` with proper sizes)

## 🔧 Icon Recommendations

For best results, create these icon sizes:

- 192x192 pixels
- 512x512 pixels
- 1024x1024 pixels (for Play Store if you want to publish)

You can use tools like:

- [Favicon Generator](https://realfavicongenerator.net/)
- [PWA Icon Generator](https://www.pwabuilder.com/)

## 📤 Publishing to Play Store (Optional)

After creating your APK:

1. Sign up for [Google Play Console](https://play.google.com/console) ($25 one-time fee)
2. Create a signed APK (not debug version)
3. Upload and publish

## 🚀 Recommended Path

**For quick testing**: Use the "Add to Home Screen" feature
**For sharing with others**: Use **PWABuilder** (Method 1) - takes 5 minutes!
**For Play Store**: Use **Bubblewrap** (Method 2) - official and trusted

## 📝 Notes

- The PWA will work offline after first visit
- Users can install directly from Chrome without an APK
- APK size will be very small (< 5MB) since it's mostly a wrapper
- The app will always load the latest version from your website

## Need Help?

If you encounter issues, check:

1. Your website is accessible via HTTPS
2. manifest.json is loading correctly (check browser console)
3. Service worker is registered (check Chrome DevTools → Application → Service Workers)

Good luck! 🎉
