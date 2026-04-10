# Pet2Vet — App Release History

All app builds are tracked here. Each release follows semantic versioning: `MAJOR.MINOR.PATCH`.

---

## Current Versions

| Platform | Version | Build Type | File | Date |
|----------|---------|-----------|------|------|
| Android | 1.0.0 | Debug | `android/Pet2Vet-v1.0.0-debug.apk` | 2026-04-05 |
| iOS | — | Not yet built | Requires Mac with Xcode | — |

---

## Version History

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
