const DEFAULT_URL = "https://tickets.example.com/incidents/new";

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "call-detected") return;
  chrome.storage.sync.get({ ticketUrl: DEFAULT_URL }).then(({ ticketUrl }) => {
    chrome.tabs.create({ url: ticketUrl || DEFAULT_URL, active: true });
  });
});
