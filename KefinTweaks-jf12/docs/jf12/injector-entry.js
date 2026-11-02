// KefinTweaks-injector (KefinTweaks jf12 fork): hand-written JavaScript Injector entry, never rewritten automatically.
// kefinTweaksInjectorStamp=jf12-bootstrap-1
// Loads <kefinTweaksRoot>injector.js once. kefinTweaksRoot (KefinTweaks-Config entry, which must come first) is the only
// place that says where the files come from and which version: a commit-pinned URL or a self-hosted folder.
(function () {
  if (window.KefinTweaksBootstrapRoot) return;
  var cfg = window.KefinTweaksConfig || {};
  var root = String(cfg.kefinTweaksRoot || '').trim();
  if (!root) { console.warn('[KefinTweaks] kefinTweaksRoot is empty in the KefinTweaks-Config entry: nothing loaded'); return; }
  if (root.charAt(root.length - 1) !== '/') root += '/';
  window.KefinTweaksBootstrapRoot = root;
  var s = document.createElement('script');
  s.src = root + 'injector.js';
  s.async = true;
  (document.head || document.documentElement).appendChild(s);
})();
