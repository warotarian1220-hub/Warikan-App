// ==========================================
// 1. PWA Service Worker の登録
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker 登録完了！', reg))
            .catch(err => console.log('Service Worker 登録失敗...', err));
    });
}

// ==========================================
// 2. 割り勘計算メインロジック
// ==========================================
function calculate() {
    const total = Number(document.getElementById('total').value);
    const numPeople = Number(document.getElementById('numPeople').value);
    const hasDriver = document.getElementById('hasDriver').checked;
    const resultDiv = document.getElementById('result');

    // バリデーション（3人以上のルールを適用）
    if (!total || total <= 0) {
        resultDiv.innerHTML = "合計金額を正しく入力してください";
        return;
    }
    if (!numPeople || numPeople < 3) {
        resultDiv.innerHTML = "人数は3人以上で入力してください";
        return;
    }

    let mode = "通常モード";
    let memberPay = 0;
    let driverPay = 0;

    // 1人あたりの平均を出す
    const avg = total / numPeople;

    // 運転手アリ ＆ 1人1,000円以上のときだけ「感謝モード」
    if (hasDriver && avg >= 1000) {
        mode = "運転手に感謝モード適用中";

        // ① まずはメンバーの支払額を「100円単位切り上げ」で仮決め
        // (合計 - 1000) をベースに計算を始める
        memberPay = Math.ceil(((total - 1000) / numPeople) / 100) * 100;

        // ② 運転手の支払額は「合計 - メンバー全員分」で計算
        driverPay = total - (memberPay * (numPeople - 1));

        // ③ 【1,000円最低保証】差額が足りなければ、メンバーの支払いを100円ずつ上げる
        while ((memberPay - driverPay) < 1000) {
            memberPay += 100;
            driverPay = total - (memberPay * (numPeople - 1));
        }
    } else {
        // 通常モード（シンプルに100円単位切り上げ）
        memberPay = Math.ceil(avg / 100) * 100;
        driverPay = total - (memberPay * (numPeople - 1)); // 最後の1人で端数調整
        
        mode = hasDriver ? "感謝モード対象外(少額のため)" : "通常モード";
    }

    // --- 表示用HTMLの組み立て ---
    let html = `<p><strong>【${mode}】</strong></p><ul>`;
    for (let i = 0; i < numPeople; i++) {
        // 0番目を運転手とする
        if (i === 0 && hasDriver && mode === "運転手に感謝モード適用中") {
            html += `<li>🚗 運転手: <strong>${Math.floor(driverPay).toLocaleString()}円</strong></li>`;
        } else {
            html += `<li>👤 メンバー: ${Math.floor(memberPay).toLocaleString()}円</li>`;
        }
    }
    html += "</ul>";
    
    // 合計の検算表示
    const actualTotal = (memberPay * (numPeople - 1)) + driverPay;
    html += `<p style="font-size:0.8em; color:gray; margin-top:10px;">(計算上の合計精算額: ${actualTotal.toLocaleString()}円)</p>`;
    
    resultDiv.innerHTML = html;
}