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

  if (content.includes('@/lib/blog')) {
    // 1. Replace the import statement
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/blog['"];?/g, "import { container } from '@/application/di/container';");
    content = content.replace(/const\s+\{([^}]+)\}\s+=\s+require\(['"]@\/lib\/blog['"]\);?/g, "const { container } = require('@/application/di/container');");
    
    // 2. Add 'async' to default export if it's not there, since we'll use await inside
    // This is a naive regex but usually works for Next.js page components
    content = content.replace(/export default function/g, "export default async function");
    content = content.replace(/export function generateStaticParams/g, "export async function generateStaticParams");
    content = content.replace(/export function generateMetadata/g, "export async function generateMetadata");

    // 3. Replace method calls
    content = content.replace(/getSortedPostsData\(/g, "await container.getSortedPostsUseCase.execute(");
    content = content.replace(/getHierarchyData\(/g, "await container.hierarchyBuilder.build(");
    content = content.replace(/getPostData\(/g, "await container.getPostDataUseCase.execute(");
    content = content.replace(/getAllPostIds\(/g, "await container.getPostPathsUseCase.execute(");

    // Some calls might already be awaited (getPostData was originally async)
    content = content.replace(/await\s+await/g, "await");

    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
