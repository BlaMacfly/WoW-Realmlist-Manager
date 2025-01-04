const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
const realmlistPath = path.join(__dirname, 'realmlists.json');
const configPath = path.join(__dirname, 'config.json');
let wowRealmlistPath = '';
let wowExePath = '';
let selectedLanguage = 'fr';

// Désactiver l'accélération matérielle
app.disableHardwareAcceleration();

// Cache des realmlists pour de meilleures performances
let realmlistsCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5000; // 5 secondes

// Charger la configuration
function loadConfig() {
    try {
        const data = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(data);
        wowRealmlistPath = config.wowRealmlistPath || '';
        wowExePath = config.wowExePath || '';
        selectedLanguage = config.language || 'fr';
    } catch (error) {
        console.log('Aucun fichier de configuration trouvé, création par défaut.');
        saveConfig();
    }
}

// Sauvegarder la configuration avec debounce
let saveConfigTimeout = null;
function saveConfig() {
    if (saveConfigTimeout) {
        clearTimeout(saveConfigTimeout);
    }
    
    saveConfigTimeout = setTimeout(() => {
        const config = {
            wowRealmlistPath,
            wowExePath,
            language: selectedLanguage
        };
        try {
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('Configuration sauvegardée :', config);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la configuration:', error);
        }
    }, 500);
}

// Lire les adresses realm avec cache
function getRealmlists(callback) {
    const now = Date.now();
    if (realmlistsCache && (now - lastCacheTime < CACHE_DURATION)) {
        callback(realmlistsCache);
        return;
    }

    fs.readFile(realmlistPath, 'utf-8', (err, data) => {
        if (err) {
            console.error("Erreur de lecture de realmlists.json :", err);
            callback([]);
            return;
        }
        try {
            realmlistsCache = JSON.parse(data);
            lastCacheTime = now;
            callback(realmlistsCache);
        } catch (parseError) {
            console.error("Erreur de parsing de realmlists.json :", parseError);
            callback([]);
        }
    });
}

// Enregistrer les modifications de realmlists
function saveRealmlists(realmlists, callback) {
    fs.writeFile(realmlistPath, JSON.stringify(realmlists, null, 2), (err) => {
        callback(err);
    });
}

// Mettre à jour le fichier realmlist.wtf
function updateWowRealmlist(newRealmlist) {
    console.log('Tentative de mise à jour du realmlist.wtf...');
    console.log('Chemin actuel:', wowRealmlistPath);
    console.log('Nouvelle adresse:', newRealmlist);

    if (!wowRealmlistPath) {
        const error = "Erreur: Le chemin du fichier realmlist.wtf n'est pas défini";
        console.error(error);
        mainWindow.webContents.send('update-error', error);
        return;
    }

    // Vérifier si le chemin contient Data/frFR
    if (!wowRealmlistPath.includes('Data\\frFR')) {
        const baseDir = path.dirname(wowRealmlistPath);
        const newPath = path.join(baseDir, 'Data', 'frFR', 'realmlist.wtf');
        console.log('Correction du chemin vers:', newPath);
        wowRealmlistPath = newPath;
        saveConfig();
    }

    // Vérifier si le fichier existe
    if (!fs.existsSync(wowRealmlistPath)) {
        const error = `Erreur: Le fichier realmlist.wtf n'existe pas au chemin: ${wowRealmlistPath}`;
        console.error(error);
        mainWindow.webContents.send('update-error', error);
        return;
    }

    const formattedRealmlist = newRealmlist.trim().startsWith('set realmlist') 
        ? newRealmlist.trim() 
        : `set realmlist ${newRealmlist.trim()}`;
    
    try {
        fs.writeFileSync(wowRealmlistPath, formattedRealmlist + '\n', 'utf8');
        const content = fs.readFileSync(wowRealmlistPath, 'utf-8');
        
        if (content.trim() === formattedRealmlist.trim()) {
            console.log('Mise à jour réussie !');
            mainWindow.webContents.send('update-success', 'Realmlist mis à jour avec succès');
        } else {
            throw new Error('Le contenu vérifié ne correspond pas à ce qui devrait être écrit');
        }
    } catch (error) {
        const errorMsg = `Erreur lors de la mise à jour du realmlist.wtf: ${error.message}`;
        console.error(errorMsg);
        mainWindow.webContents.send('update-error', errorMsg);
    }
}

// Configuration de l'application
app.whenReady().then(() => {
    loadConfig();

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false
        },
        show: false
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Gestionnaires d'événements IPC
    ipcMain.on('load-config', (event) => {
        loadConfig();
        event.reply('config-loaded', { wowRealmlistPath, wowExePath, language: selectedLanguage });
    });

    ipcMain.on('update-realmlist-path', (event, path) => {
        if (!path.endsWith('Data\\frFR')) {
            if (fs.existsSync(path + '\\Data\\frFR')) {
                path = path + '\\Data\\frFR';
            }
        }
        wowRealmlistPath = path + '\\realmlist.wtf';
        saveConfig();
        event.reply('update-success', 'Chemin du realmlist.wtf mis à jour avec succès');
    });

    ipcMain.on('select-wow-path', (event) => {
        dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        }).then(result => {
            if (!result.canceled) {
                const selectedPath = result.filePaths[0];
                event.reply('selected-wow-path', selectedPath);
            }
        });
    });

    ipcMain.on('select-exe-path', (event) => {
        dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [{ name: 'Executables', extensions: ['exe'] }]
        }).then(result => {
            if (!result.canceled) {
                wowExePath = result.filePaths[0];
                saveConfig();
                event.reply('selected-exe-path', wowExePath);
            }
        });
    });

    ipcMain.on('get-realmlists', (event) => {
        getRealmlists((realmlists) => {
            event.reply('realmlist-data', realmlists);
        });
    });

    ipcMain.on('activate-realm', (event, index) => {
        getRealmlists((realmlists) => {
            if (index >= 0 && index < realmlists.length) {
                realmlists.forEach((realm, i) => {
                    realm.active = (i === index);
                });
                
                saveRealmlists(realmlists, (err) => {
                    if (!err) {
                        updateWowRealmlist(realmlists[index].address);
                        event.reply('realmlist-data', realmlists);
                    }
                });
            }
        });
    });
});

// Nettoyage à la fermeture
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    mainWindow = null;
});