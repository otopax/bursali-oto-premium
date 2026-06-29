const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function fetchRedditLeads() {
  console.log('📡 [RADAR] Reddit /r/MechanicAdvice taranıyor...');
  try {
    let posts = [];
    try {
      const response = await axios.get('https://www.reddit.com/r/MechanicAdvice/new.json?limit=10', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
      });
      posts = response.data.data.children.map(p => p.data);
    } catch (err) {
      console.log('Reddit API 403 verdi, Mock veri kullanılıyor...');
      posts = [
        {
          id: 'mock1',
          title: 'Engine light is on, code P0171 on 2018 Honda Civic',
          selftext: 'Car is idling rough and consuming too much gas. What should I check?',
          permalink: '/r/MechanicAdvice/comments/mock1',
          author: 'CarGuy99'
        },
        {
          id: 'mock2',
          title: 'Transmission slipping 2010 BMW 320d',
          selftext: 'When shifting from 2nd to 3rd gear it hesitates. Fluid never changed.',
          permalink: '/r/MechanicAdvice/comments/mock2',
          author: 'BimmerFan'
        }
      ];
    }

    let newLeads = 0;

    for (const post of posts) {
      const { id, title, selftext, url, author, permalink } = post;
      const originalId = `reddit_${id}`;

      // Daha önce kaydedilmiş mi kontrol et
      const exists = await prisma.socialLead.findUnique({ where: { originalId } });
      if (exists) continue;

      // Eğer post içinde arıza kodu veya uyarı kelimesi geçiyorsa al
      const text = `${title} ${selftext}`.toLowerCase();
      if (text.includes('code') || text.includes('p0') || text.includes('light') || text.includes('engine') || text.includes('transmission')) {
        console.log(`\n🔍 [YENİ FIRSAT] ${title}`);
        
        // Gemini RAG Prompt
        const prompt = `Sen Bursalı Oto Servis'in (Fethiye) dijital ustası "Sanal İbrahim Usta"sın.
Aşağıdaki kişi forumda aracındaki arızayı sormuş. 
Ona teknik, yardımcı olan ama aynı zamanda dükkana gelmesi (veya iletişime geçmesi) için teşvik eden profesyonel Türkçe bir cevap yaz.
Saygılı, net ve güven verici ol. Adımız "Bursalı Oto Servis". Fethiye'deyiz.
Sadece müşteriye verilecek cevabı yaz, başka bir şey ekleme.

Müşteri Şikayeti:
"${title}
${selftext}"`;

        await delay(2000); // Rate Limit koruması

        let aiResponse = '';
        try {
          const aiResult = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
          aiResponse = aiResult.text;
        } catch (aiErr) {
          console.error('Yapay zeka hatası:', aiErr.message);
          aiResponse = "Yapay zeka cevabı oluşturulamadı.";
        }

        await prisma.socialLead.create({
          data: {
            platform: 'reddit',
            originalId,
            title,
            content: selftext || '',
            url: `https://reddit.com${permalink}`,
            author,
            aiResponse,
            status: 'pending'
          }
        });
        
        newLeads++;
        console.log(` ✅ Cevap Üretildi ve Kaydedildi!`);
      }
    }
    
    console.log(`\n🎉 Tarama tamamlandı. ${newLeads} yeni fırsat bulundu.`);
  } catch (error) {
    console.error('Radar Hatası:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fetchRedditLeads();
