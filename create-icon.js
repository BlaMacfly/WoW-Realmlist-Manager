const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertToIco() {
    try {
        // Redimensionner l'image en 256x256
        await sharp('assets/icon.png')
            .resize(256, 256, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toFile('assets/icon-256.png');

        // Maintenant utiliser png-to-ico pour la conversion finale
        const pngToIco = require('png-to-ico');
        const buf = await pngToIco('assets/icon-256.png');
        fs.writeFileSync('assets/icon.ico', buf);

        // Nettoyer le fichier temporaire
        fs.unlinkSync('assets/icon-256.png');

        console.log('Icon converted successfully!');
    } catch (err) {
        console.error('Error converting icon:', err);
    }
}

convertToIco();
