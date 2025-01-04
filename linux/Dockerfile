FROM node:18-slim

# Installation des dépendances nécessaires pour electron-builder
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    gcc \
    g++ \
    fakeroot \
    dpkg \
    rpm \
    && rm -rf /var/lib/apt/lists/*

# Création du répertoire de travail
WORKDIR /app

# Copie des fichiers du projet depuis le répertoire parent
COPY ../. .

# Installation des dépendances
RUN npm install

# Compilation de l'application
CMD ["npm", "run", "dist"]
