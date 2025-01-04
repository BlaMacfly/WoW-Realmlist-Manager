const pngToIco = require('png-to-ico');
const fs = require('fs');

async function createIcon() {
    try {
        const buffer = await pngToIco('assets/logo.png');
        fs.writeFileSync('assets/icon.ico', buffer);
        console.log('Icon created successfully!');
    } catch (error) {
        console.error('Error creating icon:', error);
    }
}

createIcon();
