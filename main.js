const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const store = new Store();

let mainWindow;
let promptWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'icon.png')
    });

    mainWindow.loadFile('index.html');
    mainWindow.setMenu(null);
}

function createPromptDialog(prompt) {
    if (promptWindow) {
        promptWindow.close();
    }

    promptWindow = new BrowserWindow({
        width: 400,
        height: 150,
        frame: false,
        parent: mainWindow,
        modal: true,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    promptWindow.loadFile('prompt.html');

    promptWindow.webContents.on('did-finish-load', () => {
        promptWindow.webContents.send('set-prompt', prompt);
        promptWindow.show();
    });

    promptWindow.on('closed', () => {
        promptWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Gestion des realms
function getRealmlists() {
    return store.get('realmlists', []);
}

function saveRealmlists(realmlists) {
    store.set('realmlists', realmlists);
}

// Fonction pour trouver le dossier de langue
function findLanguageFolder(dataPath) {
    const languageFolders = ['frFR', 'enUS', 'deDE', 'esES', 'esMX', 'ptBR', 'itIT', 'ruRU'];
    
    for (const lang of languageFolders) {
        const langPath = path.join(dataPath, lang);
        if (fs.existsSync(langPath)) {
            return langPath;
        }
    }
    
    // Si aucun dossier de langue n'est trouvé, utiliser le premier de la liste
    const defaultLang = languageFolders[0];
    const defaultPath = path.join(dataPath, defaultLang);
    fs.mkdirSync(defaultPath, { recursive: true });
    return defaultPath;
}

// Fonction pour mettre à jour le fichier realmlist.wtf
async function updateRealmlistFile(address) {
    const wowPath = store.get('wowPath');
    if (!wowPath) {
        throw new Error('Please select WoW.exe first');
    }

    const wowDir = path.dirname(wowPath);
    const dataPath = path.join(wowDir, 'Data');

    // Créer le dossier Data s'il n'existe pas
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
    }

    // Trouver ou créer le dossier de langue approprié
    const langPath = findLanguageFolder(dataPath);
    const realmlistPath = path.join(langPath, 'realmlist.wtf');

    // Écrire le fichier realmlist.wtf avec exactement le même contenu que dans la liste
    fs.writeFileSync(realmlistPath, `${address}\n`);
    console.log(`Realmlist updated at: ${realmlistPath}`);
    console.log(`New content: ${address}`);
}

// Fonction pour lancer WoW selon le système d'exploitation
async function launchWow(wowPath) {
    const isLinux = process.platform === 'linux';
    const isWindows = process.platform === 'win32';

    try {
        if (isWindows) {
            // Lancement direct sous Windows
            const wow = require('child_process').spawn(wowPath, [], {
                detached: true,
                stdio: 'ignore'
            });
            wow.unref();
        } else if (isLinux) {
            // Vérifier si Wine est installé
            try {
                await require('child_process').execSync('which wine');
            } catch (error) {
                throw new Error('Wine is not installed. Please install Wine to run WoW on Linux.');
            }

            // Lancement avec Wine sous Linux
            const wow = require('child_process').spawn('wine', [wowPath], {
                detached: true,
                stdio: 'ignore'
            });
            wow.unref();
        } else {
            throw new Error('Unsupported operating system');
        }
        console.log('WoW launched successfully');
    } catch (error) {
        console.error('Error launching WoW:', error);
        throw new Error(`Error launching WoW: ${error.message}`);
    }
}

// IPC Events
ipcMain.handle('get-realmlists', () => {
    return getRealmlists();
});

ipcMain.handle('add-realm', (event, address) => {
    const realmlists = getRealmlists();
    if (realmlists.length >= 5) {
        throw new Error('Maximum number of realms reached (5)');
    }
    realmlists.push({ address, active: false });
    saveRealmlists(realmlists);
    return realmlists;
});

ipcMain.handle('toggle-realm', async (event, index) => {
    const realmlists = getRealmlists();
    realmlists.forEach((realm, i) => {
        realm.active = i === index;
    });
    
    // Mettre à jour le fichier realmlist.wtf avec le nouveau realm actif
    const activeRealm = realmlists.find(realm => realm.active);
    if (activeRealm) {
        await updateRealmlistFile(activeRealm.address);
    }
    
    saveRealmlists(realmlists);
    return realmlists;
});

ipcMain.handle('delete-realm', (event, index) => {
    const realmlists = getRealmlists();
    realmlists.splice(index, 1);
    saveRealmlists(realmlists);
    return realmlists;
});

ipcMain.handle('select-wow-path', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'WoW.exe', extensions: ['exe'] }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const wowPath = result.filePaths[0];
        store.set('wowPath', wowPath);
        return wowPath;
    }
    return null;
});

ipcMain.handle('show-prompt-dialog', (event, prompt) => {
    return new Promise((resolve) => {
        createPromptDialog(prompt);

        ipcMain.once('prompt-response', (event, value) => {
            if (promptWindow) {
                promptWindow.close();
            }
            resolve(value);
        });

        ipcMain.once('prompt-cancel', () => {
            if (promptWindow) {
                promptWindow.close();
            }
            resolve(null);
        });
    });
});

ipcMain.handle('launch-wow', async () => {
    const wowPath = store.get('wowPath');
    if (!wowPath) {
        throw new Error('Please select WoW.exe first');
    }

    const realmlists = getRealmlists();
    const activeRealm = realmlists.find(realm => realm.active);
    if (!activeRealm) {
        throw new Error('Please select an active realm first');
    }

    await launchWow(wowPath);
});

ipcMain.handle('open-addons-folder', async () => {
    const wowPath = store.get('wowPath');
    if (!wowPath) {
        throw new Error('Please select WoW.exe first');
    }

    const wowDir = path.dirname(wowPath);
    const addonsPath = path.join(wowDir, 'Interface', 'AddOns');

    try {
        if (!fs.existsSync(addonsPath)) {
            fs.mkdirSync(addonsPath, { recursive: true });
        }
        require('child_process').exec(`explorer "${addonsPath}"`);
    } catch (error) {
        throw new Error('Error opening addons folder: ' + error.message);
    }
});

// Window controls
ipcMain.on('minimize-window', () => {
    try {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.minimize();
        }
    } catch (error) {
        console.error('Error minimizing window:', error);
    }
});

ipcMain.on('close-window', () => {
    try {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.close();
        }
    } catch (error) {
        console.error('Error closing window:', error);
    }
});