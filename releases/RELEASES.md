# Pet2Vet — App Release History

All app builds are tracked here. Each release follows semantic versioning: `MAJOR.MINOR.PATCH`.

---

## Current Versions

| Platform | Version | Build Type | File | Date |
|----------|---------|-----------|------|------|
| Android | 1.1 | Release (signed) | `releases/android/pet2vet_v1.1_release.apk` | 2026-04-18 |
| Android | 1.0.0 | Debug | `android/Pet2Vet-v1.0.0-debug.apk` | 2026-04-05 |
| iOS | — | Not yet built | Requires Mac with Xcode | — |

---

## Version History

### v1.1 — 2026-04-18 (UI/UX Audit + Mobile Must-Haves + Release Signing)

**What's new:**
- Full UI/UX audit against WCAG 2.1 AA, Apple HIG, and Material 3 guidelines
- Mobile must-haves: 44px touch targets, safe area insets, sticky CTAs, haptic feedback
- Offline detection banner
- Breadcrumb navigation on key pages
- Form progress indicators for multi-step forms
- Keyboard-appropriate input modes (tel, decimal)
- Release signing with APK Signature Scheme v2 (fixes Google Play Protect blocking)

**Build details:**
- Capacitor 8.3.0
- Android target: API 36, Min SDK: 24 (Android 7.0+)
- Signed with v2 APK Signature Scheme
- Universal build (all CPU architectures)
- App ID: `app.pet2vet.mvp`
- versionCode: 2, versionName: 1.1

---

### v1.0.0 — 2026-04-05 (Initial Native Build)

**What's included:**
- Vet search (PawPoint clinics + Google Places)
- Pet park search (Google Places)
- Pet shop search (Google Places)
- Homepage with Vets / Pet Parks / Pet Shops toggle
- Clinic profiles and appointment booking
- Vet and Pet Owner dashboards
- Push notification service (ready for future use)
- Camera utility (ready for future use)
- Platform detection (web vs native)

**Capacitor plugins:**
- Camera, Geolocation, Haptics, Local Notifications, Push Notifications, Share, Status Bar

**Build details:**
- Capacitor 8.3.0
- Android target: API 36
- Min SDK: set by Capacitor default
- App ID: `app.pet2vet.mvp`

---

## Naming Convention

```
Pet2Vet-v{VERSION}-{BUILD_TYPE}.{ext}

Examples:
  Pet2Vet-v1.0.0-debug.apk       (Android debug)
  Pet2Vet-v1.0.0-release.apk     (Android signed release)
  Pet2Vet-v1.0.0-release.aab     (Android App Bundle for Play Store)
  Pet2Vet-v1.0.0-release.ipa     (iOS release for App Store)
```

---

## How to Build

### Android Debug APK
```bash
npm run build:mobile
# APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

### Android Release APK (requires signing key)
```bash
cd android
./gradlew assembleRelease
# APK at: android/app/build/outputs/apk/release/app-release.apk
```

### iOS (requires Mac with Xcode)
```bash
npm run build:mobile
npm run open:ios
# Build and archive in Xcode
```

---

## Notes

- Debug APKs can be installed directly on any Android device
- Release APKs require a signing key (keystore) for Play Store distribution
- iOS builds require a Mac with Xcode and an Apple Developer account
- Always copy the built APK/IPA to this `releases/` folder with the version number before distributing
