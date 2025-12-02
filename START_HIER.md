# 🚀 Starte deine Appoint App

## ⚡ Jetzt App starten!

```bash
npm start
```

Das startet den Expo Development Server. Im Terminal siehst du:
- Einen **QR-Code**
- Eine **URL** (z.B. exp://192.168.x.x:8081)
- Tastenkombinationen für verschiedene Optionen

## 📱 App auf deinem Smartphone öffnen

### Android
1. Installiere **Expo Go** aus dem Play Store: https://play.google.com/store/apps/details?id=host.exp.exponent
2. Öffne Expo Go
3. Tippe auf "Scan QR code"
4. Scanne den QR-Code aus dem Terminal

### iOS (iPhone)
1. Installiere **Expo Go** aus dem App Store: https://apps.apple.com/app/expo-go/id982107779
2. Öffne die normale **Kamera-App**
3. Scanne den QR-Code
4. Tippe auf die Benachrichtigung um Expo Go zu öffnen

### Im Browser testen (schnell)
```bash
npm run web
```
Öffnet die App unter http://localhost:8081

## 🎯 Was die App kann

- ✅ **Dashboard** mit Statistiken und heutigen Terminen
- ✅ **Mitarbeiterverwaltung** mit Detailansichten
- ✅ **Dienstleistungen** verwalten
- ✅ **Kundenliste** mit Suchfunktion
- ✅ **Terminübersicht** mit Status
- ✅ **Einstellungen** mit Profil

## ⚠️ Wichtig: Assets ersetzen!

Die App verwendet aktuell **minimale Platzhalter-Icons**. Für eine richtige App:

### Option 1: Online-Tool (Empfohlen)
1. Gehe zu https://icon.kitchen/
2. Lade ein Logo/Icon hoch (quadratisch, min. 1024x1024)
3. Passe Farben an (Lila #7C3AED empfohlen)
4. Lade "Web + App Icons" herunter
5. Kopiere die Dateien nach `assets/`

### Option 2: Eigene Icons
Erstelle diese Dateien:
- `assets/icon.png` (1024x1024 px)
- `assets/splash.png` (1284x2778 px)
- `assets/adaptive-icon.png` (1024x1024 px)
- `assets/favicon.png` (48x48 px)

## 🔧 Hilfreiche Befehle im Terminal

Wenn der Dev-Server läuft, drücke:
- **`a`** - Android Emulator öffnen
- **`i`** - iOS Simulator öffnen (nur macOS)
- **`w`** - Im Browser öffnen
- **`r`** - App neu laden
- **`m`** - Dev-Menü umschalten
- **`j`** - Chrome DevTools öffnen

## 🐛 Probleme beheben

### "Unable to resolve module..."
```bash
npm install
npm start --clear
```

### QR-Code funktioniert nicht
- Computer und Smartphone müssen im **gleichen WLAN** sein
- Alternative: Tunnel-Modus verwenden
  ```bash
  npm start --tunnel
  ```

### App lädt sehr langsam
- Beim ersten Start ist das normal (lädt JavaScript-Bundle)
- Danach wird es schneller durch Caching

### Icons werden nicht angezeigt
- Icons werden beim ersten Start automatisch geladen
- Warte ca. 30 Sekunden
- Falls Problem bleibt: App neu starten

## 📝 Nächste Schritte

1. **Echte Icons hinzufügen** (siehe oben)
2. **Backend anbinden** für echte Daten
   - Firebase: `npm install firebase`
   - Supabase: `npm install @supabase/supabase-js`
3. **Features erweitern**
   - Push-Benachrichtigungen
   - Kalender-Integration
   - Bezahlsystem

## 🎨 App anpassen

### Farben ändern
Alle Komponenten verwenden diese Farben:
- Hintergrund: `#121212`
- Karten: `#1E1E1E`
- Primär: `#7C3AED` (Lila)
- Text: `#FFFFFF`, `#9CA3AF`, `#6B7280`

### Neue Screens hinzufügen
1. Erstelle neue Datei in `components/`
2. Importiere in `App.tsx`
3. Füge zum Navigation-Switch hinzu

## 📚 Mehr lernen

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Ionicons](https://ionic.io/ionicons)

## 💡 Tipps

- **Automatisches Neuladen**: Änderungen im Code werden automatisch übernommen
- **Debug-Menü**: Smartphone schütteln für Optionen
- **Logs ansehen**: Terminal zeigt alle `console.log()` Ausgaben

---

**Viel Spaß beim Entwickeln! 🎉**

Bei Fragen: Siehe [GETTING_STARTED.md](GETTING_STARTED.md) für mehr Details
