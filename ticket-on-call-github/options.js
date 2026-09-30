const DEFAULTS = {
  ticketUrl: "https://tickets.example.com/incidents/new",
  selector: "",
  snippets: [
    { name: "Bonjour", key: "Alt+1", text: "Bonjour, je vous écoute." },
    { name: "Rappel", key: "Alt+2", text: "Je vous rappelle dès que possible." },
    { name: "Clôture", key: "Alt+3", text: "Problème résolu, le ticket est clôturé." }
  ]
};

const list = document.getElementById("list");

function addRow(s = { name: "", key: "", text: "" }) {
  const row = document.createElement("div");
  row.className = "snip";
  row.innerHTML = `
    <input class="name" placeholder="Nom (ex : Bonjour)">
    <input class="key" placeholder="Raccourci" readonly>
    <button class="del" title="Supprimer">✕</button>
    <textarea class="text" placeholder="Texte à coller"></textarea>`;
  row.querySelector(".name").value = s.name;
  row.querySelector(".key").value = s.key;
  row.querySelector(".text").value = s.text;
  row.querySelector(".del").onclick = () => row.remove();
  row.querySelector(".key").addEventListener("keydown", (e) => {
    e.preventDefault();
    if (e.key === "Backspace" || e.key === "Delete") { e.target.value = ""; return; }
    if (/^(Control|Alt|Shift|Meta)/.test(e.code)) return;
    const parts = [];
    if (e.ctrlKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");
    // Lettres : lettre gravée sur la touche (AZERTY/QWERTY). Le reste : position de la touche.
    parts.push(
      /^[a-z]$/i.test(e.key) ? e.key.toUpperCase() : e.code.replace(/^(Digit|Key|Numpad)/, "").toUpperCase()
    );
    e.target.value = parts.join("+");
  });
  list.appendChild(row);
}

chrome.storage.sync.get(DEFAULTS).then((v) => {
  document.getElementById("ticketUrl").value = v.ticketUrl;
  document.getElementById("selector").value = v.selector;
  v.snippets.forEach(addRow);
});

document.getElementById("add").onclick = () => addRow();

document.getElementById("save").onclick = async () => {
  const snippets = [...list.querySelectorAll(".snip")]
    .map((r) => ({
      name: r.querySelector(".name").value.trim(),
      key: r.querySelector(".key").value,
      text: r.querySelector(".text").value
    }))
    .filter((s) => s.key && s.text);
  await chrome.storage.sync.set({
    ticketUrl: document.getElementById("ticketUrl").value.trim(),
    selector: document.getElementById("selector").value.trim(),
    snippets
  });
  document.getElementById("msg").textContent = "Enregistré ✔";
};
