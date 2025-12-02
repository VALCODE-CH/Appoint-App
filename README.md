# Appoint App - React Native

Eine mobile Termin-Management-App für Salons und Dienstleister, entwickelt mit React Native und Expo.

## 🚀 Erste Schritte

### Voraussetzungen

- Node.js (Version 18 oder höher)
- npm oder yarn
- Expo Go App auf deinem Smartphone (iOS oder Android)

### Installation

Die Dependencies sind bereits installiert. Falls du sie erneut installieren musst:

```bash
npm install
```

### App starten

1. **Entwicklungsserver starten:**
   ```bash
   npm start
   ```

2. **Auf deinem Gerät testen:**
   - Installiere die [Expo Go App](https://expo.dev/go) auf deinem Smartphone
   - Scanne den QR-Code, der im Terminal angezeigt wird
   - Die App wird auf deinem Gerät geladen

3. **Alternative Befehle:**
   ```bash
   npm run android  # Android Emulator
   npm run ios      # iOS Simulator (nur auf macOS)
   npm run web      # Im Browser testen
   ```

## 📱 Features

- **Dashboard**: Übersicht über Termine, Umsätze und Statistiken
- **Mitarbeiter-Verwaltung**: Personal verwalten und Details anzeigen
- **Service-Liste**: Dienstleistungen mit Preisen und Dauer
- **Kunden-Verwaltung**: Kundendaten und Besuchshistorie
- **Termin-Buchungen**: Terminverwaltung und Status-Tracking
- **Einstellungen**: App-Konfiguration und Geschäftsprofil

## 🏗️ Projektstruktur

```
Appoint-App/
├── App.tsx                 # Hauptkomponente mit Navigation
├── components/            # React Native Komponenten
│   ├── Dashboard.tsx
│   ├── StaffList.tsx
│   ├── StaffDetail.tsx
│   ├── ServicesList.tsx
│   ├── CustomersList.tsx
│   ├── Appointments.tsx
│   └── Settings.tsx
├── assets/               # Bilder und Icons
├── app.json             # Expo Konfiguration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript Konfiguration
```

## 🎨 Design

Die App verwendet ein dunkles Theme mit:
- Hintergrundfarbe: `#121212`
- Kartenfarbe: `#1E1E1E`
- Primärfarbe: `#7C3AED` (Lila)
- Icons: Ionicons von @expo/vector-icons

## 📝 Nächste Schritte

### Assets hinzufügen

Du musst noch App-Icons und Splash-Screens erstellen:

1. **Icon** (1024x1024 PNG): `assets/icon.png`
2. **Splash Screen** (1284x2778 PNG): `assets/splash.png`
3. **Adaptive Icon** (1024x1024 PNG): `assets/adaptive-icon.png`
4. **Favicon** (48x48 PNG): `assets/favicon.png`

Du kannst Online-Tools wie [Icon Kitchen](https://icon.kitchen/) verwenden.

### Backend anbinden

Aktuell verwendet die App statische Daten. Für eine produktive App solltest du:

1. Ein Backend (z.B. Firebase, Supabase, oder eigene API) einrichten
2. Authentifizierung implementieren
3. Datenverwaltung mit einer Datenbank verbinden
4. API-Calls für CRUD-Operationen hinzufügen

### Weitere Features

- Push-Benachrichtigungen für Termine
- Kalender-Integration
- Bezahlsystem-Integration
- Offline-Modus mit lokaler Datenspeicherung
- Berichte und Analytics

## 🔧 Troubleshooting

**Problem: App lädt nicht auf dem Gerät**
- Stelle sicher, dass Smartphone und Computer im gleichen WIFI-Netzwerk sind
- Prüfe, ob der Entwicklungsserver läuft

**Problem: Icons werden nicht angezeigt**
- Die Icons werden automatisch von Expo geladen
- Bei Problemen: `npm start --clear` ausführen

**Problem: TypeScript Fehler**
- `npx tsc --noEmit` zum Überprüfen ausführen
- Falls nötig: `rm -rf node_modules && npm install`

## 📚 Weitere Ressourcen

- [Expo Dokumentation](https://docs.expo.dev/)
- [React Native Dokumentation](https://reactnative.dev/)
- [Ionicons Referenz](https://ionic.io/ionicons)

## 🔄 Migration von Web zu Mobile

Die ursprünglichen Web-Komponenten (mit HTML/CSS) wurden gesichert als `*.web.tsx.backup`.
Die neuen React Native Komponenten verwenden:
- `View` statt `div`
- `Text` statt `p`, `h1`, etc.
- `StyleSheet` statt CSS/Tailwind
- `TouchableOpacity` statt `button`
- `ScrollView` für scrollbare Inhalte

## 📄 Lizenz

Dieses Projekt wurde mit Figma AI erstellt und zu React Native konvertiert.
