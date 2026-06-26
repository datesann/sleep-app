// HTMLの要素を取得
const startBtn = document.getElementById('start-btn');
const endBtn = document.getElementById('end-btn');
const startTimeDisplay = document.getElementById('start-time-display');
const endTimeDisplay = document.getElementById('end-time-display');
const durationDisplay = document.getElementById('duration-display');
const errorMessage = document.getElementById('error-message');

// 開始時間を記録するための変数
let startTime = null;

// 時間を見やすい形式（HH:MM:SS）に変換する関数
function formatTime(date) {
    return date.toLocaleTimeString('ja-JP');
}

// --- 【1】計測を開始する処理 ---
startBtn.addEventListener('click', () => {
    errorMessage.textContent = ""; // エラー表示をクリア
    
    // 現在の時刻を取得して保存
    startTime = new Date(); 
    
    // 画面に開始時間を表示
    startTimeDisplay.textContent = `就寝時間: ${formatTime(startTime)}`;
    endTimeDisplay.textContent = `起床時間: --:--:--`;
    durationDisplay.textContent = `睡眠時間: 計測中...`;

    // 【方針4: ユーザ入力検証】
    // 開始ボタンを押せなくし、終了ボタンを押せるようにする（二重計測防止）
    startBtn.disabled = true;
    endBtn.disabled = false;
});

// --- 【2】計測を終了する処理 ---
endBtn.addEventListener('click', () => {
    // 【方針4: ユーザ入力検証】
    // 何らかの理由で開始時間が無いのに終了が押された場合の防御処理
    if (!startTime) {
        errorMessage.textContent = "エラー: 先に計測を開始してください。";
        return;
    }

    // 現在の時刻（起床時間）を取得
    const endTime = new Date();
    endTimeDisplay.textContent = `起床時間: ${formatTime(endTime)}`;

    // --- 【3】睡眠時間の計算 ---
    // JavaScriptでは日付同士を引き算すると「ミリ秒（1/1000秒）」で差分が出ます
    const diffMs = endTime - startTime;

    // ミリ秒を秒に変換
    const diffSec = Math.floor(diffMs / 1000);
    
    // 秒から「時間」「分」「秒」を割り出す
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    // 計算結果を画面に表示
    durationDisplay.textContent = `睡眠時間: ${hours}時間 ${minutes}分 ${seconds}秒`;

    // 次の計測ができるようにボタンと変数の状態をリセット
    startBtn.disabled = false;
    endBtn.disabled = true;
    startTime = null; 
});