const https = require('https');

https.get('https://mybusinessbusinessinformation.googleapis.com/$discovery/rest?version=v1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const doc = JSON.parse(data);
    if (doc.resources) {
      for (const r in doc.resources) {
        console.log(`Resource: ${r}`);
        if (doc.resources[r].methods) {
          for (const m in doc.resources[r].methods) {
            console.log(`  ${m}: ${doc.resources[r].methods[m].httpMethod} ${doc.resources[r].methods[m].path}`);
          }
        }
      }
    }
  });
}).on('error', err => console.error(err));
