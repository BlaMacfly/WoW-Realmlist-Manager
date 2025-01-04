#!/bin/bash

# Vérifier si ImageMagick est installé
if ! command -v convert &> /dev/null; then
    echo "Installation d'ImageMagick..."
    sudo apt-get update
    sudo apt-get install -y imagemagick
fi

# Convertir l'icône en PNG si nécessaire
if [ -f "../icon.ico" ]; then
    echo "Conversion de l'icône ICO en PNG..."
    convert ../icon.ico ../assets/icon.png
fi

# Installer les dépendances
echo "Installation des dépendances..."
npm install

# Construction des packages Linux
echo "Construction des packages Linux..."
npm run dist

echo "Build terminé ! Les fichiers se trouvent dans le dossier dist/"
