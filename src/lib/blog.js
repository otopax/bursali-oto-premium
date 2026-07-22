import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const getPostsDirectory = (folder) => path.join(process.cwd(), 'src', 'content', folder);

export function getSortedPostsData(locale = 'tr', folder = 'blog') {
  const postsDirectory = getPostsDirectory(folder);
  // Klasör yoksa boş dön
  if (!fs.existsSync(postsDirectory)) return [];

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map((fileName) => {
      const id = fileName.replace(/\.mdx?$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      const matterResult = matter(fileContents);

      // İlgili dile ait içeriği filtrele (Eğer dil belirtilmemişse veya eşleşiyorsa göster)
      if (matterResult.data.locale && matterResult.data.locale !== locale) {
        return null;
      }

      return {
        id,
        ...matterResult.data,
      };
    })
    .filter(Boolean); // null olanları (diğer dilleri) çıkar

  // Tarihe göre sırala
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds(folder = 'blog') {
  const postsDirectory = getPostsDirectory(folder);
  if (!fs.existsSync(postsDirectory)) return [];
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map((fileName) => {
      return {
        params: {
          slug: fileName.replace(/\.mdx?$/, ''),
        },
      };
    });
}

export async function getPostData(slug, folder = 'blog') {
  const postsDirectory = getPostsDirectory(folder);
  let fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id: slug,
    contentHtml,
    rawContent: matterResult.content,
    ...matterResult.data,
  };
}

export function slugify(text) {
  if (!text) return 'diger';
  // Türkçe karakterleri dönüştür
  const trMap = {
    'çÇ':'c',
    'ğĞ':'g',
    'şŞ':'s',
    'üÜ':'u',
    'ıİ':'i',
    'öÖ':'o'
  };
  for(let key in trMap) {
    text = text.replace(new RegExp('['+key+']','g'), trMap[key]);
  }

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

export function getHierarchyData(locale = 'tr', folder = 'faults') {
  const posts = getSortedPostsData(locale, folder);
  const hierarchy = {};

  posts.forEach(post => {
    let brandName = post.brand || 'Diğer';
    brandName = brandName.trim();
    if (brandName.toUpperCase() === 'MERCEDES') brandName = 'Mercedes-Benz';
    if (brandName.toUpperCase() === 'VW') brandName = 'Volkswagen';
    if (brandName.toUpperCase().includes('AUDI / VW') || brandName.toUpperCase().includes('GENEL / PREMIUM')) brandName = 'Genel / Premium';
    if (brandName.toUpperCase().includes('GENEL / PORSCHE')) brandName = 'Porsche';

    let modelName = post.model || 'Genel';
    modelName = modelName.trim();

    const brandSlug = slugify(brandName);
    const modelSlug = slugify(modelName);

    if (!hierarchy[brandSlug]) {
      hierarchy[brandSlug] = {
        name: brandName,
        models: {}
      };
    }

    if (!hierarchy[brandSlug].models[modelSlug]) {
      hierarchy[brandSlug].models[modelSlug] = {
        name: modelName,
        items: []
      };
    }

    hierarchy[brandSlug].models[modelSlug].items.push(post);
  });

  return hierarchy;
}
