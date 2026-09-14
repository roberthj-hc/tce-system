const fs = require('fs');
const { getLocalIp } = require('./src/utils/network');

const ip = getLocalIp();
//const content = `NEXT_PUBLIC_API_URL=http://${ip}:4000\n`;
const content = `NEXT_PUBLIC_API_URL=http://127.0.0.1:4000\n`;

fs.writeFileSync('./.env.local', content);
console.log(`🔧 .env.local actualizado con IP dinámica: ${content}`);
