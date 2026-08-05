import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { IContentRepository } from '@/application/interfaces/IContentRepository';

// In-Memory RAM Cache to avoid re-reading 978 JSON files from disk on every HTTP request
const memoryPostsCache = new Map();

export class MarkdownContentRepository extends IContentRepository {
  constructor() {
    super();
    this.basePath = path.join(process.cwd(), 'src', 'content');
    this.jsonFaultsDir = path.join(process.cwd(), 'public', 'ariza_kodlari_data');
  }

  formatJsonFaultToPost(id, json) {
    const brandStr = Array.isArray(json.brand) ? json.brand[0] : (json.brand || 'Volkswagen');
    const modelStr = Array.isArray(json.models) ? json.models[0] : (json.models || 'Genel');
    
    const symptomsList = Array.isArray(json.symptoms) && json.symptoms.length > 0
      ? `<h3>Olası Belirtiler</h3><ul>${json.symptoms.map(s => `<li>${s}</li>`).join('')}</ul>`
      : '';

    const causesList = Array.isArray(json.commonCauses) && json.commonCauses.length > 0
      ? `<h3>Kök Nedenler ve Muhtemel Sebepler</h3><ul>${json.commonCauses.map(c => `<li>${c}</li>`).join('')}</ul>`
      : '';

    const solutionsList = Array.isArray(json.stepByStepSolution) && json.stepByStepSolution.length > 0
      ? `<h3>Adım Adım Servis Çözüm Adımları</h3><ul>${json.stepByStepSolution.map(sol => `<li>${sol}</li>`).join('')}</ul>`
      : '';

    const notesBlock = json.technicalNotes
      ? `<blockquote style="background: rgba(212, 175, 55, 0.1); border-left: 4px solid var(--accent-gold); padding: 1rem; margin-top: 1.5rem;"><strong>VAG Grubu Özel Servis Notu:</strong><p>${json.technicalNotes}</p></blockquote>`
      : '';

    const contentHtml = `<div>${symptomsList}${causesList}${solutionsList}${notesBlock}</div>`;

    return {
      id,
      title: json.title || id,
      brand: brandStr.split('/')[0].trim(),
      model: modelStr.split('/')[0].trim(),
      brands: json.brands || [brandStr],
      models: json.models || [modelStr],
      date: '2026-08-01',
      riskLevel: json.severity || 'Orta-Yüksek',
      canDrive: 'Servise Danışın',
      estimatedTime: '2-4 Saat',
      estimatedCost: 'Tespitten Sonra',
      potentialCauses: Array.isArray(json.commonCauses) ? json.commonCauses.join(', ') : json.commonCauses,
      contentHtml,
      rawContent: `${json.title}\n${json.technicalNotes || ''}`,
      isDtcJson: true
    };
  }

  async getSortedPostsData(locale = 'tr', folder = 'blog') {
    const cacheKey = `${locale}:${folder}`;
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.BUILDING === 'true' || process.env.IS_BUILD === 'true';
    
    if ((folder !== 'faults' || isBuildPhase) && memoryPostsCache.has(cacheKey)) {
      return memoryPostsCache.get(cacheKey);
    }

    const directory = path.join(this.basePath, folder);
    let posts = [];

    // 1. Markdown (.md / .mdx)
    if (fs.existsSync(directory)) {
      const fileNames = fs.readdirSync(directory);
      const mdPosts = fileNames
        .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
        .map((fileName) => {
          const id = fileName.replace(/\.mdx?$/, '');
          const fullPath = path.join(directory, fileName);
          const fileContents = fs.readFileSync(fullPath, 'utf8');
          const matterResult = matter(fileContents);

          if (matterResult.data.locale && matterResult.data.locale !== locale) {
            return null;
          }

          return {
            id,
            ...matterResult.data,
          };
        })
        .filter(Boolean);

      posts = [...mdPosts];
    }

    // 2. JSON DTC Faults
    if (folder === 'faults' && fs.existsSync(this.jsonFaultsDir)) {
      const jsonFiles = fs.readdirSync(this.jsonFaultsDir);
      jsonFiles.forEach(file => {
        if (file.endsWith('.json') && !file.startsWith('_')) {
          const id = file.replace('.json', '');
          try {
            const rawData = fs.readFileSync(path.join(this.jsonFaultsDir, file), 'utf-8');
            const jsonData = JSON.parse(rawData);
            posts.push(this.formatJsonFaultToPost(id, jsonData));
          } catch (e) {}
        }
      });
    }

    const sortedPosts = posts.sort((a, b) => (a.date < b.date ? 1 : -1));
    memoryPostsCache.set(cacheKey, sortedPosts);
    return sortedPosts;
  }

  async getAllPostIds(folder = 'blog') {
    const directory = path.join(this.basePath, folder);
    const ids = [];

    if (fs.existsSync(directory)) {
      const fileNames = fs.readdirSync(directory);
      fileNames
        .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
        .forEach(fileName => {
          ids.push({ params: { slug: fileName.replace(/\.mdx?$/, '') } });
        });
    }

    if (folder === 'faults' && fs.existsSync(this.jsonFaultsDir)) {
      const jsonFiles = fs.readdirSync(this.jsonFaultsDir);
      jsonFiles.forEach(file => {
        if (file.endsWith('.json') && !file.startsWith('_')) {
          ids.push({ params: { slug: file.replace('.json', '') } });
        }
      });
    }

    return ids;
  }

  async getPostData(slug, folder = 'blog') {
    const directory = path.join(this.basePath, folder);
    let fullPath = path.join(directory, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(directory, `${slug}.mdx`);
    }

    if (fs.existsSync(fullPath)) {
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

    if (folder === 'faults' && fs.existsSync(this.jsonFaultsDir)) {
      const jsonPath = path.join(this.jsonFaultsDir, `${slug}.json`);
      if (fs.existsSync(jsonPath)) {
        try {
          const rawData = fs.readFileSync(jsonPath, 'utf-8');
          const jsonData = JSON.parse(rawData);
          return this.formatJsonFaultToPost(slug, jsonData);
        } catch (e) {}
      }
    }

    return null;
  }
}
