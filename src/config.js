const Store = require('electron-store');

const store = new Store({
    defaults: {
        wowPath: null,
        customRealmlists: []
    }
});

module.exports = store;