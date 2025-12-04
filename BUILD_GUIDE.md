# VALCODE Appoint - Build & Release Guide

## App-Informationen
- **App Name**: VALCODE Appoint
- **Version**: 1.0.0
- **Bundle ID (iOS)**: com.valcode.appoint
- **Package Name (Android)**: com.valcode.appoint

## Voraussetzungen

1. **EAS CLI installiert**
   ```bash
   npm install -g eas-cli
   ```

2. **Bei EAS anmelden**
   ```bash
   eas login
   ```

## Build-Prozess

### iOS Build (Production)

1. **Build starten**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Build-Status überprüfen**
   - Der Build-Prozess dauert ca. 10-15 Minuten
   - Du erhältst eine E-Mail, wenn der Build fertig ist
   - Link zum Build: https://expo.dev/accounts/[dein-account]/projects/valcode-appoint/builds

### Android Build (Production)

1. **Build starten**
   ```bash
   eas build --platform android --profile production
   ```

2. **APK/AAB herunterladen**
   - Nach erfolgreichem Build erhältst du einen Download-Link
   - Die .aab Datei kann direkt in den Google Play Store hochgeladen werden

### Beide Plattformen gleichzeitig

```bash
eas build --platform all --profile production
```

## App-Submission

### iOS App Store

1. **Build zur Review einreichen**
   ```bash
   eas submit --platform ios --profile production
   ```

2. **Alternativ manuell in App Store Connect**
   - https://appstoreconnect.apple.com
   - Wähle die App aus
   - Lade den Build hoch
   - Fülle alle erforderlichen Informationen aus

### Android Play Store

1. **Build zum Play Store hochladen**
   ```bash
   eas submit --platform android --profile production
   ```

2. **Alternativ manuell in Play Console**
   - https://play.google.com/console
   - Wähle die App aus
   - Lade die .aab Datei hoch

## Preview/Test Builds

### Interner Test Build (iOS & Android)

```bash
eas build --platform all --profile preview
```

Diese Builds können über EAS Updates an Tester verteilt werden, ohne durch den App Store Review-Prozess zu gehen.

## Version aktualisieren

Bei jedem neuen Release:

1. **app.json aktualisieren**
   - `version`: "1.0.1" (oder entsprechend)
   - `ios.buildNumber`: erhöhen (z.B. "2")
   - `android.versionCode`: erhöhen (z.B. 2)

2. **package.json aktualisieren**
   - `version`: "1.0.1" (gleich wie in app.json)

## Troubleshooting

### Build schlägt fehl

1. Prüfe die Build-Logs auf expo.dev
2. Stelle sicher, dass alle Dependencies installiert sind: `npm install`
3. Prüfe TypeScript-Fehler: `npx tsc --noEmit`

### Credential-Probleme (iOS)

```bash
eas credentials
```

### App-Konfiguration neu synchronisieren

```bash
eas build:configure
```

## Wichtige Links

- **EAS Dashboard**: https://expo.dev
- **App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console
- **EAS Build Dokumentation**: https://docs.expo.dev/build/introduction/

## Support

Bei Fragen oder Problemen:
- EAS Docs: https://docs.expo.dev
- Expo Discord: https://chat.expo.dev
