const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        invoke: (...args) => ipcRenderer.invoke(...args),
        send: (...args) => {
            console.log('Envoi IPC:', ...args);
            ipcRenderer.send(...args);
        },
        on: (channel, listener) => ipcRenderer.on(channel, (event, ...args) => {
            console.log(`Réception IPC sur ${channel}:`, args);
            listener(event, ...args);
        }),
        removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
    }
});

window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('load-config');
    ipcRenderer.on('config-loaded', (event, config) => {
        if (config.wowRealmlistPath) {
            document.getElementById('path-input').value = config.wowRealmlistPath;
        }
        if (config.wowExePath) {
            document.getElementById('exe-path-input').value = config.wowExePath;
        }
    });
});

console.log('preload.js est en cours d'exécution. Communication IPC établie.');



