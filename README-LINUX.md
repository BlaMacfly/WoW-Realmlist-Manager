# Guide d'installation pour Linux

Ce guide vous aidera à exécuter World of Warcraft sous Linux en utilisant Wine.

## Prérequis

1. Wine doit être installé sur votre système
   - Ubuntu/Debian : `sudo apt-get install wine`
   - Fedora : `sudo dnf install wine`
   - Arch Linux : `sudo pacman -S wine`

2. World of Warcraft doit être installé via Wine

## Installation

1. Rendez le script exécutable :
   ```bash
   chmod +x wow-linux.sh
   ```

2. Exécutez le script :
   ```bash
   ./wow-linux.sh
   ```

## Notes importantes

- Le script vérifie automatiquement si Wine est installé
- Il vérifie également si WoW est installé dans le chemin par défaut
- Si vous avez installé WoW dans un autre emplacement, vous devrez modifier le chemin dans le script

## Dépannage

1. Si Wine n'est pas installé, le script vous indiquera la commande appropriée pour votre distribution
2. Assurez-vous que WoW est correctement installé via Wine avant d'exécuter le script
3. Pour de meilleures performances, considérez l'utilisation de DXVK pour DirectX
