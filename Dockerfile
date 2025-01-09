FROM node:18-bullseye

# Activer l'architecture i386 pour wine32
RUN dpkg --add-architecture i386

# Installation des dépendances système nécessaires pour Electron et Wine
RUN apt-get update && apt-get install -y \
    wine \
    wine32:i386 \
    wine64 \
    libgconf-2-4 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxtst6 \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libxss1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copie des fichiers du projet
COPY . .

# Installation des dépendances
RUN npm install

# Construction de l'application
CMD ["npm", "run", "build:linux"]
