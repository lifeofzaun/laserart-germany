(function () {
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function getPx(value) {
    const n = parseFloat(String(value || '').replace('px', ''));
    return Number.isFinite(n) ? n : null;
  }

  function fitTextToBox(el) {
    // Container-Box: begrenzt durch min-height + padding der Card
    // Wir wollen: Text darf mehrzeilig sein, aber nicht überlaufen.
    const minSize = 26;    // nie kleiner als das
    const maxDownSteps = 60;

    // Start mit dem (CSS) Font-Size, danach runter
    const computed = window.getComputedStyle(el);
    const startSize = getPx(computed.fontSize) || 52;

    // Reset, damit wir immer von "Start" ausgehen
    el.style.fontSize = startSize + 'px';

    // Wenn der Text noch nicht geladen ist (Webfont), kurz warten
    // (Browser macht es meist selbst, aber das hilft bei Edge-Cases)
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height) return;

    // Wir messen Overflow über scrollHeight
    // Ziel: scrollHeight <= clientHeight
    let size = startSize;
    let i = 0;

    while (i < maxDownSteps && size > minSize) {
      // Wenn es passt, stop
      if (el.scrollHeight <= el.clientHeight) break;

      size = size - 2;
      size = clamp(size, minSize, startSize);
      el.style.fontSize = size + 'px';
      i++;
    }
  }

  function applyText(root) {
    const input = root.querySelector('[data-font-preview-input]');
    const targets = root.querySelectorAll('[data-font-preview-text]');
    if (!input || !targets.length) return;

    const valRaw = (input.value || '').trim();
    const text = valRaw.length ? valRaw : ' ';

    targets.forEach(el => {
      el.textContent = text;
      fitTextToBox(el);
    });
  }

  function initFontPreview(root) {
    if (!root) return;

    const input = root.querySelector('[data-font-preview-input]');
    const targets = root.querySelectorAll('[data-font-preview-text]');
    if (!input || !targets.length) return;

    // Live tippen
    input.addEventListener('input', function () {
      applyText(root);
    });

    // Refit bei Resize
    window.addEventListener('resize', function () {
      // Refit nur für diese Section
      targets.forEach(el => fitTextToBox(el));
    });

    // Initial
    applyText(root);

    // Refit wenn Fonts fertig geladen sind
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        targets.forEach(el => fitTextToBox(el));
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-font-preview-root]').forEach(initFontPreview);
  });
})();