// Détecte un appel dans le client web 3CX (balise <call-view>) et prévient le background.
// Un seul déclenchement par appel : on ré-arme quand la vue d'appel disparaît.
(() => {
  const DEFAULT_SELECTOR = "app-call-control call-view";

  let selector = DEFAULT_SELECTOR;
  let armed = true;
  let timer = null;

  const load = () =>
    chrome.storage.sync.get({ selector: "" }).then((v) => {
      selector = v.selector || DEFAULT_SELECTOR;
    });
  load();
  chrome.storage.onChanged.addListener(load);

  const check = () => {
    timer = null;
    let present = false;
    try { present = !!document.querySelector(selector); } catch {}
    if (present && armed) {
      armed = false;
      chrome.runtime.sendMessage({ type: "call-detected" });
    } else if (!present) {
      armed = true;
    }
  };

  new MutationObserver(() => {
    if (!timer) timer = setTimeout(check, 300);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
