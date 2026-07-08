const fs = require('fs');
const path = require('path');
const { exiftool } = require('exiftool-vendored');

const galleryDir = path.join(__dirname, '../public/gallery');

// Bursalı Oto Servis Fethiye GPS Coordinates
const lat = 36.6231;
const lon = 29.1245;
const tags = {
  GPSLatitude: lat,
  GPSLatitudeRef: 'N',
  GPSLongitude: lon,
  GPSLongitudeRef: 'E',
  Keywords: ['Bursalı Oto Servis', 'Fethiye', 'Oto Tamir', 'Porsche Servis', 'BMW Servis', 'Mercedes Servis', 'Audi Servis'],
  Description: 'Bursalı Oto Servis Fethiye - Premium Araç Bakım ve Onarım Merkezi',
};

async function processPhotos() {
  try {
    const files = fs.readdirSync(galleryDir);
    const photos = files.filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.png'));
    
    console.log(`Found ${photos.length} photos. Starting geotagging...`);
    
    for (let i = 0; i < photos.length; i++) {
      const filePath = path.join(galleryDir, photos[i]);
      console.log(`[${i+1}/${photos.length}] Tagging ${photos[i]}...`);
      await exiftool.write(filePath, tags, ['-overwrite_original']);
    }
    
    console.log('Successfully tagged all photos!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await exiftool.end(); // close the exiftool child process
  }
}

processPhotos();
