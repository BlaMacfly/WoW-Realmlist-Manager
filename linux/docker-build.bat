@echo off
REM Construire l'image Docker
docker build -t wow-realmlist-builder .

REM Exécuter le conteneur et compiler l'application
docker run --rm -v "%CD%/dist:/app/dist" wow-realmlist-builder

echo Compilation terminée ! Les fichiers sont dans le dossier dist/
