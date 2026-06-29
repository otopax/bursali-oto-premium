const cheerio = require('cheerio');

async function run(){ 
  try {
    const res = await fetch('https://fuse-box.info/audi/audi-a1-8x-2010-2018-fuses', { 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/xhtml+xml'
      } 
    }); 
    const text = await res.text(); 
    const $ = cheerio.load(text); 
    
    console.log("Analyzing Audi A1 page...");
    
    const images = [];
    $('img').each((i, el) => images.push($(el).attr('src')));
    
    const tables = [];
    $('table').each((i, el) => tables.push($(el).text().substring(0, 50).replace(/\s+/g, ' ')));

    console.log(`Found ${images.length} images. First 5:`, images.slice(0, 5));
    console.log(`Found ${tables.length} tables. First 2 snippets:`, tables.slice(0, 2));

    // Try finding the main menu or list that contains brands
    const categories = [];
    $('.menu, .categories, ul li a').each((i, el) => {
        const href = $(el).attr('href');
        const txt = $(el).text().trim();
        if(href && href.includes('fuse-box.info/')) categories.push(txt);
    });
    console.log("Category-like links:", [...new Set(categories)].slice(0, 15));

  } catch(e) {
    console.log("Error:", e.message);
  }
} 

run();
