window.onerror = function (msg, url, lineNo, columnNo, error) {
    alert('システムエラーが発生しました: ' + msg);
    return false;
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reservation-form');
    const successMessage = document.getElementById('success-message');
    const formContainer = document.querySelector('.reservation-form');
    const totalPriceSpan = document.getElementById('total-price');

    // Submitボタンのクリックイベントでバリデーションチェックを明示的に行う
    // (モバイルでHTML5バリデーションが沈黙する場合の対策)
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.addEventListener('click', (e) => {
        if (!form.checkValidity()) {
            const invalidInput = form.querySelector(':invalid');
            if (invalidInput) {
                // ラベルを取得してエラーメッセージを作成
                const label = form.querySelector(`label[for="${invalidInput.id}"]`);
                let fieldName = "入力項目";
                if (label) {
                    fieldName = label.textContent.replace('*', '').trim();
                } else if (invalidInput.name === 'product') {
                    fieldName = '商品';
                }

                alert(`「${fieldName}」を確認してください。\n必須項目か、入力内容が正しくありません。`);
            }
        }
    });

    // 今日の日付を取得して、受取希望日の最小値を設定
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    document.getElementById('pickup-date').setAttribute('min', minDate);

    // 商品チェックボックスと数量入力の連動 & 合計金額計算
    const productCheckboxes = document.querySelectorAll('input[name="product"]');

    productCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const quantityInput = document.getElementById(this.id.replace('prod-', 'qty-'));

            if (this.checked) {
                quantityInput.disabled = false;
            } else {
                quantityInput.disabled = true;
                quantityInput.value = 1; // リセット
            }

            calculateTotal();
        });
    });

    // 数量入力変更時の合計金額計算
    const quantityInputs = document.querySelectorAll('.product-quantity-input input');
    quantityInputs.forEach(input => {
        input.addEventListener('input', calculateTotal);

        // 数量の有効範囲チェック
        input.addEventListener('change', function () {
            if (this.value < 1) this.value = 1;
        });
    });

    // 合計金額を計算する関数
    function calculateTotal() {
        let total = 0;
        const summaryContainer = document.getElementById('selected-products-summary');
        let summaryHtml = '<div class="summary-title">選択中の商品:</div><ul>';
        let hasSelected = false;

        productCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const label = document.querySelector(`label[for="${checkbox.id}"]`).textContent.split('(')[0].trim();
                const price = parseInt(checkbox.getAttribute('data-price'));
                const quantityInput = document.getElementById(checkbox.id.replace('prod-', 'qty-'));
                const quantity = parseInt(quantityInput.value) || 0;

                total += price * quantity;
                summaryHtml += `<li>${label}: ${quantity}個 (¥${price.toLocaleString()})</li>`;
                hasSelected = true;
            }
        });

        summaryHtml += '</ul>';
        totalPriceSpan.textContent = total.toLocaleString();

        if (hasSelected) {
            summaryContainer.innerHTML = summaryHtml;
            summaryContainer.style.display = 'block';
        } else {
            summaryContainer.style.display = 'none';
        }
    }

    // フォーム送信処理
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 商品が選択されているかチェック
        const selectedProducts = Array.from(productCheckboxes).filter(cb => cb.checked);
        if (selectedProducts.length === 0) {
            alert('商品を少なくとも1つ選択してください。');
            return;
        }

        // 商品データの収集
        const productList = selectedProducts.map(checkbox => {
            const name = checkbox.value;
            const price = parseInt(checkbox.getAttribute('data-price'));
            const quantityInput = document.getElementById(checkbox.id.replace('prod-', 'qty-'));
            const quantity = parseInt(quantityInput.value);
            return { name, price, quantity, subtotal: price * quantity };
        });

        const total = parseInt(totalPriceSpan.textContent.replace(/,/g, ''));

        // フォームデータを取得
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            products: productList,
            totalPrice: total,
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
            productCheckboxes.forEach(cb => {
                const qtyInput = document.getElementById(cb.id.replace('prod-', 'qty-'));
                qtyInput.disabled = true;
            });
            calculateTotal();

        } catch (error) {
            console.error('送信エラー:', error);
            alert('送信に失敗しました。もう一度お試しください。\n\nエラー: ' + error.message);
        } finally {
            // 送信ボタンを再度有効化
            submitButton.disabled = false;
            submitButton.textContent = '予約する';
        }
    });

    // LINE Notify (GASプロキシ) 経由で通知を送信する関数
    async function sendLineNotification(data) {
        // LINE Messaging API への通知を中継する GAS の URL
        const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwZDuTaGVVWnJmaDrEGDq19BM4Xon8sEX1qgUwh9egN-54hEGtXeht-1Zc5gjDhCa0g/exec';

        // 商品リストのテキスト作成
        const productsText = data.products.map(p =>
            `・${p.name}: ${p.quantity}個 (¥${(p.price * p.quantity).toLocaleString()})`
        ).join('\n');

        // メッセージを作成
        const message = `
【お取り置き予約】
お名前: ${data.name}
電話番号: ${data.phone}
${data.email ? `メール: ${data.email}` : ''}

■ご注文内容
${productsText}
合計金額: ¥${data.totalPrice.toLocaleString()}

受取日時: ${data.pickupDate} ${data.pickupTime}
${data.notes ? `備考: ${data.notes}` : ''}
`.trim();

        console.log('Sending message verbatim to GAS:', message);

        // 【重要】フロント側で正しくデータが取得できているか確認するためのアラートです。
        // ここで正しい内容が表示されるのに通知が空の場合、GAS/LINE側の問題です。
        alert("以下の内容で送信を試みます：\n\n" + message);

        try {
            // GASへデータを送信
            // JSONパースのエラーを避けるため、メッセージ本文（テキスト）をそのまま送信します。
            const response = await fetch(GAS_WEBAPP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: message // テキストをそのまま送る
            });

            console.log('Verbatim message sent to GAS.');
            return Promise.resolve();
        } catch (fetchError) {
            console.error('Fetch operation failed:', fetchError);
            throw new Error('ネットワーク送信に失敗しました: ' + fetchError.message);
        }
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

    // init
    calculateTotal();
});
