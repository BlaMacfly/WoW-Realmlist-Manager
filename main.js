const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const { spawn, execFileSync } = require('child_process');
const Store = require('electron-store');

const store = new Store();

let mainWindow;

const LANGUAGE_FOLDERS = ['frFR', 'enUS', 'deDE', 'esES', 'esMX', 'ptBR', 'itIT', 'ruRU', 'koKR', 'zhCN', 'zhTW'];

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 640,
        minWidth: 640,
        minHeight: 480,
        frame: false,
        backgroundColor: '#0d0f14',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        },
        icon: path.join(__dirname, 'icon.png')
    });

    mainWindow.loadFile('index.html');
    mainWindow.setMenu(null);
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

// ---------------------------------------------------------------------------
// Realm helpers
// ---------------------------------------------------------------------------

function getRealmlists() {
    const realms = store.get('realmlists', []);
    // Migration : anciennes entrées sans id / name
    let migrated = false;
    realms.forEach((realm) => {
        if (!realm.id) { realm.id = randomUUID(); migrated = true; }
        if (realm.name === undefined) { realm.name = ''; migrated = true; }
        if (realm.active === undefined) { realm.active = false; migrated = true; }
    });
    if (migrated) store.set('realmlists', realms);
    return realms;
}

function saveRealmlists(realmlists) {
    store.set('realmlists', realmlists);
}

// Normalise une adresse saisie en une ligne "set realmlist <hôte>".
function normalizeRealmline(raw) {
    let value = String(raw || '').trim();
    if (!value) return null;
    // Retire un éventuel préfixe "set realmlist " pour ne garder que l'hôte.
    value = value.replace(/^set\s+realmlist\s+/i, '').trim();
    if (!value) return null;
    return `set realmlist ${value}`;
}

// Retourne l'hôte seul (sans le préfixe) pour l'affichage.
function hostOnly(address) {
    return String(address || '').replace(/^set\s+realmlist\s+/i, '').trim();
}

// ---------------------------------------------------------------------------
// Fichier realmlist.wtf
// ---------------------------------------------------------------------------

// Retourne tous les dossiers de langue existants sous <WoW>/Data.
// Si aucun n'existe, en crée un par défaut (enUS) pour éviter l'échec.
function getLanguagePaths(dataPath) {
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
    }
    const found = LANGUAGE_FOLDERS
        .map((lang) => path.join(dataPath, lang))
        .filter((p) => fs.existsSync(p));

    if (found.length > 0) return found;

    const fallback = path.join(dataPath, 'enUS');
    fs.mkdirSync(fallback, { recursive: true });
    return [fallback];
}

function getWowDir() {
    const wowPath = store.get('wowPath');
    if (!wowPath) {
        throw new Error('SELECT_WOW');
    }
    return path.dirname(wowPath);
}

// Écrit la ligne realmlist dans chaque dossier de langue, avec sauvegarde .bak.
function updateRealmlistFile(address) {
    const line = normalizeRealmline(address);
    if (!line) throw new Error('INVALID_ADDRESS');

    const dataPath = path.join(getWowDir(), 'Data');
    const langPaths = getLanguagePaths(dataPath);
    const written = [];

    for (const langPath of langPaths) {
        const realmlistPath = path.join(langPath, 'realmlist.wtf');
        // Sauvegarde du fichier existant avant écrasement (une seule fois).
        if (fs.existsSync(realmlistPath)) {
            const backupPath = `${realmlistPath}.bak`;
            if (!fs.existsSync(backupPath)) {
                fs.copyFileSync(realmlistPath, backupPath);
            }
        }
        fs.writeFileSync(realmlistPath, `${line}\n`);
        written.push(realmlistPath);
    }
    return written;
}

// ---------------------------------------------------------------------------
// Lancement de WoW
// ---------------------------------------------------------------------------

function launchWow(wowPath) {
    const cwd = path.dirname(wowPath);

    if (process.platform === 'win32') {
        const wow = spawn(wowPath, [], { detached: true, stdio: 'ignore', cwd });
        wow.unref();
        return;
    }

    if (process.platform === 'linux') {
        try {
            execFileSync('which', ['wine']);
        } catch {
            throw new Error('WINE_MISSING');
        }
        const wow = spawn('wine', [wowPath], { detached: true, stdio: 'ignore', cwd });
        wow.unref();
        return;
    }

    throw new Error('UNSUPPORTED_OS');
}

// ---------------------------------------------------------------------------
// IPC
// ---------------------------------------------------------------------------

ipcMain.handle('get-state', () => ({
    realmlists: getRealmlists(),
    wowPath: store.get('wowPath', null)
}));

ipcMain.handle('add-realm', (event, { name, address }) => {
    const line = normalizeRealmline(address);
    if (!line) throw new Error('INVALID_ADDRESS');

    const realmlists = getRealmlists();
    realmlists.push({
        id: randomUUID(),
        name: String(name || '').trim(),
        address: line,
        active: false
    });
    saveRealmlists(realmlists);
    return realmlists;
});

ipcMain.handle('update-realm', (event, { id, name, address }) => {
    const line = normalizeRealmline(address);
    if (!line) throw new Error('INVALID_ADDRESS');

    const realmlists = getRealmlists();
    const realm = realmlists.find((r) => r.id === id);
    if (!realm) throw new Error('NOT_FOUND');
    realm.name = String(name || '').trim();
    realm.address = line;
    saveRealmlists(realmlists);
    // Si le realm modifié est actif, on réécrit le fichier.
    if (realm.active) updateRealmlistFile(realm.address);
    return realmlists;
});

ipcMain.handle('toggle-realm', (event, id) => {
    const realmlists = getRealmlists();
    const target = realmlists.find((r) => r.id === id);
    if (!target) throw new Error('NOT_FOUND');

    const willActivate = !target.active;
    realmlists.forEach((r) => { r.active = false; });
    target.active = willActivate;

    if (willActivate) {
        updateRealmlistFile(target.address);
    }
    saveRealmlists(realmlists);
    return realmlists;
});

ipcMain.handle('delete-realm', (event, id) => {
    const realmlists = getRealmlists().filter((r) => r.id !== id);
    saveRealmlists(realmlists);
    return realmlists;
});

ipcMain.handle('reorder-realm', (event, { id, direction }) => {
    const realmlists = getRealmlists();
    const index = realmlists.findIndex((r) => r.id === id);
    if (index === -1) return realmlists;
    const target = index + (direction === 'up' ? -1 : 1);
    if (target < 0 || target >= realmlists.length) return realmlists;
    [realmlists[index], realmlists[target]] = [realmlists[target], realmlists[index]];
    saveRealmlists(realmlists);
    return realmlists;
});

ipcMain.handle('select-wow-path', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'WoW', extensions: ['exe'] }]
    });
    if (!result.canceled && result.filePaths.length > 0) {
        const wowPath = result.filePaths[0];
        store.set('wowPath', wowPath);
        return wowPath;
    }
    return null;
});

ipcMain.handle('launch-wow', () => {
    const wowPath = store.get('wowPath');
    if (!wowPath) throw new Error('SELECT_WOW');
    if (!fs.existsSync(wowPath)) throw new Error('WOW_NOT_FOUND');

    const activeRealm = getRealmlists().find((r) => r.active);
    if (!activeRealm) throw new Error('SELECT_REALM');

    launchWow(wowPath);
});

ipcMain.handle('open-addons-folder', () => {
    const addonsPath = path.join(getWowDir(), 'Interface', 'AddOns');
    if (!fs.existsSync(addonsPath)) {
        fs.mkdirSync(addonsPath, { recursive: true });
    }
    shell.openPath(addonsPath);
});

// Aperçu du contenu realmlist.wtf actuellement écrit sur le disque.
ipcMain.handle('read-current-realmlist', () => {
    try {
        const dataPath = path.join(getWowDir(), 'Data');
        const langPaths = getLanguagePaths(dataPath);
        for (const langPath of langPaths) {
            const realmlistPath = path.join(langPath, 'realmlist.wtf');
            if (fs.existsSync(realmlistPath)) {
                return fs.readFileSync(realmlistPath, 'utf8').trim();
            }
        }
    } catch {
        // ignoré : simple aperçu
    }
    return null;
});

ipcMain.handle('export-realms', async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export realms',
        defaultPath: 'realms.json',
        filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (result.canceled || !result.filePath) return false;

    const realms = getRealmlists().map(({ name, address }) => ({
        name,
        address: hostOnly(address)
    }));
    fs.writeFileSync(result.filePath, JSON.stringify(realms, null, 2));
    return true;
});

ipcMain.handle('import-realms', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Import realms',
        properties: ['openFile'],
        filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (result.canceled || result.filePaths.length === 0) return null;

    let data;
    try {
        data = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'));
    } catch {
        throw new Error('IMPORT_PARSE');
    }
    if (!Array.isArray(data)) throw new Error('IMPORT_FORMAT');

    const realmlists = getRealmlists();
    const existing = new Set(realmlists.map((r) => r.address.toLowerCase()));
    let added = 0;
    for (const entry of data) {
        const line = normalizeRealmline(entry && entry.address);
        if (!line || existing.has(line.toLowerCase())) continue;
        realmlists.push({
            id: randomUUID(),
            name: String((entry && entry.name) || '').trim(),
            address: line,
            active: false
        });
        existing.add(line.toLowerCase());
        added++;
    }
    saveRealmlists(realmlists);
    return { realmlists, added };
});

// Contrôles de fenêtre
ipcMain.on('window-minimize', () => mainWindow && !mainWindow.isDestroyed() && mainWindow.minimize());
ipcMain.on('window-close', () => mainWindow && !mainWindow.isDestroyed() && mainWindow.close());
