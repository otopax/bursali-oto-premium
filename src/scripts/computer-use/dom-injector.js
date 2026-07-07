// This script is injected into the browser via Puppeteer
function injectSetOfMark() {
  // Remove existing marks if any
  document.querySelectorAll('.agent-som-mark').forEach(el => el.remove());

  const interactiveSelectors = [
    'a', 'button', 'input', 'textarea', 'select', 
    '[role="button"]', '[role="link"]', '[role="menuitem"]',
    '[tabindex]:not([tabindex="-1"])',
    'div[jsname]', 'div[jsaction]' // Google-specific interactive elements
  ];

  const elements = document.querySelectorAll(interactiveSelectors.join(','));
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  let idCounter = 1;
  const elementMap = {};

  elements.forEach(el => {
    // Check if element is visible
    const rect = el.getBoundingClientRect();
    if (
      rect.width > 0 && 
      rect.height > 0 &&
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= viewportHeight &&
      rect.right <= viewportWidth &&
      window.getComputedStyle(el).visibility !== 'hidden' &&
      window.getComputedStyle(el).display !== 'none'
    ) {
      const id = idCounter++;
      
      // Calculate center for clicking
      const centerX = rect.left + (rect.width / 2);
      const centerY = rect.top + (rect.height / 2);
      
      elementMap[id] = { x: centerX, y: centerY };

      // Create visual label
      const label = document.createElement('div');
      label.className = 'agent-som-mark';
      label.textContent = id;
      label.style.position = 'absolute';
      label.style.top = `${rect.top + window.scrollY}px`;
      label.style.left = `${rect.left + window.scrollX}px`;
      label.style.backgroundColor = 'red';
      label.style.color = 'white';
      label.style.padding = '2px 4px';
      label.style.fontSize = '12px';
      label.style.fontWeight = 'bold';
      label.style.zIndex = '2147483647'; // Max z-index
      label.style.pointerEvents = 'none'; // So it doesn't block clicks
      label.style.borderRadius = '3px';
      label.style.border = '1px solid white';
      
      // Optional: draw bounding box
      const box = document.createElement('div');
      box.className = 'agent-som-mark';
      box.style.position = 'absolute';
      box.style.top = `${rect.top + window.scrollY}px`;
      box.style.left = `${rect.left + window.scrollX}px`;
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;
      box.style.border = '2px solid rgba(255, 0, 0, 0.5)';
      box.style.zIndex = '2147483646';
      box.style.pointerEvents = 'none';

      document.body.appendChild(box);
      document.body.appendChild(label);
    }
  });

  return elementMap;
}

window.injectSetOfMark = injectSetOfMark;
