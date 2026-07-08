const { contextBridge, ipcRenderer } = require('electron');

// Surface d'API minimale et explicite exposée au renderer.
// Le renderer n'a aucun accès direct à Node, fs ou child_process.
contextBridge.exposeInMainWorld('api', {
    getState: () => ipcRenderer.invoke('get-state'),
    addRealm: (payload) => ipcRenderer.invoke('add-realm', payload),
    updateRealm: (payload) => ipcRenderer.invoke('update-realm', payload),
    toggleRealm: (id) => ipcRenderer.invoke('toggle-realm', id),
    deleteRealm: (id) => ipcRenderer.invoke('delete-realm', id),
    reorderRealm: (payload) => ipcRenderer.invoke('reorder-realm', payload),
    selectWowPath: () => ipcRenderer.invoke('select-wow-path'),
    launchWow: () => ipcRenderer.invoke('launch-wow'),
    openAddonsFolder: () => ipcRenderer.invoke('open-addons-folder'),
    readCurrentRealmlist: () => ipcRenderer.invoke('read-current-realmlist'),
    exportRealms: () => ipcRenderer.invoke('export-realms'),
    importRealms: () => ipcRenderer.invoke('import-realms'),
    minimize: () => ipcRenderer.send('window-minimize'),
    close: () => ipcRenderer.send('window-close')
});
