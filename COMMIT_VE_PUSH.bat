@echo off
rem =====================================================================
rem  Bursali Oto Web - SEO/GBP duzeltmelerini commit'le ve GitHub'a gonder
rem  Cift tikla yeter. (08.07.2026 - Claude)
rem =====================================================================
cd /d "%~dp0"

echo.
echo [1/4] Degisen dosyalar sahneye aliniyor...
git add "src/lib/business.js"
git add "public/llms.txt"
git add "src/app/[locale]/hakkimizda/page.js"
git add "src/app/[locale]/ariza-cozumleri/[kod]/page.js"
git add "src/app/[locale]/_hidden-[marka]-servis-fethiye/page.js"
git add "src/app/[locale]/admin/is-emirleri/page.js"
git add ".env.example"

echo.
echo [2/4] Commit atiliyor...
git commit -m "fix(seo): GBP uyum paketi - sameAs+gercek koordinat, gorunur SSS+FAQPage, AggregateRating kaldirildi (self-serving review riski), adres No:1, WhatsApp yorum butonu env"
if errorlevel 1 (
  echo.
  echo UYARI: Commit atilamadi. Yukaridaki hata mesajini Claude'a yapistir.
  pause
  exit /b 1
)

echo.
echo [3/4] Uzak depodaki yeni commitler aliniyor (rebase)...
git pull --rebase origin main
if errorlevel 1 (
  echo.
  echo UYARI: Rebase cakismasi olustu. Hicbir sey kaybolmadi.
  echo Bu pencerenin ekran goruntusunu Claude'a gonder.
  pause
  exit /b 1
)

echo.
echo [4/4] GitHub'a gonderiliyor...
git push origin main
if errorlevel 1 (
  echo.
  echo UYARI: Push basarisiz. Hata mesajini Claude'a yapistir.
  pause
  exit /b 1
)

echo.
echo =====================================================
echo  TAMAMLANDI! Vercel otomatik deploy baslatacak.
echo  2-3 dakika sonra site guncellenmis olacak.
echo =====================================================
pause
