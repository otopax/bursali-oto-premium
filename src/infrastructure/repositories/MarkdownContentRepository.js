import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { IContentRepository } from '@/application/interfaces/IContentRepository';

const memoryPostsCache = new Map();

// Load Automotive Terms Dictionary for EN -> TR translation
let termsDict = {};
try {
  const termsPath = path.join(process.cwd(), 'src', 'data', 'automotive_terms.json');
  if (fs.existsSync(termsPath)) {
    termsDict = JSON.parse(fs.readFileSync(termsPath, 'utf-8'));
  }
} catch (e) {}

function translateTerms(text) {
  if (!text || typeof text !== 'string') return text;
  let translated = text;
  Object.entries(termsDict).forEach(([en, tr]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translated = translated.replace(regex, tr);
  });
  return translated;
}

function extractTsbPdf(technicalNotes) {
  if (!technicalNotes) return { pdfUrl: null, tsbNumber: null };
  const pdfRegex = /(https?:\/\/[^\s]+\.pdf)/gi;
  const tsbRegex = /(?:TSB|TPI|MC)[-:\s]*([A-Z0-9-]+)/gi;

  const pdfMatch = technicalNotes.match(pdfRegex);
  const tsbMatch = technicalNotes.match(tsbRegex);

  return {
    pdfUrl: pdfMatch ? pdfMatch[0] : null,
    tsbNumber: tsbMatch ? tsbMatch[0] : null
  };
}

export class MarkdownContentRepository extends IContentRepository {
  constructor() {
    super();
    this.basePath = path.join(process.cwd(), 'src', 'content');
    this.jsonFaultsDir = path.join(process.cwd(), 'public', 'ariza_kodlari_data');
  }

  formatJsonFaultToPost(id, json) {
    const rawBrand = Array.isArray(json.brand) ? json.brand[0] : (json.brand || 'Volkswagen');
    const rawModel = Array.isArray(json.models) ? json.models[0] : (json.models || 'Genel');
    
    // Normalize Duplicate Titles (e.g. "P0030 - P0030")
    let title = json.title || id;
    if (title.match(/^([A-Z0-9]+)\s*-\s*\1$/i)) {
      const code = id.toUpperCase();
      const trDesc = translateTerms(json.description || json.title);
      title = trDesc && trDesc !== title ? `${code} - ${trDesc}` : `${code} - Arıza Kodu Teşhis Rehberi`;
    }

    const symptoms = Array.isArray(json.symptoms) ? json.symptoms.map(translateTerms) : [];
    const commonCauses = Array.isArray(json.commonCauses) ? json.commonCauses.map(translateTerms) : [];
    const solutions = Array.isArray(json.stepByStepSolution) ? json.stepByStepSolution.map(translateTerms) : [];

    const symptomsList = symptoms.length > 0
      ? `<h3>Olası Belirtiler</h3><ul>${symptoms.map(s => `<li>${s}</li>`).join('')}</ul>`
      : '';

    const causesList = commonCauses.length > 0
      ? `<h3>Kök Nedenler ve Muhtemel Sebepler</h3><ul>${commonCauses.map(c => `<li>${c}</li>`).join('')}</ul>`
      : '';

    const solutionsList = solutions.length > 0
      ? `<h3>Adım Adım Servis Çözüm Adımları</h3><ul>${solutions.map(sol => `<li>${sol}</li>`).join('')}</ul>`
      : '';

    const notesBlock = json.technicalNotes
      ? `<blockquote style="background: rgba(212, 175, 55, 0.1); border-left: 4px solid var(--accent-gold); padding: 1rem; margin-top: 1.5rem;"><strong>VAG Grubu Özel Servis Notu:</strong><p>${translateTerms(json.technicalNotes)}</p></blockquote>`
      : '';

    const contentHtml = `<div>${symptomsList}${causesList}${solutionsList}${notesBlock}</div>`;
    const { pdfUrl, tsbNumber } = extractTsbPdf(json.technicalNotes);

    return {
      id,
      code: id.toUpperCase(),
      title,
      brand: rawBrand.split('/')[0].trim(),
      model: rawModel.split('/')[0].trim(),
      brands: json.brands || [rawBrand],
      models: json.models || [rawModel],
      date: '2026-08-01',
      riskLevel: json.severity || 'Orta-Yüksek',
      canDrive: 'Servise Danışın',
      estimatedTime: '2-4 Saat',
      estimatedCost: 'Tespitten Sonra',
      potentialCauses: commonCauses.join(', '),
      symptoms,
      commonCauses,
      stepByStepSolution: solutions,
      technicalNotes: json.technicalNotes,
      pdfUrl,
      tsbNumber,
      contentHtml,
      rawContent: `${title}\n${json.technicalNotes || ''}`,
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
        if (file.endsWith('.json') && !file.startsWith('_') && !file.toLowerCase().includes('template')) {
          const codeMatch = file.match(/^([A-Z0-9]{4,6})/i);
          const id = codeMatch ? codeMatch[1].toUpperCase() : file.replace('.json', '');
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
        if (file.endsWith('.json') && !file.startsWith('_') && !file.toLowerCase().includes('template')) {
          const codeMatch = file.match(/^([A-Z0-9]{4,6})/i);
          const id = codeMatch ? codeMatch[1].toUpperCase() : file.replace('.json', '');
          ids.push({ params: { slug: id } });
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
      const cleanSlug = slug.toUpperCase();
      let jsonPath = path.join(this.jsonFaultsDir, `${cleanSlug}.json`);
      
      if (!fs.existsSync(jsonPath)) {
        const jsonFiles = fs.readdirSync(this.jsonFaultsDir);
        const matchedFile = jsonFiles.find(f => f.toUpperCase().startsWith(cleanSlug) && !f.toLowerCase().includes('template'));
        if (matchedFile) {
          jsonPath = path.join(this.jsonFaultsDir, matchedFile);
        }
      }

      if (fs.existsSync(jsonPath)) {
        try {
          const rawData = fs.readFileSync(jsonPath, 'utf-8');
          const jsonData = JSON.parse(rawData);
          return this.formatJsonFaultToPost(cleanSlug, jsonData);
        } catch (e) {}
      }
    }

    return null;
  }
}
