const cheerio = require('cheerio');

async function run(){ 
  const res = await fetch('https://www.startmycar.com/volvo/s60/info/manuals/service-repair', { headers: {'User-Agent': 'Mozilla/5.0'} }); 
  const text = await res.text(); 
  const $ = cheerio.load(text); 
  
  console.log("Found PDF Links on Service/Repair page:");
  $('a').each((i, el)=>{ 
    const href = $(el).attr('href');
    if(href && href.endsWith('.pdf')) { 
      console.log('PDF:', href); 
    } 
  }); 
} 

run();
