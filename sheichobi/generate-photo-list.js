// Node.js script to automatically generate photo list
// Run this script whenever you add new photos: node generate-photo-list.js

const fs = require('fs');
const path = require('path');

const photosDir = './Photographs';
const outputFile = './photos.json';

// Read all files from the Photographs directory
fs.readdir(photosDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // Filter only image files
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const photoList = files
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    })
    .map(file => `Photographs/${file}`)
    .sort(); // Sort alphabetically

  // Write to JSON file
  fs.writeFile(outputFile, JSON.stringify(photoList, null, 2), (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log(`✓ Generated ${outputFile} with ${photoList.length} photos`);
    console.log('Photos found:', photoList);
  });
});
