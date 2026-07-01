// 要素の取得
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

// 定数の設定
const MIN_DURATION_SEC = 3;   
const MAX_DURATION_SEC = 300; 

// 現在表示しているカレンダーの年月を管理するオブジェクト
let displayDate = new Date();

function formatTime(date) {
    return date.toLocaleTimeString('ja-JP');
}

function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ==========================================
// スタンプ数の管理
// ==========================================
function updateStampDisplay() {
    const stamps = parseInt(localStorage.getItem('sleepAppStamps') || '0', 10);
    stampCountDisplay.textContent = stamps;
}

// ==========================================
// 目標時間の管理
// ==========================================
function updateTargetDisplay() {
    const savedTarget = localStorage.getItem('targetWakeUpTime');
    if (savedTarget) {
        currentTargetDisplay.textContent = `現在の目標: ${savedTarget}`;
        targetInput.value = savedTarget;
    } else {
        currentTargetDisplay.textContent = "現在の目標: 未設定";
        targetInput.value = "00:00";
    }
}

setTargetBtn.addEventListener('click', () => {
    if (targetInput.value) {
        localStorage.setItem('targetWakeUpTime', targetInput.value);
        updateTargetDisplay();
        errorMessage.textContent = "";
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
        const emptyCell = document.createElement("div");
        calendarGrid.appendChild(emptyCell);
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
            
            // 【修正】スタンプ表示エリアの処理
            if (data.hasStamp) {
                const stampDiv = document.createElement("div");
                stampDiv.className = "day-stamp";
                
                // 通常は「💮」、ボーナス日なら「💮🎁✨」を表示
                if (data.isBonus) {
                    stampDiv.textContent = "💮🎁✨"; 
                } else {
                    stampDiv.textContent = "💮";
                }
                
                dayCell.appendChild(stampDiv);
            }
            
            const infoDiv = document.createElement("div");
            infoDiv.className = "day-info";
            infoDiv.innerHTML = `就寝: ${data.start}<br>起床: ${data.end}<br>睡眠: ${data.duration}`;
            dayCell.appendChild(infoDiv);
        }
        calendarGrid.appendChild(dayCell);
    }
}

prevMonthBtn.addEventListener('click', () => {
    displayDate.setMonth(displayDate.getMonth() - 1);
    renderCalendar();
});
nextMonthBtn.addEventListener('click', () => {
    displayDate.setMonth(displayDate.getMonth() + 1);
    renderCalendar();
});

// ==========================================
// 画面起動時の復元処理
// ==========================================
updateTargetDisplay();
updateStampDisplay(); 
renderCalendar(); 

const savedStartTime = localStorage.getItem('sleepStartTime');
if (savedStartTime) {
    const startTime = new Date(parseInt(savedStartTime, 10));
    startTimeDisplay.textContent = `就寝時間: ${formatTime(startTime)}`;
    durationDisplay.textContent = `睡眠時間: 計測中...`;
    
    startBtn.disabled = true;
    endBtn.disabled = false;
    
    targetInput.disabled = true;
    setTargetBtn.disabled = true;
    clearTargetBtn.disabled = true;
}

// ==========================================
// 計測開始
// ==========================================
startBtn.addEventListener('click', () => {
    errorMessage.textContent = "";
    feedbackMessage.textContent = "";
    endTimeDisplay.textContent = "起床時間: --:--:--";
    
    const now = new Date();
    localStorage.setItem('sleepStartTime', now.getTime());
    
    startTimeDisplay.textContent = `就寝時間: ${formatTime(now)}`;
    durationDisplay.textContent = `睡眠時間: 計測中...`;
    
    startBtn.disabled = true;
    endBtn.disabled = false;
    
    targetInput.disabled = true;
    setTargetBtn.disabled = true;
    clearTargetBtn.disabled = true;
});

// ==========================================
// 計測終了（判定ロジック）
// ==========================================
endBtn.addEventListener('click', () => {
    const storedStartTimeStr = localStorage.getItem('sleepStartTime');
    const targetTimeStr = localStorage.getItem('targetWakeUpTime');

    if (!storedStartTimeStr) {
        errorMessage.textContent = "エラー: 計測データが見つかりません。";
        return;
    }

    const startTimeMs = parseInt(storedStartTimeStr, 10);
    const startTime = new Date(startTimeMs);
    const endTime = new Date();
    endTimeDisplay.textContent = `起床時間: ${formatTime(endTime)}`;

    const diffMs = endTime.getTime() - startTimeMs;
    const diffSec = Math.floor(diffMs / 1000);

    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;
    const durationText = `${hours}時間 ${minutes}分 ${seconds}秒`;
    durationDisplay.textContent = `睡眠時間: ${durationText}`;

    if (diffSec < MIN_DURATION_SEC) {
        errorMessage.textContent = `エラー: ${MIN_DURATION_SEC}秒未満は計測できません。`;
        finishMeasurement();
        return;
    }
    if (diffSec > MAX_DURATION_SEC) {
        errorMessage.textContent = `エラー: 5分（${MAX_DURATION_SEC}秒）を超えたため、計測を終了しました。`;
        finishMeasurement();
        return;
    }

    let isStampEarned = false; 

    if (targetTimeStr) {
        const [targetHour, targetMin] = targetTimeStr.split(':').map(Number);
        const targetDate = new Date(endTime);
        targetDate.setHours(targetHour, targetMin, 0, 0);

        const timeGapSec = (endTime.getTime() - targetDate.getTime()) / 1000;

        if (timeGapSec < -60) {
            feedbackMessage.textContent = "おはようございます！早起きですね！";
            feedbackMessage.style.color = "#3498db"; 
        } else if (timeGapSec > 60) {
            feedbackMessage.textContent = "寝坊ですかな？";
            feedbackMessage.style.color = "#e67e22"; 
        } else {
            feedbackMessage.textContent = "おはようございます！いい調子ですね！";
            feedbackMessage.style.color = "#2ecc71"; 
            isStampEarned = true;
        }
    } else {
        feedbackMessage.textContent = "おはようございます！結果はどうですか？";
        feedbackMessage.style.color = "#333333";
    }

    const dateKey = getLocalDateString(endTime); 
    const history = JSON.parse(localStorage.getItem('sleepAppHistory') || '{}');
    let totalStamps = parseInt(localStorage.getItem('sleepAppStamps') || '0', 10);
    let isBonusEarned = false;

    if (isStampEarned) {
        totalStamps += 1; 

        // 過去6日間連続でスタンプがあるかチェック
        let consecutiveDays = 1; 
        for (let i = 1; i <= 6; i++) {
            const checkDate = new Date(endTime);
            checkDate.setDate(checkDate.getDate() - i);
            const checkKey = getLocalDateString(checkDate);
            
            if (history[checkKey] && history[checkKey].hasStamp) {
                consecutiveDays++;
            } else {
                break; 
            }
        }

        // 7日連続を達成した場合
        if (consecutiveDays === 7) {
            totalStamps += 1; // ボーナススタンプを+1
            isBonusEarned = true;
            feedbackMessage.textContent += " 🎉 7日連続達成ボーナス！追加スタンプ獲得！";
            feedbackMessage.style.color = "#e74c3c"; 
        }
    }

    history[dateKey] = {
        start: formatTime(startTime),
        end: formatTime(endTime),
        duration: durationText,
        hasStamp: isStampEarned,
        isBonus: isBonusEarned 
    };
    
    localStorage.setItem('sleepAppHistory', JSON.stringify(history));
    localStorage.setItem('sleepAppStamps', totalStamps);
    
    updateStampDisplay(); 
    renderCalendar(); 
    finishMeasurement();
});

function finishMeasurement() {
    localStorage.removeItem('sleepStartTime');
    startBtn.disabled = false;
    endBtn.disabled = true;
    
    targetInput.disabled = false;
    setTargetBtn.disabled = false;
    clearTargetBtn.disabled = false;
}