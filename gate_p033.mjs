import fs from 'fs/promises';
import path from 'path';

const root = process.cwd();
const ignoreDirs = ['node_modules', '.next', '.git', 'public/catalog', 'scratch'];
const allowedExts = ['.js', '.ts', '.json', '.tsx', '.jsx'];

async function *walk(dir) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
          if (!ignoreDirs.includes(file.name)) {
              yield* walk(path.join(dir, file.name));
          }
      } else {
          const ext = path.extname(file.name);
          if (allowedExts.includes(ext)) {
              yield path.join(dir, file.name);
          }
      }
    }
  } catch (e) {
    // ignore
  }
}

async function search() {
    let found = false;
    for await (const file of walk(root)) {
        try {
            const content = await fs.readFile(file, 'utf-8');
            if (content.toLowerCase().includes('country')) {
                // If it looks like a brand mapping or metadata array
                if (content.toLowerCase().includes('toyota') || content.toLowerCase().includes('brand') || content.toLowerCase().includes('manufacturer')) {
                    console.log(`\n--- Match in ${file.replace(root, '')} ---`);
                    const lines = content.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].toLowerCase().includes('country')) {
                            // Print context
                            console.log(`L${i+1}: ${lines[i].trim()}`);
                        }
                    }
                    found = true;
                }
            }
        } catch(e) {}
    }
    if (!found) {
        console.log("COUNTRY_TRUTH_SOURCE = NONE");
    }
}

search();
