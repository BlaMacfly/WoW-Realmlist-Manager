FROM ubuntu:22.04

# Installation des dépendances nécessaires
RUN apt-get update && apt-get install -y \
    libgtk-3-0 \
    libnotify4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    libatspi2.0-0 \
    libdrm2 \
    libgbm1 \
    libxcb-dri3-0 \
    && rm -rf /var/lib/apt/lists/*

# Création du répertoire de travail
WORKDIR /app

# Copie du paquet .deb
COPY dist/wow-realmlist-manager_1.1.0_amd64.deb .

# Installation du paquet
RUN apt-get update && apt-get install -y ./wow-realmlist-manager_1.1.0_amd64.deb

# Commande pour lancer l'application
CMD ["wow-realmlist-manager"]
