@echo off
echo Construction de l'image de test...
docker build -t wow-realmlist-tester .

echo.
echo Lancement du conteneur de test...
docker run --rm -it wow-realmlist-tester
