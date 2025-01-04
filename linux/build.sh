#!/bin/bash

# Vérifier si nous sommes dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "Erreur: Exécutez ce script depuis le dossier linux/"
    exit 1
fi

# Créer le dossier assets s'il n'existe pas
mkdir -p assets

# Vérifier si ImageMagick est installé
if ! command -v convert &> /dev/null; then
    echo "Installation d'ImageMagick..."
    sudo apt-get update && sudo apt-get install -y imagemagick
fi

# Convertir l'icône (une seule taille)
convert ../assets/icon.ico[0] assets/icon.png

# Installer les dépendances
echo "Installation des dépendances npm..."
npm install

# Construction des paquets
echo "Construction des paquets Linux..."
npm run dist

echo "Build terminé ! Les fichiers se trouvent dans le dossier 'dist'"
echo "Formats disponibles :"
echo "- AppImage (exécutable portable)"
echo "- .deb (pour Ubuntu/Debian/Zorin OS)"
echo "- .rpm (pour Fedora/RHEL)"
