// HTMLの要素を取得
const startBtn = document.getElementById('start-btn');
const endBtn = document.getElementById('end-btn');
const startTimeDisplay = document.getElementById('start-time-display');
const endTimeDisplay = document.getElementById('end-time-display');
const durationDisplay = document.getElementById('duration-display');
const errorMessage = document.getElementById('error-message');

function formatTime(date) {
    return date.toLocaleTimeString('ja-JP');
}

// 画面を開いた時の「復元」処理
const savedStartTime = localStorage.getItem('sleepStartTime');
if (savedStartTime) {
    const startTime = new Date(parseInt(savedStartTime, 10));
    startTimeDisplay.textContent = `就寝時間: ${formatTime(startTime)}`;
    durationDisplay.textContent = `睡眠時間: 計測中...`;
    startBtn.disabled = true;
    endBtn.disabled = false;
}

// 【1】計測を開始する処理
startBtn.addEventListener('click', () => {
    errorMessage.textContent = ""; // エラーをクリア
    
    const now = new Date(); 
    localStorage.setItem('sleepStartTime', now.getTime());
    
    startTimeDisplay.textContent = `就寝時間: ${formatTime(now)}`;
    endTimeDisplay.textContent = `起床時間: --:--:--`;
    durationDisplay.textContent = `睡眠時間: 計測中...`;

    startBtn.disabled = true;
    endBtn.disabled = false;
});

// 【2】計測を終了する処理
endBtn.addEventListener('click', () => {
    errorMessage.textContent = ""; // 古いエラーを一旦クリア

    const storedStartTimeStr = localStorage.getItem('sleepStartTime');
    if (!storedStartTimeStr) {
        errorMessage.textContent = "エラー: 計測データが見つかりません。";
        return;
    }

    const startTimeMs = parseInt(storedStartTimeStr, 10);
    const endTime = new Date();
    endTimeDisplay.textContent = `起床時間: ${formatTime(endTime)}`;

    // 差分の計算
    const diffMs = endTime.getTime() - startTimeMs;
    const diffSec = Math.floor(diffMs / 1000); // 経過時間を「秒」で取得

    // ==========================================
    // 【変更点】エラー判定の前に、まずは時間を計算して画面に表示してしまう
    // ==========================================
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;
    durationDisplay.textContent = `睡眠時間: ${hours}時間 ${minutes}分 ${seconds}秒`;

    // ==========================================
    // 【方針4: ユーザ入力の検証】最大値と最小値の判定
    // ==========================================
    if (diffSec < 5) {
        // 5秒未満の場合
        errorMessage.textContent = "エラー: 5秒未満は計測できません。";
    } 
    else if (diffSec > 15) {
        // 15秒を超えた場合
        errorMessage.textContent = "エラー: 15秒を超えたため、計測を終了しました。";
    } 
    // 正常な場合（5秒〜15秒）は、すでに時間が表示されておりエラーも無いのでそのまま

    // エラーが出た場合も正常終了の場合も、計測自体は終わるのでリセット処理を行う
    localStorage.removeItem('sleepStartTime');
    startBtn.disabled = false;
    endBtn.disabled = true;
});