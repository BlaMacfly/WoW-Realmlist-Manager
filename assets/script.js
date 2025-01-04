const { ipcRenderer, shell } = require('electron');

const translations = {
    fr: {
        title: 'Modifier les adresses Realmlist',
        pathLabel: 'Chemin du Realmlist WoW :',
        exePathLabel: 'Chemin de WoW.exe :',
        browse: 'Parcourir...',
        langLabel: 'Langue :',
        modify: 'Modifier',
        launch: 'Lancer WoW'
    },
    en: {
        title: 'Edit Realmlist Addresses',
        pathLabel: 'WoW Realmlist Path:',
        exePathLabel: 'WoW.exe Path:',
        browse: 'Browse...',
        langLabel: 'Language:',
        modify: 'Edit',
        launch: 'Launch WoW'
    },
    es: {
        title: 'Editar Direcciones de Realmlist',
        pathLabel: 'Ruta de la lista de reinos de WoW:',
        exePathLabel: 'Ruta de WoW.exe:',
        browse: 'Explorar...',
        langLabel: 'Idioma:',
        modify: 'Editar',
        launch: 'Iniciar WoW'
    }
};

let selectedLanguage = 'fr';
let wowExePath = '';

// Debounce function pour limiter les appels fréquents
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Précharger les sons pour de meilleures performances
const sounds = {
    launch: new Audio('assets/launch.mp3'),
    browse: new Audio('assets/browse.mp3'),
    click: new Audio('assets/click.mp3'),
    toggle: new Audio('assets/toggle.mp3')
};

// Précharger les sons
Object.values(sounds).forEach(sound => {
    sound.load();
    sound.volume = 0.5; // Volume par défaut
});

// Cache des éléments DOM fréquemment utilisés
const domElements = {
    container: document.getElementById('realmlist-container'),
    pathInput: document.getElementById('path-input'),
    exePathInput: document.getElementById('exe-path-input'),
    languageSelector: document.getElementById('language-selector')
};

function setLanguage(lang) {
    selectedLanguage = lang;
    const t = translations[lang];
    document.getElementById('title').innerText = t.title;
    document.getElementById('path-label').innerText = t.pathLabel;
    document.getElementById('exe-path-label').innerText = t.exePathLabel;
    document.getElementById('select-path').innerText = t.browse;
    document.getElementById('select-exe-path').innerText = t.browse;
    document.getElementById('lang-label').innerText = t.langLabel;
    document.getElementById('launch-wow').innerText = t.launch;

    document.querySelectorAll('.modify-button').forEach(button => {
        button.innerText = t.modify;
    });
}

setLanguage('fr');

// Gestionnaire d'événements optimisé pour la liste des realms
function createRealmElement(realm, index) {
    const div = document.createElement('div');
    div.className = 'realm-item';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = realm.address;
    input.id = `realm-input-${index}`;

    const modifyButton = document.createElement('button');
    modifyButton.innerText = translations[selectedLanguage].modify;
    modifyButton.className = 'modify-button';

    const toggleButton = document.createElement('button');
    toggleButton.innerText = realm.active ? 'On' : 'Off';
    toggleButton.style.backgroundColor = realm.active ? 'green' : 'red';

    // Utilisation de la délégation d'événements
    div.addEventListener('click', (e) => {
        if (e.target === modifyButton) {
            sounds.click.play();
            const updatedAddress = input.value;
            ipcRenderer.send('update-realm', updatedAddress, index);
        } else if (e.target === toggleButton) {
            sounds.toggle.play();
            ipcRenderer.send('activate-realm', index);
        }
    });

    div.appendChild(input);
    div.appendChild(modifyButton);
    div.appendChild(toggleButton);
    return div;
}

// Mise à jour optimisée de la liste des realms
const updateRealmList = debounce((realmlists) => {
    const fragment = document.createDocumentFragment();
    realmlists.forEach((realm, index) => {
        fragment.appendChild(createRealmElement(realm, index));
    });
    
    domElements.container.innerHTML = '';
    domElements.container.appendChild(fragment);
}, 100);

// Gestionnaires d'événements optimisés
document.getElementById('select-path').addEventListener('click', () => {
    sounds.browse.play();
    ipcRenderer.send('select-wow-path');
});

document.getElementById('select-exe-path').addEventListener('click', () => {
    sounds.browse.play();
    ipcRenderer.send('select-exe-path');
});

document.getElementById('launch-wow').addEventListener('click', () => {
    sounds.launch.play();
    if (wowExePath) {
        shell.openPath(wowExePath);
    } else {
        alert('Veuillez sélectionner le chemin de wow.exe');
    }
});

// Gestionnaire de langue optimisé
domElements.languageSelector.addEventListener('change', debounce((event) => {
    const selectedLang = event.target.value;
    setLanguage(selectedLang);
    ipcRenderer.send('change-language', selectedLang);
}, 250));

// Écouteurs d'événements IPC optimisés
ipcRenderer.on('config-loaded', (event, config) => {
    if (config.wowRealmlistPath) {
        domElements.pathInput.value = config.wowRealmlistPath;
    }
    if (config.wowExePath) {
        domElements.exePathInput.value = config.wowExePath;
        wowExePath = config.wowExePath;
    }
    setLanguage(config.language || 'fr');
});

ipcRenderer.on('realmlist-data', (event, realmlists) => {
    updateRealmList(realmlists);
});

ipcRenderer.on('selected-wow-path', (event, path) => {
    if (path) {
        domElements.pathInput.value = path;
        ipcRenderer.send('update-realmlist-path', path);
    }
});

ipcRenderer.on('selected-exe-path', (event, path) => {
    if (path) {
        domElements.exePathInput.value = path;
        wowExePath = path;
    }
});

// Gestion des erreurs
window.addEventListener('error', (e) => {
    console.error('Erreur globale:', e.error);
});

// Initialisation
window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('load-config');
    ipcRenderer.send('get-realmlists');
});
