# WoW Realmlist Manager

Une application de bureau pour gérer facilement les serveurs World of Warcraft 3.3.5a.

## Fonctionnalités

- Interface utilisateur moderne et intuitive
- Gestion facile des adresses de serveurs
- Activation/désactivation rapide des serveurs
- Mise à jour automatique du fichier realmlist.wtf
- Support multilingue (FR/EN/ES)
- Effets sonores pour une meilleure expérience utilisateur

## Installation

1. Assurez-vous d'avoir [Node.js](https://nodejs.org/) installé
2. Clonez ce dépôt
3. Installez les dépendances :
```bash
npm install
```

## Utilisation

1. Lancez l'application :
```bash
npm start
```

2. Sélectionnez le dossier d'installation de WoW 3.3.5a
3. Ajoutez vos serveurs préférés
4. Utilisez les boutons On/Off pour switcher entre les serveurs

## Technologies utilisées

- Electron.js
- Node.js
- HTML/CSS/JavaScript

## Structure du projet

```
project-realmlist/
├── assets/
│   ├── style.css
│   ├── script.js
│   └── sounds/
├── src/
│   └── config.js
├── main.js
├── index.html
└── realmlists.json
```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## License

MIT License - voir le fichier LICENSE pour plus de détails
