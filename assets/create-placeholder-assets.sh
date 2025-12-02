#!/bin/bash

# Erstelle einfache Platzhalter-Bilder mit ImageMagick (falls verfügbar)

if command -v convert &> /dev/null; then
    echo "Erstelle Platzhalter-Assets mit ImageMagick..."
    
    # Icon (1024x1024)
    convert -size 1024x1024 xc:"#7C3AED" \
            -gravity center -pointsize 400 -fill white -annotate +0+0 "A" \
            icon.png
    
    # Splash (1284x2778)
    convert -size 1284x2778 xc:"#121212" \
            -gravity center -pointsize 200 -fill "#7C3AED" -annotate +0+0 "Appoint App" \
            splash.png
    
    # Adaptive Icon (1024x1024)
    cp icon.png adaptive-icon.png
    
    # Favicon (48x48)
    convert icon.png -resize 48x48 favicon.png
    
    echo "✅ Platzhalter-Assets erstellt!"
else
    echo "❌ ImageMagick nicht gefunden."
    echo "Bitte erstelle die Assets manuell oder verwende Online-Tools wie icon.kitchen"
fi
