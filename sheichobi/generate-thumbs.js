// Node.js script to generate grid thumbnails (Photographs/thumbs/).
// The archive grid and collection preview load these; the lightbox
// loads the originals. Run after adding new photos:
//   npm install sharp && node generate-thumbs.js
// (new photos without a thumb still work — the grid falls back to
// the original — but they load slower until this is run)

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const photosDir = './Photographs';
const thumbsDir = path.join(photosDir, 'thumbs');
fs.mkdirSync(thumbsDir, { recursive: true });

(async () => {
  const files = fs.readdirSync(photosDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  let made = 0;
  for (const file of files) {
    const dest = path.join(thumbsDir, file);
    if (fs.existsSync(dest)) continue;
    await sharp(path.join(photosDir, file))
      .resize({ width: 900, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(dest);
    made++;
  }
  console.log(`${files.length} photos, ${made} new thumbnails generated`);
})();
