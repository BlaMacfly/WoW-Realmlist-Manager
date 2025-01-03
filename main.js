const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
const realmlistPath = path.join(__dirname, 'realmlists.json');
const configPath = path.join(__dirname, 'config.json');
let wowRealmlistPath = '';
let wowExePath = '';
let selectedLanguage = 'fr';

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

// Sauvegarder la configuration
function saveConfig() {
    const config = {
        wowRealmlistPath,
        wowExePath,
        language: selectedLanguage
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Configuration sauvegardée :', config);
}

// Lire les adresses realm
function getRealmlists(callback) {
    fs.readFile(realmlistPath, 'utf-8', (err, data) => {
        if (err) {
            fs.writeFileSync(realmlistPath, JSON.stringify([], null, 2));
            callback([]);
            return;
        }
        callback(JSON.parse(data));
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
    fs.writeFile(wowRealmlistPath, `set realmlist ${newRealmlist}`, (err) => {
        if (err) {
            console.error("Erreur lors de la mise à jour du realmlist.wtf :", err);
        } else {
            console.log("realmlist.wtf mis à jour avec :", newRealmlist);
        }
    });
}

app.whenReady().then(() => {
    loadConfig();  // Charger la configuration au démarrage

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'icon.ico'),  // Ajouter l'icône ici
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    // Envoyer la configuration au chargement
    ipcMain.on('load-config', (event) => {
        loadConfig();
        event.reply('config-loaded', {
            wowRealmlistPath,
            wowExePath,
            language: selectedLanguage
        });
    });

    ipcMain.on('select-wow-path', (event) => {
        dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        }).then(result => {
            if (!result.canceled) {
                wowRealmlistPath = path.join(result.filePaths[0], 'realmlist.wtf');
                saveConfig();  // Enregistrer immédiatement
                event.reply('selected-wow-path', wowRealmlistPath);
                console.log('Chemin WoW realmlist enregistré :', wowRealmlistPath);
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
                saveConfig();  // Enregistrer immédiatement
                event.reply('selected-exe-path', wowExePath);
                console.log('Chemin WoW.exe enregistré :', wowExePath);
            }
        });
    });

    ipcMain.on('change-language', (event, lang) => {
        selectedLanguage = lang;
        saveConfig();
    });

    ipcMain.on('get-language', (event) => {
        event.reply('set-language', selectedLanguage);
    });

    ipcMain.on('activate-realm', (event, index) => {
        getRealmlists((realmlists) => {
            const selectedRealm = realmlists[index];
            realmlists.forEach((realm, i) => {
                realm.active = (i === index);
            });
            saveRealmlists(realmlists, (err) => {
                if (!err) {
                    updateWowRealmlist(selectedRealm.address);
                    saveConfig();  // Enregistrer la configuration après l'activation
                    event.reply('modification-result', 'Adresse activée et realmlist.wtf mis à jour');
                    event.reply('realmlist-data', realmlists);
                }
            });
        });
    });

    ipcMain.on('get-realmlists', (event) => {
        getRealmlists((realmlists) => {
            event.reply('realmlist-data', realmlists);
        });
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
});













