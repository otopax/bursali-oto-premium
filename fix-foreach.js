const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'src', 'app');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if(file.endsWith('.js') || file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk(DIR);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('posts.forEach(')) {
    content = content.replace(/posts\.forEach\(/g, "posts.items.forEach(");
    changed = true;
  }
  
  if (content.includes('data.models[model].forEach(')) {
    content = content.replace(/data\.models\[model\]\.forEach\(/g, "data.models[model].items.forEach(");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed forEach in', file);
  }
});
