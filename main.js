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
function getRealmlists() {
    return new Promise((resolve, reject) => {
        const now = Date.now();
        if (realmlistsCache && (now - lastCacheTime < CACHE_DURATION)) {
            resolve(realmlistsCache);
            return;
        }

        fs.readFile(realmlistPath, 'utf-8', (err, data) => {
            if (err) {
                console.error("Erreur de lecture de realmlists.json :", err);
                reject(err);
                return;
            }
            try {
                realmlistsCache = JSON.parse(data);
                lastCacheTime = now;
                resolve(realmlistsCache);
            } catch (parseError) {
                console.error("Erreur de parsing de realmlists.json :", parseError);
                reject(parseError);
            }
        });
    });
}

// Enregistrer les modifications de realmlists avec vérification
async function saveRealmlists(realmlists) {
    const data = JSON.stringify(realmlists, null, 2);
    
    return new Promise((resolve, reject) => {
        fs.writeFile(realmlistPath, data, async (err) => {
            if (err) {
                console.error("Erreur lors de la sauvegarde des realmlists:", err);
                reject(err);
                return;
            }

            // Vérifier que les données ont été correctement écrites
            try {
                const savedData = await fs.promises.readFile(realmlistPath, 'utf-8');
                const savedRealmlists = JSON.parse(savedData);
                
                if (JSON.stringify(savedRealmlists) === JSON.stringify(realmlists)) {
                    realmlistsCache = realmlists;
                    lastCacheTime = Date.now();
                    resolve(true);
                } else {
                    reject(new Error("Les données sauvegardées ne correspondent pas"));
                }
            } catch (verifyError) {
                reject(verifyError);
            }
        });
    });
}

// Mettre à jour le fichier realmlist.wtf avec vérification
async function updateWowRealmlist(newRealmlist) {
    console.log('Tentative de mise à jour du realmlist.wtf...');
    console.log('Chemin actuel:', wowRealmlistPath);
    console.log('Nouvelle adresse:', newRealmlist);

    if (!wowRealmlistPath) {
        throw new Error("Le chemin du fichier realmlist.wtf n'est pas défini");
    }

    // Vérifier si le chemin contient Data/frFR
    if (!wowRealmlistPath.includes('Data\\frFR')) {
        const baseDir = path.dirname(wowRealmlistPath);
        const newPath = path.join(baseDir, 'Data', 'frFR', 'realmlist.wtf');
        console.log('Correction du chemin vers:', newPath);
        wowRealmlistPath = newPath;
        saveConfig();
    }

    // Créer le dossier s'il n'existe pas
    const dir = path.dirname(wowRealmlistPath);
    if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
    }

    const formattedRealmlist = newRealmlist.trim().startsWith('set realmlist') 
        ? newRealmlist.trim() 
        : `set realmlist ${newRealmlist.trim()}`;
    
    await fs.promises.writeFile(wowRealmlistPath, formattedRealmlist + '\n', 'utf8');
    
    // Vérifier que le fichier a été correctement écrit
    const content = await fs.promises.readFile(wowRealmlistPath, 'utf-8');
    if (content.trim() !== formattedRealmlist) {
        throw new Error('La vérification du contenu a échoué');
    }
    
    return true;
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
    ipcMain.on('get-realmlists', async (event) => {
        try {
            const realmlists = await getRealmlists();
            event.reply('realmlist-data', realmlists);
        } catch (error) {
            event.reply('update-error', error.message);
        }
    });

    ipcMain.on('update-realm', async (event, newAddress, index) => {
        try {
            const realmlists = await getRealmlists();
            if (realmlists[index]) {
                realmlists[index].address = newAddress;
                await saveRealmlists(realmlists);
                await updateWowRealmlist(newAddress);
                event.reply('realmlist-data', realmlists);
                event.reply('update-success', 'Realmlist mis à jour avec succès');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du realm:', error);
            event.reply('update-error', error.message);
        }
    });

    ipcMain.on('activate-realm', async (event, index) => {
        try {
            const realmlists = await getRealmlists();
            realmlists.forEach((realm, i) => {
                realm.active = (i === index);
            });
            await saveRealmlists(realmlists);
            if (realmlists[index]) {
                await updateWowRealmlist(realmlists[index].address);
            }
            event.reply('realmlist-data', realmlists);
            event.reply('update-success', 'Realm activé avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'activation du realm:', error);
            event.reply('update-error', error.message);
        }
    });

    ipcMain.on('load-config', (event) => {
        loadConfig();
        event.reply('config-loaded', { wowRealmlistPath, wowExePath, language: selectedLanguage });
    });

    ipcMain.on('update-realmlist-path', (event, path) => {
        wowRealmlistPath = path.endsWith('realmlist.wtf') ? path : path + '\\realmlist.wtf';
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

    ipcMain.on('change-language', (event, lang) => {
        selectedLanguage = lang;
        saveConfig();
    });
});

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