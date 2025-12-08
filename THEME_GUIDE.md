# Theme System Guide

## Übersicht

Die App unterstützt jetzt zwei Theme-Modi:
- **Standard**: Das aktuelle Design mit den festgelegten Farben (#7C3AED Primary, etc.)
- **Custom**: Farben vom Server über den `/design-settings` Endpoint

## Wie funktioniert es?

### 1. Theme Toggle in Settings
Benutzer können in den Einstellungen zwischen "Standard-Design" und "Custom Design" wechseln. Die Einstellung wird gespeichert und bleibt auch nach App-Neustart erhalten.

### 2. Theme Service
Der `ThemeService` lädt beim App-Start automatisch:
- Das gespeicherte Theme-Mode (standard/custom)
- Bei Custom: Die Farben vom `/design-settings` Endpoint
- Bei Standard: Die hardcodierten Standard-Farben

### 3. Theme Context
Der `ThemeContext` stellt das aktuelle Theme in der ganzen App zur Verfügung.

## Theme in Komponenten verwenden

### Import
```typescript
import { useTheme } from "../contexts/ThemeContext";
```

### Verwendung
```typescript
function MeineKomponente() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>Titel</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
      >
        <Text style={{ color: "#FFFFFF" }}>Button</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});
```

## Verfügbare Theme-Farben

```typescript
interface Theme {
  background: string;        // Haupt-Hintergrund (#121212)
  card: string;             // Card-Hintergrund (#1E1E1E)
  cardSecondary: string;    // Sekundäre Cards (#2A2A2A)
  primary: string;          // Primärfarbe (Standard: #7C3AED, Custom: accent_color)
  primaryLight: string;     // Hellere Primärfarbe
  text: string;             // Haupttext (#FFFFFF)
  textSecondary: string;    // Sekundärtext (#A0A0A0)
  border: string;           // Border (#333333)
  success: string;          // Erfolg (#10B981)
  warning: string;          // Warnung (#F59E0B)
  error: string;            // Fehler (#EF4444)
  shadow: string;           // Shadow-Farbe (Standard: #7C3AED, Custom: accent_color)
}
```

## Beispiele

### Dashboard Widget
```typescript
const { theme } = useTheme();

<View style={[styles.widget, { backgroundColor: theme.card }]}>
  <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
    <Ionicons name="calendar" size={24} color="#FFFFFF" />
  </View>
  <Text style={[styles.label, { color: theme.textSecondary }]}>Heute</Text>
  <Text style={[styles.value, { color: theme.text }]}>12</Text>
</View>
```

### Button mit Primary-Farbe
```typescript
const { theme } = useTheme();

<TouchableOpacity
  style={[
    styles.button,
    {
      backgroundColor: theme.primary,
      shadowColor: theme.shadow
    }
  ]}
>
  <Text style={styles.buttonText}>Speichern</Text>
</TouchableOpacity>
```

### Card mit dynamischen Farben
```typescript
const { theme } = useTheme();

<View style={[
  styles.card,
  {
    backgroundColor: theme.card,
    borderColor: theme.border
  }
]}>
  <Text style={{ color: theme.text }}>Titel</Text>
  <Text style={{ color: theme.textSecondary }}>Beschreibung</Text>
</View>
```

## Migration bestehender Komponenten

### Schritt 1: Import hinzufügen
```typescript
import { useTheme } from "../contexts/ThemeContext";
```

### Schritt 2: Hook verwenden
```typescript
function MeineKomponente() {
  const { theme } = useTheme();
  // ...
}
```

### Schritt 3: Hardcodierte Farben ersetzen
**Vorher:**
```typescript
<View style={{ backgroundColor: "#1E1E1E" }}>
```

**Nachher:**
```typescript
<View style={{ backgroundColor: theme.card }}>
```

### Schritt 4: Hardcodierte Farben aus StyleSheet entfernen
**Vorher:**
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
  },
});
```

**Nachher:**
```typescript
const styles = StyleSheet.create({
  container: {
    // backgroundColor wird inline gesetzt
  },
});

// In der Komponente:
<View style={[styles.container, { backgroundColor: theme.background }]}>
```

## Best Practices

1. **Statische Styles in StyleSheet**: Alles was nicht farbabhängig ist (padding, margin, borderRadius, etc.)
2. **Dynamische Farben inline**: Theme-Farben werden inline mit dem Theme-Objekt gesetzt
3. **Kombiniere beide**: `style={[styles.container, { backgroundColor: theme.card }]}`
4. **Verwende Theme-Variablen**: Nicht `#7C3AED` hardcoden, sondern `theme.primary` verwenden

## Server-seitige Konfiguration

Der `/design-settings` Endpoint gibt folgende Struktur zurück:
```json
{
  "primary_color": "#0f172a",
  "accent_color": "#6366f1",
  "accent_gradient_start": "#667eea",
  "accent_gradient_end": "#764ba2",
  "radius": "14px",
  "font_family": "Inter, system-ui, ..."
}
```

Aktuell werden verwendet:
- `accent_color` → `theme.primary` und `theme.shadow`
- `accent_gradient_start` → `theme.primaryLight`

Die anderen Werte (primary_color, radius, font_family) sind aktuell nicht implementiert, könnten aber später hinzugefügt werden.

## App-Neustart nach Theme-Änderung

Nach einem Theme-Wechsel zeigt die App einen Alert:
> "Bitte starte die App neu, damit die Änderungen vollständig angewendet werden."

Das ist notwendig, weil:
1. Nicht alle Komponenten den ThemeContext verwenden (noch)
2. Einige Styles beim Component-Mount berechnet werden
3. Eine vollständige Neuinitialisierung sicherstellt, dass alles korrekt dargestellt wird

## Nächste Schritte (Optional)

Um das Theme-System vollständig zu machen, könnten folgende Komponenten migriert werden:
- Dashboard.tsx
- StaffList.tsx
- StaffDetail.tsx
- ServicesList.tsx
- ServiceDetail.tsx
- CustomersList.tsx
- CustomerDetail.tsx
- Appointments.tsx
- AppointmentDetail.tsx
- Settings.tsx (bereits teilweise done)

Aktuell verwenden nur die Hauptnavigation und Settings das Theme-System.
