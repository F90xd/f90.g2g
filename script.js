"use strict";

/* ================= CONFIG ================= */

const CONFIG = {
  historyKey: "f90_history",
  themeKey: "f90_theme",
  max: 1e30
};

/*
  ملاحظة:
  rate100k و rate1m مستقلان تماماً.
  لا يتم افتراض أن سعر المليون يساوي سعر 100 ألف × 10.
*/
const CALCULATOR_CONFIG = {
  shipping: {
    JOD: {
      title: "شحن الدينار الأردني", currency: "JOD",
      cash: "دينار", coins: "كوينز",
      rate100k: 5 / 60000 * 100000, rate1m: 80,
      available: true,
      formula: "5 دينار = 60,000 كوينز | 1,000,000 كوينز = 80 دينار"
    },
    USD: {
      title: "شحن الدولار", currency: "USD",
      cash: "دولار", coins: "كوينز",
      rate100k: 100000 / 8700, rate1m: 115,
      available: true,
      formula: "1 دولار = 8,700 كوينز | 1,000,000 كوينز = 115 دولار"
    },
    EGP: {
      title: "شحن الجنيه المصري", currency: "EGP",
      cash: "جنيه", coins: "كوينز",
      rate100k: 100000 / 175, rate1m: 5800,
      available: true,
      formula: "100 جنيه = 17,500 كوينز | 1,000,000 كوينز = 5,800 جنيه"
    },
    ILS: {
      title: "شحن الشيقل", currency: "ILS",
      cash: "شيقل", coins: "كوينز",
      rate100k: 50 / 130000 * 100000, rate1m: 380,
      available: true,
      formula: "50 شيقل = 130,000 كوينز | 1,000,000 كوينز = 380 شيقل"
    }
  },

  target: {
    JOD: {
      title: "سحب تارجت — الدينار", currency: "JOD",
      cash: "دينار", coins: "دعم",
      rate100k: 7, rate1m: 73, available: true,
      formula: "100,000 دعم = 7 دينار | 1,000,000 دعم = 73 دينار"
    },
    USD: {
      title: "سحب تارجت — الدولار", currency: "USD",
      cash: "دولار", coins: "دعم",
      rate100k: 10, rate1m: 100, available: true,
      formula: "100,000 دعم = 10 دولار | 1,000,000 دعم = 100 دولار"
    },
    EGP: {
      title: "سحب تارجت — الجنيه المصري", currency: "EGP",
      cash: "جنيه", coins: "دعم",
      rate100k: null, rate1m: null, available: false,
      formula: "سعر الجنيه المصري لسحب التارجت غير محدد حالياً."
    },
    ILS: {
      title: "سحب تارجت — الشيقل", currency: "ILS",
      cash: "شيقل", coins: "دعم",
      rate100k: 30, rate1m: 300, available: true,
      formula: "100,000 دعم = 30 شيقل | 1,000,000 دعم = 300 شيقل"
    }
  },

  games: {
    JOD: {
      title: "مكاسب الألعاب — الدينار", currency: "JOD",
      cash: "دينار", coins: "دعم",
      rate100k: 6, rate1m: 63, available: true,
      formula: "100,000 دعم = 6 دينار | 1,000,000 دعم = 63 دينار"
    },
    USD: {
      title: "مكاسب الألعاب — الدولار", currency: "USD",
      cash: "دولار", coins: "رمي",
      rate100k: 8, rate1m: 83, available: true,
      formula: "100,000 رمي = 8 دولار | 1,000,000 رمي = 83 دولار"
    },
    EGP: {
      title: "مكاسب الألعاب — الجنيه", currency: "EGP",
      cash: "جنيه", coins: "دعم",
      rate100k: 400, rate1m: 4500, available: true,
      formula: "100,000 دعم = 400 جنيه | 1,000,000 دعم = 4,500 جنيه"
    },
    ILS: {
      title: "مكاسب الألعاب — الشيقل", currency: "ILS",
      cash: "شيقل", coins: "دعم",
      rate100k: 25, rate1m: 250, available: true,
      formula: "100,000 دعم = 25 شيقل | 1,000,000 دعم = 250 شيقل"
    }
  }
};

const VIP = [
[50000,50000,30000],[100000,50000,30000],[300000,100000,90000],
[1000000,800000,500000],[3000000,2000000,1300000],
[7000000,4000000,2600000],[14000000,7000000,4500000],
[26000000,12000000,7800000],[42000000,16000000,11000000],
[62000000,20000000,14000000],[102000000,40000000,28000000],
[220000000,118000000,83000000],[430000000,210000000,150000000],
[820000000,390000000,310000000],[1820000000,1000000000,700000000],
[3820000000,2000000000,1400000000],[7382000000,3500000000,3000000000],
[11882000000,4500000000,4000000000],[17382000000,5500000000,5000000000],
[27382000000,10000000000,9000000000]
].map((x,i)=>({level:i+1,total:x[0],upgrade:x[1],maintain:x[2]}));

const $ = id => document.getElementById(id);
const fmt = n => Number.isFinite(Number(n)) ? Number(n).toLocaleString("en-US",{maximumFractionDigits:8}) : "0";
const num = v => {
  const n = Number(String(v ?? "").replace(/,/g,""));
  return Number.isFinite(n) && n >= 0 && n <= CONFIG.max ? n : 0;
};

function toast(message) {
  const el = $("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(()=>el.classList.remove("show"),1800);
}

function copy(text) {
  if (!text) return toast("لا توجد نتيجة");
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(()=>toast("تم النسخ"));
  } else {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    toast("تم النسخ");
  }
}

/* ================= THEME ================= */

function initTheme() {
  if (localStorage.getItem(CONFIG.themeKey) === "light") {
    document.body.classList.add("light");
  }

  $("themeToggle").onclick = () => {
    document.body.classList.toggle("light");
    localStorage.setItem(
      CONFIG.themeKey,
      document.body.classList.contains("light") ? "light" : "dark"
    );
  };
}

/* ================= CALCULATOR ENGINE ================= */

let selectedType = "shipping";
let selectedCurrency = "JOD";

function tieredCoinsToCash(value, rate100k, rate1m) {
  if (!rate100k || !rate1m) return 0;

  const millions = Math.floor(value / 1000000);
  const rest = value % 1000000;

  /*
    القيمة بين 100K و 1M تستخدم سعر 1M كنسبة.
    السعر المحدد للمليون لا يتم استبداله بسعر 100K × 10.
  */
  const restCash = rest <= 100000
    ? rest / 100000 * rate100k
    : rest / 1000000 * rate1m;

  return millions * rate1m + restCash;
}

function cashToCoins(value, rate100k, rate1m) {
  if (!rate100k || !rate1m) return 0;

  const millions = Math.floor(value / rate1m);
  const rest = value - millions * rate1m;

  const restCoins = rest <= rate100k
    ? rest / rate100k * 100000
    : rest / rate1m * 1000000;

  return millions * 1000000 + restCoins;
}

function convert(config, mode, value) {
  const n = num(value);

  if (!config.available || !n) {
    return { value:0, unavailable:!config.available };
  }

  if (mode === "coins") {
    if (selectedType === "shipping") {
      return {value:tieredCoinsToCash(n,config.rate100k,config.rate1m),unavailable:false};
    }

    return {value:tieredCoinsToCash(n,config.rate100k,config.rate1m),unavailable:false};
  }

  return {
    value:cashToCoins(n,config.rate100k,config.rate1m),
    unavailable:false
  };
}

function card(config) {
  const key = `${selectedType}-${selectedCurrency}`;
  const unavailable = config.available ? "" : `<div class="unavailable">السعر غير محدد حالياً. يمكنك تعديل rate100k و rate1m في CONFIG.</div>`;

  return `
  <article class="calc-card">
    <div class="card-top">
      <div><h3>${config.title}</h3><p>${config.currency}</p></div>
      <span class="card-icon">${config.currency}</span>
    </div>

    <label>وحدة الإدخال
      <select id="unit-${key}">
        <option value="coins">${config.coins}</option>
        <option value="cash">${config.cash}</option>
      </select>
    </label>

    <label>القيمة
      <input id="input-${key}" type="number" min="0" step="any" placeholder="أدخل القيمة">
    </label>

    <div class="calc-actions">
      <button class="btn" id="copy-${key}" type="button">نسخ</button>
      <button class="btn" id="clear-${key}" type="button">مسح</button>
    </div>

    <div class="result">
      <small>القيمة المحولة</small>
      <strong id="result-${key}">0</strong>
      <div class="formula" id="formula-${key}">${config.formula}</div>
      ${unavailable}
    </div>
  </article>`;
}

function renderCalculator() {
  const grid = $("calculatorGrid");
  const config = CALCULATOR_CONFIG[selectedType][selectedCurrency];

  grid.innerHTML = card(config);

  const key = `${selectedType}-${selectedCurrency}`;
  const input = $(`input-${key}`);
  const unit = $(`unit-${key}`);
  const result = $(`result-${key}`);

  function update() {
    const output = convert(config,unit.value,input.value);

    if (output.unavailable) {
      result.textContent = "غير متاح";
      return;
    }

    const outputUnit = unit.value === "coins" ? config.cash : config.coins;
    result.textContent = `${fmt(output.value)} ${outputUnit}`;
  }

  input.oninput = update;
  unit.onchange = update;

  $(`clear-${key}`).onclick = () => {
    input.value = "";
    result.textContent = "0";
  };

  $(`copy-${key}`).onclick = () => {
    copy(`${config.title}\n${result.textContent}\n${config.formula}`);
  };
}

function initCalculatorNavigation() {
  document.querySelectorAll("[data-type]").forEach(button => {
    button.onclick = () => {
      document.querySelectorAll("[data-type]").forEach(x=>x.classList.remove("active"));
      button.classList.add("active");
      selectedType = button.dataset.type;
      renderCalculator();
    };
  });

  document.querySelectorAll("[data-currency]").forEach(button => {
    button.onclick = () => {
      document.querySelectorAll("[data-currency]").forEach(x=>x.classList.remove("active"));
      button.classList.add("active");
      selectedCurrency = button.dataset.currency;
      renderCalculator();
    };
  });

  renderCalculator();
}

/* ================= VIP ================= */

function initVipSelectors() {
  $("currentVip").innerHTML = VIP.map(x=>`<option value="${x.level}">VIP ${x.level}</option>`).join("");
  $("targetVip").innerHTML = VIP.map(x=>`<option value="${x.level}">VIP ${x.level}</option>`).join("");
  $("multiplier").innerHTML = Array.from({length:10},(_,i)=>`<option value="${i+1}">×${i+1}</option>`).join("");
  $("currentVip").value = 1;
  $("targetVip").value = 2;
}

function calculateVip() {
  const current = num($("currentVip").value) || 1;
  const target = num($("targetVip").value) || 1;
  const mode = $("vipMode").value;
  const multiplier = num($("multiplier").value) || 1;
  const rate = num($("supportRate").value);

  const targetData = VIP[target-1];
  const reach = target > current && mode !== "lock" ? targetData.upgrade : 0;
  const lock = mode !== "reach" ? targetData.maintain : 0;
  const total = reach + lock;
  const actual = total / multiplier;
  const support = actual / 1000000 * rate;

  const values = [
    ["Current VIP",`VIP ${current}`],
    ["Target VIP",`VIP ${target}`],
    ["Reach Points",fmt(reach)],
    ["Lock Points",fmt(lock)],
    ["Total VIP Points",fmt(total)],
    ["Actual Charge",fmt(actual)],
    ["Support Required",fmt(support)],
    ["JOD / USD",`${fmt(support)} / ${fmt(support)}`]
  ];

  $("vipResults").innerHTML = values.map(x=>`<div class="metric"><small>${x[0]}</small><b>${x[1]}</b></div>`).join("");

  $("vipFormula").textContent =
`الوصول: ${fmt(reach)}
التثبيت: ${fmt(lock)}
الإجمالي: ${fmt(total)} ÷ ×${multiplier} = ${fmt(actual)}
الدعم: ${fmt(actual)} ÷ 1,000,000 × ${fmt(rate)} = ${fmt(support)}`;

  return {current,target,multiplier,reach,lock,total,actual,support,jod:support,usd:support};
}

function initVip() {
  initVipSelectors();
  ["currentVip","targetVip","vipMode","multiplier","supportRate"].forEach(id=>{
    $(id).onchange = calculateVip;
  });
  $("calculateVip").onclick = calculateVip;
  $("copyVip").onclick = () => copy($("vipFormula").textContent);
  calculateVip();
}

function initVipTable() {
  function render(search="") {
    $("vipTable").innerHTML = VIP.filter(x=>`vip ${x.level}`.includes(search.toLowerCase())).map(x=>`
      <tr><td>VIP ${x.level}</td><td>${fmt(x.total)}</td><td>${fmt(x.upgrade)}</td><td>${fmt(x.maintain)}</td></tr>
    `).join("");
  }
  render();
  $("vipSearch").oninput = e => render(e.target.value);
}

/* ================= HISTORY / STATS ================= */

function historyData() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.historyKey) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(data) {
  localStorage.setItem(CONFIG.historyKey,JSON.stringify(data));
}

function renderStats(data) {
  const sum = key => data.reduce((a,x)=>a+num(x[key]),0);
  const customers = new Set(data.map(x=>x.clientId).filter(Boolean)).size;
  const highest = data.reduce((a,x)=>Math.max(a,num(x.target)),0);

  const values = [
    ["إجمالي العمليات",data.length],
    ["إجمالي العملاء",customers],
    ["إجمالي الشحن",fmt(sum("actual"))],
    ["إجمالي الدعم",fmt(sum("support"))],
    ["إجمالي نقاط VIP",fmt(sum("total"))],
    ["إجمالي الدينار",fmt(sum("jod"))],
    ["إجمالي الدولار",fmt(sum("usd"))],
    ["أعلى VIP مستهدف",highest ? `VIP ${highest}` : "—"]
  ];

  $("stats").innerHTML = values.map(x=>`<div class="stat"><small>${x[0]}</small><b>${x[1]}</b></div>`).join("");
}

function clean(value) {
  return String(value).replace(/[&<>"']/g,x=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[x]));
}

function renderHistory(search="") {
  const data = historyData();
  renderStats(data);

  const query = search.toLowerCase();
  const filtered = data.filter(x=>
    `${x.clientName} ${x.clientId}`.toLowerCase().includes(query)
  );

  $("historyList").innerHTML = filtered.length
    ? filtered.map(x=>`
      <div class="history-item">
        <div>
          <p><b>${clean(x.clientName)}</b> — ${clean(x.clientId || "بدون ID")}</p>
          <small>${x.date} · VIP ${x.current} → VIP ${x.target} · دعم ${fmt(x.support)}</small>
        </div>
        <button class="btn danger delete-history" data-id="${x.id}" type="button">حذف</button>
      </div>
    `).join("")
    : `<div class="panel">لا توجد عمليات محفوظة.</div>`;

  document.querySelectorAll(".delete-history").forEach(button=>{
    button.onclick = () => {
      saveHistory(historyData().filter(x=>x.id !== button.dataset.id));
      renderHistory($("historySearch").value);
      toast("تم حذف العملية");
    };
  });
}

function initHistory() {
  renderHistory();

  $("historySearch").oninput = e => renderHistory(e.target.value);

  $("statsToggle").onclick = () => {
    $("stats").classList.toggle("hidden");
  };

  $("clearHistory").onclick = () => {
    saveHistory([]);
    renderHistory();
    toast("تم حذف السجل");
  };

  $("saveOperation").onclick = () => {
    const result = calculateVip();

    const item = {
      id: String(Date.now()),
      clientName: $("clientName").value.trim() || "عميل غير مسمى",
      clientId: $("clientId").value.trim(),
      ...result,
      date: new Date().toLocaleString("ar-EG")
    };

    saveHistory([item,...historyData()]);
    renderHistory();
    toast("تم حفظ العملية");
  };
}

/* ================= INITIALIZATION ================= */

document.addEventListener("DOMContentLoaded",()=>{
  initTheme();
  initCalculatorNavigation();
  initVip();
  initVipTable();
  initHistory();
});
