"use strict";

/* =========================
   CONFIG
========================= */
const CONFIG = {
  historyKey: "f90_history",
  themeKey: "f90_theme",
  maxInput: 1e30
};

const shippingData = [
  { id:"jod", title:"الشحن بالدينار", icon:"د", input:"دينار", output:"كوينز", rate:60000 / 5, reverse:80 / 1000000, formula:"كل 5 دينار = 60,000 كوينز | كل 1,000,000 كوينز = 80 دينار" },
  { id:"usd", title:"الشحن بالدولار", icon:"$", input:"دولار", output:"كوينز", rate:8700, reverse:115 / 1000000, formula:"كل 1 دولار = 8,700 كوينز | كل 1,000,000 كوينز = 115 دولار" },
  { id:"egp", title:"الشحن بالجنيه", icon:"ج", input:"جنيه", output:"كوينز", rate:17500 / 100, reverse:5800 / 1000000, formula:"كل 100 جنيه = 17,500 كوينز | كل 1,000,000 كوينز = 5,800 جنيه" }
];

const withdrawData = [
  { id:"gameJod", title:"الدينار — مكاسب الألعاب", icon:"د", input:"دعم", output:"دينار", rate:6 / 100000, reverse:100000 / 6, formula:"كل 100,000 دعم = 6 دينار | كل 1,000,000 دعم = 63 دينار" },
  { id:"targetJod", title:"الدينار — سحب تارجت", icon:"د", input:"دعم", output:"دينار", rate:7 / 100000, reverse:100000 / 7, formula:"كل 100,000 دعم = 7 دينار | كل 1,000,000 دعم = 73 دينار" },
  { id:"gameUsd", title:"الدولار — مكاسب الألعاب", icon:"$", input:"رمي", output:"دولار", rate:8 / 100000, reverse:100000 / 8, formula:"كل 100,000 رمي = 8 دولار | كل 1,000,000 رمي = 83 دولار" },
  { id:"targetUsd", title:"الدولار — سحب تارجت", icon:"$", input:"رمي", output:"دولار", rate:10 / 100000, reverse:100000 / 10, formula:"كل 100,000 رمي = 10 دولار | كل 1,000,000 رمي = 100 دولار" },
  { id:"gameEgp", title:"الجنيه — مكاسب الألعاب", icon:"ج", input:"دعم", output:"جنيه", rate:400 / 100000, reverse:100000 / 400, formula:"كل 100,000 دعم = 400 جنيه | كل 1,000,000 دعم = 4,500 جنيه" },
  { id:"chargeIls", title:"الشيقل — الشحن", icon:"₪", input:"شيقل", output:"كوينز", rate:130000 / 50, reverse:380 / 1000000, formula:"كل 50 شيقل = 130,000 كوينز | كل 1,000,000 كوينز = 380 شيقل" },
  { id:"targetIls", title:"الشيقل — سحب تارجت", icon:"₪", input:"دعم", output:"شيقل", rate:30 / 100000, reverse:100000 / 30, formula:"كل 100,000 دعم = 30 شيقل | كل 1,000,000 دعم = 300 شيقل" },
  { id:"gameIls", title:"الشيقل — مكاسب الألعاب", icon:"₪", input:"دعم", output:"شيقل", rate:25 / 100000, reverse:100000 / 25, formula:"كل 100,000 دعم = 25 شيقل | كل 1,000,000 دعم = 250 شيقل" }
];

const vipData = [
[50000,50000,30000],[100000,50000,30000],[300000,100000,90000],[1000000,800000,500000],
[3000000,2000000,1300000],[7000000,4000000,2600000],[14000000,7000000,4500000],
[26000000,12000000,7800000],[42000000,16000000,11000000],[62000000,20000000,14000000],
[102000000,40000000,28000000],[220000000,118000000,83000000],[430000000,210000000,150000000],
[820000000,390000000,310000000],[1820000000,1000000000,700000000],[3820000000,2000000000,1400000000],
[7382000000,3500000000,3000000000],[11882000000,4500000000,4000000000],
[17382000000,5500000000,5000000000],[27382000000,10000000000,9000000000]
].map((v,i)=>({ level:i+1,total:v[0],upgrade:v[1],maintain:v[2] }));

/* =========================
   HELPERS / FORMATTERS
========================= */
const $ = id => document.getElementById(id);
const safeNumber = value => {
  const n = Number(String(value ?? "").replace(/,/g,""));
  return Number.isFinite(n) && n >= 0 && n <= CONFIG.maxInput ? n : 0;
};
const fmt = value => Number.isFinite(Number(value)) ? Number(value).toLocaleString("en-US",{maximumFractionDigits:6}) : "0";
const money = value => fmt(value);
const getVip = level => vipData[Math.max(0,Math.min(19,Number(level)-1))];
const showToast = message => {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(()=>toast.classList.remove("show"),1800);
};
const copyText = text => navigator.clipboard?.writeText(text).then(()=>showToast("تم النسخ")).catch(()=>showToast("تعذر النسخ"));

/* =========================
   THEME
========================= */
function initTheme() {
  const saved = localStorage.getItem(CONFIG.themeKey);
  if (saved === "light") document.body.classList.add("light");
  $("themeToggle")?.addEventListener("click",()=>{
    document.body.classList.toggle("light");
    localStorage.setItem(CONFIG.themeKey,document.body.classList.contains("light")?"light":"dark");
  });
}

/* =========================
   CALCULATOR ENGINE
========================= */
function convertValue(value, direction, config) {
  const n = safeNumber(value);
  if (!n) return 0;
  return direction === "forward" ? n * config.rate : n * config.reverse;
}

function calculatorCard(config) {
  return `
  <article class="calc-card">
    <div class="card-top"><div><h3>${config.title}</h3><p>تحويل مباشر بين الوحدات</p></div><span class="card-icon">${config.icon}</span></div>
    <label>نوع الإدخال
      <select data-unit="${config.id}">
        <option value="forward">${config.input}</option>
        <option value="reverse">${config.output}</option>
      </select>
    </label>
    <label>القيمة
      <input data-input="${config.id}" type="number" min="0" step="any" placeholder="اكتب القيمة">
    </label>
    <div class="calc-actions">
      <button type="button" class="btn btn-ghost" data-copy="${config.id}">نسخ</button>
      <button type="button" class="btn btn-ghost" data-clear="${config.id}">مسح</button>
    </div>
    <div class="result-box">
      <span class="result-label">القيمة المحولة</span>
      <strong class="result-value" data-result="${config.id}">0</strong>
      <div class="formula" data-formula="${config.id}">${config.formula}</div>
    </div>
  </article>`;
}

function initCalculators(list, containerId) {
  const container = $(containerId);
  if (!container) return;
  container.innerHTML = list.map(calculatorCard).join("");

  list.forEach(config=>{
    const input = document.querySelector(`[data-input="${config.id}"]`);
    const unit = document.querySelector(`[data-unit="${config.id}"]`);
    const result = document.querySelector(`[data-result="${config.id}"]`);

    const update = ()=>{
      const direction = unit.value;
      const value = convertValue(input.value,direction,config);
      const outputUnit = direction === "forward" ? config.output : config.input;
      result.textContent = `${fmt(value)} ${outputUnit}`;
    };

    input.addEventListener("input",update);
    unit.addEventListener("change",update);

    document.querySelector(`[data-clear="${config.id}"]`)?.addEventListener("click",()=>{
      input.value = "";
      result.textContent = "0";
    });

    document.querySelector(`[data-copy="${config.id}"]`)?.addEventListener("click",()=>{
      copyText(`${config.title}: ${result.textContent}`);
    });
  });
}

/* =========================
   VIP DATA / UI
========================= */
function initVipSelectors() {
  [$("currentVip"),$("targetVip")].forEach(select=>{
    if (!select) return;
    select.innerHTML = vipData.map(v=>`<option value="${v.level}">VIP ${v.level}</option>`).join("");
  });
  if ($("currentVip")) $("currentVip").value = "1";
  if ($("targetVip")) $("targetVip").value = "2";
  if ($("multiplier")) $("multiplier").innerHTML = Array.from({length:10},(_,i)=>`<option value="${i+1}">×${i+1}</option>`).join("");
}

function calculateVip() {
  const current = safeNumber($("currentVip")?.value) || 1;
  const target = safeNumber($("targetVip")?.value) || 1;
  const mode = $("vipMode")?.value || "reach";
  const multiplier = safeNumber($("multiplier")?.value) || 1;
  const supportRate = safeNumber($("supportRate")?.value);

  const targetData = getVip(target);
  const currentData = getVip(current);
  const reach = target > current ? targetData.upgrade : 0;
  const lock = mode === "lock" || mode === "both" ? targetData.maintain : 0;
  const total = mode === "lock" ? lock : reach + lock;
  const actual = total / multiplier;
  const support = actual / 1000000 * supportRate;

  const values = {
    current:`VIP ${current}`, target:`VIP ${target}`, reach:fmt(reach),
    lock:fmt(lock), total:fmt(total), actual:fmt(actual),
    support:fmt(support), jod:fmt(support), usd:fmt(support)
  };

  $("vipResults").innerHTML = [
    ["المستوى الحالي",values.current],["المستوى المطلوب",values.target],
    ["Reach Points",values.reach],["Lock Points",values.lock],
    ["Total VIP Points",values.total],["Actual Charge",values.actual],
    ["Support Required",values.support],["JOD / USD",`${values.jod} / ${values.usd}`]
  ].map(x=>`<div class="metric"><small>${x[0]}</small><b>${x[1]}</b></div>`).join("");

  $("vipFormula").textContent =
`الوصول: ${fmt(reach)} نقطة
التثبيت: ${fmt(lock)} نقطة
الإجمالي: ${fmt(total)} ÷ ×${multiplier} = ${fmt(actual)} شحن فعلي
الدعم: ${fmt(actual)} ÷ 1,000,000 × ${fmt(supportRate)} = ${fmt(support)}`;
  return {current,target,multiplier,reach,lock,total,actual,support,jod:support,usd:support};
}

function initVip() {
  initVipSelectors();
  $("vipForm")?.addEventListener("submit",e=>{e.preventDefault(); calculateVip();});
  ["currentVip","targetVip","vipMode","multiplier","supportRate"].forEach(id=>$(id)?.addEventListener("change",calculateVip));
  calculateVip();
}

/* =========================
   VIP TABLE
========================= */
function initVipTable() {
  const body = $("vipTableBody");
  if (!body) return;
  const draw = filter => {
    body.innerHTML = vipData.filter(v=>`vip ${v.level}`.includes(filter.toLowerCase()))
      .map(v=>`<tr><td>VIP ${v.level}</td><td>${fmt(v.total)}</td><td>${fmt(v.upgrade)}</td><td>${fmt(v.maintain)}</td></tr>`).join("");
  };
  draw("");
  $("vipSearch")?.addEventListener("input",e=>draw(e.target.value));
}

/* =========================
   HISTORY / STATS
========================= */
function getHistory() {
  try { return JSON.parse(localStorage.getItem(CONFIG.historyKey) || "[]"); }
  catch { return []; }
}
function saveHistory(data) { localStorage.setItem(CONFIG.historyKey,JSON.stringify(data)); }

function renderStats(history) {
  const panel = $("statsPanel");
  if (!panel) return;
  const sum = key => history.reduce((a,x)=>a + safeNumber(x[key]),0);
  const highest = history.reduce((a,x)=>Math.max(a,safeNumber(x.target)),0);
  const unique = new Set(history.map(x=>x.clientId).filter(Boolean)).size;
  panel.innerHTML = [
    ["إجمالي العمليات",history.length],["إجمالي العملاء",unique],
    ["إجمالي الشحن",fmt(sum("actual"))],["إجمالي الدعم",fmt(sum("support"))],
    ["إجمالي نقاط VIP",fmt(sum("total"))],["إجمالي الدينار",fmt(sum("jod"))],
    ["إجمالي الدولار",fmt(sum("usd"))],["أعلى VIP مستهدف",highest ? `VIP ${highest}` : "—"]
  ].map(x=>`<div class="stat-card"><small>${x[0]}</small><b>${x[1]}</b></div>`).join("");
}

function renderHistory(filter="") {
  const list = $("historyList");
  if (!list) return;
  const history = getHistory();
  renderStats(history);
  const q = filter.toLowerCase();
  const rows = history.filter(x=>(x.clientName+" "+x.clientId).toLowerCase().includes(q));
  list.innerHTML = rows.length ? rows.map(x=>`
    <article class="history-item">
      <div><p><strong>${escapeHtml(x.clientName || "عميل غير مسمى")}</strong> — ${escapeHtml(x.clientId || "بدون ID")}</p>
      <small>${x.date} · VIP ${x.current} → VIP ${x.target} · دعم: ${fmt(x.support)}</small></div>
      <button type="button" class="btn btn-danger" data-delete="${x.id}">حذف</button>
    </article>`).join("") : `<div class="panel"><p>لا توجد عمليات محفوظة.</p></div>`;
  list.querySelectorAll("[data-delete]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      saveHistory(getHistory().filter(x=>x.id !== btn.dataset.delete));
      renderHistory($("historySearch")?.value || "");
      showToast("تم حذف العملية");
    });
  });
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function initHistory() {
  renderHistory();
  $("historySearch")?.addEventListener("input",e=>renderHistory(e.target.value));
  $("statsToggle")?.addEventListener("click",()=>$("statsPanel")?.classList.toggle("is-hidden"));
  $("clearHistory")?.addEventListener("click",()=>{
    if (!getHistory().length) return showToast("السجل فارغ");
    saveHistory([]); renderHistory(); showToast("تم حذف السجل");
  });
  $("saveOperation")?.addEventListener("click",()=>{
    const result = calculateVip();
    const item = {
      id:Date.now().toString(),
      clientName:$("clientName")?.value.trim() || "عميل غير مسمى",
      clientId:$("clientId")?.value.trim() || "",
      ...result,
      date:new Date().toLocaleString("ar-EG")
    };
    saveHistory([item,...getHistory()]);
    renderHistory();
    showToast("تم حفظ العملية");
  });
}

/* =========================
   COPY / INITIALIZATION
========================= */
document.addEventListener("click",e=>{
  const button = e.target.closest("[data-copy-target]");
  if (button) {
    const target = $(button.dataset.copyTarget);
    if (target) copyText(target.textContent);
  }
});

document.addEventListener("DOMContentLoaded",()=>{
  initTheme();
  initCalculators(shippingData,"shippingGrid");
  initCalculators(withdrawData,"withdrawGrid");
  initVip();
  initVipTable();
  initHistory();
});
