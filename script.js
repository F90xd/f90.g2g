const HISTORY_KEY = "f90_history";

// Rates Configuration
const rates = {
  JOD: { coinToCash: 80/1000000, cashToCoin: 60000/5, games100k: 6, games1m: 63, target100k: 7, target1m: 73 },
  USD: { coinToCash: 115/1000000, cashToCoin: 8700/1, games100k: 8, games1m: 83, target100k: 10, target1m: 100 },
  EGP: { coinToCash: 5800/1000000, cashToCoin: 17500/100, games100k: 400, games1m: 4500, target100k: 0, target1m: 0 },
  ILS: { coinToCash: 380/1000000, cashToCoin: 130000/50, games100k: 25, games1m: 250, target100k: 30, target1m: 300 }
};

function calculateVIP() {
  const points = document.getElementById("vipPoints").value;
  const mult = document.getElementById("vipMultiplier").value;
  const type = document.getElementById("vipType").value;
  // أضف منطق الجدول الكامل هنا بناءً على متطلباتك الدقيقة للـ VIP
  const result = (points / mult).toFixed(2);
  document.getElementById("vipResult").innerText = "النتيجة: " + result;
  saveHistory("حاسبة VIP", result);
}

function saveHistory(name, result) {
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  history.unshift({ name, result, date: new Date().toLocaleString() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById("historyList");
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  list.innerHTML = history.map(h => `<p>${h.name}: ${h.result} - ${h.date}</p>`).join('');
}

function clearHistory() { localStorage.removeItem(HISTORY_KEY); renderHistory(); }

document.getElementById("themeToggle").onclick = () => document.body.classList.toggle("light");

// Initialize
renderHistory();
