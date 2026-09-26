"use strict";

/* جدول VIP ثابت بالقيم المحددة. */
const VIP_TABLE = [
  { level: 1, total: 50000, upgrade: 50000, maintain: 30000 },
  { level: 2, total: 100000, upgrade: 50000, maintain: 30000 },
  { level: 3, total: 300000, upgrade: 100000, maintain: 90000 },
  { level: 4, total: 1000000, upgrade: 800000, maintain: 500000 },
  { level: 5, total: 3000000, upgrade: 2000000, maintain: 1300000 },
  { level: 6, total: 7000000, upgrade: 4000000, maintain: 2600000 },
  { level: 7, total: 14000000, upgrade: 7000000, maintain: 4500000 },
  { level: 8, total: 26000000, upgrade: 12000000, maintain: 7800000 },
  { level: 9, total: 42000000, upgrade: 16000000, maintain: 11000000 },
  { level: 10, total: 62000000, upgrade: 20000000, maintain: 14000000 },
  { level: 11, total: 102000000, upgrade: 40000000, maintain: 28000000 },
  { level: 12, total: 220000000, upgrade: 118000000, maintain: 83000000 },
  { level: 13, total: 430000000, upgrade: 210000000, maintain: 150000000 },
  { level: 14, total: 820000000, upgrade: 390000000, maintain: 310000000 },
  { level: 15, total: 1820000000, upgrade: 1000000000, maintain: 700000000 },
  { level: 16, total: 3820000000, upgrade: 2000000000, maintain: 1400000000 },
  { level: 17, total: 7382000000, upgrade: 3500000000, maintain: 3000000000 },
  { level: 18, total: 11882000000, upgrade: 4500000000, maintain: 4000000000 },
  { level: 19, total: 17382000000, upgrade: 5500000000, maintain: 5000000000 },
  { level: 20, total: 27382000000, upgrade: 10000000000, maintain: 9000000000 }
];

const HISTORY_KEY = "f90_vip_history_v1";
const THEME_KEY = "f90_calculator_theme";
const WHATSAPP_NUMBER = "970568181910"; // رقم واتساب المقدم: +970568181910
const state = { history: loadHistory(), multiplier: 5, result: null };
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function loadHistory() {
  try {
    const data = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(data) ? data.filter(item => item && item.id) : [];
  } catch {
    return [];
  }
}

function saveHistoryStorage() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
    return true;
  } catch {
    notify("تعذر الحفظ محلياً. تحقق من مساحة المتصفح.", "error");
    return false;
  }
}

function numberFrom(selector) {
  const raw = $(selector).value.trim();
  if (raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function fmt(value, decimals = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return number.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function recordId() {
  return globalThis.crypto?.randomUUID?.() ||
    `f90-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function notify(message, type = "") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  $("#toastRegion").append(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function populateControls() {
  for (const level of VIP_TABLE) {
    for (const id of ["currentVip", "targetVip"]) {
      const option = document.createElement("option");
      option.value = String(level.level);
      option.textContent = `VIP ${level.level}`;
      $( `#${id}` ).append(option);
    }
  }
  for (let value = 1; value <= 10; value += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `×${value}`;
    button.dataset.multiplier = String(value);
    button.setAttribute("aria-pressed", String(value === 5));
    button.addEventListener("click", () => {
      state.multiplier = value;
      $$("#multiplierList button").forEach(item => {
        item.setAttribute("aria-pressed", String(Number(item.dataset.multiplier) === value));
      });
      calculate();
    });
    $("#multiplierList").append(button);
  }
  $("#currentVip").value = "10";
  $("#targetVip").value = "11";
}

function calculateOperation() {
  const current = Number($("#currentVip").value);
  const target = Number($("#targetVip").value);
  const supportRate = numberFrom("#supportRate");
  const jodRate = numberFrom("#jodRate");
  const usdRate = numberFrom("#usdRate");
  const firstTransition = numberFrom("#firstTransitionInput");

  if (target < current) throw new Error("المستوى المطلوب يجب أن يكون مساوياً للمستوى الحالي أو أعلى.");
  if ([supportRate, jodRate, usdRate].some(value => value === null || value < 0)) {
    throw new Error("تحقق من صحة أسعار الدعم والعملات.");
  }
  if (target > current && (firstTransition === null || firstTransition < 0)) {
    throw new Error("أدخل قيمة صحيحة للانتقال الأول.");
  }

  let reachPoints = 0;
  const transitions = [];

  for (let from = current; from < target; from += 1) {
    const to = from + 1;
    // الانتقال الأول يدوي، وما بعده يعتمد upgrade للمستوى المطلوب.
    const points = from === current
      ? firstTransition
      : VIP_TABLE[to - 1].upgrade;
    reachPoints += points;
    transitions.push({ from, to, points, type: from === current ? "يدوي" : "تلقائي" });
  }

  let lockPoints = 0;
  if ($("#currentLock").checked) lockPoints += VIP_TABLE[current - 1].maintain;
  if ($("#targetLock").checked) lockPoints += VIP_TABLE[target - 1].maintain;

  const totalVipPoints = reachPoints + lockPoints;
  const actualCharge = totalVipPoints / state.multiplier;
  const supportNeeded = actualCharge / 1000000 * supportRate;
  const jodTotal = supportRate === 0 ? 0 : supportNeeded / supportRate * jodRate;
  const usdTotal = supportRate === 0 ? 0 : supportNeeded / supportRate * usdRate;

  if ([reachPoints, lockPoints, totalVipPoints, actualCharge, supportNeeded, jodTotal, usdTotal]
    .some(value => !Number.isFinite(value))) {
    throw new Error("نتيجة غير صالحة. راجع القيم المدخلة.");
  }

  return {
    id: recordId(),
    createdAt: new Date().toISOString(),
    clientName: $("#clientName").value.trim(),
    clientId: $("#clientId").value.trim(),
    currentVip: current,
    targetVip: target,
    multiplier: state.multiplier,
    firstTransition: firstTransition ?? 0,
    transitions,
    reachPoints,
    lockPoints,
    totalVipPoints,
    actualCharge,
    supportNeeded,
    jodTotal,
    usdTotal,
    supportRate,
    jodRate,
    usdRate,
    currentLock: $("#currentLock").checked,
    targetLock: $("#targetLock").checked
  };
}

function updateJourneyLabels() {
  const current = Number($("#currentVip").value);
  const target = Number($("#targetVip").value);
  const currentData = VIP_TABLE[current - 1];
  const targetData = VIP_TABLE[target - 1];
  $("#transitionFrom").textContent = `VIP ${current}`;
  $("#transitionTo").textContent = `VIP ${Math.min(current + 1, 20)}`;
  $("#currentLockText").textContent = `VIP ${current} · ${fmt(currentData.maintain)} XP`;
  $("#targetLockText").textContent = `VIP ${target} · ${fmt(targetData.maintain)} XP`;
  $("#summaryRoute").textContent = `VIP ${current} → VIP ${target}`;
}

function renderSummary(result) {
  $("#summaryMultiplier").textContent = `×${result.multiplier}`;
  $("#summaryRoute").textContent = `VIP ${result.currentVip} → VIP ${result.targetVip}`;
  $("#actualCharge").textContent = fmt(result.actualCharge);
  $("#reachPoints").textContent = fmt(result.reachPoints);
  $("#lockPoints").textContent = fmt(result.lockPoints);
  $("#totalVipPoints").textContent = fmt(result.totalVipPoints);
  $("#supportNeeded").textContent = fmt(result.supportNeeded);
  $("#jodTotal").textContent = fmt(result.jodTotal, 2);
  $("#usdTotal").textContent = fmt(result.usdTotal, 2);

  $("#transitionDetails").innerHTML = result.transitions.length
    ? result.transitions.map(item => `
      <div class="detail-transition">
        <span>VIP ${item.from} → VIP ${item.to} · ${item.type}</span>
        <strong>${fmt(item.points)} XP</strong>
      </div>`).join("")
    : `<div class="detail-transition"><span>لا توجد انتقالات</span><strong>0 XP</strong></div>`;

  $("#chargeFormula").textContent =
    `${fmt(result.totalVipPoints)} ÷ ${result.multiplier} = ${fmt(result.actualCharge)} Coins`;
  $("#supportFormula").textContent =
    `${fmt(result.actualCharge)} ÷ 1,000,000 × ${fmt(result.supportRate)} = ${fmt(result.supportNeeded)}`;
}

function calculate(showError = false) {
  $("#calcError").hidden = true;
  updateJourneyLabels();
  try {
    state.result = calculateOperation();
    renderSummary(state.result);
    return state.result;
  } catch (error) {
    state.result = null;
    if (showError) {
      $("#calcError").textContent = error.message;
      $("#calcError").hidden = false;
    }
    return null;
  }
}

function reportClientStatus(message, type = "") {
  const element = $("#clientStatus");
  element.textContent = message;
  element.className = type;
  element.hidden = !message;
}

function saveOperation() {
  const result = calculate(true);
  if (!result) return;

  if (!result.clientName && !result.clientId) {
    reportClientStatus("أدخل اسم العميل أو ID أولاً", "error");
    return;
  }

  state.history.unshift(result);
  if (!saveHistoryStorage()) return;
  reportClientStatus("تم حفظ العملية بنجاح", "success");
  renderHistory();
  renderStats();
  notify("تم حفظ العملية بنجاح.", "success");
}

function renderHistory() {
  const query = $("#historySearch").value.trim().toLowerCase();
  const records = state.history.filter(item =>
    `${item.clientName} ${item.clientId} VIP ${item.currentVip} VIP ${item.targetVip}`
      .toLowerCase().includes(query)
  );

  $("#historyList").innerHTML = records.map(item => `
    <article class="history-record">
      <div class="record-client">
        <strong>${escapeHtml(item.clientName || "عميل بدون اسم")}</strong>
        <small>ID: ${escapeHtml(item.clientId || "—")} · ${escapeHtml(dateLabel(item.createdAt))}</small>
      </div>
      <div class="record-route">VIP ${Number(item.currentVip)} → VIP ${Number(item.targetVip)}</div>
      <div class="record-value"><span>الشحن <strong>${fmt(item.actualCharge)}</strong></span><span>الدعم <strong>${fmt(item.supportNeeded)}</strong></span></div>
      <div class="record-actions">
        <button type="button" data-action="details" data-id="${escapeHtml(item.id)}">التفاصيل</button>
        <button type="button" data-action="restore" data-id="${escapeHtml(item.id)}">استرجاع</button>
        <button class="delete-record" type="button" data-action="delete" data-id="${escapeHtml(item.id)}">حذف</button>
      </div>
    </article>
  `).join("");

  $("#historyEmpty").hidden = records.length > 0;
  if (query && records.length === 0) {
    $("#historyEmpty").querySelector("strong").textContent = "لا توجد نتائج";
    $("#historyEmpty").querySelector("small").textContent = "جرّب البحث باستخدام اسم أو ID مختلف.";
  } else {
    $("#historyEmpty").querySelector("strong").textContent = "السجل فارغ";
    $("#historyEmpty").querySelector("small").textContent = "احفظ عملية لتظهر تفاصيلها هنا.";
  }
}

function dateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function renderStats() {
  const records = state.history;
  const customers = new Set(records.map(item => item.clientId || item.clientName).filter(Boolean));
  const sum = key => records.reduce((total, item) => total + (Number(item[key]) || 0), 0);
  $("#statOperations").textContent = fmt(records.length);
  $("#statCustomers").textContent = fmt(customers.size);
  $("#statCharge").textContent = fmt(sum("actualCharge"));
  $("#statSupport").textContent = fmt(sum("supportNeeded"));
}

function restoreOperation(id) {
  const item = state.history.find(record => record.id === id);
  if (!item) return;
  $("#clientName").value = item.clientName || "";
  $("#clientId").value = item.clientId || "";
  $("#currentVip").value = String(item.currentVip);
  $("#targetVip").value = String(item.targetVip);
  $("#firstTransitionInput").value = String(item.firstTransition ?? "");
  $("#supportRate").value = String(item.supportRate ?? 130000);
  $("#jodRate").value = String(item.jodRate ?? 11);
  $("#usdRate").value = String(item.usdRate ?? 15);
  $("#currentLock").checked = Boolean(item.currentLock);
  $("#targetLock").checked = Boolean(item.targetLock);
  setMultiplier(Number(item.multiplier) || 5);
  calculate();
  window.scrollTo({ top: 0, behavior: "smooth" });
  reportClientStatus("تم استرجاع العملية", "success");
  notify("تم استرجاع بيانات العملية.", "success");
}

function deleteOperation(id) {
  state.history = state.history.filter(item => item.id !== id);
  saveHistoryStorage();
  renderHistory();
  renderStats();
  notify("تم حذف العملية.", "success");
}

function setMultiplier(value) {
  state.multiplier = Math.max(1, Math.min(10, Number(value) || 5));
  $$("#multiplierList button").forEach(button => {
    button.setAttribute("aria-pressed", String(Number(button.dataset.multiplier) === state.multiplier));
  });
}

function shareText(item) {
  return [
    "F90 — حاسبة أف تسعين",
    "",
    `العميل: ${item.clientName || "—"}`,
    `ID الحساب: ${item.clientId || "—"}`,
    `VIP: ${item.currentVip} → ${item.targetVip}`,
    `الانتقال الأول: ${fmt(item.firstTransition)} XP`,
    `نقاط الوصول: ${fmt(item.reachPoints)} XP`,
    `نقاط التثبيت: ${fmt(item.lockPoints)} XP`,
    `إجمالي نقاط VIP: ${fmt(item.totalVipPoints)} XP`,
    `العرض: ×${item.multiplier}`,
    `إجمالي شحن الوكيل: ${fmt(item.actualCharge)} Coins`,
    `الدعم المطلوب: ${fmt(item.supportNeeded)}`,
    `الدينار: ${fmt(item.jodTotal, 2)} JOD`,
    `الدولار: ${fmt(item.usdTotal, 2)} USD`
  ].join("\n");
}

function openWhatsApp(item) {
  if (!item) {
    notify("أكمل الحسبة أولاً.", "error");
    return;
  }
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(shareText(item))}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function showDetails(item) {
  $("#dialogBody").innerHTML = `
    <div class="dialog-summary">
      <div><span>العميل</span><strong>${escapeHtml(item.clientName || "—")}</strong></div>
      <div><span>ID الحساب</span><strong>${escapeHtml(item.clientId || "—")}</strong></div>
      <div><span>رحلة VIP</span><strong>VIP ${Number(item.currentVip)} → VIP ${Number(item.targetVip)}</strong></div>
      <div><span>العرض</span><strong>×${Number(item.multiplier)}</strong></div>
      <div><span>نقاط الوصول</span><strong>${fmt(item.reachPoints)} XP</strong></div>
      <div><span>نقاط التثبيت</span><strong>${fmt(item.lockPoints)} XP</strong></div>
      <div><span>إجمالي نقاط VIP</span><strong>${fmt(item.totalVipPoints)} XP</strong></div>
      <div><span>شحن الوكيل</span><strong>${fmt(item.actualCharge)} Coins</strong></div>
      <div><span>الدعم المطلوب</span><strong>${fmt(item.supportNeeded)}</strong></div>
      <div><span>القيمة</span><strong>${fmt(item.jodTotal, 2)} JOD · ${fmt(item.usdTotal, 2)} USD</strong></div>
      <div><span>التاريخ</span><strong>${escapeHtml(dateLabel(item.createdAt))}</strong></div>
    </div>`;
  $("#dialogShare").dataset.id = item.id;
  const dialog = $("#operationDialog");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function updateTools() {
  const target = Math.max(0, numberFrom("#targetInput") || 0);
  const games = Math.max(0, numberFrom("#gamesInput") || 0);
  $("#targetJod").textContent = fmt(target / 100000 * 7, 2);
  $("#targetUsd").textContent = fmt(target / 100000 * 10, 2);
  $("#gamesJod").textContent = fmt(games / 100000 * 6, 2);
  $("#gamesUsd").textContent = fmt(games / 100000 * 8, 2);
}

function newOperation() {
  $("#clientName").value = "";
  $("#clientId").value = "";
  $("#currentVip").value = "10";
  $("#targetVip").value = "11";
  $("#firstTransitionInput").value = "";
  $("#currentLock").checked = false;
  $("#targetLock").checked = false;
  $("#supportRate").value = "130000";
  $("#jodRate").value = "11";
  $("#usdRate").value = "15";
  setMultiplier(5);
  reportClientStatus("", "");
  $("#calcError").hidden = true;
  calculate();
  window.scrollTo({ top: $("#calculator").offsetTop - 80, behavior: "smooth" });
}

function setTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* الثيم يعمل حتى عند تعذر التخزين */ }
}

function initializeTheme() {
  let theme = "dark";
  try { theme = localStorage.getItem(THEME_KEY) || "dark"; } catch { /* الثيم الافتراضي */ }
  setTheme(theme === "light" ? "light" : "dark");
}

function bindEvents() {
  [
    "#currentVip", "#targetVip", "#firstTransitionInput", "#currentLock",
    "#targetLock", "#supportRate", "#jodRate", "#usdRate"
  ].forEach(selector => {
    $(selector).addEventListener("input", () => calculate());
    $(selector).addEventListener("change", () => calculate());
  });

  $("#calculateBtn").addEventListener("click", () => {
    if (calculate(true)) notify("تم تحديث الحساب.", "success");
  });
  $("#saveBtn").addEventListener("click", saveOperation);
  $("#newBtn").addEventListener("click", newOperation);
  $("#shareBtn").addEventListener("click", () => openWhatsApp(calculate(true)));

  $("#detailsToggle").addEventListener("click", () => {
    const content = $("#detailsContent");
    content.hidden = !content.hidden;
    $("#detailsToggle").setAttribute("aria-expanded", String(!content.hidden));
    $("#detailsToggle").querySelector("span").textContent = content.hidden ? "＋" : "−";
  });

  $("#historySearch").addEventListener("input", renderHistory);
  $("#historyList").addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.action === "delete") deleteOperation(id);
    if (button.dataset.action === "restore") restoreOperation(id);
    if (button.dataset.action === "details") {
      const item = state.history.find(record => record.id === id);
      if (item) showDetails(item);
    }
  });

  $("#clearHistory").addEventListener("click", () => {
    if (!state.history.length) {
      notify("السجل فارغ بالفعل.");
      return;
    }
    if (!window.confirm("هل تريد حذف جميع العمليات؟")) return;
    state.history = [];
    saveHistoryStorage();
    renderHistory();
    renderStats();
    notify("تم حذف السجل.", "success");
  });

  $("#themeToggle").addEventListener("click", () => {
    setTheme(document.body.classList.contains("light") ? "dark" : "light");
  });

  $("#targetInput").addEventListener("input", updateTools);
  $("#gamesInput").addEventListener("input", updateTools);

  $("#dialogClose").addEventListener("click", () => $("#operationDialog").close());
  $("#operationDialog").addEventListener("click", event => {
    if (event.target === $("#operationDialog")) $("#operationDialog").close();
  });
  $("#dialogShare").addEventListener("click", event => {
    const item = state.history.find(record => record.id === event.currentTarget.dataset.id);
    openWhatsApp(item);
  });
  $("#dialogPrint").addEventListener("click", () => window.print());

  $("#menuToggle").addEventListener("click", () => {
    const nav = $(".nav-links");
    const open = nav.classList.toggle("open");
    $("#menuToggle").setAttribute("aria-expanded", String(open));
  });
  $$(".nav-links a").forEach(link => link.addEventListener("click", () => {
    $(".nav-links").classList.remove("open");
    $("#menuToggle").setAttribute("aria-expanded", "false");
  }));

  $("#subscribeLink").href =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحباً، أود الاستفسار عن الاشتراك في حاسبة F90.")}`;
}

function initialize() {
  populateControls();
  initializeTheme();
  bindEvents();
  renderHistory();
  renderStats();
  updateTools();
  updateJourneyLabels();
  calculate();

  // إدخال الأرقام فقط، مع السماح بالفاصلة العشرية والسالب عند الحاجة.
  $$('input[type="number"]').forEach(input => {
    input.addEventListener("input", () => {
      const clean = input.value.replace(/[^\d.,-]/g, "").replace(/,/g, ".");
      if (clean !== input.value) input.value = clean;
    });
  });
}

initialize();
