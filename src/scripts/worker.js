const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const { QueueManager } = require('../lib/crawler/QueueManager');
const { CrawlerBase } = require('../lib/crawler/CrawlerBase');

/**
 * Example Specific Crawler for YouTube
 */
class YouTubeCrawler extends CrawlerBase {
  constructor() {
    super('YouTubeCrawler');
  }

  async run(jobData) {
    const { brand, model, faultCode } = jobData;
    console.log(`[${this.name}] Processing: ${brand} ${model} - ${faultCode}`);
    
    // Simulate stealth fetch and API parsing
    await this.sleep(2000); 
    
    // In a real scenario, this would use fetchHtml and parse Cheerio
    return {
      status: 'success',
      videos: [
        { title: `${brand} ${model} ${faultCode} Fix`, url: 'https://youtube.com/watch?v=mock' }
      ]
    };
  }
}

const ytCrawler = new YouTubeCrawler();

// Create master worker for 'crawler-queue'
console.log('🕷️ Master Crawler Node starting up...');
QueueManager.createWorker('crawler-queue', async (job) => {
  console.log(`\n--- NEW CRAWL JOB [${job.id}] ---`);
  
  if (job.name === 'youtube-search') {
    return await ytCrawler.run(job.data);
  } else if (job.name === 'oem-part-search') {
    console.log(`Searching OEM Parts for: ${job.data.partName}`);
    await ytCrawler.sleep(1500);
    return { oemNumber: 'MOCK-1234' };
  } else {
    console.warn(`Unknown job type: ${job.name}`);
    return null;
  }
}, 2); // Concurrency: 2
