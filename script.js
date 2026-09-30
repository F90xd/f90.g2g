/**
 * F90 Financial & VIP Calculator Engine
 * Static, Pure Vanilla JS Solution
 */

// 1. CONFIGURATION & CALCULATOR RATES (CENTRALIZED)
const CONFIG = {
    // Shipping Calculators Rules
    shipping: {
        jod: {
            name: "الشحن بالدينار الأردني",
            currency: "JOD",
            icon: "🇯🇴",
            ruleCash: 5,
            ruleCoinsForCash: 60000,
            ruleMillionCoins: 1000000,
            ruleCashForMillion: 80
        },
        usd: {
            name: "الشحن بالدولار الأمريكي",
            currency: "USD",
            icon: "🇺🇸",
            ruleCash: 1,
            ruleCoinsForCash: 8700,
            ruleMillionCoins: 1000000,
            ruleCashForMillion: 115
        },
        egp: {
            name: "الشحن بالجنيه المصري",
            currency: "EGP",
            icon: "🇪🇬",
            ruleCash: 100,
            ruleCoinsForCash: 17500,
            ruleMillionCoins: 1000000,
            ruleCashForMillion: 5800
        },
        ils: {
            name: "الشحن بالشيكل الإسرائيلي",
            currency: "ILS",
            icon: "🇵🇸",
            ruleCash: 50,
            ruleCoinsForCash: 130000,
            ruleMillionCoins: 1000000,
            ruleCashForMillion: 380
        }
    },
    // Withdrawal / Target Calculators Rules
    withdrawal: {
        jod: {
            name: "سحب التارجت بالدينار",
            currency: "JOD",
            icon: "🇯🇴",
            ratePer100k: 7,
            ratePerMillion: 73
        },
        usd: {
            name: "سحب التارجت بالدولار",
            currency: "USD",
            icon: "🇺🇸",
            ratePer100k: 10,
            ratePerMillion: 100
        },
        egp: {
            name: "قسم الشحن بالجنيه (تارجت)",
            currency: "EGP",
            icon: "🇪🇬",
            ruleCash: 100,
            ruleCoinsForCash: 17500,
            ruleMillionCoins: 1000000,
            ruleCashForMillion: 5800
        },
        ils: {
            name: "سحب التارجت بالشيكل",
            currency: "ILS",
            icon: "🇵🇸",
            ratePer100k: 30,
            ratePerMillion: 300
        }
    },
    // Games Earnings Calculators Rules
    games: {
        jod: {
            name: "مكاسب الألعاب بالدينار",
            currency: "JOD",
            icon: "🇯🇴",
            ratePer100k: 6,
            ratePerMillion: 63
        },
        usd: {
            name: "مكاسب الألعاب بالدولار",
            currency: "USD",
            icon: "🇺🇸",
            ratePer100k: 8,
            ratePerMillion: 83
        },
        egp: {
            name: "مكاسب الألعاب بالجنيه",
            currency: "EGP",
            icon: "🇪🇬",
            ratePer100k: 400,
            ratePerMillion: 4500
        },
        ils: {
            name: "مكاسب الألعاب بالشيكل",
            currency: "ILS",
            icon: "🇵🇸",
            ratePer100k: 25,
            ratePerMillion: 250
        }
    },
    // VIP Config
    vipRates: {
        supportPerMillionAgent: 130000, // 130,000 support per 1M agent coins
        supportPriceJod: 11,            // 130,000 support = 11 JOD
        supportPriceUsd: 15             // 130,000 support = 15 USD
    }
};

// 2. OFFICIAL VIP TABLE
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

// 3. HELPERS
function formatNum(num) {
    if (num === null || num === undefined || isNaN(num)) return "0";
    return Number(num).toLocaleString('en-US');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function safeParseFloat(val) {
    const p = parseFloat(val);
    return isNaN(p) || p < 0 ? 0 : p;
}

// 4. SHIPPING CALCULATIONS ENGINE
function calcShipping(key, val, mode) {
    const rule = CONFIG.shipping[key];
    if (!rule || !val || val <= 0) return { result: 0, text: "" };

    let res = 0;
    let explain = "";

    if (mode === "cash") {
        // Input: Cash -> Output: Coins
        if (val >= rule.ruleCashForMillion) {
            res = (val / rule.ruleCashForMillion) * rule.ruleMillionCoins;
            explain = `المعادلة: (${formatNum(val)} ÷ ${formatNum(rule.ruleCashForMillion)}) × 1,000,000 كوينز`;
        } else {
            res = (val / rule.ruleCash) * rule.ruleCoinsForCash;
            explain = `المعادلة: (${formatNum(val)} ÷ ${formatNum(rule.ruleCash)}) × ${formatNum(rule.ruleCoinsForCash)} كوينز`;
        }
    } else {
        // Input: Coins -> Output: Cash
        if (val >= rule.ruleMillionCoins) {
            res = (val / rule.ruleMillionCoins) * rule.ruleCashForMillion;
            explain = `المعادلة: (${formatNum(val)} ÷ 1,000,000) × ${formatNum(rule.ruleCashForMillion)} ${rule.currency}`;
        } else {
            res = (val / rule.ruleCoinsForCash) * rule.ruleCash;
            explain = `المعادلة: (${formatNum(val)} ÷ ${formatNum(rule.ruleCoinsForCash)}) × ${formatNum(rule.ruleCash)} ${rule.currency}`;
        }
    }

    return { result: Math.round(res * 100) / 100, text: explain };
}

// 5. WITHDRAWAL & GAMES CALCULATIONS ENGINE
function calcTieredRate(val, mode, rates, currency) {
    if (!val || val <= 0) return { result: 0, text: "" };

    let res = 0;
    let explain = "";

    if (rates.ruleCash) {
        // Handles EGP Special Shipping/Withdrawal
        return calcShipping('egp', val, mode);
    }

    if (mode === "cash") {
        // Input: Cash -> Output: Coins/Points needed
        if (val >= rates.ratePerMillion) {
            res = (val / rates.ratePerMillion) * 1000000;
            explain = `المعادلة: (${formatNum(val)} ÷ ${formatNum(rates.ratePerMillion)}) × 1,000,000`;
        } else {
            res = (val / rates.ratePer100k) * 100000;
            explain = `المعادلة: (${formatNum(val)} ÷ ${formatNum(rates.ratePer100k)}) × 100,000`;
        }
    } else {
        // Input: Coins/Points -> Output: Cash
        if (val >= 1000000) {
            res = (val / 1000000) * rates.ratePerMillion;
            explain = `المعادلة: (${formatNum(val)} ÷ 1,000,000) × ${formatNum(rates.ratePerMillion)} ${currency}`;
        } else {
            res = (val / 1000000) * (rates.ratePer100k * 10);
            explain = `المعادلة: (${formatNum(val)} ÷ 100,000) × ${formatNum(rates.ratePer100k)} ${currency}`;
        }
    }

    return { result: Math.round(res * 100) / 100, text: explain };
}

// 6. RENDER DYNAMIC CARD COMPONENTS
function renderCard(id, config, category) {
    return `
    <div class="glass-card calc-card" id="card-${category}-${id}">
        <div class="calc-header">
            <div class="calc-title-group">
                <span class="calc-icon">${config.icon}</span>
                <span class="calc-title">${config.name}</span>
            </div>
            <span class="calc-currency-badge">${config.currency}</span>
        </div>

        <div class="calc-input-wrap">
            <div class="input-label-row">
                <span id="label-${category}-${id}">أدخل المبلغ النادي:</span>
                <div class="mode-toggle-group">
                    <button class="toggle-btn active" onclick="setCalcMode('${category}', '${id}', 'cash')">نقداً</button>
                    <button class="toggle-btn" onclick="setCalcMode('${category}', '${id}', 'coins')">كوينز</button>
                </div>
            </div>
            <input type="number" 
                   id="input-${category}-${id}" 
                   class="calc-input-field" 
                   placeholder="0" 
                   min="0"
                   oninput="handleCalcInput('${category}', '${id}')">
            <div class="calc-actions">
                <button class="clear-btn" onclick="clearCalcField('${category}', '${id}')">مسح الرقم</button>
            </div>
        </div>

        <div class="calc-result-box">
            <div class="result-label" id="res-label-${category}-${id}">النتيجة الكوينية:</div>
            <div class="result-value" id="res-val-${category}-${id}">0</div>
            <div class="calc-explain" id="res-exp-${category}-${id}">أدخل قيمة لبدء الحساب</div>
        </div>
    </div>
    `;
}

// Active Calc Modes state
const calcModes = {};

function setCalcMode(category, id, mode) {
    const key = `${category}-${id}`;
    calcModes[key] = mode;

    const card = document.getElementById(`card-${category}-${id}`);
    const btns = card.querySelectorAll('.toggle-btn');
    btns.forEach(btn => btn.classList.remove('active'));

    if (mode === 'cash') {
        btns[0].classList.add('active');
        document.getElementById(`label-${key}`).innerText = "أدخل المبلغ النادي:";
        document.getElementById(`res-label-${key}`).innerText = "عدد الكوينز المستحق:";
    } else {
        btns[1].classList.add('active');
        document.getElementById(`label-${key}`).innerText = "أدخل عدد الكوينز:";
        document.getElementById(`res-label-${key}`).innerText = "المبلغ النادي المستحق:";
    }

    handleCalcInput(category, id);
}

function handleCalcInput(category, id) {
    const key = `${category}-${id}`;
    const mode = calcModes[key] || 'cash';
    const val = safeParseFloat(document.getElementById(`input-${key}`).value);

    let resObj = { result: 0, text: "" };

    if (category === 'shipping') {
        resObj = calcShipping(id, val, mode);
    } else if (category === 'withdrawal') {
        resObj = calcTieredRate(val, mode, CONFIG.withdrawal[id], CONFIG.withdrawal[id].currency);
    } else if (category === 'games') {
        resObj = calcTieredRate(val, mode, CONFIG.games[id], CONFIG.games[id].currency);
    }

    const currencyName = category === 'shipping' ? CONFIG.shipping[id].currency :
                        category === 'withdrawal' ? CONFIG.withdrawal[id].currency : CONFIG.games[id].currency;

    const unit = mode === 'cash' ? 'كوينز' : currencyName;
    document.getElementById(`res-val-${key}`).innerText = `${formatNum(resObj.result)} ${unit}`;
    document.getElementById(`res-exp-${key}`).innerText = resObj.text || "أدخل قيمة لبدء الحساب";
}

function clearCalcField(category, id) {
    const key = `${category}-${id}`;
    document.getElementById(`input-${key}`).value = "";
    handleCalcInput(category, id);
}

// 7. VIP CALCULATOR LOGIC
function initVipCalculator() {
    const currSelect = document.getElementById('vipCurrentLevel');
    const targetSelect = document.getElementById('vipTargetLevel');

    currSelect.innerHTML = '';
    targetSelect.innerHTML = '';

    VIP_TABLE.forEach(v => {
        currSelect.innerHTML += `<option value="${v.level}">VIP ${v.level}</option>`;
        targetSelect.innerHTML += `<option value="${v.level}">VIP ${v.level}</option>`;
    });

    currSelect.value = "1";
    targetSelect.value = "2";

    // Event listeners
    currSelect.addEventListener('change', () => {
        if (parseInt(targetSelect.value) <= parseInt(currSelect.value)) {
            targetSelect.value = Math.min(20, parseInt(currSelect.value) + 1);
        }
        updateVipCalculation();
    });

    targetSelect.addEventListener('change', () => {
        if (parseInt(targetSelect.value) <= parseInt(currSelect.value)) {
            currSelect.value = Math.max(1, parseInt(targetSelect.value) - 1);
        }
        updateVipCalculation();
    });

    document.getElementById('vipCalcMode').addEventListener('change', (e) => {
        const isReach = e.target.value === 'reach';
        document.getElementById('targetLevelGroup').style.display = isReach ? 'flex' : 'none';
        document.getElementById('manualXpGroup').style.display = isReach ? 'flex' : 'none';
        document.getElementById('maintainTargetGroup').style.display = isReach ? 'flex' : 'none';
        updateVipCalculation();
    });

    document.getElementById('vipOffer').addEventListener('change', updateVipCalculation);
    document.getElementById('vipManualDeficit').addEventListener('input', updateVipCalculation);
    document.getElementById('vipMaintainTargetSwitch').addEventListener('change', updateVipCalculation);

    updateVipCalculation();
}

function updateVipCalculation() {
    const mode = document.getElementById('vipCalcMode').value;
    const currLvl = parseInt(document.getElementById('vipCurrentLevel').value);
    const targetLvl = parseInt(document.getElementById('vipTargetLevel').value);
    const offerMultiplier = parseFloat(document.getElementById('vipOffer').value) || 5;
    const manualDeficit = safeParseFloat(document.getElementById('vipManualDeficit').value);
    const maintainTarget = document.getElementById('vipMaintainTargetSwitch').checked;

    let reachXp = 0;
    let maintainXp = 0;
    let routeText = "";

    if (mode === 'maintain_current') {
        const currData = VIP_TABLE.find(v => v.level === currLvl);
        maintainXp = currData ? currData.maintain : 0;
        routeText = `تثبيت VIP ${currLvl}`;
    } else {
        routeText = `VIP ${currLvl} ➔ VIP ${targetLvl}`;

        // Calculate Reach XP
        for (let l = currLvl + 1; l <= targetLvl; l++) {
            const data = VIP_TABLE.find(v => v.level === l);
            if (data) {
                if (l === currLvl + 1 && manualDeficit > 0) {
                    reachXp += manualDeficit;
                } else {
                    reachXp += data.upgrade;
                }
            }
        }

        // Maintain target level XP if switch active
        if (maintainTarget) {
            const targetData = VIP_TABLE.find(v => v.level === targetLvl);
            if (targetData) {
                maintainXp = targetData.maintain;
            }
        }
    }

    const totalVipXp = reachXp + maintainXp;
    const agentCoins = Math.round(totalVipXp / offerMultiplier);
    
    // Support Needed Formula
    const supportNeeded = Math.round((agentCoins / 1000000) * CONFIG.vipRates.supportPerMillionAgent);
    
    // Cost Calculations
    const costJod = Math.round((supportNeeded / CONFIG.vipRates.supportPerMillionAgent) * CONFIG.vipRates.supportPriceJod * 100) / 100;
    const costUsd = Math.round((supportNeeded / CONFIG.vipRates.supportPerMillionAgent) * CONFIG.vipRates.supportPriceUsd * 100) / 100;

    // Render Results
    document.getElementById('vipRouteDisplay').innerText = routeText;
    document.getElementById('resReachXp').innerText = formatNum(reachXp);
    document.getElementById('resMaintainXp').innerText = formatNum(maintainXp);
    document.getElementById('resTotalVipXp').innerText = formatNum(totalVipXp);
    document.getElementById('resAgentCoins').innerText = formatNum(agentCoins);
    document.getElementById('resSupportNeeded').innerText = formatNum(supportNeeded);
    document.getElementById('resCostJod').innerText = `${formatNum(costJod)} دينار`;
    document.getElementById('resCostUsd').innerText = `${formatNum(costUsd)} $`;

    document.getElementById('vipFormulaExplain').innerText = 
        `المعادلة: إجمالي نقاط VIP (${formatNum(totalVipXp)}) ÷ العرض (×${offerMultiplier}) = ${formatNum(agentCoins)} شحن الوكيل`;

    // Store globally for save operation
    window.lastVipCalcState = {
        routeText,
        offerMultiplier,
        reachXp,
        maintainXp,
        totalVipXp,
        agentCoins,
        supportNeeded,
        costJod,
        costUsd,
        currLvl,
        targetLvl: mode === 'maintain_current' ? currLvl : targetLvl
    };
}

// 8. STORAGE & HISTORY ENGINE
function getHistory() {
    try {
        return JSON.parse(localStorage.getItem('f90_history') || '[]');
    } catch (e) {
        return [];
    }
}

function saveHistory(historyArr) {
    try {
        localStorage.setItem('f90_history', JSON.stringify(historyArr));
    } catch (e) {
        console.error("LocalStorage store failed", e);
    }
}

function handleSaveOperation() {
    const clientName = document.getElementById('clientNameInput').value.trim();
    const clientId = document.getElementById('clientIdInput').value.trim();

    if (!clientName) {
        alert("يرجى إدخال اسم العميل لحفظ العملية.");
        return;
    }

    const calc = window.lastVipCalcState;
    if (!calc) return;

    const record = {
        id: Date.now().toString(),
        clientName,
        clientId: clientId || "N/A",
        routeText: calc.routeText,
        offer: `×${calc.offerMultiplier}`,
        totalVipXp: calc.totalVipXp,
        agentCoins: calc.agentCoins,
        supportNeeded: calc.supportNeeded,
        costJod: calc.costJod,
        costUsd: calc.costUsd,
        currLvl: calc.currLvl,
        targetLvl: calc.targetLvl,
        date: new Date().toLocaleString('ar-EG')
    };

    const history = getHistory();
    history.unshift(record);
    saveHistory(history);

    document.getElementById('clientNameInput').value = '';
    document.getElementById('clientIdInput').value = '';

    renderHistory();
    updateStatsDashboard();
    alert("تم حفظ العملية بسجل العملاء بنجاح!");
}

function renderHistory(filterTerm = "") {
    const tbody = document.getElementById('historyTableBody');
    const history = getHistory();
    tbody.innerHTML = '';

    const term = filterTerm.toLowerCase().trim();

    const filtered = history.filter(item => 
        item.clientName.toLowerCase().includes(term) || 
        item.clientId.toLowerCase().includes(term)
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; color: var(--text-muted);">لا توجد عمليات محفوظة حالياً</td></tr>`;
        return;
    }

    filtered.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(item.clientName)}</strong><br><small>${escapeHtml(item.clientId)}</small></td>
            <td>${escapeHtml(item.routeText)}</td>
            <td><span class="route-display">${escapeHtml(item.offer)}</span></td>
            <td>${formatNum(item.totalVipXp)}</td>
            <td style="color:var(--accent-gold); font-weight:bold;">${formatNum(item.agentCoins)}</td>
            <td>${formatNum(item.supportNeeded)}</td>
            <td style="color:var(--accent-green);">${formatNum(item.costJod)}</td>
            <td style="color:var(--accent-green);">${formatNum(item.costUsd)}</td>
            <td><small>${escapeHtml(item.date)}</small></td>
            <td>
                <button class="action-icon-btn" onclick="deleteHistoryItem('${item.id}')" title="حذف">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteHistoryItem(id) {
    if (!confirm("هل أنت أصل من حذف هذه العملية؟")) return;
    let history = getHistory();
    history = history.filter(i => i.id !== id);
    saveHistory(history);
    renderHistory();
    updateStatsDashboard();
}

function clearAllHistory() {
    if (!confirm("هل أنت متأكد من حذف السجل بالكامل؟ لن يمكنك استرجاع البيانات!")) return;
    localStorage.removeItem('f90_history');
    renderHistory();
    updateStatsDashboard();
}

// 9. STATISTICS DASHBOARD
function updateStatsDashboard() {
    const history = getHistory();

    const totalOps = history.length;
    const uniqueClients = new Set(history.map(i => i.clientName.trim().toLowerCase())).size;

    const totalShipping = history.reduce((sum, i) => sum + (i.agentCoins || 0), 0);
    const totalSupport = history.reduce((sum, i) => sum + (i.supportNeeded || 0), 0);
    const totalVipXp = history.reduce((sum, i) => sum + (i.totalVipXp || 0), 0);
    const totalJod = history.reduce((sum, i) => sum + (i.costJod || 0), 0);
    const totalUsd = history.reduce((sum, i) => sum + (i.costUsd || 0), 0);

    let maxVip = 0;
    history.forEach(i => {
        if (i.targetLvl > maxVip) maxVip = i.targetLvl;
    });

    document.getElementById('statTotalOps').innerText = formatNum(totalOps);
    document.getElementById('statTotalClients').innerText = formatNum(uniqueClients);
    document.getElementById('statTotalShipping').innerText = formatNum(totalShipping);
    document.getElementById('statTotalSupport').innerText = formatNum(totalSupport);
    document.getElementById('statTotalVipXp').innerText = formatNum(totalVipXp);
    document.getElementById('statTotalJod').innerText = `${formatNum(Math.round(totalJod))} JOD`;
    document.getElementById('statTotalUsd').innerText = `${formatNum(Math.round(totalUsd))} $`;
    document.getElementById('statMaxVip').innerText = `VIP ${maxVip}`;
}

// 10. OFFICIAL VIP TABLE RENDER
function renderOfficialVipTable() {
    const tbody = document.getElementById('officialVipTableBody');
    tbody.innerHTML = '';

    VIP_TABLE.forEach(v => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>VIP ${v.level}</strong></td>
            <td>${formatNum(v.total)}</td>
            <td style="color: var(--accent-gold); font-weight:700;">${formatNum(v.upgrade)}</td>
            <td>${formatNum(v.maintain)}</td>
        `;
        tbody.appendChild(row);
    });
}

// 11. THEME TOGGLE
function initTheme() {
    const savedTheme = localStorage.getItem('f90_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    document.getElementById('themeToggleBtn').addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('f90_theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const iconSpan = document.querySelector('#themeToggleBtn .theme-icon');
    if (iconSpan) {
        iconSpan.innerText = theme === 'dark' ? '☾' : '☀';
    }
}

// 12. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    // Render Calculators Grids
    const shippingGrid = document.getElementById('shippingGrid');
    Object.keys(CONFIG.shipping).forEach(k => {
        shippingGrid.innerHTML += renderCard(k, CONFIG.shipping[k], 'shipping');
    });

    const withdrawalGrid = document.getElementById('withdrawalGrid');
    Object.keys(CONFIG.withdrawal).forEach(k => {
        withdrawalGrid.innerHTML += renderCard(k, CONFIG.withdrawal[k], 'withdrawal');
    });

    const gamesGrid = document.getElementById('gamesGrid');
    Object.keys(CONFIG.games).forEach(k => {
        gamesGrid.innerHTML += renderCard(k, CONFIG.games[k], 'games');
    });

    // Initialize VIP Calculator
    initVipCalculator();

    // Render Official Tables & History
    renderOfficialVipTable();
    renderHistory();
    updateStatsDashboard();
    initTheme();

    // Event listeners
    document.getElementById('saveVipOperationBtn').addEventListener('click', handleSaveOperation);
    document.getElementById('clearAllHistoryBtn').addEventListener('click', clearAllHistory);
    document.getElementById('historySearchInput').addEventListener('input', (e) => {
        renderHistory(e.target.value);
    });

    // Modal Events
    const statsModal = document.getElementById('statsModal');
    document.getElementById('statsToggleBtn').addEventListener('click', () => {
        statsModal.classList.remove('hidden');
    });
    document.getElementById('closeStatsBtn').addEventListener('click', () => {
        statsModal.classList.add('hidden');
    });
    statsModal.addEventListener('click', (e) => {
        if (e.target === statsModal) statsModal.classList.add('hidden');
    });
});
