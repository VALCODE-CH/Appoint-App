# VALCODE Appoint - Release Checklist ✅

## Pre-Build Checks

- [x] App-Name geändert zu "VALCODE Appoint"
- [x] Bundle-IDs aktualisiert (com.valcode.appoint)
- [x] TypeScript kompiliert ohne Fehler
- [x] Alle Features funktionieren:
  - [x] Dashboard mit funktionierenden Widgets
  - [x] Termine (Liste + Detail + Erstellen)
  - [x] Kunden (Liste + Detail mit Permissions)
  - [x] Mitarbeiter (Liste + Detail)
  - [x] Dienstleistungen (Liste + Detail)
  - [x] Einstellungen (Profil bearbeiten mit API)
  - [x] Smooth Swipe-Navigation mit Animationen
  - [x] Haptic Feedback
  - [x] Permissions-System

## Build Commands

### iOS Production Build
```bash
eas build --platform ios --profile production
```

### Android Production Build
```bash
eas build --platform android --profile production
```

### Beide Plattformen
```bash
eas build --platform all --profile production
```

## Post-Build

### iOS App Store
1. Warte auf Build-Completion (10-15 Min.)
2. Download .ipa oder direkt submitten
3. Submit: `eas submit --platform ios --profile production`
4. Fülle App Store Informationen aus
5. Submit for Review

### Android Play Store
1. Warte auf Build-Completion (10-15 Min.)
2. Download .aab
3. Submit: `eas submit --platform android --profile production`
4. Fülle Play Store Informationen aus
5. Submit for Review

## App Store Assets (benötigt)

### Screenshots
- iPhone 6.7" (1290 x 2796 px)
- iPhone 6.5" (1242 x 2688 px)
- iPad Pro 12.9" (2048 x 2732 px)

### Texte
- **App Name**: VALCODE Appoint
- **Subtitle**: Terminverwaltung für Ihr Business
- **Description**: (siehe App Store Connect)
- **Keywords**: Termine, Terminverwaltung, Booking, Kalender, Business

## Version Info
- Version: 1.0.0
- Build: 1
- Release Notes: Initial Release

## Ready to Build! 🚀
