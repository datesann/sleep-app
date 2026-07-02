// ==========================================
// 初期設定と要素取得
// ==========================================
const targetInput = document.getElementById('target-time-input');
const setTargetBtn = document.getElementById('set-target-btn');
const clearTargetBtn = document.getElementById('clear-target-btn');
const currentTargetDisplay = document.getElementById('current-target-display');

const startBtn = document.getElementById('start-btn');
const endBtn = document.getElementById('end-btn');
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

// モーダル関連の要素取得
const purchaseModal = document.getElementById('purchase-modal');
const modalMessage = document.getElementById('modal-message');
const modalYesBtn = document.getElementById('modal-yes-btn');
const modalNoBtn = document.getElementById('modal-no-btn');

// 右上ナビゲーション＆設定・ヘルプモーダル要素取得
const navSettingsBtn = document.getElementById('nav-settings-btn');
const navHelpBtn = document.getElementById('nav-help-btn');
const settingsMenuModal = document.getElementById('settings-menu-modal');
const wakeupSettingModal = document.getElementById('wakeup-setting-modal');
const bgSettingModal = document.getElementById('bg-setting-modal');
const helpModal = document.getElementById('help-modal');

const goToWakeupBtn = document.getElementById('go-to-wakeup-btn');
const goToBgBtn = document.getElementById('go-to-bg-btn');
const closeModalBtns = document.querySelectorAll('.close-modal-btn');
const backToMenuBtns = document.querySelectorAll('.back-to-menu-btn'); // 戻るボタン

// 一言コメント要素取得
const commentInput = document.getElementById('comment-input');
const saveCommentBtn = document.getElementById('save-comment-btn');

const MIN_DURATION_SEC = 3;   
const MAX_DURATION_SEC = 300; 
let displayDate = new Date();
let pendingPurchase = null; 
let currentCommentDateKey = null; 

// ==========================================
// 着せ替え（テーマ）データ定義
// ==========================================
const THEMES = {
    "default": { name: "デフォルト (青/白)", cost: 0, colors: { bg: "#f0f4f8", box: "#ffffff", primary: "#3498db", secondary: "#2c3e50", text: "#333333", border: "#3498db", header: "#34495e" } },
    "red_1": { name: "単色: レッド", cost: 10, colors: { bg: "#fdebd0", box: "#fff5e6", primary: "#e74c3c", secondary: "#c0392b", text: "#4a2311", border: "#e74c3c", header: "#c0392b" } },
    "blue_1": { name: "単色: ダークブルー", cost: 10, colors: { bg: "#eaf2f8", box: "#f4f6f7", primary: "#2980b9", secondary: "#154360", text: "#1b4f72", border: "#2980b9", header: "#154360" } },
    "yellow_1": { name: "単色: イエロー", cost: 10, colors: { bg: "#fcf3cf", box: "#fef9e7", primary: "#f1c40f", secondary: "#b7950b", text: "#7d6608", border: "#f1c40f", header: "#b7950b" } },
    "red_green_2": { name: "2色: レッド＆グリーン", cost: 20, colors: { bg: "#fdedec", box: "#e9f7ef", primary: "#e74c3c", secondary: "#27ae60", text: "#2c3e50", border: "#27ae60", header: "#e74c3c" } },
    "purple_blue_2": { name: "2色: パープル＆ブルー", cost: 20, colors: { bg: "#f4ecf7", box: "#ebf5fb", primary: "#9b59b6", secondary: "#2980b9", text: "#34495e", border: "#8e44ad", header: "#2980b9" } },
    "tricolor_3": { name: "3色: トリコロール", cost: 30, colors: { bg: "#fdfefe", box: "#eaf2f8", primary: "#e74c3c", secondary: "#2980b9", text: "#17202a", border: "#e74c3c", header: "#2c3e50" } },
    "forest_3": { name: "3色: フォレスト", cost: 30, colors: { bg: "#e8f8f5", box: "#fcf3cf", primary: "#1abc9c", secondary: "#117a65", text: "#145a32", border: "#f1c40f", header: "#117a65" } }
};

// ==========================================
// ナビゲーション・モーダル開閉処理
// ==========================================
navSettingsBtn.addEventListener('click', () => {
    settingsMenuModal.classList.remove('hidden');
});

navHelpBtn.addEventListener('click', () => {
    helpModal.classList.remove('hidden');
});

goToWakeupBtn.addEventListener('click', () => {
    settingsMenuModal.classList.add('hidden');
    wakeupSettingModal.classList.remove('hidden');
});

goToBgBtn.addEventListener('click', () => {
    settingsMenuModal.classList.add('hidden');
    bgSettingModal.classList.remove('hidden');
});

// 「閉じる」ボタン（完全に閉じる）
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = e.target.getAttribute('data-target');
        document.getElementById(targetId).classList.add('hidden');
    });
});

// 「戻る」ボタン（1つ前の設定メニューに戻る）
backToMenuBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const currentId = e.target.getAttribute('data-current');
        document.getElementById(currentId).classList.add('hidden');
        settingsMenuModal.classList.remove('hidden');
    });
});

// ==========================================
// ユーティリティ関数
// ==========================================
function formatTime(date) { return date.toLocaleTimeString('ja-JP'); }
function getLocalDateString(date) {
    const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
function getTotalStamps() { return parseInt(localStorage.getItem('sleepAppStamps') || '0', 10); }
function setTotalStamps(val) {
    localStorage.setItem('sleepAppStamps', val);
    stampCountDisplay.textContent = val;
}
function getOwnedThemes() { return JSON.parse(localStorage.getItem('ownedThemes') || '["default"]'); }
function setOwnedThemes(themesArray) { localStorage.setItem('ownedThemes', JSON.stringify(themesArray)); }

// ==========================================
// 着せ替え機能ロジック
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

    localStorage.setItem('currentTheme', themeId);
}

function renderShopAndInventory() {
    shopItemsArea.innerHTML = "";
    inventoryItemsArea.innerHTML = "";
    
    const owned = getOwnedThemes();
    const currentStamps = getTotalStamps();
    const currentTheme = localStorage.getItem('currentTheme') || 'default';

    for (const [id, theme] of Object.entries(THEMES)) {
        const card = document.createElement('div');
        card.className = "theme-card";
        
        const info = document.createElement('div');
        info.innerHTML = `<h4>${theme.name}</h4>`;

        if (owned.includes(id)) {
            info.innerHTML += `<span>入手済み</span>`;
            const actionBtn = document.createElement('button');
            
            if (currentTheme === id) {
                actionBtn.textContent = "適用中";
                actionBtn.disabled = true;
            } else {
                actionBtn.textContent = "着せ替える";
                actionBtn.onclick = () => {
                    applyTheme(id);
                    renderShopAndInventory(); 
                };
            }
            card.appendChild(info);
            card.appendChild(actionBtn);
            inventoryItemsArea.appendChild(card);

        } else {
            info.innerHTML += `<span>必要スタンプ: ${theme.cost}個</span>`;
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
            shopItemsArea.appendChild(card);
        }
    }
}

modalYesBtn.addEventListener('click', () => {
    if (pendingPurchase) {
        const currentStamps = getTotalStamps();
        setTotalStamps(currentStamps - pendingPurchase.cost);
        
        const newOwned = getOwnedThemes();
        newOwned.push(pendingPurchase.id);
        setOwnedThemes(newOwned);
        
        renderShopAndInventory();
    }
    purchaseModal.classList.add('hidden');
    pendingPurchase = null;
});

modalNoBtn.addEventListener('click', () => {
    purchaseModal.classList.add('hidden');
    pendingPurchase = null;
});

// ==========================================
// 目標時間の管理
// ==========================================
function updateTargetDisplay() {
    const savedTarget = localStorage.getItem('targetWakeUpTime');
    if (savedTarget) {
        currentTargetDisplay.textContent = `現在の目標: ${savedTarget}`;
    } else {
        currentTargetDisplay.textContent = "現在の目標: 未設定";
    }
    targetInput.value = "00:00"; 
}

setTargetBtn.addEventListener('click', () => {
    if (targetInput.value) {
        localStorage.setItem('targetWakeUpTime', targetInput.value);
        updateTargetDisplay();
        errorMessage.textContent = "";
        
        // 保存後に設定メニューへ戻る
        wakeupSettingModal.classList.add('hidden');
        settingsMenuModal.classList.remove('hidden');
    } else {
        errorMessage.textContent = "エラー: 起床時間を入力してください。";
    }
});
clearTargetBtn.addEventListener('click', () => {
    localStorage.removeItem('targetWakeUpTime');
    updateTargetDisplay();
    errorMessage.textContent = "";
});

// ==========================================
// カレンダーの描画処理
// ==========================================
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
        headerCell.className = "calendar-header";
        headerCell.textContent = day;
        calendarGrid.appendChild(headerCell);
    });
    
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const history = JSON.parse(localStorage.getItem('sleepAppHistory') || '{}');
    
    for (let i = 0; i < firstDayIndex; i++) {
        calendarGrid.appendChild(document.createElement("div"));
    }
    
    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement("div");
        dayCell.className = "calendar-day";
        if (day === realToday.getDate() && viewMonth === realToday.getMonth() && viewYear === realToday.getFullYear()) {
            dayCell.classList.add("today");
        }
        
        const numberDiv = document.createElement("div");
        numberDiv.className = "day-number";
        numberDiv.textContent = day;
        dayCell.appendChild(numberDiv);
        
        const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        if (history[dateKey]) {
            const data = history[dateKey];
            if (data.hasStamp) {
                const stampDiv = document.createElement("div");
                stampDiv.className = "day-stamp";
                stampDiv.textContent = data.isBonus ? "💮🎁✨" : "💮"; 
                dayCell.appendChild(stampDiv);
            }
            const infoDiv = document.createElement("div");
            infoDiv.className = "day-info";
            
            let infoHtml = `就寝: ${data.start}<br>起床: ${data.end}<br>睡眠: ${data.duration}`;
            if (data.comment) {
                infoHtml += `<span class="day-comment">💬 ${data.comment}</span>`;
            }
            infoDiv.innerHTML = infoHtml;
            
            dayCell.appendChild(infoDiv);
        }
        calendarGrid.appendChild(dayCell);
    }
}

prevMonthBtn.addEventListener('click', () => { displayDate.setMonth(displayDate.getMonth() - 1); renderCalendar(); });
nextMonthBtn.addEventListener('click', () => { displayDate.setMonth(displayDate.getMonth() + 1); renderCalendar(); });

// ==========================================
// 計測処理
// ==========================================
startBtn.addEventListener('click', () => {
    errorMessage.textContent = "";
    feedbackMessage.textContent = "";
    endTimeDisplay.textContent = "起床時間: --:--:--";
    const now = new Date();
    localStorage.setItem('sleepStartTime', now.getTime());
    startTimeDisplay.textContent = `就寝時間: ${formatTime(now)}`;
    durationDisplay.textContent = `睡眠時間: 計測中...`;
    
    commentInput.disabled = true;
    saveCommentBtn.disabled = true;
    commentInput.value = "";
    commentInput.placeholder = "計測を終了すると入力できます";

    startBtn.disabled = true; endBtn.disabled = false;
    navSettingsBtn.disabled = true; 
});

endBtn.addEventListener('click', () => {
    const storedStartTimeStr = localStorage.getItem('sleepStartTime');
    const targetTimeStr = localStorage.getItem('targetWakeUpTime');
    if (!storedStartTimeStr) { errorMessage.textContent = "エラー: 計測データが見つかりません。"; return; }

    const startTimeMs = parseInt(storedStartTimeStr, 10);
    const startTime = new Date(startTimeMs);
    const endTime = new Date();
    endTimeDisplay.textContent = `起床時間: ${formatTime(endTime)}`;

    const diffSec = Math.floor((endTime.getTime() - startTimeMs) / 1000);
    const durationText = `${Math.floor(diffSec / 3600)}時間 ${Math.floor((diffSec % 3600) / 60)}分 ${diffSec % 60}秒`;
    durationDisplay.textContent = `睡眠時間: ${durationText}`;

    if (diffSec < MIN_DURATION_SEC) {
        errorMessage.textContent = `エラー: ${MIN_DURATION_SEC}秒未満は計測できません。`;
        finishMeasurement(); return;
    }
    if (diffSec > MAX_DURATION_SEC) {
        errorMessage.textContent = `エラー: 5分（${MAX_DURATION_SEC}秒）を超えました。`;
        finishMeasurement(); return;
    }

    if (targetTimeStr) {
        let isStampEarned = false; 
        const [targetHour, targetMin] = targetTimeStr.split(':').map(Number);
        const targetDate = new Date(endTime);
        targetDate.setHours(targetHour, targetMin, 0, 0);
        const timeGapSec = (endTime.getTime() - targetDate.getTime()) / 1000;

        if (timeGapSec < -60) {
            feedbackMessage.textContent = "早起きですね！"; feedbackMessage.style.color = "var(--primary-color)"; 
        } else if (timeGapSec > 60) {
            feedbackMessage.textContent = "寝坊ですかな？"; feedbackMessage.style.color = "#e67e22"; 
        } else {
            feedbackMessage.textContent = "いい調子ですね！"; feedbackMessage.style.color = "#2ecc71"; 
            isStampEarned = true;
        }

        const dateKey = getLocalDateString(endTime); 
        const history = JSON.parse(localStorage.getItem('sleepAppHistory') || '{}');
        let totalStamps = getTotalStamps();
        let isBonusEarned = false;

        if (isStampEarned) {
            totalStamps += 1; 
            let consecutiveDays = 1; 
            for (let i = 1; i <= 6; i++) {
                const checkDate = new Date(endTime);
                checkDate.setDate(checkDate.getDate() - i);
                const checkKey = getLocalDateString(checkDate);
                if (history[checkKey] && history[checkKey].hasStamp) consecutiveDays++;
                else break; 
            }
            if (consecutiveDays === 7) {
                totalStamps += 1; 
                isBonusEarned = true;
                feedbackMessage.textContent += " 🎉 7日連続ボーナス獲得！";
            }
        }

        history[dateKey] = { 
            start: formatTime(startTime), 
            end: formatTime(endTime), 
            duration: durationText, 
            hasStamp: isStampEarned, 
            isBonus: isBonusEarned,
            comment: "" 
        };
        
        localStorage.setItem('sleepAppHistory', JSON.stringify(history));
        setTotalStamps(totalStamps);
        
        renderCalendar(); 
        renderShopAndInventory(); 

        currentCommentDateKey = dateKey; 
        commentInput.disabled = false;
        saveCommentBtn.disabled = false;
        commentInput.placeholder = "今日の一言を入力してください（保存は1回のみ）";

    } else {
        feedbackMessage.textContent = "結果の測定完了！（目標未設定のためカレンダーには記録されません）"; 
        feedbackMessage.style.color = "var(--text-color)";

        commentInput.disabled = true;
        saveCommentBtn.disabled = true;
        commentInput.placeholder = "目標時間が設定されていなかったため入力できません";
    }

    finishMeasurement();
});

saveCommentBtn.addEventListener('click', () => {
    if (!currentCommentDateKey) return;

    const history = JSON.parse(localStorage.getItem('sleepAppHistory') || '{}');
    
    if (history[currentCommentDateKey]) {
        history[currentCommentDateKey].comment = commentInput.value.trim();
        localStorage.setItem('sleepAppHistory', JSON.stringify(history));
        renderCalendar(); 
    }

    commentInput.disabled = true;
    saveCommentBtn.disabled = true;
    commentInput.placeholder = "コメントは保存されました（編集不可）";
    currentCommentDateKey = null; 
});

function finishMeasurement() {
    localStorage.removeItem('sleepStartTime');
    startBtn.disabled = false; endBtn.disabled = true;
    navSettingsBtn.disabled = false;
    targetInput.value = "00:00"; 
}

// ==========================================
// 画面起動時の初期化処理
// ==========================================
setTotalStamps(getTotalStamps());
updateTargetDisplay();
renderCalendar();
applyTheme(localStorage.getItem('currentTheme') || 'default');
renderShopAndInventory();

const savedStartTime = localStorage.getItem('sleepStartTime');
if (savedStartTime) {
    startTimeDisplay.textContent = `就寝時間: ${formatTime(new Date(parseInt(savedStartTime, 10)))}`;
    durationDisplay.textContent = `睡眠時間: 計測中...`;
    
    commentInput.disabled = true;
    saveCommentBtn.disabled = true;

    startBtn.disabled = true; endBtn.disabled = false;
    navSettingsBtn.disabled = true; 
}

// ==========================================
// タブ切り替え処理
// ==========================================
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});