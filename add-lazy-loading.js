import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;
walkDir('src', function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace <img ... with <img loading="lazy" ... if loading is not already there
    // Regex explanation: Match <img followed by space, negative lookahead for loading=
    let newContent = content.replace(/<img\s+(?!.*?\bloading\s*=)/g, '<img loading="lazy" ');
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated:', filePath);
      modifiedFiles++;
    }
  }
});

console.log(`Finished updating ${modifiedFiles} files.`);
