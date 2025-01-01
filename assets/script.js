const { ipcRenderer, shell } = require('electron');

const translations = {
    fr: {
        title: 'Modifier les adresses Realmlist',
        pathLabel: 'Chemin du client WoW :',
        exePathLabel: 'Chemin de WoW.exe :',
        browse: 'Parcourir...',
        langLabel: 'Langue :',
        modify: 'Modifier',
        launch: 'Lancer WoW'
    },
    en: {
        title: 'Edit Realmlist Addresses',
        pathLabel: 'WoW Client Path:',
        exePathLabel: 'WoW.exe Path:',
        browse: 'Browse...',
        langLabel: 'Language:',
        modify: 'Edit',
        launch: 'Launch WoW'
    },
    es: {
        title: 'Editar Direcciones de Realmlist',
        pathLabel: 'Ruta del cliente WoW:',
        exePathLabel: 'Ruta de WoW.exe:',
        browse: 'Explorar...',
        langLabel: 'Idioma:',
        modify: 'Editar',
        launch: 'Iniciar WoW'
    }
};

let selectedLanguage = 'fr';
let wowExePath = '';
const launchSound = new Audio('assets/launch.mp3');

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

document.getElementById('language-selector').addEventListener('change', (event) => {
    const selectedLang = event.target.value;
    setLanguage(selectedLang);
    ipcRenderer.send('change-language', selectedLang);
});

const browseSound = new Audio('assets/browse.mp3');

document.getElementById('select-path').addEventListener('click', () => {
    browseSound.play();
    ipcRenderer.send('select-wow-path');
});

document.getElementById('select-exe-path').addEventListener('click', () => {
    browseSound.play();
    ipcRenderer.send('select-exe-path');
});

document.getElementById('launch-wow').addEventListener('click', () => {
    launchSound.play();
    if (wowExePath) {
        shell.openPath(wowExePath);
    } else {
        alert('Veuillez sélectionner le chemin de wow.exe');
    }
});

ipcRenderer.on('selected-wow-path', (event, path) => {
    if (path) {
        document.getElementById('path-input').value = path;
    }
});

ipcRenderer.on('selected-exe-path', (event, path) => {
    if (path) {
        document.getElementById('exe-path-input').value = path;
        wowExePath = path;
    }
});

const clickSound = new Audio('assets/click.mp3');
const toggleSound = new Audio('assets/toggle.mp3');

ipcRenderer.send('get-realmlists');

ipcRenderer.on('realmlist-data', (event, realmlists) => {
    const container = document.getElementById('realmlist-container');
    container.innerHTML = '';

    realmlists.forEach((realm, index) => {
        const div = document.createElement('div');
        div.className = 'realm-item';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = realm.address;
        input.id = `realm-input-${index}`;

        const modifyButton = document.createElement('button');
        modifyButton.innerText = translations[selectedLanguage].modify;
        modifyButton.className = 'modify-button';
        modifyButton.addEventListener('click', () => {
            const updatedAddress = input.value;
            clickSound.play();
            ipcRenderer.send('update-realm', updatedAddress, index);
        });

        const toggleButton = document.createElement('button');
        toggleButton.innerText = realm.active ? 'On' : 'Off';
        toggleButton.style.backgroundColor = realm.active ? 'green' : 'red';

        toggleButton.addEventListener('click', () => {
            toggleSound.play();
            ipcRenderer.send('activate-realm', index);
        });

        div.appendChild(input);
        div.appendChild(modifyButton);
        div.appendChild(toggleButton);
        container.appendChild(div);
    });
});

ipcRenderer.on('modification-result', (event, message) => {
    alert(message);
    ipcRenderer.send('get-realmlists');
});









