import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUpload() {
  const dummyFile = path.join(__dirname, 'dummy.mp4');
  fs.writeFileSync(dummyFile, 'dummy video content');
  
  const buffer = fs.readFileSync(dummyFile);
  const blob = new Blob([buffer], { type: 'video/mp4' });
  
  const formData = new FormData();
  formData.append('video', blob, 'dummy.mp4');
  
  try {
    const res = await fetch('https://api.setaradapps.com/api/upload-video', {
      method: 'POST',
      body: formData
    });
    const data = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (fs.existsSync(dummyFile)) fs.unlinkSync(dummyFile);
  }
}

testUpload();
