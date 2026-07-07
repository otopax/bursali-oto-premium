const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { getNextAction } = require('./agent');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

function findBrowserPath() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Chrome/Edge bulunamadı. Lütfen executablePath yolunu manuel girin.');
}

async function runAgent(taskDescription) {
  console.log(`[🤖] Ajan Başlatılıyor... Görev: "${taskDescription}"`);
  
  const executablePath = findBrowserPath();
  const userDataDir = path.join(process.cwd(), '.agent-profile'); // İzole ama kalıcı profil
  
  let browser;
  try {
    // 1. Önce kullanıcının açık olan GERÇEK Chrome'una bağlanmayı dene
    browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null });
    console.log('[🤖] Kullanıcının aktif Chrome oturumuna başarıyla bağlanıldı (Bot Koruması Aşılıyor!)');
  } catch (e) {
    // 2. Bulamazsa yeni (ama bota yakalanma riski olan) bir tarayıcı aç
    console.log('[🤖] Aktif Chrome bulunamadı, yeni bir izole tarayıcı başlatılıyor...');
    browser = await puppeteer.launch({
      executablePath,
      userDataDir,
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized', '--disable-blink-features=AutomationControlled'] // Bot korumasını hafifletmek için
    });
  }

  // Yeni bir sekme aç (bağlandıysak da, başlattıysak da)
  const page = await browser.newPage();
  
  // DOM Injector kodunu oku
  const injectorCode = fs.readFileSync(path.join(__dirname, 'dom-injector.js'), 'utf8');

  // Başlangıç için Google'a git
  await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });

  let isDone = false;
  let step = 1;

  while (!isDone && step <= 15) { // Maksimum 15 adım
    console.log(`\n--- Adım ${step} ---`);
    
    // 1. Etiketleri Sayfaya Enjekte Et (Observe)
    await page.evaluate(injectorCode);
    const elementMap = await page.evaluate(() => window.injectSetOfMark());
    
    // 2. Ekran Görüntüsü Al
    await new Promise(r => setTimeout(r, 1000)); // Animasyonların bitmesini bekle
    const screenshot = await page.screenshot({ encoding: 'base64' });
    console.log(`[📸] Ekran görüntüsü alındı. Gemini'ye düşünmesi için gönderiliyor...`);

    // 3. Gemini'ye Sor (Think)
    let actionResponse;
    try {
      actionResponse = await getNextAction(screenshot, taskDescription, elementMap);
      console.log(`[🧠] Gemini'nin Kararı:`, actionResponse);
    } catch (e) {
      console.error("[❌] Gemini API Hatası:", e.message);
      break;
    }

    // 4. Aksiyonu Gerçekleştir (Act)
    const { action, elementId, text, key, reason } = actionResponse;

    if (action === 'done') {
      console.log(`[✅] GÖREV TAMAMLANDI! Sebep: ${reason}`);
      isDone = true;
      break;
    }

    if (action === 'click' || action === 'type') {
      const coords = elementMap[elementId];
      if (!coords) {
        console.log(`[⚠️] Hata: Element ID ${elementId} bulunamadı! Yeniden deneniyor...`);
        step++;
        continue;
      }
      
      // Fareyi elementin ortasına götür ve tıkla
      await page.mouse.click(coords.x, coords.y);
      console.log(`[🖱️] ID ${elementId} elementine tıklandı.`);
      
      if (action === 'type' && text) {
        // Tıkladıktan sonra klavyeden yaz
        await page.keyboard.type(text, { delay: 50 });
        console.log(`[⌨️] Metin yazıldı: "${text}"`);
      }
    } else if (action === 'keypress') {
      await page.keyboard.press(key);
      console.log(`[⌨️] Tuşa basıldı: ${key}`);
    } else {
      console.log(`[❓] Bilinmeyen aksiyon: ${action}`);
    }

    // Sayfanın yüklenmesini/tepkisini bekle
    await new Promise(r => setTimeout(r, 2000));
    step++;
  }

  if (!isDone) {
    console.log(`[⚠️] Maksimum adım sınırına (15) ulaşıldı, görev sonlandırılıyor.`);
  }

  console.log(`[🛑] Tarayıcı kapatılıyor...`);
  // Kullanıcı izlesin diye kapatmadan önce biraz bekle
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
}

const task = process.argv[2];
if (!task) {
  console.log('Kullanım: node src/scripts/computer-use/run.js "Görevi buraya yazın"');
  process.exit(1);
}

runAgent(task).catch(console.error);
