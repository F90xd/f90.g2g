"use strict";

const HISTORY_KEY = "f90-operation-history";
const THEME_KEY = "f90-theme";
const $ = (id) => document.getElementById(id);

const packages = [
  { price: 100, coins: 17500 },
  { price: 200, coins: 35000 },
  { price: 300, coins: 51000 },
  { price: 400, coins: 70000 },
  { price: 500, coins: 87500 },
  { price: 1000, coins: 175000 }
];

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function formatNumber(value) {
  return fmt.format(value);
}

function getHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function saveOperation(name, result, unit) {
  const history = getHistory();
  history.unshift({
    name,
    result: `${formatNumber(result)} ${unit}`,
    time: new Date().toLocaleString("ar", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short"
    })
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  renderHistory();
}

function renderHistory() {
  const list = $("historyList");
  const empty = $("emptyHistory");
  const history = getHistory();

  list.replaceChildren();
  empty.hidden = history.length > 0;

  history.forEach((item) => {
    const row = document.createElement("div");
    row.className = "history-row";

    const name = document.createElement("span");
    name.textContent = item.name;

    const result = document.createElement("strong");
    result.textContent = item.result;

    const time = document.createElement("span");
    time.className = "history-time";
    time.textContent = item.time;

    const shareCell = document.createElement("span");
    const share = document.createElement("button");
    share.className = "share-button";
    share.type = "button";
    share.textContent = "↗";
    share.setAttribute("aria-label", "مشاركة العملية عبر واتساب");
    share.addEventListener("click", () => {
      const message = `F90 | ملخص عملية\nالعملية: ${item.name}\nالنتيجة: ${item.result}\nالوقت: ${item.time}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    });
    shareCell.appendChild(share);

    row.append(name, result, time, shareCell);
    list.appendChild(row);
  });
}

function getAmount(id) {
  const value = Number($(id).value);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function calculateVip() {
  const points = getAmount("vipPoints");
  const multiplier = getAmount("vipMultiplier");

  if (!points || !multiplier) {
    alert("أدخل نقاط VIP والمضاعف بقيم صحيحة أكبر من صفر.");
    return;
  }

  const result = points / multiplier;
  $("vipResult").textContent = formatNumber(result);
  saveOperation("حاسبة VIP", result, "كوينز");
}

function calculate(type) {
  const tools = {
    target: {
      input: "targetInput",
      output: "targetResult",
      name: "سحب التارجت",
      unit: "جنيه",
      rate: 500,
      description: "لكل 100,000 كوين"
    },
    games: {
      input: "gamesInput",
      output: "gamesResult",
      name: "مكاسب الألعاب",
      unit: "جنيه",
      rate: 400,
      description: "لكل 100,000 كوين"
    },
    coinValue: {
      input: "coinValueInput",
      output: "coinValueResult",
      name: "تحويل الكوينز إلى جنيه",
      unit: "جنيه",
      rate: 5300,
      description: "لكل مليون كوين"
    }
  };

  const tool = tools[type];
  const amount = getAmount(tool.input);

  if (amount === null) {
    alert("أدخل عدد كوينز صحيحاً أكبر من صفر.");
    return;
  }

  const result = type === "coinValue"
    ? (amount / 1000000) * tool.rate
    : (amount / 100000) * tool.rate;

  $(tool.output).textContent = formatNumber(result);
  saveOperation(tool.name, result, tool.unit);
}

function renderPackages() {
  const grid = $("packageGrid");
  grid.replaceChildren();

  packages.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "package-button";

    const price = document.createElement("strong");
    price.textContent = `${formatNumber(item.price)} جنيه`;

    const coins = document.createElement("span");
    coins.textContent = `${formatNumber(item.coins)} كوين`;

    button.append(price, coins);
    button.addEventListener("click", () => {
      saveOperation(`باقة شحن ${formatNumber(item.price)} جنيه`, item.coins, "كوين");
    });
    grid.appendChild(button);
  });
}

function calculateCustomPackage() {
  const amount = getAmount("customAmount");
  if (amount === null) {
    alert("أدخل مبلغاً صحيحاً أكبر من صفر.");
    return;
  }

  const coins = (amount / 5300) * 1000000;
  $("customCoins").textContent = formatNumber(coins);
  saveOperation(`شحن مخصص بقيمة ${formatNumber(amount)} جنيه`, coins, "كوين");
}

function setup() {
  $("today").textContent = new Date().toLocaleDateString("ar", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  $("vipCalculate").addEventListener("click", calculateVip);
  document.querySelectorAll("[data-calc]").forEach((button) => {
    button.addEventListener("click", () => calculate(button.dataset.calc));
  });

  $("customCalculate").addEventListener("click", calculateCustomPackage);

  $("clearHistory").addEventListener("click", () => {
    if (getHistory().length && confirm("هل تريد مسح سجل العمليات؟")) {
      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
    }
  });

  $("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem(
      THEME_KEY,
      document.body.classList.contains("light") ? "light" : "dark"
    );
  });

  if (localStorage.getItem(THEME_KEY) === "light") {
    document.body.classList.add("light");
  }

  renderPackages();
  renderHistory();
}

setup();
