document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reservation-form');
    const successMessage = document.getElementById('success-message');
    const formContainer = document.querySelector('.reservation-form');

    // 今日の日付を取得して、受取希望日の最小値を設定
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    document.getElementById('pickup-date').setAttribute('min', minDate);

    // フォーム送信処理
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // フォームデータを取得
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            product: document.getElementById('product').value,
            quantity: document.getElementById('quantity').value,
            pickupDate: document.getElementById('pickup-date').value,
            pickupTime: document.getElementById('pickup-time').value,
            notes: document.getElementById('notes').value
        };

        // 送信ボタンを無効化
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = '送信中...';

        try {
            // LINE通知を送信
            await sendLineNotification(formData);

            // 成功メッセージを表示
            formContainer.style.display = 'none';
            successMessage.style.display = 'block';

            // フォームをリセット
            form.reset();
        } catch (error) {
            console.error('送信エラー:', error);
            alert('送信に失敗しました。もう一度お試しください。\n\nエラー: ' + error.message);
        } finally {
            // 送信ボタンを再度有効化
            submitButton.disabled = false;
            submitButton.textContent = '予約する';
        }
    });

    // LINE通知を送信する関数
    async function sendLineNotification(data) {
        // LINE Notify APIのアクセストークン
        // 注意: 本番環境では、このトークンをサーバーサイドで管理してください
        const LINE_NOTIFY_TOKEN = 'YOUR_LINE_NOTIFY_TOKEN_HERE';

        // 通知メッセージを作成
        const message = `
【お取り置き予約】

お名前: ${data.name}
電話番号: ${data.phone}
${data.email ? `メール: ${data.email}` : ''}
商品: ${data.product}
数量: ${data.quantity}個
受取日時: ${data.pickupDate} ${data.pickupTime}
${data.notes ? `備考: ${data.notes}` : ''}

※ お客様へのご連絡をお願いします
        `.trim();

        // デモモード: 実際のLINE APIを呼び出さずにシミュレート
        if (LINE_NOTIFY_TOKEN === 'YOUR_LINE_NOTIFY_TOKEN_HERE') {
            console.log('=== デモモード ===');
            console.log('LINE通知メッセージ:');
            console.log(message);
            console.log('================');

            // デモ用の遅延
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('【デモモード】\n\nLINE通知が送信されました（シミュレーション）\n\n実際の通知内容:\n' + message);
            return;
        }

        // 実際のLINE Notify API呼び出し
        const response = await fetch('https://notify-api.line.me/api/notify', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                message: message
            })
        });

        if (!response.ok) {
            throw new Error(`LINE通知の送信に失敗しました (${response.status})`);
        }

        const result = await response.json();
        console.log('LINE通知送信成功:', result);
    }

    // 電話番号の自動フォーマット
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^\d]/g, '');
        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        // ハイフンを自動挿入
        if (value.length > 6) {
            value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
        } else if (value.length > 3) {
            value = value.slice(0, 3) + '-' + value.slice(3);
        }

        e.target.value = value;
    });

    // 数量の検証
    const quantityInput = document.getElementById('quantity');
    quantityInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value < 1) {
            e.target.value = 1;
        } else if (value > 99) {
            e.target.value = 99;
        }
    });
});
