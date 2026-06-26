const { Client } = require('C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\eed2de16-4fd6-41ce-a042-47b951f031a7\\scratch\\ssh-check\\node_modules\\ssh2');
const fs = require('fs');
const path = require('path');

const host = '8.219.250.29';
const username = 'root';
const password = 'Sera020294#';

const filesToUpdate = [
  'sera-agent-python/tools/sera_tools.py',
  'sera-agent-python/services/asset_service.py',
  'sera-agent-python/services/chat_service.py',
  'sera-agent-python/agents/prompts/plan_agent.txt',
  'sera-agent-python/agents/prompts/store_agent.txt',
  'sera-agent-python/agents/prompts/spokesperson_agent.txt'
];

const conn = new Client();
conn.on('ready', () => {
  console.log('Client ready. Starting SFTP upload for changed files...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    let uploadedCount = 0;
    
    function uploadNext() {
      if (uploadedCount >= filesToUpdate.length) {
        console.log('All files uploaded. Restarting backend processes...');
        conn.exec('pm2 restart sera-python sera-node', (err, stream) => {
          if (err) throw err;
          stream.on('close', (code, signal) => {
            console.log('PM2 restart finished with code ' + code);
            conn.end();
          }).on('data', (data) => {
            process.stdout.write(data);
          }).stderr.on('data', (data) => {
            process.stderr.write(data);
          });
        });
        return;
      }
      
      const file = filesToUpdate[uploadedCount];
      const localPath = path.join(__dirname, file);
      const remotePath = '/root/sera-project/' + file.replace(/\\/g, '/');
      
      console.log(`Uploading ${file}...`);
      sftp.fastPut(localPath, remotePath, (err) => {
        if (err) {
          console.error(`Error uploading ${file}:`, err);
          conn.end();
          return;
        }
        uploadedCount++;
        uploadNext();
      });
    }
    
    uploadNext();
  });
}).on('error', (err) => {
  console.log('Error: ' + err);
}).connect({
  host,
  port: 22,
  username,
  password,
  readyTimeout: 60000
});
