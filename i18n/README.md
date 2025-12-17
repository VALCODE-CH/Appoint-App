# Internationalisierung (i18n) System

Dieses Projekt verwendet **i18next** und **react-i18next** für die Mehrsprachigkeit.

## Struktur

```
i18n/
├── config.ts          # i18n Konfiguration und Initialisierung
└── locales/
    ├── de.json        # Deutsche Übersetzungen
    └── en.json        # Englische Übersetzungen
```

## Verfügbare Sprachen

- **Deutsch (de)** - Standardsprache
- **English (en)**

## Funktionsweise

### Automatische Spracherkennung

Beim ersten App-Start:
1. System prüft, ob eine Sprache in AsyncStorage gespeichert ist
2. Falls nicht, wird die Gerätesprache erkannt
3. Falls Gerätesprache nicht unterstützt wird → Fallback auf Deutsch

### Sprache wechseln

Benutzer können die Sprache in den **Einstellungen** ändern:
1. Navigiere zu Einstellungen
2. Tippe auf "Sprache" / "Language"
3. Wähle die gewünschte Sprache aus dem Modal
4. Die neue Sprache wird sofort angewendet und in AsyncStorage gespeichert

## Verwendung in Komponenten

### 1. Import des useTranslation Hook

```typescript
import { useTranslation } from 'react-i18next';
```

### 2. Hook in Komponente verwenden

```typescript
function MeineKomponente() {
  const { t, i18n } = useTranslation();

  return (
    <View>
      <Text>{t('common.save')}</Text>
      <Text>{t('settings.title')}</Text>
    </View>
  );
}
```

### 3. Verschachtelte Übersetzungen

```typescript
// Zugriff auf verschachtelte Werte mit Punkt-Notation
t('onboarding.welcome.title')
t('settings.profile.errors.nameRequired')
```

### 4. Aktuelle Sprache abrufen

```typescript
const currentLanguage = i18n.language; // 'de' oder 'en'
```

## Neue Übersetzungen hinzufügen

### 1. Text zu Übersetzungsdateien hinzufügen

**de.json:**
```json
{
  "mySection": {
    "myKey": "Mein deutscher Text"
  }
}
```

**en.json:**
```json
{
  "mySection": {
    "myKey": "My english text"
  }
}
```

### 2. In Komponente verwenden

```typescript
<Text>{t('mySection.myKey')}</Text>
```

## Neue Sprache hinzufügen

### 1. Übersetzungsdatei erstellen

Erstelle `i18n/locales/[sprachcode].json` (z.B. `fr.json` für Französisch)

### 2. In config.ts registrieren

```typescript
// Import hinzufügen
import fr from './locales/fr.json';

// In resources hinzufügen
resources: {
  de: { translation: de },
  en: { translation: en },
  fr: { translation: fr },  // Neu
}
```

### 3. Zu verfügbaren Sprachen hinzufügen

```typescript
export const getAvailableLanguages = () => [
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },  // Neu
];
```

## Hilfs-Funktionen

### changeLanguage

```typescript
import { changeLanguage } from '../i18n/config';

// Sprache programmatisch ändern
await changeLanguage('en');
```

### getCurrentLanguage

```typescript
import { getCurrentLanguage } from '../i18n/config';

const currentLang = getCurrentLanguage(); // 'de' oder 'en'
```

### getAvailableLanguages

```typescript
import { getAvailableLanguages } from '../i18n/config';

const languages = getAvailableLanguages();
// [{ code: 'de', name: 'Deutsch' }, { code: 'en', name: 'English' }]
```

## Migration bestehender Texte

Um bestehende hartcodierte deutsche Texte zu ersetzen:

1. Text in beiden Übersetzungsdateien hinzufügen (`de.json` und `en.json`)
2. `useTranslation` Hook importieren
3. Hardcodierten Text durch `t('key')` ersetzen

**Vorher:**
```typescript
<Text>Einstellungen</Text>
```

**Nachher:**
```typescript
const { t } = useTranslation();
<Text>{t('settings.title')}</Text>
```

## Best Practices

1. **Konsistente Struktur**: Gruppiere Übersetzungen logisch nach Screens/Features
2. **Aussagekräftige Keys**: Verwende beschreibende Schlüssel wie `settings.profile.name` statt `text1`
3. **Beide Sprachen pflegen**: Füge neue Texte immer in ALLEN Sprachdateien hinzu
4. **Fallback nutzen**: Deutsch ist die Fallback-Sprache, stelle sicher dass alle Keys vorhanden sind
5. **Keine Duplikate**: Nutze `common` für häufig verwendete Texte wie "Speichern", "Abbrechen"

## Fehlerbehebung

### Text wird nicht übersetzt

- Prüfe ob der Key in beiden Sprachdateien existiert
- Prüfe die Schreibweise des Keys (case-sensitive)
- Prüfe ob `useTranslation()` Hook importiert und verwendet wird

### Sprache wechselt nicht

- App-Neustart kann nötig sein für vollständige Aktualisierung
- Prüfe AsyncStorage ob Sprache gespeichert wurde
- Prüfe Browser-Console auf Fehler

### Gerätsprache wird nicht erkannt

- Stelle sicher dass `expo-localization` korrekt installiert ist
- Fallback auf Deutsch ist gewollt, wenn Gerätesprache nicht unterstützt wird
