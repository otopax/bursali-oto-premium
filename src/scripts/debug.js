const cheerio = require('cheerio');

async function test() {
  const res = await fetch('https://www.startmycar.com/ford/f-150/info/fusebox/2021');
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log("Fusebox section HTML snippet:");
  const section = $('.fusebox-section').first();
  console.log(section.html().substring(0, 2000));
}

test();
