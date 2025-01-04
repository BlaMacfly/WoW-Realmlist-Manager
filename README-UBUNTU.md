# Guide d'installation World of Warcraft pour Ubuntu/Zorin OS

Ce guide est spécifiquement conçu pour Ubuntu et Zorin OS, et vous aidera à installer et exécuter World of Warcraft.

## Prérequis Système

- Ubuntu 20.04+ ou Zorin OS 16+
- Au moins 4 Go de RAM
- Carte graphique compatible avec Vulkan (recommandé)
- Au moins 100 Go d'espace disque libre

## Installation Automatique

1. Rendez le script exécutable :
   ```bash
   chmod +x wow-linux.sh
   ```

2. Exécutez le script :
   ```bash
   ./wow-linux.sh
   ```

Le script s'occupera automatiquement de :
- Installer Wine et Winetricks
- Configurer l'environnement Wine
- Installer les composants Windows nécessaires
- Lancer WoW avec les paramètres optimaux

## Installation Manuelle (si le script échoue)

1. Installez Wine et Winetricks :
   ```bash
   sudo apt update
   sudo apt install wine winetricks
   ```

2. Installez les dépendances Windows :
   ```bash
   winetricks d3dx9 vcrun2008 vcrun2010 dotnet40 corefonts
   ```

3. Installez World of Warcraft :
   - Téléchargez l'installateur de WoW
   - Ouvrez un terminal et naviguez vers le dossier contenant l'installateur
   - Exécutez : `wine WoW-Installer.exe`

## Optimisations

Le script inclut déjà plusieurs optimisations :
- Configuration DXVK pour de meilleures performances graphiques
- Priorité de processus optimisée
- Désactivation des logs Wine pour de meilleures performances

## Dépannage

1. Si vous rencontrez des problèmes graphiques :
   ```bash
   winetricks dxvk
   ```

2. Pour les problèmes de son :
   ```bash
   winetricks sound=pulse
   ```

3. Pour les problèmes de performance :
   - Activez le mode de compatibilité Windows 10
   - Utilisez les paramètres graphiques bas ou moyens
   - Désactivez les add-ons non essentiels

## Support

Si vous rencontrez des problèmes :
1. Vérifiez que votre système est à jour
2. Assurez-vous d'avoir les derniers pilotes graphiques
3. Consultez les forums WoW Linux pour des solutions spécifiques

## Notes

- Le jeu sera installé par défaut dans : `~/.wine/drive_c/Program Files (x86)/World of Warcraft/`
- Les sauvegardes sont dans : `~/.wine/drive_c/users/[votre_nom]/Application Data/World of Warcraft/`
- Pour de meilleures performances, considérez l'utilisation de GameMode : `sudo apt install gamemode`
