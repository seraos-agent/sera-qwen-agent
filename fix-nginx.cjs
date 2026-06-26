const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
sed -i 's/location \\//client_max_body_size 100M;\\n    location \\//g' /etc/nginx/sites-available/api.setaradapps.com && \\
sed -i 's/location \\//client_max_body_size 100M;\\n    location \\//g' /etc/nginx/sites-available/ai.setaradapps.com && \\
nginx -t && systemctl reload nginx && echo DONE
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).on('error', (err) => {
  console.log('Error: ' + err);
}).connect({
  host: '8.219.250.29',
  port: 22,
  username: 'root',
  password: 'Sera020294#'
});
