const { ipcRenderer } = require('electron');

// Sons
const sounds = {
    click: new Audio('assets/sounds/click.mp3'),
    launch: new Audio('assets/sounds/launch.mp3'),
    toggle: new Audio('assets/sounds/toggle.mp3'),
    browse: new Audio('assets/sounds/browse.mp3')
};

// Éléments de la fenêtre
const minimizeBtn = document.getElementById('minimize-btn');
const closeBtn = document.getElementById('close-btn');

// Contrôles de fenêtre
if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
        playSound('click');
        ipcRenderer.send('minimize-window');
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        playSound('click');
        ipcRenderer.send('close-window');
    });
}

// Traductions
const translations = {
    fr: {
        title: 'Gestionnaire de Realmlist',
        addRealm: 'Ajouter un realm',
        launchWow: 'Lancer WoW',
        openAddons: 'Dossier Addons',
        browse: 'Parcourir',
        activate: 'Activer',
        edit: 'Éditer',
        delete: 'Supprimer',
        errors: {
            max: 'Nombre maximum de realms atteint (5)',
            save: 'Erreur lors de la sauvegarde des realms',
            load: 'Erreur lors du chargement des realms',
            selectWow: 'Veuillez sélectionner WoW.exe',
            addons: 'Erreur lors de l\'ouverture du dossier des addons'
        },
        enterRealmAddress: 'Entrez l\'adresse du realm:'
    },
    en: {
        title: 'Realmlist Manager',
        addRealm: 'Add realm',
        launchWow: 'Launch WoW',
        openAddons: 'Addons Folder',
        browse: 'Browse',
        activate: 'Activate',
        edit: 'Edit',
        delete: 'Delete',
        errors: {
            max: 'Maximum number of realms reached (5)',
            save: 'Error saving realms',
            load: 'Error loading realms',
            selectWow: 'Please select WoW.exe',
            addons: 'Error opening addons folder'
        },
        enterRealmAddress: 'Enter realm address:'
    }
};

// Éléments DOM
const pathInput = document.getElementById('path-input');
const selectPathBtn = document.getElementById('select-path');
const addRealmBtn = document.getElementById('add-realm');
const realmList = document.getElementById('realm-list');
const languageSelect = document.getElementById('language-select');
const launchWowBtn = document.getElementById('launch-wow');
const openAddonBtn = document.getElementById('open-addon');

// Langue
let currentLanguage = localStorage.getItem('language') || 'fr';

function updateLanguage() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.dataset.translate;
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
}

// Affichage d'erreur
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Sélection du chemin WoW
if (selectPathBtn) {
    selectPathBtn.addEventListener('click', async () => {
        playSound('browse');
        try {
            const path = await ipcRenderer.invoke('select-wow-path');
            if (path) {
                pathInput.value = path;
            }
        } catch (error) {
            showError(error.message);
        }
    });
}

// Fonction pour créer un élément realm
function createRealmElement(realm, index) {
    const div = document.createElement('div');
    div.className = `realm-item${realm.active ? ' active' : ''}`;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'realm-address';
    input.value = realm.address;
    input.readOnly = true;

    const controls = document.createElement('div');
    controls.className = 'realm-controls';

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = realm.active ? 'ON' : 'OFF';
    toggleBtn.onclick = () => {
        playSound('click');
        toggleRealm(index);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = translations[currentLanguage].delete;
    deleteBtn.onclick = () => {
        playSound('click');
        deleteRealm(index);
    };

    controls.appendChild(toggleBtn);
    controls.appendChild(deleteBtn);

    div.appendChild(input);
    div.appendChild(controls);

    return div;
}

// Affichage des realms
async function displayRealms() {
    try {
        const realms = await ipcRenderer.invoke('get-realmlists');
        realmList.innerHTML = '';
        realms.forEach((realm, index) => {
            realmList.appendChild(createRealmElement(realm, index));
        });
    } catch (error) {
        showError(translations[currentLanguage].errors.load);
    }
}

// Fonction pour ajouter un nouveau realm
async function addRealm() {
    try {
        playSound('toggle');
        const result = await ipcRenderer.invoke('show-prompt-dialog', translations[currentLanguage].enterRealmAddress);
        if (result) {
            await ipcRenderer.invoke('add-realm', result);
            await displayRealms();
        }
    } catch (error) {
        showError(error.message);
    }
}

// Fonction pour basculer un realm
async function toggleRealm(index) {
    try {
        await ipcRenderer.invoke('toggle-realm', index);
        await displayRealms();
    } catch (error) {
        showError(translations[currentLanguage].errors.toggle);
    }
}

// Fonction pour supprimer un realm
async function deleteRealm(index) {
    try {
        await ipcRenderer.invoke('delete-realm', index);
        await displayRealms();
    } catch (error) {
        showError(translations[currentLanguage].errors.delete);
    }
}

// Fonction pour lancer WoW
async function launchWow() {
    try {
        await ipcRenderer.invoke('launch-wow');
    } catch (error) {
        showError(error.message);
    }
}

// Fonction pour ouvrir le dossier Addons
async function openAddonsFolder() {
    try {
        await ipcRenderer.invoke('open-addons-folder');
    } catch (error) {
        showError(translations[currentLanguage].errors.addons);
    }
}

function playSound(soundName) {
    if (sounds[soundName]) {
        const sound = sounds[soundName].cloneNode();
        sound.volume = 0.5;
        sound.play().catch(e => console.error('Error playing sound:', e));
    }
}

// Événements
if (addRealmBtn) {
    addRealmBtn.addEventListener('click', () => {
        playSound('toggle');
        addRealm();
    });
}

if (launchWowBtn) {
    launchWowBtn.addEventListener('click', () => {
        playSound('launch');
        launchWow();
    });
}

if (openAddonBtn) {
    openAddonBtn.addEventListener('click', () => {
        playSound('toggle');
        openAddonsFolder();
    });
}

// Gestion du changement de langue
if (languageSelect) {
    languageSelect.addEventListener('change', (event) => {
        playSound('click');
        currentLanguage = event.target.value;
        localStorage.setItem('language', currentLanguage);
        updateLanguage();
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Charger la langue
    languageSelect.value = currentLanguage;
    updateLanguage();
    
    // Charger les realms
    displayRealms();
});
