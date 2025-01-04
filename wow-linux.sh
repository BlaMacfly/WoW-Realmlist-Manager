#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour vérifier les dépendances
check_dependencies() {
    echo -e "${YELLOW}Vérification des dépendances...${NC}"
    
    # Liste des paquets nécessaires
    PACKAGES="wine winetricks"
    
    for pkg in $PACKAGES; do
        if ! dpkg -l | grep -q "^ii  $pkg "; then
            echo -e "${RED}$pkg n'est pas installé.${NC}"
            echo "Installation des dépendances nécessaires..."
            sudo apt update
            sudo apt install -y wine winetricks
            
            # Vérifier si l'installation a réussi
            if [ $? -ne 0 ]; then
                echo -e "${RED}Erreur lors de l'installation des dépendances.${NC}"
                echo "Essayez d'exécuter manuellement:"
                echo "sudo apt update && sudo apt install wine winetricks"
                exit 1
            fi
        fi
    done
    
    echo -e "${GREEN}Toutes les dépendances sont installées.${NC}"
}

# Fonction pour configurer Wine
setup_wine() {
    echo -e "${YELLOW}Configuration de Wine...${NC}"
    
    # Créer le préfixe Wine s'il n'existe pas
    if [ ! -d "$HOME/.wine" ]; then
        echo "Initialisation de Wine..."
        winecfg
    fi
    
    # Installation des composants Windows nécessaires
    echo "Installation des composants Windows nécessaires..."
    winetricks d3dx9 vcrun2008 vcrun2010 dotnet40 corefonts
}

# Vérifier si WoW est installé
check_wow() {
    WOW_PATH="$HOME/.wine/drive_c/Program Files (x86)/World of Warcraft/wow.exe"
    if [ ! -f "$WOW_PATH" ]; then
        echo -e "${RED}World of Warcraft n'est pas installé dans le chemin par défaut.${NC}"
        echo "Veuillez installer WoW via Wine d'abord."
        echo "1. Téléchargez l'installateur de WoW"
        echo "2. Exécutez-le avec: wine WoW-Installer.exe"
        exit 1
    fi
    return 0
}

# Fonction principale
main() {
    echo -e "${GREEN}=== World of Warcraft Linux Launcher (Ubuntu/Zorin OS) ===${NC}"
    
    # Vérifier les dépendances
    check_dependencies
    
    # Configurer Wine si nécessaire
    setup_wine
    
    # Vérifier l'installation de WoW
    check_wow
    
    # Lancer WoW
    echo -e "${GREEN}Lancement de World of Warcraft...${NC}"
    cd "$(dirname "$WOW_PATH")"
    
    # Configuration des variables d'environnement pour de meilleures performances
    export WINEARCH=win64
    export WINEPREFIX="$HOME/.wine"
    export WINEDEBUG=-all
    export DXVK_HUD=fps
    
    # Lancement avec priorité élevée
    nice -n -15 wine "$WOW_PATH"
}

# Exécution du script
main
