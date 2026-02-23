(function () {
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function setTextAll(root, value) {
    const nodes = root.querySelectorAll("[data-font-preview-text]");
    nodes.forEach((el) => {
      el.textContent = value;
    });
  }

  // Auto-fit: reduziert font-size, bis Text in die Box passt
  function fitOne(el) {
    // Startwerte aus CSS (pro Schrift über --base-size / --base-line)
    const styles = window.getComputedStyle(el);
    const baseSize = parseFloat(styles.fontSize) || 54;

    // Zielbox (wir fitten auf Höhe + Breite über scrollHeight)
    const maxH = el.clientHeight;

    // Sicherheitsnetz: manche Fonts rendern kurz "nach"
    // -> wir iterieren klein, aber capped
    let size = baseSize;
    const minSize = 22; // nie kleiner als das
    const maxIterations = 80;

    // Reset auf Base, damit wir von oben runtergehen
    el.style.fontSize = baseSize + "px";

    // Wenn passt: fertig
    if (el.scrollHeight <= maxH) return;

    let i = 0;
    while (i < maxIterations && size > minSize) {
      size -= 1;
      el.style.fontSize = size + "px";
      if (el.scrollHeight <= maxH) break;
      i++;
    }

    // Falls immer noch zu hoch (extrem lange Texte) -> härter runter
    if (el.scrollHeight > maxH) {
      size = clamp(size - 6, minSize, baseSize);
      el.style.fontSize = size + "px";
    }
  }

  function fitAll(root) {
    const nodes = root.querySelectorAll("[data-font-preview-text]");
    nodes.forEach((el) => {
      // wichtig: inline font-size kommt vom Fit -> jede Runde neu fitten
      // wir lassen line-height im CSS (pro Font) und skalieren nur font-size
      fitOne(el);
    });
  }

  function init() {
    const root = document.querySelector("[data-font-preview-root]");
    if (!root) return;

    const input = root.querySelector("[data-font-preview-input]");
    if (!input) return;

    // Initial
    setTextAll(root, input.value || "");
    requestAnimationFrame(() => fitAll(root));

    // Input live
    const onChange = () => {
      const val = (input.value || "").trim();
      setTextAll(root, val.length ? val : " ");
      requestAnimationFrame(() => fitAll(root));
    };

    input.addEventListener("input", onChange);

    // Refit bei Resize
    window.addEventListener("resize", () => {
      requestAnimationFrame(() => fitAll(root));
    });

    // Refit nach Fonts geladen (sonst springt es)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        requestAnimationFrame(() => fitAll(root));
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();