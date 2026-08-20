import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const LIBRARY_DIR = path.join(process.cwd(), 'src/content/library');
const FAULTS_DIR = path.join(process.cwd(), 'src/content/faults');

export function getMdxFiles(dir) {
  try {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(file => file.endsWith('.mdx'));
  } catch (error) {
    console.error(`Error reading MDX files from ${dir}:`, error);
    return [];
  }
}

export function getArticleBySlug(slug, dir = LIBRARY_DIR) {
  try {
    const realSlug = slug.replace(/\.mdx$/, '');
    const fullPath = path.join(dir, `${realSlug}.mdx`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      slug: realSlug,
      frontmatter: data,
      content,
    };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
}

export function getAllArticles() {
  const libraryFiles = getMdxFiles(LIBRARY_DIR);
  const faultFiles = getMdxFiles(FAULTS_DIR);
  
  const articles = [];
  
  libraryFiles.forEach(file => {
    const article = getArticleBySlug(file, LIBRARY_DIR);
    if (article) {
      articles.push({ ...article, type: 'library' });
    }
  });
  
  faultFiles.forEach(file => {
    const article = getArticleBySlug(file, FAULTS_DIR);
    if (article) {
      articles.push({ ...article, type: 'fault' });
    }
  });
  
  // Sort by date (newest first)
  return articles.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date || '2000-01-01');
    const dateB = new Date(b.frontmatter.date || '2000-01-01');
    return dateB - dateA;
  });
}

export function getArticlesByBrand(brandSlug) {
  const allArticles = getAllArticles();
  return allArticles.filter(article => {
    if (!article.frontmatter.brand) return false;
    const articleBrandSlug = article.frontmatter.brand.toLowerCase()
      .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
      .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return articleBrandSlug === brandSlug.toLowerCase();
  });
}

export function getArticleFromAnywhere(slug) {
  let article = getArticleBySlug(slug, LIBRARY_DIR);
  if (article) {
    return { ...article, type: 'library' };
  }
  
  article = getArticleBySlug(slug, FAULTS_DIR);
  if (article) {
    return { ...article, type: 'fault' };
  }
  
  return null;
}
