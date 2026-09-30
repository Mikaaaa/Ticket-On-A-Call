// Colle un texte préenregistré dans le champ actif quand on tape son raccourci.
(() => {
  let snippets = [];
  const load = () =>
    chrome.storage.sync.get({ snippets: [] }).then((v) => (snippets = v.snippets));
  load();
  chrome.storage.onChanged.addListener(load);

  // Même format que la page d'options : "Ctrl+Alt+Shift+TOUCHE"
  const combo = (e) => {
    const parts = [];
    if (e.ctrlKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");
    // Lettres : lettre gravée sur la touche (AZERTY/QWERTY). Le reste : position de la touche.
    parts.push(
      /^[a-z]$/i.test(e.key) ? e.key.toUpperCase() : e.code.replace(/^(Digit|Key|Numpad)/, "").toUpperCase()
    );
    return parts.join("+");
  };

  const paste = (text) => {
    const el = document.activeElement;
    if (!el) return;
    const editable =
      el.isContentEditable || el.tagName === "TEXTAREA" ||
      (el.tagName === "INPUT" && /^(text|search|url|email|)$/i.test(el.type));
    if (!editable) return;
    // execCommand déclenche les événements "input" attendus par les frameworks (Angular, React…)
    if (!document.execCommand("insertText", false, text) && "value" in el) {
      const s = el.selectionStart ?? el.value.length;
      const e = el.selectionEnd ?? el.value.length;
      el.setRangeText(text, s, e, "end");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  document.addEventListener(
    "keydown",
    (e) => {
      if (!e.code || /^(Control|Alt|Shift|Meta)/.test(e.code)) return;
      const c = combo(e);
      const hit = snippets.find((s) => s.key === c);
      if (!hit) return;
      e.preventDefault();
      e.stopPropagation();
      paste(hit.text);
    },
    true
  );
})();
