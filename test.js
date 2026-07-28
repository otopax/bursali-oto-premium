const { spawn } = require('child_process');
const server = spawn('npx.cmd', ['next', 'start', '-p', '3006'], { shell: true });
setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:3006/tr/ariza-cozumleri/bmw');
    console.log('Status: ' + res.status);
    console.log('Cache-Control: ' + res.headers.get('cache-control'));
    console.log('X-Nextjs-Cache: ' + res.headers.get('x-nextjs-cache'));
    
    let rlStatus;
    for (let i = 0; i < 15; i++) {
      const rlRes = await fetch('http://localhost:3006/api/chat', { 
        method: 'POST', 
        body: JSON.stringify({messages:[{role:'user', content:'test'}]}), 
        headers:{'content-type':'application/json'} 
      });
      rlStatus = rlRes.status;
      if (rlStatus === 429) {
         console.log('Rate Limit Hit at request ' + (i+1) + ': 429');
         break;
      }
    }
  } catch(e) {}
  server.kill();
  process.exit();
}, 15000);
