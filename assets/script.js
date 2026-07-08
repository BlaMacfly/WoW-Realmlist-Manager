'use strict';

// ---------------------------------------------------------------------------
// Sons
// ---------------------------------------------------------------------------
const sounds = {
    click: new Audio('assets/sounds/click.mp3'),
    launch: new Audio('assets/sounds/launch.mp3'),
    toggle: new Audio('assets/sounds/toggle.mp3'),
    browse: new Audio('assets/sounds/browse.mp3')
};

function playSound(name) {
    const base = sounds[name];
    if (!base) return;
    const sound = base.cloneNode();
    sound.volume = 0.5;
    sound.play().catch(() => {});
}

// ---------------------------------------------------------------------------
// Traductions
// ---------------------------------------------------------------------------
const translations = {
    fr: {
        title: 'RealmList Manager', addRealm: '+ Ajouter un realm', launchWow: '▶ Lancer WoW',
        openAddons: 'Dossier Addons', browse: 'Parcourir', pathLabel: 'Chemin vers WoW.exe',
        search: 'Rechercher…', import: 'Importer', export: 'Exporter',
        empty: 'Aucun realm. Cliquez sur « Ajouter un realm » pour commencer.',
        nameLabel: 'Nom (facultatif)', namePlaceholder: 'Ex : Firestorm Sethraliss',
        addressLabel: 'Adresse du realm', addressHint: '« set realmlist » est ajouté automatiquement.',
        editRealm: 'Modifier le realm', cancel: 'Annuler', save: 'Enregistrer',
        active: 'ACTIF', activate: 'Activer', edit: 'Éditer', delete: 'Supprimer', copy: 'Copier',
        confirmDelete: 'Supprimer ce realm ?', copied: 'Adresse copiée', activated: 'Realm activé',
        exported: 'Realms exportés', imported: 'realm(s) importé(s)', currentRealm: 'Realm actif sur le disque :',
        errors: {
            SELECT_WOW: 'Veuillez d\'abord sélectionner WoW.exe',
            SELECT_REALM: 'Veuillez activer un realm d\'abord',
            WOW_NOT_FOUND: 'WoW.exe est introuvable au chemin enregistré',
            INVALID_ADDRESS: 'Adresse de realm invalide',
            WINE_MISSING: 'Wine n\'est pas installé (requis sous Linux)',
            UNSUPPORTED_OS: 'Système d\'exploitation non supporté',
            IMPORT_PARSE: 'Fichier d\'import illisible', IMPORT_FORMAT: 'Format de fichier invalide',
            generic: 'Une erreur est survenue'
        }
    },
    en: {
        title: 'RealmList Manager', addRealm: '+ Add realm', launchWow: '▶ Launch WoW',
        openAddons: 'Addons Folder', browse: 'Browse', pathLabel: 'Path to WoW.exe',
        search: 'Search…', import: 'Import', export: 'Export',
        empty: 'No realms yet. Click "Add realm" to get started.',
        nameLabel: 'Name (optional)', namePlaceholder: 'e.g. Firestorm Sethraliss',
        addressLabel: 'Realm address', addressHint: '"set realmlist" is added automatically.',
        editRealm: 'Edit realm', cancel: 'Cancel', save: 'Save',
        active: 'ACTIVE', activate: 'Activate', edit: 'Edit', delete: 'Delete', copy: 'Copy',
        confirmDelete: 'Delete this realm?', copied: 'Address copied', activated: 'Realm activated',
        exported: 'Realms exported', imported: 'realm(s) imported', currentRealm: 'Active realm on disk:',
        errors: {
            SELECT_WOW: 'Please select WoW.exe first', SELECT_REALM: 'Please activate a realm first',
            WOW_NOT_FOUND: 'WoW.exe not found at the saved path', INVALID_ADDRESS: 'Invalid realm address',
            WINE_MISSING: 'Wine is not installed (required on Linux)', UNSUPPORTED_OS: 'Unsupported operating system',
            IMPORT_PARSE: 'Import file could not be read', IMPORT_FORMAT: 'Invalid file format',
            generic: 'An error occurred'
        }
    },
    de: {
        title: 'RealmList Manager', addRealm: '+ Realm hinzufügen', launchWow: '▶ WoW starten',
        openAddons: 'Addons-Ordner', browse: 'Durchsuchen', pathLabel: 'Pfad zu WoW.exe',
        search: 'Suchen…', import: 'Importieren', export: 'Exportieren',
        empty: 'Noch keine Realms. Klicke auf „Realm hinzufügen".',
        nameLabel: 'Name (optional)', namePlaceholder: 'z. B. Firestorm Sethraliss',
        addressLabel: 'Realm-Adresse', addressHint: '„set realmlist" wird automatisch hinzugefügt.',
        editRealm: 'Realm bearbeiten', cancel: 'Abbrechen', save: 'Speichern',
        active: 'AKTIV', activate: 'Aktivieren', edit: 'Bearbeiten', delete: 'Löschen', copy: 'Kopieren',
        confirmDelete: 'Diesen Realm löschen?', copied: 'Adresse kopiert', activated: 'Realm aktiviert',
        exported: 'Realms exportiert', imported: 'Realm(s) importiert', currentRealm: 'Aktiver Realm auf der Festplatte:',
        errors: {
            SELECT_WOW: 'Bitte zuerst WoW.exe auswählen', SELECT_REALM: 'Bitte zuerst einen Realm aktivieren',
            WOW_NOT_FOUND: 'WoW.exe am gespeicherten Pfad nicht gefunden', INVALID_ADDRESS: 'Ungültige Realm-Adresse',
            WINE_MISSING: 'Wine ist nicht installiert (unter Linux erforderlich)', UNSUPPORTED_OS: 'Nicht unterstütztes Betriebssystem',
            IMPORT_PARSE: 'Importdatei nicht lesbar', IMPORT_FORMAT: 'Ungültiges Dateiformat',
            generic: 'Ein Fehler ist aufgetreten'
        }
    },
    es: {
        title: 'RealmList Manager', addRealm: '+ Añadir realm', launchWow: '▶ Iniciar WoW',
        openAddons: 'Carpeta Addons', browse: 'Explorar', pathLabel: 'Ruta a WoW.exe',
        search: 'Buscar…', import: 'Importar', export: 'Exportar',
        empty: 'No hay realms. Haz clic en «Añadir realm» para empezar.',
        nameLabel: 'Nombre (opcional)', namePlaceholder: 'Ej: Firestorm Sethraliss',
        addressLabel: 'Dirección del realm', addressHint: '«set realmlist» se añade automáticamente.',
        editRealm: 'Editar realm', cancel: 'Cancelar', save: 'Guardar',
        active: 'ACTIVO', activate: 'Activar', edit: 'Editar', delete: 'Eliminar', copy: 'Copiar',
        confirmDelete: '¿Eliminar este realm?', copied: 'Dirección copiada', activated: 'Realm activado',
        exported: 'Realms exportados', imported: 'realm(s) importado(s)', currentRealm: 'Realm activo en el disco:',
        errors: {
            SELECT_WOW: 'Selecciona primero WoW.exe', SELECT_REALM: 'Activa primero un realm',
            WOW_NOT_FOUND: 'No se encuentra WoW.exe en la ruta guardada', INVALID_ADDRESS: 'Dirección de realm inválida',
            WINE_MISSING: 'Wine no está instalado (requerido en Linux)', UNSUPPORTED_OS: 'Sistema operativo no compatible',
            IMPORT_PARSE: 'No se pudo leer el archivo', IMPORT_FORMAT: 'Formato de archivo inválido',
            generic: 'Ha ocurrido un error'
        }
    }
};

let currentLanguage = localStorage.getItem('language') || 'fr';
let realms = [];
let editingId = null;

function t(key) {
    return translations[currentLanguage][key] || translations.en[key] || key;
}

function translateError(err) {
    const code = (err && err.message ? err.message : '').replace(/^Error:\s*/, '').trim();
    const table = translations[currentLanguage].errors;
    return table[code] || (err && err.message) || table.generic;
}

// ---------------------------------------------------------------------------
// Éléments DOM
// ---------------------------------------------------------------------------
const el = (id) => document.getElementById(id);
const pathInput = el('path-input');
const realmList = el('realm-list');
const emptyState = el('empty-state');
const searchInput = el('search-input');
const currentRealmBox = el('current-realm');
const statusText = el('status-text');
const languageSelect = el('language-select');
const modalOverlay = el('modal-overlay');
const modalTitle = el('modal-title');
const modalName = el('modal-name');
const modalAddress = el('modal-address');

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((node) => {
        node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach((node) => {
        node.placeholder = t(node.dataset.i18nPh);
    });
    document.documentElement.lang = currentLanguage;
}

let statusTimer;
function setStatus(message, isError = false) {
    statusText.textContent = message;
    statusText.classList.toggle('error', isError);
    clearTimeout(statusTimer);
    if (message) statusTimer = setTimeout(() => { statusText.textContent = ''; statusText.classList.remove('error'); }, 4000);
}

function hostOnly(address) {
    return String(address || '').replace(/^set\s+realmlist\s+/i, '').trim();
}

// ---------------------------------------------------------------------------
// Rendu des realms
// ---------------------------------------------------------------------------
function renderRealms() {
    const filter = searchInput.value.trim().toLowerCase();
    realmList.innerHTML = '';

    const visible = realms.filter((r) => {
        if (!filter) return true;
        return (r.name || '').toLowerCase().includes(filter) || hostOnly(r.address).toLowerCase().includes(filter);
    });

    emptyState.hidden = realms.length !== 0;

    visible.forEach((realm) => {
        realmList.appendChild(buildRealmCard(realm));
    });
}

function buildRealmCard(realm) {
    const card = document.createElement('div');
    card.className = `realm-item${realm.active ? ' active' : ''}`;

    const info = document.createElement('div');
    info.className = 'realm-info';

    if (realm.name) {
        const name = document.createElement('div');
        name.className = 'realm-name';
        name.textContent = realm.name;
        info.appendChild(name);
    }

    const addr = document.createElement('div');
    addr.className = 'realm-address';
    addr.textContent = hostOnly(realm.address);
    info.appendChild(addr);

    if (realm.active) {
        const badge = document.createElement('span');
        badge.className = 'active-badge';
        badge.textContent = t('active');
        info.appendChild(badge);
    }

    const controls = document.createElement('div');
    controls.className = 'realm-controls';

    const toggleBtn = iconButton(realm.active ? 'ON' : 'OFF', realm.active ? 'toggle on' : 'toggle', () => onToggle(realm.id));
    const editBtn = iconButton('✎', 'ghost', () => openModal(realm), t('edit'));
    const copyBtn = iconButton('⧉', 'ghost', () => onCopy(realm), t('copy'));
    const delBtn = iconButton('🗑', 'ghost danger', () => onDelete(realm.id), t('delete'));

    controls.append(toggleBtn, editBtn, copyBtn, delBtn);
    card.append(info, controls);
    return card;
}

function iconButton(label, className, onClick, title) {
    const btn = document.createElement('button');
    btn.className = `rbtn ${className}`;
    btn.textContent = label;
    if (title) btn.title = title;
    btn.addEventListener('click', onClick);
    return btn;
}

// ---------------------------------------------------------------------------
// Actions realm
// ---------------------------------------------------------------------------
async function refresh() {
    const state = await window.api.getState();
    realms = state.realmlists;
    pathInput.value = state.wowPath || '';
    renderRealms();
    updateCurrentRealm();
}

async function updateCurrentRealm() {
    const line = await window.api.readCurrentRealmlist();
    if (line) {
        currentRealmBox.textContent = `${t('currentRealm')} ${hostOnly(line)}`;
        currentRealmBox.hidden = false;
    } else {
        currentRealmBox.hidden = true;
    }
}

async function onToggle(id) {
    playSound('toggle');
    try {
        realms = await window.api.toggleRealm(id);
        renderRealms();
        updateCurrentRealm();
        if (realms.find((r) => r.id === id && r.active)) setStatus(t('activated'));
    } catch (err) {
        setStatus(translateError(err), true);
    }
}

async function onDelete(id) {
    if (!window.confirm(t('confirmDelete'))) return;
    playSound('click');
    try {
        realms = await window.api.deleteRealm(id);
        renderRealms();
    } catch (err) {
        setStatus(translateError(err), true);
    }
}

async function onCopy(realm) {
    try {
        await navigator.clipboard.writeText(realm.address);
        setStatus(t('copied'));
    } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Modale
// ---------------------------------------------------------------------------
function openModal(realm) {
    playSound('click');
    editingId = realm ? realm.id : null;
    modalTitle.textContent = realm ? t('editRealm') : t('addRealm');
    modalName.value = realm ? (realm.name || '') : '';
    modalAddress.value = realm ? hostOnly(realm.address) : '';
    modalOverlay.hidden = false;
    modalAddress.focus();
}

function closeModal() {
    modalOverlay.hidden = true;
    editingId = null;
}

async function saveModal() {
    const name = modalName.value;
    const address = modalAddress.value;
    if (!address.trim()) { modalAddress.focus(); return; }
    playSound('toggle');
    try {
        if (editingId) {
            realms = await window.api.updateRealm({ id: editingId, name, address });
        } else {
            realms = await window.api.addRealm({ name, address });
        }
        closeModal();
        renderRealms();
        updateCurrentRealm();
    } catch (err) {
        setStatus(translateError(err), true);
    }
}

// ---------------------------------------------------------------------------
// Barre d'actions
// ---------------------------------------------------------------------------
async function selectPath() {
    playSound('browse');
    try {
        const p = await window.api.selectWowPath();
        if (p) { pathInput.value = p; updateCurrentRealm(); }
    } catch (err) {
        setStatus(translateError(err), true);
    }
}

async function launch() {
    playSound('launch');
    try {
        await window.api.launchWow();
    } catch (err) {
        setStatus(translateError(err), true);
    }
}

async function openAddons() {
    playSound('click');
    try {
        await window.api.openAddonsFolder();
    } catch (err) {
        setStatus(translateError(err), true);
    }
}

async function exportRealms() {
    try {
        if (await window.api.exportRealms()) setStatus(t('exported'));
    } catch (err) {
        setStatus(translateError(err), true);
    }
}

async function importRealms() {
    try {
        const result = await window.api.importRealms();
        if (result) {
            realms = result.realmlists;
            renderRealms();
            setStatus(`${result.added} ${t('imported')}`);
        }
    } catch (err) {
        setStatus(translateError(err), true);
    }
}

// ---------------------------------------------------------------------------
// Thème
// ---------------------------------------------------------------------------
function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    playSound('click');
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
}

// ---------------------------------------------------------------------------
// Câblage des événements
// ---------------------------------------------------------------------------
el('minimize-btn').addEventListener('click', () => { playSound('click'); window.api.minimize(); });
el('close-btn').addEventListener('click', () => { playSound('click'); window.api.close(); });
el('theme-btn').addEventListener('click', toggleTheme);
el('select-path').addEventListener('click', selectPath);
el('add-realm').addEventListener('click', () => openModal(null));
el('launch-wow').addEventListener('click', launch);
el('open-addon').addEventListener('click', openAddons);
el('export-realms').addEventListener('click', exportRealms);
el('import-realms').addEventListener('click', importRealms);
searchInput.addEventListener('input', renderRealms);
el('modal-cancel').addEventListener('click', closeModal);
el('modal-save').addEventListener('click', saveModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
modalAddress.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveModal(); });
modalName.addEventListener('keydown', (e) => { if (e.key === 'Enter') modalAddress.focus(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modalOverlay.hidden) closeModal(); });

languageSelect.addEventListener('change', (e) => {
    playSound('click');
    currentLanguage = e.target.value;
    localStorage.setItem('language', currentLanguage);
    applyTranslations();
    renderRealms();
    updateCurrentRealm();
});

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------
applyTheme(localStorage.getItem('theme') || 'dark');
languageSelect.value = currentLanguage;
applyTranslations();
refresh();
