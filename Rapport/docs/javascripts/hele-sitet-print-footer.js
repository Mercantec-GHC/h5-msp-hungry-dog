/**
 * Hele-sitet (/hele-sitet/): Chromium kan ikke bruge calc(counter(pages) - 2) i @page-marginer.
 * Før udskrift estimeres antal PDF-sider ud fra #print-site-page og samme margener som extra.css,
 * og Y sættes til max(1, estimerede_sider - 2) så sidste side kan blive "37 ud af 37".
 */
(function () {
  var STYLE_ID = "hele-sitet-print-footer-y";

  function mmToPx(mm) {
    return (mm * 96) / 25.4;
  }

  /** Som @page i extra.css: top 13mm, bund 28mm → brødteksthøjde pr. side */
  function printableHeightPx() {
    return mmToPx(297 - 13 - 28);
  }

  function estimatePdfPageCount() {
    var root = document.getElementById("print-site-page");
    if (!root) return 1;
    var h = root.scrollHeight;
    var per = printableHeightPx();
    if (!(per > 0)) return 1;
    return Math.max(1, Math.ceil(h / per));
  }

  function injectStyle() {
    var root = document.getElementById("print-site-page");
    if (!root) return;

    var skipFrontMatter = 2;
    var physical = estimatePdfPageCount();
    var y = Math.max(1, physical - skipFrontMatter);

    var old = document.getElementById(STYLE_ID);
    if (old) old.remove();

    var css = [
      "@page {",
      "  size: A4 portrait;",
      "  margin: 13mm 11mm 28mm 11mm;",
      "  counter-increment: content-page 1;",
      "  @bottom-right { content: none; }",
      "  @bottom-center {",
      '    content: "Side " counter(content-page) " ud af ' + y + '";',
      "    font-size: 9pt;",
      "    color: #424242;",
      '    font-family: "DM Sans", "Segoe UI", system-ui, sans-serif;',
      "  }",
      "}",
      "@page :first {",
      "  margin: 13mm 11mm 28mm 11mm;",
      "  counter-increment: none !important;",
      "  @bottom-center { content: none !important; }",
      "  @bottom-right { content: none !important; }",
      "}",
      "@page toc {",
      "  margin: 13mm 11mm 28mm 11mm;",
      "  counter-increment: none !important;",
      "  @bottom-center { content: none !important; }",
      "  @bottom-right { content: none !important; }",
      "}",
    ].join("\n");

    var el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = css;
    document.head.appendChild(el);
  }

  function removeStyle() {
    var old = document.getElementById(STYLE_ID);
    if (old) old.remove();
  }

  function scheduleInject() {
    requestAnimationFrame(function () {
      requestAnimationFrame(injectStyle);
    });
  }

  window.addEventListener("beforeprint", scheduleInject);
  window.addEventListener("afterprint", removeStyle);

  try {
    window.matchMedia("print").addEventListener("change", function (e) {
      if (e.matches) scheduleInject();
      else removeStyle();
    });
  } catch (_) {
    window.matchMedia("print").addListener(function (mql) {
      if (mql.matches) scheduleInject();
      else removeStyle();
    });
  }
})();
