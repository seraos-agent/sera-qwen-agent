const { Client } = require('ssh2');
const fs = require('fs');

const host = '8.219.250.29';
const username = 'root';
const password = 'Sera020294#';
const localFile = 'C:\\Users\\Admin\\Desktop\\SERA-QWEN-HACKTHON\\backend-deploy.zip';
const remoteFile = '/root/backend-deploy.zip';

const deployCommands = `
set -e
echo "Extracting backend..."
mkdir -p /root/sera-project
cd /root/sera-project
unzip -o /root/backend-deploy.zip > /dev/null
rm /root/backend-deploy.zip

echo "Updating Node Backend..."
cd /root/sera-project/server
npm install

echo "Updating Python Backend..."
cd /root/sera-project/sera-agent-python
source .venv/bin/activate
pip install -r requirements.txt

echo "Restarting PM2 Processes..."
pm2 restart sera-node
pm2 restart sera-python

echo "Backend Deployment SUCCESSFUL!"
pm2 status
`;

const conn = new Client();
conn.on('ready', () => {
  console.log('Client ready. Starting SFTP upload...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) throw err;
      console.log('Upload complete. Executing commands...');
      conn.exec(deployCommands, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('Execution finished with code ' + code);
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data);
        }).stderr.on('data', (data) => {
          process.stderr.write(data);
        });
      });
    });
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
