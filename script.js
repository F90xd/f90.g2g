(() => {
"use strict";

const $ = id => document.getElementById(id);

const n = v => {
  const x = Number(String(v ?? "").replace(/,/g,"").trim());
  return Number.isFinite(x) ? x : 0;
};

const fmt = (v,d=0) =>
  n(v).toLocaleString("en-US", {
    minimumFractionDigits:d,
    maximumFractionDigits:d
  });

const toast = msg => {
  const el = $("toast");
  if (!el) return;

  el.textContent = msg;
  el.classList.add("show");

  clearTimeout(window.__toast);

  window.__toast = setTimeout(
    () => el.classList.remove("show"),
    2200
  );
};


/* =========================================================
   F90 VIP DATA
========================================================= */

const VIP = [
  {level:1,total:50000,upgrade:50000,maintain:30000},
  {level:2,total:100000,upgrade:50000,maintain:30000},
  {level:3,total:300000,upgrade:100000,maintain:90000},
  {level:4,total:1000000,upgrade:800000,maintain:500000},
  {level:5,total:3000000,upgrade:2000000,maintain:1300000},
  {level:6,total:7000000,upgrade:4000000,maintain:2600000},
  {level:7,total:14000000,upgrade:7000000,maintain:4500000},
  {level:8,total:26000000,upgrade:12000000,maintain:7800000},
  {level:9,total:42000000,upgrade:16000000,maintain:11000000},
  {level:10,total:62000000,upgrade:20000000,maintain:14000000},
  {level:11,total:102000000,upgrade:40000000,maintain:28000000},
  {level:12,total:220000000,upgrade:118000000,maintain:83000000},
  {level:13,total:430000000,upgrade:210000000,maintain:150000000},
  {level:14,total:820000000,upgrade:390000000,maintain:310000000},
  {level:15,total:1820000000,upgrade:1000000000,maintain:700000000},
  {level:16,total:3820000000,upgrade:2000000000,maintain:1400000000},
  {level:17,total:7382000000,upgrade:3500000000,maintain:3000000000},
  {level:18,total:11882000000,upgrade:4500000000,maintain:4000000000},
  {level:19,total:17382000000,upgrade:5500000000,maintain:5000000000},
  {level:20,total:27382000000,upgrade:10000000000,maintain:9000000000}
];

const getVIP = level =>
  VIP.find(x => x.level === Number(level));


/* =========================================================
   STORAGE
========================================================= */

const HISTORY_KEY = "f90_vip_history_v1";
const THEME_KEY = "f90_theme_v1";

let history = [];

try {
  history = JSON.parse(
    localStorage.getItem(HISTORY_KEY) || "[]"
  );

  if (!Array.isArray(history)) {
    history = [];
  }
} catch {
  history = [];
}


/* =========================================================
   THEME
========================================================= */

function applyTheme(theme) {

  document.body.classList.toggle(
    "light",
    theme === "light"
  );

  const button = $("themeToggle");

  if (button) {
    button.textContent =
      theme === "light" ? "☀" : "☾";
  }
}

const savedTheme =
  localStorage.getItem(THEME_KEY) || "dark";

applyTheme(savedTheme);

$("themeToggle")?.addEventListener(
  "click",
  () => {

    const light =
      document.body.classList.contains("light");

    const theme =
      light ? "dark" : "light";

    localStorage.setItem(
      THEME_KEY,
      theme
    );

    applyTheme(theme);
  }
);


/* =========================================================
   VIP SELECTS
========================================================= */

function buildVipSelects() {

  const current = $("currentVip");
  const target = $("targetVip");

  if (!current || !target) return;

  current.innerHTML = "";
  target.innerHTML = "";

  VIP.forEach(item => {

    const a =
      document.createElement("option");

    a.value = item.level;
    a.textContent = `VIP ${item.level}`;

    current.appendChild(a);


    const b =
      document.createElement("option");

    b.value = item.level;
    b.textContent = `VIP ${item.level}`;

    target.appendChild(b);

  });

  current.value = "10";
  target.value = "11";
}

buildVipSelects();


/* =========================================================
   VIP TABLE
========================================================= */

function renderVipTable() {

  const table = $("vipTable");

  if (!table) return;

  table.innerHTML = "";

  VIP.forEach(item => {

    const tr =
      document.createElement("tr");

    tr.innerHTML = `
      <td>VIP ${item.level}</td>
      <td>${fmt(item.total)}</td>
      <td>${fmt(item.upgrade)}</td>
      <td>${fmt(item.maintain)}</td>
    `;

    table.appendChild(tr);
  });
}

renderVipTable();


/* =========================================================
   VIP TRANSITIONS
========================================================= */

function renderTransitions() {

  const area = $("transitionList");

  if (!area) return;

  area.innerHTML = "";

  const current =
    n($("currentVip")?.value);

  const target =
    n($("targetVip")?.value);

  if (target <= current) {

    area.innerHTML = `
      <div class="empty">
        اختر مستوى أعلى من المستوى الحالي
      </div>
    `;

    return;
  }

  const firstTarget = current + 1;

  const first =
    getVIP(firstTarget);

  if (!first) return;

  const firstBox =
    document.createElement("div");

  firstBox.className =
    "transition first-transition";

  firstBox.innerHTML = `
    <div class="transition-head">
      <span>الانتقال الأول</span>
      <strong>
        VIP ${current} → VIP ${firstTarget}
      </strong>
    </div>

    <input
      id="firstTransitionInput"
      type="text"
      inputmode="decimal"
      placeholder="أدخل قيمة النقص الفعلية"
      autocomplete="off"
    >
  `;

  area.appendChild(firstBox);

  $("firstTransitionInput")?.addEventListener(
    "input",
    calculateVIP
  );


  if (target > firstTarget) {

    const title =
      document.createElement("div");

    title.className =
      "automatic-title";

    title.innerHTML = `
      <span>الانتقالات التالية</span>
      <small>تُحسب تلقائياً من جدول VIP</small>
    `;

    area.appendChild(title);


    for (
      let level = firstTarget;
      level < target;
      level++
    ) {

      const next =
        getVIP(level + 1);

      if (!next) continue;

      const box =
        document.createElement("div");

      box.className =
        "transition automatic-transition";

      box.innerHTML = `
        <div class="transition-head">
          <span>تلقائي</span>

          <strong>
            VIP ${level} → VIP ${level + 1}
          </strong>
        </div>

        <div class="auto-transition-value">
          <span>قيمة الترقية</span>
          <strong>${fmt(next.upgrade)}</strong>
        </div>
      `;

      area.appendChild(box);
    }
  }
}


/* =========================================================
   VIP CALCULATOR
========================================================= */

function calculateVIP() {

  const current =
    n($("currentVip")?.value);

  const target =
    n($("targetVip")?.value);

  const multiplier =
    n($("multiplier")?.value) || 1;

  const mode =
    document.querySelector(
      'input[name="mode"]:checked'
    )?.value || "reach";


  let reachPoints = 0;
  let lockPoints = 0;


  /*
   * الوصول:
   * الانتقال الأول يدخل يدوياً.
   * باقي الانتقالات من جدول VIP.
   */

  if (
    mode === "reach" &&
    target > current
  ) {

    const firstInput =
      $("firstTransitionInput");

    reachPoints =
      n(firstInput?.value);


    for (
      let level = current + 1;
      level < target;
      level++
    ) {

      const next =
        getVIP(level + 1);

      if (next) {
        reachPoints += next.upgrade;
      }
    }
  }


  /*
   * تثبيت المستوى الحالي
   */

  if (mode === "currentLock") {

    const currentData =
      getVIP(current);

    if (currentData) {
      lockPoints =
        currentData.maintain;
    }
  }


  /*
   * تثبيت المستوى المطلوب
   */

  if (
    mode === "reach" &&
    $("enableTargetLock")?.checked
  ) {

    const targetData =
      getVIP(target);

    if (targetData) {
      lockPoints =
        targetData.maintain;
    }
  }


  const totalVipPoints =
    reachPoints + lockPoints;


  /*
   * نقاط VIP ÷ العرض
   */

  const actualCharge =
    totalVipPoints / multiplier;


  /*
   * الدعم
   */

  const supportRate =
    n($("supportRate")?.value);

  const supportNeeded =
    actualCharge / 1000000 * supportRate;


  /*
   * العملات
   */

  const jodRate =
    n($("jodRate")?.value);

  const usdRate =
    n($("usdRate")?.value);


  const jodTotal =
    supportRate > 0
      ? supportNeeded / supportRate * jodRate
      : 0;


  const usdTotal =
    supportRate > 0
      ? supportNeeded / supportRate * usdRate
      : 0;


  const result = {
    current,
    target,
    multiplier,
    reachPoints,
    lockPoints,
    totalVipPoints,
    actualCharge,
    supportNeeded,
    jodTotal,
    usdTotal,
    supportRate
  };


  updateVIPResult(result);

  return result;
}


/* =========================================================
   VIP RESULT
========================================================= */

function updateVIPResult(data) {

  if ($("resultTitle")) {
    $("resultTitle").textContent =
      `VIP ${data.current} → VIP ${data.target}`;
  }

  if ($("resultMultiplier")) {
    $("resultMultiplier").textContent =
      `×${data.multiplier}`;
  }

  if ($("actualCharge")) {
    $("actualCharge").textContent =
      fmt(data.actualCharge);
  }

  if ($("reachPoints")) {
    $("reachPoints").textContent =
      fmt(data.reachPoints);
  }

  if ($("lockPoints")) {
    $("lockPoints").textContent =
      fmt(data.lockPoints);
  }

  if ($("totalVipPoints")) {
    $("totalVipPoints").textContent =
      fmt(data.totalVipPoints);
  }

  if ($("supportNeeded")) {
    $("supportNeeded").textContent =
      fmt(data.supportNeeded);
  }

  if ($("jodTotal")) {
    $("jodTotal").textContent =
      `${fmt(data.jodTotal,2)} د.أ`;
  }

  if ($("usdTotal")) {
    $("usdTotal").textContent =
      `${fmt(data.usdTotal,2)} $`;
  }

  if ($("formulaReach")) {
    $("formulaReach").textContent =
      fmt(data.reachPoints);
  }

  if ($("formulaLock")) {
    $("formulaLock").textContent =
      fmt(data.lockPoints);
  }

  if ($("formulaVip")) {
    $("formulaVip").textContent =
      fmt(data.totalVipPoints);
  }

  if ($("formulaMultiplier")) {
    $("formulaMultiplier").textContent =
      `×${data.multiplier}`;
  }

  if ($("formulaSupport")) {
    $("formulaSupport").textContent =
      `${fmt(data.actualCharge)} ÷ 1,000,000 × ${fmt(data.supportRate)} = ${fmt(data.supportNeeded)}`;
  }

  const target =
    getVIP(data.target);

  if (target) {

    if ($("autoLockValue")) {
      $("autoLockValue").textContent =
        fmt(target.maintain);
    }

    if ($("autoLockLevel")) {
      $("autoLockLevel").textContent =
        target.level;
    }
  }
}


/* =========================================================
   VIP MODE
========================================================= */

function updateMode() {

  const selected =
    document.querySelector(
      'input[name="mode"]:checked'
    );

  if (!selected) return;

  const reach =
    selected.value === "reach";

  $("reachModeLabel")
    ?.classList.toggle("active", reach);

  $("currentLockLabel")
    ?.classList.toggle("active", !reach);

  $("transitionArea")
    ?.classList.toggle("hidden", !reach);

  $("targetLockBox")
    ?.classList.toggle("hidden", !reach);

  calculateVIP();
}


/* =========================================================
   TARGET LOCK
========================================================= */

function updateLock() {

  const checkbox =
    $("enableTargetLock");

  const input =
    $("targetLockInput");

  if (!checkbox || !input) return;

  input.classList.toggle(
    "hidden",
    !checkbox.checked
  );

  calculateVIP();
}


/* =========================================================
   VIP EVENTS
========================================================= */

[
  "currentVip",
  "targetVip",
  "multiplier",
  "supportRate",
  "jodRate",
  "usdRate"
].forEach(id => {

  $(id)?.addEventListener(
    "input",
    () => {

      if (
        id === "currentVip" ||
        id === "targetVip"
      ) {
        renderTransitions();
      }

      calculateVIP();
    }
  );

  $(id)?.addEventListener(
    "change",
    () => {

      if (
        id === "currentVip" ||
        id === "targetVip"
      ) {
        renderTransitions();
      }

      calculateVIP();
    }
  );
});


document
  .querySelectorAll(
    'input[name="mode"]'
  )
  .forEach(radio =>
    radio.addEventListener(
      "change",
      updateMode
    )
  );


$("enableTargetLock")
  ?.addEventListener(
    "change",
    updateLock
  );


/* =========================================================
   SHIPPING CALCULATORS
========================================================= */

/*
   القاعدة المطلوبة:

   الدينار:
   5 د.أ = 60,000 كوينز
   1,000,000 كوينز = 80 د.أ

   الدولار:
   1$ = 8,700 كوينز
   1,000,000 كوينز = 115$

   الجنيه:
   100 جنيه = 17,500 كوينز
   1,000,000 كوينز = 5,800 جنيه

   الشيكل:
   50 شيكل = 130,000 كوينز
   1,000,000 كوينز = 380 شيكل
*/


const SHIPPING = {

  jod: {
    coinsPerUnit: 60000 / 5,
    moneyPerMillion: 80
  },

  usd: {
    coinsPerUnit: 8700,
    moneyPerMillion: 115
  },

  egp: {
    coinsPerUnit: 17500 / 100,
    moneyPerMillion: 5800
  },

  ils: {
    coinsPerUnit: 130000 / 50,
    moneyPerMillion: 380
  }

};


function shippingCalculate(
  currency,
  mode,
  value
) {

  const data =
    SHIPPING[currency];

  if (!data) {
    return {
      coins:0,
      money:0
    };
  }


  value = n(value);

  if (value <= 0) {
    return {
      coins:0,
      money:0
    };
  }


  if (mode === "money") {

    return {
      coins:
        value * data.coinsPerUnit,

      money:
        value
    };
  }


  return {

    coins:
      value,

    money:
      value / 1000000 *
      data.moneyPerMillion

  };
}


function updateShippingCard(
  currency
) {

  const input =
    $(`ship-${currency}-input`);

  const mode =
    $(`ship-${currency}-mode`);

  const coinsResult =
    $(`ship-${currency}-coins`);

  const moneyResult =
    $(`ship-${currency}-money`);

  if (
    !input ||
    !mode
  ) {
    return;
  }


  const result =
    shippingCalculate(
      currency,
      mode.value,
      input.value
    );


  if (coinsResult) {
    coinsResult.textContent =
      fmt(result.coins);
  }

  if (moneyResult) {
    moneyResult.textContent =
      fmt(result.money,2);
  }
}


["jod","usd","egp","ils"]
.forEach(currency => {

  $(`ship-${currency}-input`)
    ?.addEventListener(
      "input",
      () => updateShippingCard(currency)
    );

  $(`ship-${currency}-mode`)
    ?.addEventListener(
      "change",
      () => updateShippingCard(currency)
    );

  updateShippingCard(currency);
});


/* =========================================================
   CASH OUT CALCULATORS
========================================================= */

/*
   دعم / مكاسب ألعاب:

   JOD:
   Games:
   100k = 6 JOD
   1M = 63 JOD

   Target:
   100k = 7 JOD
   1M = 73 JOD

   USD:
   Games:
   100k = 8$
   1M = 83$

   Target:
   100k = 10$
   1M = 100$

   EGP:
   Games:
   100k = 400 EGP
   1M = 4500 EGP

   ILS:
   Target:
   100k = 30 ILS
   1M = 300 ILS

   Games:
   100k = 25 ILS
   1M = 250 ILS
*/


const CASHOUT = {

  jod: {
    games: 63,
    target: 73
  },

  usd: {
    games: 83,
    target: 100
  },

  egp: {
    games: 4500,
    target: null
  },

  ils: {
    games: 250,
    target: 300
  }

};


function cashoutCalculate(
  currency,
  type,
  value
) {

  value = n(value);

  if (value <= 0) {
    return 0;
  }

  const rate =
    CASHOUT[currency]?.[type];

  if (!rate) {
    return 0;
  }

  return (
    value / 1000000
  ) * rate;
}


function updateCashoutCard(
  currency,
  type
) {

  const input =
    $(`cash-${type}-${currency}-input`);

  const mode =
    $(`cash-${type}-${currency}-mode`);

  const result =
    $(`cash-${type}-${currency}-result`);

  if (!input || !result) {
    return;
  }


  let value =
    n(input.value);


  /*
   * إذا كان الوضع نقدي:
   * نعتبر القيمة المدخلة هي المبلغ النقدي
   * ونحوّلها إلى ما يقابلها من كوينز.
   */

  if (
    mode &&
    mode.value === "money"
  ) {

    const rate =
      CASHOUT[currency]?.[type];

    if (rate) {

      /*
       * مليون كوينز = rate
       * لذلك:
       * الكوينز = المبلغ / rate × مليون
       */

      value =
        value / rate *
        1000000;
    }
  }


  const resultValue =
    cashoutCalculate(
      currency,
      type,
      value
    );


  result.textContent =
    fmt(resultValue,2);
}


["jod","usd","egp","ils"]
.forEach(currency => {

  ["games","target"]
  .forEach(type => {

    $(`cash-${type}-${currency}-input`)
      ?.addEventListener(
        "input",
        () =>
          updateCashoutCard(
            currency,
            type
          )
      );

    $(`cash-${type}-${currency}-mode`)
      ?.addEventListener(
        "change",
        () =>
          updateCashoutCard(
            currency,
            type
          )
      );

    updateCashoutCard(
      currency,
      type
    );

  });

});


/* =========================================================
   HISTORY
========================================================= */

function saveHistory() {

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history)
  );
}


function createRecord() {

  const result =
    calculateVIP();

  return {

    id:
      Date.now().toString(),

    createdAt:
      new Date().toISOString(),

    clientName:
      $("clientName")?.value.trim() || "",

    clientId:
      $("clientId")?.value.trim() || "",

    currentVip:
      result.current,

    targetVip:
      result.target,

    multiplier:
      result.multiplier,

    reachPoints:
      result.reachPoints,

    lockPoints:
      result.lockPoints,

    totalVipPoints:
      result.totalVipPoints,

    actualCharge:
      result.actualCharge,

    supportNeeded:
      result.supportNeeded,

    jodTotal:
      result.jodTotal,

    usdTotal:
      result.usdTotal
  };
}


function renderHistory() {

  const container =
    $("history");

  if (!container) return;


  const search =
    $("historySearch")
      ?.value
      .trim()
      .toLowerCase() || "";


  let records =
    history;


  if (search) {

    records =
      records.filter(record =>
        String(
          record.clientName || ""
        )
          .toLowerCase()
          .includes(search)

        ||

        String(
          record.clientId || ""
        )
          .toLowerCase()
          .includes(search)
      );
  }


  if (!records.length) {

    container.innerHTML = `
      <div class="empty">
        لا توجد عمليات محفوظة
      </div>
    `;

    return;
  }


  container.innerHTML = "";


  records.forEach(record => {

    const item =
      document.createElement("div");

    item.className =
      "history-item";


    const date =
      new Date(record.createdAt);


    const dateText =
      date.toLocaleString(
        "ar",
        {
          dateStyle:"medium",
          timeStyle:"short"
        }
      );


    item.innerHTML = `
      <div class="history-main">

        <strong>
          ${escapeHTML(
            record.clientName ||
            "بدون اسم"
          )}
        </strong>

        <span>
          ID:
          ${escapeHTML(
            record.clientId || "-"
          )}
        </span>

        <span>
          VIP ${record.currentVip}
          →
          VIP ${record.targetVip}
          ·
          ${fmt(record.actualCharge)}
          كوينز
        </span>

        <span>
          ${dateText}
        </span>

      </div>

      <div class="history-buttons">

        <button
          type="button"
          data-load="${record.id}"
        >
          استرجاع
        </button>

        <button
          type="button"
          class="delete"
          data-delete="${record.id}"
        >
          حذف
        </button>

      </div>
    `;


    container.appendChild(item);
  });
}


function escapeHTML(value) {

  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}


$("historySearch")
  ?.addEventListener(
    "input",
    renderHistory
  );


$("history")
  ?.addEventListener(
    "click",
    event => {

      const load =
        event.target.closest(
          "[data-load]"
        );

      const del =
        event.target.closest(
          "[data-delete]"
        );


      if (load) {

        loadRecord(
          load.dataset.load
        );
      }


      if (del) {

        deleteRecord(
          del.dataset.delete
        );
      }

    }
  );


function loadRecord(id) {

  const record =
    history.find(
      x => x.id === id
    );

  if (!record) return;


  if ($("clientName")) {
    $("clientName").value =
      record.clientName || "";
  }

  if ($("clientId")) {
    $("clientId").value =
      record.clientId || "";
  }

  if ($("currentVip")) {
    $("currentVip").value =
      record.currentVip;
  }

  if ($("targetVip")) {
    $("targetVip").value =
      record.targetVip;
  }

  if ($("multiplier")) {
    $("multiplier").value =
      record.multiplier;
  }


  renderTransitions();
  calculateVIP();


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });


  toast("تم استرجاع العملية");
}


function deleteRecord(id) {

  history =
    history.filter(
      x => x.id !== id
    );

  saveHistory();
  renderHistory();
  renderStats();

  toast("تم حذف العملية");
}


$("clearHistory")
  ?.addEventListener(
    "click",
    () => {

      if (!history.length) return;

      if (
        !confirm(
          "هل تريد حذف جميع العمليات؟"
        )
      ) {
        return;
      }

      history = [];

      saveHistory();
      renderHistory();
      renderStats();

      toast("تم حذف السجل بالكامل");
    }
  );


$("saveBtn")
  ?.addEventListener(
    "click",
    () => {

      const name =
        $("clientName")?.value.trim() || "";

      const id =
        $("clientId")?.value.trim() || "";


      if (!name && !id) {

        toast(
          "أدخل اسم العميل أو ID أولاً"
        );

        return;
      }


      history.unshift(
        createRecord()
      );

      saveHistory();
      renderHistory();
      renderStats();

      toast(
        "تم حفظ العملية بنجاح"
      );
    }
  );


/* =========================================================
   STATS
========================================================= */

function renderStats() {

  const operations =
    history.length;


  const customers =
    new Set(
      history.map(
        record =>
          record.clientId ||
          record.clientName ||
          record.id
      )
    ).size;


  let charge = 0;
  let support = 0;
  let vipPoints = 0;
  let jod = 0;
  let usd = 0;
  let highest = 0;


  history.forEach(record => {

    charge +=
      n(record.actualCharge);

    support +=
      n(record.supportNeeded);

    vipPoints +=
      n(record.totalVipPoints);

    jod +=
      n(record.jodTotal);

    usd +=
      n(record.usdTotal);

    highest =
      Math.max(
        highest,
        n(record.targetVip)
      );
  });


  if ($("statOperations")) {
    $("statOperations").textContent =
      fmt(operations);
  }

  if ($("statCustomers")) {
    $("statCustomers").textContent =
      fmt(customers);
  }

  if ($("statCharge")) {
    $("statCharge").textContent =
      fmt(charge);
  }

  if ($("statSupport")) {
    $("statSupport").textContent =
      fmt(support);
  }

  if ($("statVipPoints")) {
    $("statVipPoints").textContent =
      fmt(vipPoints);
  }

  if ($("statJod")) {
    $("statJod").textContent =
      fmt(jod,2);
  }

  if ($("statUsd")) {
    $("statUsd").textContent =
      fmt(usd,2);
  }

  if ($("statHighestVip")) {
    $("statHighestVip").textContent =
      `VIP ${highest}`;
  }
}

renderHistory();
renderStats();


/* =========================================================
   NEW OPERATION
========================================================= */

$("newBtn")
  ?.addEventListener(
    "click",
    () => {

      if ($("clientName"))
        $("clientName").value = "";

      if ($("clientId"))
        $("clientId").value = "";

      if ($("currentVip"))
        $("currentVip").value = "10";

      if ($("targetVip"))
        $("targetVip").value = "11";

      if ($("multiplier"))
        $("multiplier").value = "5";

      if ($("supportRate"))
        $("supportRate").value = "130000";

      if ($("jodRate"))
        $("jodRate").value = "11";

      if ($("usdRate"))
        $("usdRate").value = "15";

      if ($("enableTargetLock"))
        $("enableTargetLock").checked = false;


      renderTransitions();
      updateMode();
      updateLock();
      calculateVIP();


      window.scrollTo({
        top:0,
        behavior:"smooth"
      });

      toast("تم فتح عملية جديدة");
    }
  );


/* =========================================================
   CALCULATE BUTTON
========================================================= */

$("calculateBtn")
  ?.addEventListener(
    "click",
    () => {

      calculateVIP();

      [
        "jod",
        "usd",
        "egp",
        "ils"
      ]
      .forEach(updateShippingCard);


      [
        "jod",
        "usd",
        "egp",
        "ils"
      ]
      .forEach(currency => {

        ["games","target"]
          .forEach(type =>
            updateCashoutCard(
              currency,
              type
            )
          );
      });


      toast(
        "تم تحديث جميع الحسابات"
      );
    }
  );


/* =========================================================
   COLLAPSIBLE SECTIONS
========================================================= */

function setupCollapse(
  toggleId,
  contentId
) {

  const toggle =
    $(toggleId);

  const content =
    $(contentId);

  if (!toggle || !content) return;


  toggle.addEventListener(
    "click",
    () => {

      const hidden =
        content.classList.contains(
          "hidden"
        );

      content.classList.toggle(
        "hidden",
        !hidden
      );

      toggle.classList.toggle(
        "open",
        hidden
      );
    }
  );
}


setupCollapse(
  "clientToggle",
  "clientSectionContent"
);

setupCollapse(
  "historyToggle",
  "historySectionContent"
);


/* =========================================================
   CONTACT COPY
========================================================= */

document
  .querySelectorAll(".copy-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      async () => {

        const value =
          button.dataset.copy;

        if (!value) return;


        const old =
          button.textContent;


        try {

          await navigator.clipboard.writeText(
            value
          );

        } catch {

          const textarea =
            document.createElement(
              "textarea"
            );

          textarea.value =
            value;

          textarea.style.position =
            "fixed";

          textarea.style.opacity =
            "0";

          document.body.appendChild(
            textarea
          );

          textarea.focus();
          textarea.select();

          try {
            document.execCommand("copy");
          } catch {}

          textarea.remove();
        }


        button.textContent =
          "تم النسخ";


        setTimeout(
          () =>
            button.textContent = old,
          1200
        );
      }
    );
  });


/* =========================================================
   INITIALIZE
========================================================= */

renderTransitions();
updateMode();
updateLock();
calculateVIP();

})();
