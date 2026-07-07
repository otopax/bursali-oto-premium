# Project Rules for Bursalı Oto Servis

## Image Processing & Upload Discipline
When the user uploads images (especially screenshots from Instagram or other social media) to be added to the website:
1. **Never upload raw screenshots directly to the website.**
2. **Crop UI Elements:** Programmatically analyze and crop out all mobile or app UI elements (e.g., Instagram headers, notches, action buttons like heart/comment/share, text captions). Ensure only the pure, relevant automotive/engine photo remains.
3. **Enhance Quality:** Use image processing tools (like `sharp` in Node.js or `Pillow`/`OpenCV` in Python) to enhance the image:
   - Adjust brightness (`~1.05x`) and saturation (`~1.15x`) to make the metallic engine parts and colors pop.
   - Apply a sharpening matrix (`unsharp mask` or similar filters with e.g. `sigma: 1.5`, `x1: 2`) to ensure high clarity and a crisp, professional look.
4. **Format & Optimize:** Save the image in a modern, optimized format (PNG/WebP) with appropriate dimensions for the website, keeping the aspect ratio intact after the UI crop.
5. **Consistency:** Apply this exact discipline to EVERY image uploaded for the "Arıza Çözümleri" or any other gallery/article section.

## Arıza Çözümleri - İçerik ve SEO/AEO Kuralları (Temmuz 2026 Güncellemesi)
When creating or modifying fault articles (Arıza Çözümleri), you MUST adhere to the following strict SEO and AEO guidelines to maintain Google dominance:
1. **Never use dummy Google Search image links.** If a real image is not available, leave the `image` field empty or point to a valid local path (e.g., `/default-fault.jpg`).
2. **Dynamic Dates:** Never hardcode all articles to the same date. Spread their `date:` frontmatter across the past 6 months to avoid spam flags. Use `!isNaN(new Date(...).getTime())` for robust parsing.
3. **Structured Data (Schema.org):** Every article MUST include the following JSON-LD schemas in the `page.js` layout:
   - `TechArticle`
   - `BreadcrumbList` (using strict absolute paths, e.g., `/ariza-cozumleri`)
   - `FAQPage` (dynamically inject the exact OEM diagnostic tool for the brand, e.g., Xentry for Mercedes, ISTA for BMW, PIWIS for Porsche, ODIS for VAG, VIDA for Volvo)
   - `LocalBusiness` and `AutoRepair`
   - `Service`
   - `HowTo` (detailing diagnostic, mechanical, and testing steps)
4. **Google Business Profile (GBP) API Integration:** Never hardcode `aggregateRating`. Always fetch the live rating and review count from the GBP API via `lib/gbp.js`. If the API fails, gracefully fallback to default values (e.g., 4.9 rating, 124 reviews).
5. **Environment Variables for CTA:** All phone numbers, WhatsApp links, and Google Maps/Review links in `ExpertCTA.js` MUST be fetched from `process.env.NEXT_PUBLIC_...`. Never hardcode raw IDs or phone numbers.
6. **Sentence Extraction (Regex):** When automatically extracting the first sentence for meta descriptions or FAQs, use a negative lookbehind regex `/(?<!\d)\.\s/` to split strings. This prevents breaking sentences at decimals or gears (e.g., "2. vites" or "3.0 TFSI").
