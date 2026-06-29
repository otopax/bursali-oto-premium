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
