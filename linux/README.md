# WoW Realmlist Manager pour Linux

Ce gestionnaire de realmlist pour World of Warcraft 3.3.5 est spécialement conçu pour fonctionner sous Linux avec Wine.

## 🚀 Installation rapide

### Option 1 : AppImage (Recommandé - Toutes distributions)
1. Téléchargez `WoW Realmlist Manager-1.0.0.AppImage`
2. Rendez le fichier exécutable :
   ```bash
   chmod +x "WoW Realmlist Manager-1.0.0.AppImage"
   ```
3. Double-cliquez sur l'AppImage ou lancez-le en ligne de commande

### Option 2 : Ubuntu/Debian
1. Installez les prérequis :
   ```bash
   sudo apt update
   sudo apt install wine winetricks
   ```
2. Installez le package :
   ```bash
   sudo dpkg -i wow-realmlist-manager_1.0.0_amd64.deb
   ```

### Option 3 : Fedora/RHEL
1. Installez les prérequis :
   ```bash
   sudo dnf install wine winetricks
   ```
2. Installez le package :
   ```bash
   sudo rpm -i wow-realmlist-manager-1.0.0.x86_64.rpm
   ```

## 🔧 Configuration

1. Au premier lancement, sélectionnez le dossier d'installation de WoW
2. Le chemin par défaut sous Wine est généralement :
   ```
   ~/.wine/drive_c/Program Files (x86)/World of Warcraft/
   ```
3. L'application détectera automatiquement le fichier realmlist.wtf

## 🛠️ Compilation depuis les sources

### Prérequis
- Node.js et npm
- Wine et Winetricks
- ImageMagick (pour la conversion d'icônes)

### Étapes de compilation
1. Clonez le dépôt :
   ```bash
   git clone https://github.com/BlaMacfly/WoW-Realmlist-Manager.git
   cd WoW-Realmlist-Manager/linux
   ```

2. Installez les dépendances :
   ```bash
   chmod +x build.sh
   ./build.sh
   ```

Les fichiers compilés seront disponibles dans le dossier `dist/`.

## 🎮 Utilisation avec Wine

L'application est conçue pour fonctionner automatiquement avec Wine. Elle :
- Détecte l'installation de WoW dans le préfixe Wine
- Gère correctement les chemins Windows/Wine
- Met à jour le fichier realmlist.wtf au bon endroit

## 🔍 Dépannage

### Problèmes courants

1. **L'application ne trouve pas WoW** :
   - Vérifiez que WoW est installé dans le préfixe Wine par défaut
   - Ou sélectionnez manuellement le dossier d'installation

2. **Erreur de permissions** :
   - Vérifiez que vous avez les droits en écriture sur le dossier WoW
   ```bash
   chmod -R u+w "~/.wine/drive_c/Program Files (x86)/World of Warcraft/"
   ```

3. **Wine n'est pas trouvé** :
   - Installez Wine :
     ```bash
     # Ubuntu/Debian
     sudo apt install wine

     # Fedora
     sudo dnf install wine
     ```

### Logs et support

- Les logs sont stockés dans : `~/.config/WoW Realmlist Manager/logs/`
- Pour signaler un bug, visitez : https://github.com/BlaMacfly/WoW-Realmlist-Manager/issues

## 📝 Notes

- L'application nécessite Wine 5.0 ou supérieur
- Testée sur Ubuntu 20.04+, Zorin OS et Fedora 35+
- Compatible avec les installations 32 et 64 bits de WoW
