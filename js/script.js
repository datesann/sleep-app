// 要素の取得
const targetInput = document.getElementById('target-time-input');
const setTargetBtn = document.getElementById('set-target-btn');
const currentTargetDisplay = document.getElementById('current-target-display');

const startBtn = document.getElementById('start-btn');
const endBtn = document.getElementById('end-btn');
const startTimeDisplay = document.getElementById('start-time-display');
const endTimeDisplay = document.getElementById('end-time-display');
const durationDisplay = document.getElementById('duration-display');
const feedbackMessage = document.getElementById('feedback-message');
const errorMessage = document.getElementById('error-message');

// 定数の設定
const MIN_DURATION_SEC = 3;   // 最小3秒
const MAX_DURATION_SEC = 300; // 最大5分 (300秒)

function formatTime(date) {
    return date.toLocaleTimeString('ja-JP');
}

// ==========================================
// 目標時間の管理
// ==========================================
function updateTargetDisplay() {
    const savedTarget = localStorage.getItem('targetWakeUpTime');
    currentTargetDisplay.textContent = savedTarget ? `現在の目標: ${savedTarget}` : "現在の目標: 未設定";
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

// ==========================================
// 画面起動時の復元処理
// ==========================================
updateTargetDisplay();

const savedStartTime = localStorage.getItem('sleepStartTime');
if (savedStartTime) {
    const startTime = new Date(parseInt(savedStartTime, 10));
    startTimeDisplay.textContent = `就寝時間: ${formatTime(startTime)}`;
    durationDisplay.textContent = `睡眠時間: 計測中...`;
    startBtn.disabled = true;
    endBtn.disabled = false;
}

// ==========================================
// 計測開始
// ==========================================
startBtn.addEventListener('click', () => {
    if (!localStorage.getItem('targetWakeUpTime')) {
        errorMessage.textContent = "エラー: 先に起床目標時間を設定してください。";
        return;
    }
    
    errorMessage.textContent = "";
    feedbackMessage.textContent = "";
    const now = new Date();
    localStorage.setItem('sleepStartTime', now.getTime());
    
    startTimeDisplay.textContent = `就寝時間: ${formatTime(now)}`;
    durationDisplay.textContent = `睡眠時間: 計測中...`;
    startBtn.disabled = true;
    endBtn.disabled = false;
});

// ==========================================
// 計測終了（判定ロジック）
// ==========================================
endBtn.addEventListener('click', () => {
    const storedStartTimeStr = localStorage.getItem('sleepStartTime');
    const targetTimeStr = localStorage.getItem('targetWakeUpTime');

    if (!storedStartTimeStr || !targetTimeStr) {
        errorMessage.textContent = "エラー: データが不足しています。";
        return;
    }

    const startTimeMs = parseInt(storedStartTimeStr, 10);
    const endTime = new Date();
    endTimeDisplay.textContent = `起床時間: ${formatTime(endTime)}`;

    // 1. 睡眠時間の計算
    const diffMs = endTime.getTime() - startTimeMs;
    const diffSec = Math.floor(diffMs / 1000);

    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;
    durationDisplay.textContent = `睡眠時間: ${hours}時間 ${minutes}分 ${seconds}秒`;

    // 2. 計測時間のバリデーション（方針4: 入力検証）
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

    // 3. 起床時刻のフィードバック判定
    const [targetHour, targetMin] = targetTimeStr.split(':').map(Number);
    const targetDate = new Date(endTime); // 起床日と同じ日付でオブジェクト作成
    targetDate.setHours(targetHour, targetMin, 0, 0);

    // 実際の起床時間と目標時間の差（秒）を計算
    const timeGapSec = (endTime.getTime() - targetDate.getTime()) / 1000;

    if (timeGapSec < -5) {
        feedbackMessage.textContent = "おはようございます！早起きですね！";
        feedbackMessage.style.color = "#3498db"; // 青系
    } else if (timeGapSec > 5) {
        feedbackMessage.textContent = "寝坊ですかな？";
        feedbackMessage.style.color = "#e67e22"; // オレンジ系
    } else {
        feedbackMessage.textContent = "おはようございます！いい調子ですね！";
        feedbackMessage.style.color = "#2ecc71"; // 緑系
    }

    finishMeasurement();
});

function finishMeasurement() {
    localStorage.removeItem('sleepStartTime');
    startBtn.disabled = false;
    endBtn.disabled = true;
}