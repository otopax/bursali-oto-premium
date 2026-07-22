import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { IContentRepository } from '@/application/interfaces/IContentRepository';

export class MarkdownContentRepository extends IContentRepository {
  constructor() {
    super();
    this.basePath = path.join(process.cwd(), 'src', 'content');
  }

  async getSortedPostsData(locale = 'tr', folder = 'blog') {
    const directory = path.join(this.basePath, folder);
    if (!fs.existsSync(directory)) return [];

    const fileNames = fs.readdirSync(directory);
    const allPostsData = fileNames
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

    return allPostsData.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  async getAllPostIds(folder = 'blog') {
    const directory = path.join(this.basePath, folder);
    if (!fs.existsSync(directory)) return [];
    
    const fileNames = fs.readdirSync(directory);
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

  async getPostData(slug, folder = 'blog') {
    const directory = path.join(this.basePath, folder);
    let fullPath = path.join(directory, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(directory, `${slug}.mdx`);
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
}
