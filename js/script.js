// ==========================================
// 1. 初期設定と要素取得
// ==========================================
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

const targetInput = document.getElementById('target-time-input');
const setTargetBtn = document.getElementById('set-target-btn');
const clearTargetBtn = document.getElementById('clear-target-btn');
const currentTargetDisplay = document.getElementById('current-target-display');
const mainTargetDisplay = document.getElementById('main-target-display'); 
const wakeupErrorMessage = document.getElementById('wakeup-error-message'); 

const sleepStateBefore = document.getElementById('sleep-state-before');
const sleepStateDuring = document.getElementById('sleep-state-during');
const sleepStateAfter = document.getElementById('sleep-state-after');

const startBtn = document.getElementById('start-btn');
const endBtn = document.getElementById('end-btn');
const abortBtn = document.getElementById('abort-btn'); 
const completeBtn = document.getElementById('complete-btn'); 

const startTimeDisplay = document.getElementById('start-time-display');
const endTimeDisplay = document.getElementById('end-time-display');
const durationDisplay = document.getElementById('duration-display');
const feedbackMessage = document.getElementById('feedback-message');
const errorMessage = document.getElementById('error-message');
const stampCountDisplay = document.getElementById('stamp-count');

const calendarTitle = document.getElementById('calendar-title');
const calendarGrid = document.getElementById('calendar-grid');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');

const shopItemsArea = document.getElementById('shop-items');
const inventoryItemsArea = document.getElementById('inventory-items');

const purchaseModal = document.getElementById('purchase-modal');
const modalMessage = document.getElementById('modal-message');
const modalYesBtn = document.getElementById('modal-yes-btn');
const modalNoBtn = document.getElementById('modal-no-btn');

const applyPromptModal = document.getElementById('apply-prompt-modal');
const applyYesBtn = document.getElementById('apply-yes-btn');
const applyNoBtn = document.getElementById('apply-no-btn');

const abortModal = document.getElementById('abort-modal'); 
const abortYesBtn = document.getElementById('abort-yes-btn');
const abortNoBtn = document.getElementById('abort-no-btn');

const errorModal = document.getElementById('measurement-error-modal');
const errorModalMessage = document.getElementById('measurement-error-message');
const errorModalCloseBtn = document.getElementById('measurement-error-close-btn');

const navSettingsBtn = document.getElementById('nav-settings-btn');
const navHelpBtn = document.getElementById('nav-help-btn');
const settingsMenuModal = document.getElementById('settings-menu-modal');
const wakeupSettingModal = document.getElementById('wakeup-setting-modal');
const bgSettingModal = document.getElementById('bg-setting-modal');
const helpModal = document.getElementById('help-modal');

const goToWakeupBtn = document.getElementById('go-to-wakeup-btn');
const goToBgBtn = document.getElementById('go-to-bg-btn');
const closeModalBtns = document.querySelectorAll('.close-modal-btn');
const backToMenuBtns = document.querySelectorAll('.back-to-menu-btn');

const commentSection = document.getElementById('comment-section');
const commentInput = document.getElementById('comment-input');

let displayDate = new Date();
if (displayDate.getHours() < 4) {
    displayDate.setDate(displayDate.getDate() - 1);
}
let pendingPurchase = null; 
let currentCommentDateKey = null; 

// ==========================================
// 2. 睡眠管理タブ 状態切り替えロジック
// ==========================================
function switchSleepState(state) {
    sleepStateBefore.classList.add('hidden');
    sleepStateDuring.classList.add('hidden');
    sleepStateAfter.classList.add('hidden');

    if (state === 'before') {
        sleepStateBefore.classList.remove('hidden');
        navSettingsBtn.disabled = false;
        navHelpBtn.disabled = false;
        navButtons.forEach(b => b.disabled = false); 
    } else if (state === 'during') {
        sleepStateDuring.classList.remove('hidden');
        navSettingsBtn.disabled = true;
        navHelpBtn.disabled = false; 
        navButtons.forEach(b => b.disabled = true);  
    } else if (state === 'after') {
        sleepStateAfter.classList.remove('hidden');
        navSettingsBtn.disabled = true;
        navHelpBtn.disabled = false; 
        navButtons.forEach(b => b.disabled = true);  
    }
}

// ==========================================
// 3. ナビゲーション・モーダル開閉処理
// ==========================================
navSettingsBtn.addEventListener('click', () => { if(!navSettingsBtn.disabled) settingsMenuModal.classList.remove('hidden'); });
navHelpBtn.addEventListener('click', () => { if(!navHelpBtn.disabled) helpModal.classList.remove('hidden'); });

goToWakeupBtn.addEventListener('click', () => {
    settingsMenuModal.classList.add('hidden');
    wakeupSettingModal.classList.remove('hidden');
    wakeupErrorMessage.textContent = ""; 
});
goToBgBtn.addEventListener('click', () => {
    settingsMenuModal.classList.add('hidden');
    bgSettingModal.classList.remove('hidden');
});

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = e.target.getAttribute('data-target');
        document.getElementById(targetId).classList.add('hidden');
    });
});

backToMenuBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const currentId = e.target.getAttribute('data-current');
        document.getElementById(currentId).classList.add('hidden');
        settingsMenuModal.classList.remove('hidden');
    });
});

// ==========================================
// 4. 着せ替えデータ定義
// ==========================================
const THEMES = {
    "light": { name: "ライト (初期設定)", cost: 0, colors: { bg: "#f8f9fa", box: "#ffffff", primary: "#3498db", secondary: "#6c757d", text: "#333333", border: "#dee2e6", header: "#e9ecef", danger: "#e74c3c" } },
    "dark": { name: "ダーク (質素な青)", cost: 0, colors: { bg: "#1e1e1e", box: "#2d2d2d", primary: "#3498db", secondary: "#5dade2", text: "#e0e0e0", border: "#444444", header: "#252525", danger: "#c0392b" } },
    "single_red": { name: "単色：レッド", cost: 7, colors: { bg: "#fff5f5", box: "#ffffff", primary: "#e74c3c", secondary: "#c0392b", text: "#333333", border: "#fadbd8", header: "#f2d7d5", danger: "#2c3e50" } },
    "single_blue": { name: "単色：ブルー", cost: 7, colors: { bg: "#f4f6f7", box: "#ffffff", primary: "#3498db", secondary: "#2980b9", text: "#333333", border: "#d6eaf8", header: "#ebf5fb", danger: "#e74c3c" } },
    "single_yellow": { name: "単色：イエロー", cost: 7, colors: { bg: "#fcf9f2", box: "#ffffff", primary: "#f1c40f", secondary: "#f39c12", text: "#333333", border: "#f9e79f", header: "#fcf3cf", danger: "#e74c3c" } },
    "single_green": { name: "単色：グリーン", cost: 7, colors: { bg: "#f4fcf6", box: "#ffffff", primary: "#2ecc71", secondary: "#27ae60", text: "#333333", border: "#d5f5e3", header: "#eaeded", danger: "#e74c3c" } },
    "single_purple": { name: "単色：パープル", cost: 7, colors: { bg: "#f9f4fc", box: "#ffffff", primary: "#9b59b6", secondary: "#8e44ad", text: "#333333", border: "#ebdef0", header: "#f5eef8", danger: "#e74c3c" } },
    "single_orange": { name: "単色：オレンジ", cost: 7, colors: { bg: "#fdf5e6", box: "#ffffff", primary: "#e67e22", secondary: "#d35400", text: "#333333", border: "#f5cba7", header: "#fae5d3", danger: "#c0392b" } },
    "single_pink": { name: "単色：ピンク", cost: 7, colors: { bg: "#fdf2f8", box: "#ffffff", primary: "#ff9ff3", secondary: "#f368e0", text: "#333333", border: "#fadbd8", header: "#fbeee6", danger: "#e91e63" } },
    "double_wb": { name: "2色：ホワイト＆ブラック", cost: 14, colors: { bg: "#ffffff", box: "#f8f9fa", primary: "#000000", secondary: "#333333", text: "#000000", border: "#000000", header: "#e0e0e0", danger: "#e74c3c" } },
    "double_red_pink": { name: "2色：レッド＆ピンク", cost: 14, colors: { bg: "#fff0f5", box: "#ffffff", primary: "#e74c3c", secondary: "#fd79a8", text: "#333333", border: "#ffb8c6", header: "#fadbd8", danger: "#2c3e50" } },
    "double_yellow_green": { name: "2色：イエロー＆グリーン", cost: 14, colors: { bg: "#fafff0", box: "#ffffff", primary: "#f1c40f", secondary: "#2ecc71", text: "#333333", border: "#d5f5e3", header: "#f9e79f", danger: "#e67e22" } },
    "double_blue_purple": { name: "2色：ブルー＆パープル", cost: 14, colors: { bg: "#f4f4fc", box: "#ffffff", primary: "#3498db", secondary: "#9b59b6", text: "#333333", border: "#d6eaf8", header: "#ebdef0", danger: "#c0392b" } },
    "special_chocomint": { name: "特殊：チョコミント", cost: 30, colors: { bg: "#aaffc3", box: "#ffffff", primary: "#3e2723", secondary: "#5d4037", text: "#3e2723", border: "#81c784", header: "#aaffc3", danger: "#e74c3c" } },
    "special_sakura": { name: "特殊：さくら抹茶", cost: 30, colors: { bg: "#fdeef4", box: "#ffffff", primary: "#4caf50", secondary: "#388e3c", text: "#4a4a4a", border: "#f8bbd0", header: "#c8e6c9", danger: "#e91e63" } },
    "special_midnight": { name: "特殊：夜空の月", cost: 30, colors: { bg: "#0f0f2d", box: "#1b1b3a", primary: "#f1c40f", secondary: "#f39c12", text: "#ffffff", border: "#34495e", header: "#0f0f2d", danger: "#e74c3c" } },
    "special_latte": { name: "特殊：カフェラテ", cost: 30, colors: { bg: "#f3e5d8", box: "#ffffff", primary: "#8d6e63", secondary: "#5d4037", text: "#4e342e", border: "#d7ccc8", header: "#e4d0c8", danger: "#a67c52" } },
    "special_honey": { name: "特殊：ハニーレモン", cost: 30, colors: { bg: "#fffacd", box: "#ffffff", primary: "#ffd700", secondary: "#32cd32", text: "#8b4513", border: "#f0e68c", header: "#fffacd", danger: "#ff4500" } },
    "special_wagashi": { name: "特殊：和菓子(あずき)", cost: 30, colors: { bg: "#f5f5f5", box: "#ffffff", primary: "#800000", secondary: "#556b2f", text: "#2f4f4f", border: "#dcdcdc", header: "#faf0e6", danger: "#8b0000" } },
    "special_forest": { name: "特殊：深い森", cost: 30, colors: { bg: "#e9f5e9", box: "#ffffff", primary: "#228b22", secondary: "#8b4513", text: "#004225", border: "#c8e6c9", header: "#f5f5dc", danger: "#b22222" } }
};

// ==========================================
// 5. ユーティリティ関数
// ==========================================
function formatTime(date) { return date.toLocaleTimeString('ja-JP'); }
function getLocalDateString(date) {
    const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
function getAppDateString(dateObj) {
    const d = new Date(dateObj.getTime());
    if (d.getHours() < 4) {
        d.setDate(d.getDate() - 1); 
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
function getTotalStamps() { return parseInt(localStorage.getItem('sleepAppStamps') || '0', 10); }
function setTotalStamps(val) {
    localStorage.setItem('sleepAppStamps', val);
    stampCountDisplay.textContent = val;
}
function getOwnedThemes() { 
    return JSON.parse(localStorage.getItem('ownedThemes') || '["light", "dark"]'); 
}
function setOwnedThemes(themesArray) { localStorage.setItem('ownedThemes', JSON.stringify(themesArray)); }

// ==========================================
// 6. 着せ替え機能ロジック
// ==========================================
function applyTheme(themeId) {
    const theme = THEMES[themeId];
    if (!theme) return;
    
    document.documentElement.style.setProperty('--bg-color', theme.colors.bg);
    document.documentElement.style.setProperty('--box-bg', theme.colors.box);
    document.documentElement.style.setProperty('--primary-color', theme.colors.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.colors.secondary);
    document.documentElement.style.setProperty('--text-color', theme.colors.text);
    document.documentElement.style.setProperty('--border-color', theme.colors.border);
    document.documentElement.style.setProperty('--calendar-header', theme.colors.header);
    document.documentElement.style.setProperty('--danger-color', theme.colors.danger || "#e74c3c");
    
    localStorage.setItem('currentTheme', themeId);
}

function renderShopAndInventory() {
    shopItemsArea.innerHTML = "";
    inventoryItemsArea.innerHTML = "";
    const owned = getOwnedThemes();
    const currentStamps = getTotalStamps();
    const currentTheme = localStorage.getItem('currentTheme') || 'light';

    for (const [id, theme] of Object.entries(THEMES)) {
        if (owned.includes(id)) {
            const card = document.createElement('div');
            card.className = "theme-card";
            const info = document.createElement('div');
            info.innerHTML = `<h4>${theme.name}</h4><span>入手済み</span>`;

            const actionBtn = document.createElement('button');
            if (currentTheme === id) {
                actionBtn.textContent = "適用中"; 
                actionBtn.disabled = true;
            } else {
                actionBtn.textContent = "着せ替える";
                actionBtn.onclick = () => { applyTheme(id); renderShopAndInventory(); };
            }
            card.appendChild(info); 
            card.appendChild(actionBtn);
            inventoryItemsArea.appendChild(card);
        }
    }

    const categories = [
        { key: 'single', label: '🎨 単色テーマ (7スタンプ)' },
        { key: 'double', label: '🌓 2色組み合わせ (14スタンプ)' },
        { key: 'special', label: '✨ 特殊テーマ (30スタンプ)' }
    ];

    let activeIdx = parseInt(localStorage.getItem('currentShopCategoryIdx') || '0', 10);
    if (activeIdx < 0 || activeIdx >= categories.length) activeIdx = 0; 

    const currentCategory = categories[activeIdx];

    const headerContainer = document.createElement('div');
    headerContainer.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-top: 20px; margin-bottom: 15px; padding: 10px; background-color: var(--box-bg); border: 1px solid var(--border-color); border-radius: 8px;";

    const prevBtn = document.createElement('button');
    prevBtn.textContent = "◀";
    prevBtn.style.cssText = "background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-color); padding: 5px 15px; font-weight: bold;";
    if (activeIdx === 0) {
        prevBtn.style.opacity = "0.2"; 
        prevBtn.disabled = true;
    } else {
        prevBtn.onclick = () => {
            localStorage.setItem('currentShopCategoryIdx', activeIdx - 1);
            renderShopAndInventory(); 
        };
    }

    const titleLabel = document.createElement('span');
    titleLabel.textContent = currentCategory.label;
    titleLabel.style.cssText = "font-weight: bold; font-size: 15px; color: var(--text-color);";

    const nextBtn = document.createElement('button');
    nextBtn.textContent = "▶";
    nextBtn.style.cssText = "background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-color); padding: 5px 15px; font-weight: bold;";
    if (activeIdx === categories.length - 1) {
        nextBtn.style.opacity = "0.2"; 
        nextBtn.disabled = true;
    } else {
        nextBtn.onclick = () => {
            localStorage.setItem('currentShopCategoryIdx', activeIdx + 1);
            renderShopAndInventory(); 
        };
    }

    headerContainer.appendChild(prevBtn);
    headerContainer.appendChild(titleLabel);
    headerContainer.appendChild(nextBtn);
    shopItemsArea.appendChild(headerContainer);

    const filteredThemes = Object.entries(THEMES).filter(([id]) => 
        id.startsWith(currentCategory.key) && !owned.includes(id)
    );

    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = "display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; width: 100%;";

    if (filteredThemes.length === 0) {
        gridContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px 0; color: #888; font-size: 14px;">このカテゴリはすべてコンプリートしました！🎉</div>`;
    } else {
        filteredThemes.forEach(([id, theme]) => {
            const card = document.createElement('div');
            card.className = "theme-card";
            const info = document.createElement('div');
            const displayName = theme.name.includes('：') ? theme.name.split('：')[1] : theme.name;
            info.innerHTML = `<h4>${displayName}</h4><span>🪙 ${theme.cost}</span>`;

            const actionBtn = document.createElement('button');
            actionBtn.textContent = "購入";
            if (currentStamps < theme.cost) {
                actionBtn.disabled = true; 
                actionBtn.style.backgroundColor = "#95a5a6";
            } else {
                actionBtn.onclick = () => {
                    pendingPurchase = { id: id, cost: theme.cost };
                    modalMessage.innerHTML = `${theme.name} を ${theme.cost}スタンプで購入しますか？`;
                    purchaseModal.classList.remove('hidden'); 
                };
            }
            card.appendChild(info); 
            card.appendChild(actionBtn);
            gridContainer.appendChild(card);
        });
    }

    shopItemsArea.appendChild(gridContainer);
}

// ==========================================
// 購入確認モーダルのボタン処理
// ==========================================
modalYesBtn.addEventListener('click', () => {
    if (pendingPurchase) {
        const currentStamps = getTotalStamps();
        setTotalStamps(currentStamps - pendingPurchase.cost);
        const newOwned = getOwnedThemes();
        newOwned.push(pendingPurchase.id);
        setOwnedThemes(newOwned);
        
        renderShopAndInventory();
        purchaseModal.classList.add('hidden');
        applyPromptModal.classList.remove('hidden');

        const purchasedThemeId = pendingPurchase.id; 

        applyYesBtn.onclick = () => {
            applyTheme(purchasedThemeId);
            renderShopAndInventory(); 
            applyPromptModal.classList.add('hidden');
        };

        applyNoBtn.onclick = () => {
            applyPromptModal.classList.add('hidden');
        };

        pendingPurchase = null;
    }
});

modalNoBtn.addEventListener('click', () => { 
    purchaseModal.classList.add('hidden'); 
    pendingPurchase = null; 
});

// ==========================================
// 7. 目標時間の管理
// ==========================================

// ユーザーが入力欄を触ったとき、空欄なら「00:00」をセットする
['focus', 'click'].forEach(evt => {
    targetInput.addEventListener(evt, () => {
        if (targetInput.value === "") {
            targetInput.value = "00:00";
        }
    });
});

function updateTargetDisplay() {
    const savedTarget = localStorage.getItem('targetWakeUpTime');
    const targetMeasuredDate = localStorage.getItem('targetMeasuredDate');
    const todayStr = getAppDateString(new Date());

    if (savedTarget) {
        currentTargetDisplay.textContent = `現在の目標: ${savedTarget}`;
        mainTargetDisplay.textContent = `現在の目標時間: ${savedTarget}`;
    } else {
        if (targetMeasuredDate === todayStr) {
            currentTargetDisplay.textContent = "現在の目標: 未設定 (本日分は計測済み)";
            mainTargetDisplay.textContent = "現在の目標時間: 未設定 (本日分は計測済み)";
        } else {
            currentTargetDisplay.textContent = "現在の目標: 未設定";
            mainTargetDisplay.textContent = "現在の目標時間: 未設定";
        }
    }
    targetInput.value = ""; 
}

setTargetBtn.addEventListener('click', () => {
    const todayStr = getAppDateString(new Date());
    const targetMeasuredDate = localStorage.getItem('targetMeasuredDate');

    if (targetMeasuredDate === todayStr) {
        wakeupErrorMessage.textContent = "エラー: 本日の目標計測は完了しています。"; 
        return;
    }

    if (targetInput.value) {
        localStorage.setItem('targetWakeUpTime', targetInput.value);
        updateTargetDisplay();
        wakeupErrorMessage.textContent = ""; 
        wakeupSettingModal.classList.add('hidden');
        settingsMenuModal.classList.remove('hidden');
    } else {
        wakeupErrorMessage.textContent = "時間が設定されていません"; 
    }
});

clearTargetBtn.addEventListener('click', () => {
    localStorage.removeItem('targetWakeUpTime');
    updateTargetDisplay();
    wakeupErrorMessage.textContent = ""; 
});

// ==========================================
// 8. 平均計算・カレンダー描画処理
// ==========================================
function timeToMinutes(timeStr) {
    const parts = timeStr.split(':');
    let h = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);
    if (h < 12) h += 24;
    return h * 60 + m;
}

function minutesToTime(totalMins) {
    if (isNaN(totalMins)) return "--:--";
    let h = Math.floor(totalMins / 60) % 24;
    let m = Math.floor(totalMins % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatAverageDuration(totalSecs) {
    if (isNaN(totalSecs)) return "--時間 --分";
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    return `${h}時間 ${m}分`;
}

function updateAverages() {
    const history = JSON.parse(localStorage.getItem('sleepAppHistory') || '{}');
    
    // 🌟 修正1: 履歴から「有効な記録がある日」だけを抽出し、日付の新しい順に並べる
    const validRecords = [];
    const sortedKeys = Object.keys(history).sort().reverse();
    
    for (const key of sortedKeys) {
        const data = history[key];
        if (data && data.diffSec !== undefined && data.start && data.end) {
            validRecords.push(data);
        }
    }
    
    let stats = {
        7: { sleepSec: 0, startMin: 0, endMin: 0, count: 0 },
        30: { sleepSec: 0, startMin: 0, endMin: 0, count: 0 }
    };

    // 🌟 修正2: 新しい順にたどって、最大30回分の「記録」をカウントする
    for (let i = 0; i < validRecords.length; i++) {
        if (i >= 30) break; // 30回分集まったらストップ
        
        let data = validRecords[i];
        let startM = timeToMinutes(data.start);
        let endM = timeToMinutes(data.end);
        
        stats[30].sleepSec += data.diffSec;
        stats[30].startMin += startM;
        stats[30].endMin += endM;
        stats[30].count++;
        
        if (i < 7) {
            stats[7].sleepSec += data.diffSec;
            stats[7].startMin += startM;
            stats[7].endMin += endM;
            stats[7].count++;
        }
    }
    
    [7, 30].forEach(days => {
        let count = stats[days].count;
        let sleepStr = "--時間 --分";
        let startStr = "--:--";
        let endStr = "--:--";
        
        // 🌟 修正3: 「記録がある日数」が規定日数（7回・30回）に達した場合のみ計算
        if (count === days) {
            sleepStr = formatAverageDuration(stats[days].sleepSec / count);
            startStr = minutesToTime(stats[days].startMin / count);
            endStr = minutesToTime(stats[days].endMin / count);
        }
        
        document.getElementById(`avg-sleep-${days}`).textContent = sleepStr;
        document.getElementById(`avg-start-${days}`).textContent = startStr;
        document.getElementById(`avg-end-${days}`).textContent = endStr;
    });
}

function renderCalendar() {
    calendarGrid.innerHTML = ""; 
    const realToday = new Date(); 
    const viewYear = displayDate.getFullYear(); 
    const viewMonth = displayDate.getMonth(); 
    
    calendarTitle.textContent = `${viewYear}年 ${viewMonth + 1}月`;
    const monthDiff = (viewYear - realToday.getFullYear()) * 12 + (viewMonth - realToday.getMonth());
    prevMonthBtn.disabled = (monthDiff <= -1); 
    nextMonthBtn.disabled = (monthDiff >= 1);  

    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    weekdays.forEach(day => {
        const headerCell = document.createElement("div");
        headerCell.className = "calendar-header"; headerCell.textContent = day; calendarGrid.appendChild(headerCell);
    });
    
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const history = JSON.parse(localStorage.getItem('sleepAppHistory') || '{}');
    
    for (let i = 0; i < firstDayIndex; i++) { calendarGrid.appendChild(document.createElement("div")); }
    
    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement("div");
        dayCell.className = "calendar-day";
        if (day === realToday.getDate() && viewMonth === realToday.getMonth() && viewYear === realToday.getFullYear()) {
            dayCell.classList.add("today");
        }
        
        const numberDiv = document.createElement("div");
        numberDiv.className = "day-number"; numberDiv.textContent = day; dayCell.appendChild(numberDiv);
        const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        if (history[dateKey]) {
            const data = history[dateKey];
            if (data.hasStamp) {
                const stampDiv = document.createElement("div");
                stampDiv.className = "day-stamp"; stampDiv.textContent = data.isBonus ? "💮🎁✨" : "💮"; dayCell.appendChild(stampDiv);
            }
            const infoDiv = document.createElement("div");
            infoDiv.className = "day-info";
            let infoHtml = `就寝: ${data.start}<br>起床: ${data.end}<br>睡眠(合計): ${data.duration}`;
            if (data.comment) { infoHtml += `<span class="day-comment">💬 ${data.comment}</span>`; }
            infoDiv.innerHTML = infoHtml; dayCell.appendChild(infoDiv);
        }
        calendarGrid.appendChild(dayCell);
    }
    
    updateAverages();
}
prevMonthBtn.addEventListener('click', () => { displayDate.setMonth(displayDate.getMonth() - 1); renderCalendar(); });
nextMonthBtn.addEventListener('click', () => { displayDate.setMonth(displayDate.getMonth() + 1); renderCalendar(); });

// ==========================================
// 9. 計測処理
// ==========================================
startBtn.addEventListener('click', () => {
    errorMessage.textContent = "";
    feedbackMessage.textContent = "";
    const now = new Date();
    const todayStr = getAppDateString(now); 
    
    localStorage.setItem('sleepStartTime', now.getTime());
    localStorage.setItem('sleepStartDateKey', todayStr);

    const savedTarget = localStorage.getItem('targetWakeUpTime');
    const targetMeasuredDate = localStorage.getItem('targetMeasuredDate');

    if (savedTarget && targetMeasuredDate !== todayStr) {
        localStorage.setItem('isTargetMeasurement', 'true');
    } else {
        localStorage.setItem('isTargetMeasurement', 'false');
    }

    switchSleepState('during');
});

abortBtn.addEventListener('click', () => { abortModal.classList.remove('hidden'); });
abortYesBtn.addEventListener('click', () => {
    localStorage.removeItem('sleepStartTime'); 
    localStorage.removeItem('sleepStartDateKey');
    localStorage.removeItem('isTargetMeasurement');
    abortModal.classList.add('hidden');
    switchSleepState('before'); 
});
abortNoBtn.addEventListener('click', () => { abortModal.classList.add('hidden'); });

endBtn.addEventListener('click', () => {
    const storedStartTimeStr = localStorage.getItem('sleepStartTime');
    const startDateKey = localStorage.getItem('sleepStartDateKey');
    const isTargetMeasurement = localStorage.getItem('isTargetMeasurement') === 'true';
    const targetTimeStr = localStorage.getItem('targetWakeUpTime');

    if (!storedStartTimeStr) { return; }

    const startTimeMs = parseInt(storedStartTimeStr, 10);
    const startTime = new Date(startTimeMs);
    const endTime = new Date();

    startTimeDisplay.textContent = formatTime(startTime);
    endTimeDisplay.textContent = formatTime(endTime);

    const diffSec = Math.floor((endTime.getTime() - startTimeMs) / 1000);
    const currentDurationText = `${Math.floor(diffSec / 3600)}時間 ${Math.floor((diffSec % 3600) / 60)}分 ${diffSec % 60}秒`;
    durationDisplay.textContent = `今回の睡眠: ${currentDurationText}`;

    if (isTargetMeasurement) {
        localStorage.setItem('targetMeasuredDate', startDateKey);
        localStorage.removeItem('targetWakeUpTime'); 
    }

    // ========== 【修正】1. 計測範囲のエラーチェック ==========
    let minDurationSec = 0;
    const maxDurationSec = 20 * 3600; // 20時間 = 72000秒

    // 起床目標時間が設定されているかどうかの判定
    if (targetTimeStr) {
        minDurationSec = 1 * 3600; // 1時間 = 3600秒
    } else {
        minDurationSec = 0; // 0分 = 0秒
    }

    if (diffSec < minDurationSec) {
        errorModalMessage.textContent = targetTimeStr ? "1時間未満は計測できません。" : "0分未満は計測できません。";
        errorModal.classList.remove('hidden');
        return; 
    }
    if (diffSec >= maxDurationSec) {
        errorModalMessage.textContent = "20時間以上は計測できません。";
        errorModal.classList.remove('hidden');
        return;
    }

    localStorage.removeItem('sleepStartTime'); 
    localStorage.removeItem('sleepStartDateKey');
    localStorage.removeItem('isTargetMeasurement');

    const dateKey = startDateKey; 
    const history = JSON.parse(localStorage.getItem('sleepAppHistory') || '{}');
    
    const existingData = history[dateKey];
    let totalDiffSec = diffSec;
    
    let finalStart = formatTime(startTime);
    let finalEnd = formatTime(endTime);
    
    let isStampEarned = existingData ? existingData.hasStamp : false;
    let isBonusEarned = existingData ? existingData.isBonus : false;
    let currentComment = existingData ? existingData.comment : "";
    let totalStamps = getTotalStamps();

    if (existingData && existingData.diffSec !== undefined) {
        totalDiffSec += existingData.diffSec;
        if (existingData.start) {
            finalStart = existingData.start;
            finalEnd = existingData.end;
        }
    }

    const totalH = Math.floor(totalDiffSec / 3600);
    const totalM = Math.floor((totalDiffSec % 3600) / 60);
    const totalS = totalDiffSec % 60;
    const totalDurationText = `${totalH}時間 ${totalM}分 ${totalS}秒`;

    // ========== 【修正】2. スタンプ獲得の判定（前1時間〜後10分） ==========
    if (isTargetMeasurement && targetTimeStr) {
        const [targetHour, targetMin] = targetTimeStr.split(':').map(Number);
        const targetDate = new Date(endTime);
        targetDate.setHours(targetHour, targetMin, 0, 0);
        
        // 実際の起床時間と目標時間の差分（秒単位）
        let timeGapSec = (endTime.getTime() - targetDate.getTime()) / 1000;

        // 日付をまたぐ場合の簡易的な補正（念のため）
        if (timeGapSec < -12 * 3600) timeGapSec += 24 * 3600;
        if (timeGapSec > 12 * 3600) timeGapSec -= 24 * 3600;

        if (!isStampEarned) {
            // 前1時間（-3600秒）から 後10分（+600秒）の範囲内であれば達成
            if (timeGapSec >= -3600 && timeGapSec <= 600) {
                feedbackMessage.textContent = "いい調子ですね！スタンプを獲得しました！"; 
                feedbackMessage.style.color = "#2ecc71"; 
                isStampEarned = true;
                totalStamps += 1; 
                
                let consecutiveDays = 1; 
                for (let i = 1; i <= 6; i++) {
                    const checkDate = new Date(startTime); 
                    checkDate.setDate(checkDate.getDate() - i);
                    const checkKey = getAppDateString(checkDate);
                    if (history[checkKey] && history[checkKey].hasStamp) consecutiveDays++; else break; 
                }
                if (consecutiveDays === 7) { 
                    totalStamps += 1; 
                    isBonusEarned = true; 
                    feedbackMessage.textContent += " 🎉 7日連続ボーナス獲得！"; 
                }
                setTotalStamps(totalStamps);
            } else if (timeGapSec < -3600) {
                feedbackMessage.textContent = "早起きすぎます！起床目標時間から外れてしまいました。"; 
                feedbackMessage.style.color = "var(--primary-color)"; 
            } else {
                feedbackMessage.textContent = "寝坊ですかな？起床目標時間から外れてしまいました。"; 
                feedbackMessage.style.color = "#e67e22"; 
            }
        }
        commentSection.classList.remove('hidden');
        commentInput.value = currentComment; 
    } else {
        feedbackMessage.textContent = "結果の測定完了！（通常計測として記録しました）"; 
        feedbackMessage.style.color = "var(--text-color)";
        commentSection.classList.add('hidden');
        
        if (existingData) {
            finalStart = existingData.start || "";
            finalEnd = existingData.end || "";
        } else {
            finalStart = "";
            finalEnd = "";
        }
    }

    history[dateKey] = { 
        start: finalStart, 
        end: finalEnd, 
        duration: totalDurationText, 
        hasStamp: isStampEarned, 
        isBonus: isBonusEarned, 
        comment: currentComment,
        diffSec: totalDiffSec
    };
    localStorage.setItem('sleepAppHistory', JSON.stringify(history));

    currentCommentDateKey = dateKey; 
    renderCalendar(); 
    renderShopAndInventory(); 
    updateTargetDisplay(); 
    switchSleepState('after');
});

errorModalCloseBtn.addEventListener('click', () => {
    localStorage.removeItem('sleepStartTime'); 
    localStorage.removeItem('sleepStartDateKey');
    localStorage.removeItem('isTargetMeasurement');
    errorModal.classList.add('hidden');
    switchSleepState('before');
    updateTargetDisplay(); 
});

completeBtn.addEventListener('click', () => {
    const commentText = commentInput.value.trim();
    
    if (currentCommentDateKey) {
        const history = JSON.parse(localStorage.getItem('sleepAppHistory') || '{}');
        if (history[currentCommentDateKey]) {
            history[currentCommentDateKey].comment = commentText.substring(0, 250);
            localStorage.setItem('sleepAppHistory', JSON.stringify(history));
            
            renderCalendar(); 
        }
    }

    switchSleepState('before');
    commentInput.value = "";
    currentCommentDateKey = null; 
});

// ==========================================
// 10. タブ切り替えイベント設定
// ==========================================
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.disabled) return; 
        navButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

// ==========================================
// 11. 画面起動時の初期化処理
// ==========================================
setTotalStamps(getTotalStamps());
updateTargetDisplay();
renderCalendar();

applyTheme(localStorage.getItem('currentTheme') || 'light');

renderShopAndInventory();

const savedStartTime = localStorage.getItem('sleepStartTime');
if (savedStartTime) {
    switchSleepState('during');
} else {
    switchSleepState('before');
}

// ==========================================
// 12. ヘルプアコーディオン開閉制御
// ==========================================
document.querySelectorAll('.help-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // ボタンの矢印の向きを切り替える（▲と▼）
        btn.classList.toggle('open');
        
        // ボタンの次にある要素（.help-body）を取得して開閉する
        const body = btn.nextElementSibling;
        if (body) {
            body.classList.toggle('hidden');
        }
    });
});