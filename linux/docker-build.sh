#!/bin/bash

# Construire l'image Docker
docker build -t wow-realmlist-builder .

# Exécuter le conteneur et compiler l'application
docker run --rm -v ${PWD}/dist:/app/dist wow-realmlist-builder

echo "Compilation terminée ! Les fichiers sont dans le dossier dist/"
