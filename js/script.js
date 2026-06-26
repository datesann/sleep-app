// HTMLの要素を取得
const startBtn = document.getElementById('start-btn');
const endBtn = document.getElementById('end-btn');
const startTimeDisplay = document.getElementById('start-time-display');
const endTimeDisplay = document.getElementById('end-time-display');
const durationDisplay = document.getElementById('duration-display');
const errorMessage = document.getElementById('error-message');

// 時間を見やすい形式（HH:MM:SS）に変換する関数
function formatTime(date) {
    return date.toLocaleTimeString('ja-JP');
}

// ==========================================
// 【追加機能】画面を開いた時の「復元」処理
// ==========================================
// ブラウザの記憶（localStorage）から、保存された開始時間を取り出す
const savedStartTime = localStorage.getItem('sleepStartTime');

if (savedStartTime) {
    // もし記憶が残っていたら（計測中にブラウザを閉じて、また開いた時）
    // 文字列として保存されている時間を、計算できる数値（Date）に戻す
    const startTime = new Date(parseInt(savedStartTime, 10));
    
    // 画面の表示を「計測中」の状態に復元する
    startTimeDisplay.textContent = `就寝時間: ${formatTime(startTime)}`;
    durationDisplay.textContent = `睡眠時間: 計測中...`;
    
    // ボタンの状態も復元
    startBtn.disabled = true;
    endBtn.disabled = false;
}

// ==========================================
// 【1】計測を開始する処理
// ==========================================
startBtn.addEventListener('click', () => {
    errorMessage.textContent = ""; 
    
    // 現在の時刻を取得
    const now = new Date(); 
    
    // 【重要】開始時間をブラウザに記憶させる！（ミリ秒という細かい数値にして保存）
    localStorage.setItem('sleepStartTime', now.getTime());
    
    startTimeDisplay.textContent = `就寝時間: ${formatTime(now)}`;
    endTimeDisplay.textContent = `起床時間: --:--:--`;
    durationDisplay.textContent = `睡眠時間: 計測中...`;

    startBtn.disabled = true;
    endBtn.disabled = false;
});

// ==========================================
// 【2】計測を終了する処理
// ==========================================
endBtn.addEventListener('click', () => {
    // 終了時は、ブラウザの記憶（localStorage）から開始時間を引っ張り出す
    const storedStartTimeStr = localStorage.getItem('sleepStartTime');
    
    if (!storedStartTimeStr) {
        errorMessage.textContent = "エラー: 計測データが見つかりません。";
        return;
    }

    // 記憶していた時間を数値に戻す
    const startTimeMs = parseInt(storedStartTimeStr, 10);
    const endTime = new Date();
    
    endTimeDisplay.textContent = `起床時間: ${formatTime(endTime)}`;

    // --- 【3】睡眠時間の計算 ---
    // 終了時間（ミリ秒） - 開始時間（ミリ秒）
    const diffMs = endTime.getTime() - startTimeMs;

    const diffSec = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    durationDisplay.textContent = `睡眠時間: ${hours}時間 ${minutes}分 ${seconds}秒`;

    // 【重要】計測が終わったので、ブラウザの記憶を消去してリセットする
    localStorage.removeItem('sleepStartTime');

    startBtn.disabled = false;
    endBtn.disabled = true;
});