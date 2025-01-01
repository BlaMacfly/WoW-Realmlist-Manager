const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
const realmlistPath = path.join(__dirname, 'realmlists.json');
let wowRealmlistPath = 'G:\\WoW 3.3.5\\World-of-Warcraft-3.3.5a.12340-frFR\\World of Warcraft 3.3.5a.12340 frFR\\Data\\frFR\\realmlist.wtf';
let wowExePath = '';  // Chemin de wow.exe
let selectedLanguage = 'fr';  // Langue par défaut

// Lire les adresses realm
function getRealmlists(callback) {
    fs.readFile(realmlistPath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Erreur de lecture du fichier realmlists.json, création d\'un fichier vide.');
            fs.writeFileSync(realmlistPath, JSON.stringify([], null, 2));
            callback([]);
            return;
        }
        callback(JSON.parse(data));
    });
}

// Enregistrer les modifications
function saveRealmlists(realmlists, callback) {
    fs.writeFile(realmlistPath, JSON.stringify(realmlists, null, 2), (err) => {
        callback(err);
    });
}

// Mettre à jour le fichier realmlist.wtf
function updateWowRealmlist(newRealmlist) {
    fs.writeFile(wowRealmlistPath, newRealmlist, (err) => {
        if (err) {
            console.error("Erreur lors de la mise à jour du realmlist.wtf :", err);
        } else {
            console.log("realmlist.wtf mis à jour avec :", newRealmlist);
        }
    });
}

// Créer la fenêtre principale
app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    ipcMain.on('get-realmlists', (event) => {
        getRealmlists((realmlists) => {
            event.reply('realmlist-data', realmlists);
        });
    });

    ipcMain.on('update-realm', (event, updatedRealm, index) => {
        getRealmlists((realmlists) => {
            if (realmlists[index]) {
                realmlists[index] = {
                    ...realmlists[index],
                    address: updatedRealm
                };
                saveRealmlists(realmlists, (err) => {
                    event.reply('modification-result', err ? 'Erreur' : 'Adresse modifiée avec succès');
                });
            }
        });
    });

    ipcMain.on('activate-realm', (event, index) => {
        getRealmlists((realmlists) => {
            const selectedRealm = realmlists[index];

            // Activer uniquement cette adresse
            realmlists.forEach((realm, i) => {
                realm.active = (i === index);
            });

            saveRealmlists(realmlists, (err) => {
                if (!err) {
                    updateWowRealmlist(selectedRealm.address);
                    event.reply('modification-result', 'Adresse activée et realmlist.wtf mis à jour');
                }
            });
        });
    });

    // Gestion de la sélection du chemin WoW Data
    ipcMain.on('select-wow-path', (event) => {
        dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        }).then(result => {
            if (!result.canceled) {
                wowRealmlistPath = path.join(result.filePaths[0], 'realmlist.wtf');
                event.reply('selected-wow-path', wowRealmlistPath);
                console.log('Nouveau chemin sélectionné :', wowRealmlistPath);
            }
        }).catch(err => {
            console.error('Erreur lors de la sélection du chemin :', err);
        });
    });

    // Gestion de la sélection du chemin de WoW.exe
    ipcMain.on('select-exe-path', (event) => {
        dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'Executables', extensions: ['exe'] }
            ]
        }).then(result => {
            if (!result.canceled) {
                wowExePath = result.filePaths[0];
                event.reply('selected-exe-path', wowExePath);
                console.log('Chemin de wow.exe sélectionné :', wowExePath);
            }
        }).catch(err => {
            console.error('Erreur lors de la sélection de wow.exe :', err);
        });
    });

    // Lancer WoW à partir de l'interface
    ipcMain.on('launch-wow', () => {
        if (wowExePath) {
            shell.openPath(wowExePath).catch(err => {
                console.error('Erreur lors du lancement de WoW :', err);
            });
        } else {
            console.error('Aucun chemin de wow.exe sélectionné.');
        }
    });

    // Écouter les changements de langue depuis le processus de rendu
    ipcMain.on('change-language', (event, lang) => {
        selectedLanguage = lang;
        console.log('Langue sélectionnée :', selectedLanguage);
    });

    // Renvoie la langue sélectionnée au processus de rendu
    ipcMain.on('get-language', (event) => {
        event.reply('set-language', selectedLanguage);
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
});













