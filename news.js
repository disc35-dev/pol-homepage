// お知らせを動的に読み込んで表示するスクリプト
const NEWS_STORAGE_KEY = 'pol_news_data';
const EVENT_STORAGE_KEY = 'pol_event_data';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 更新履歴(News)の読み込み
    await loadAndRenderNews(
        '.news-list',
        NEWS_STORAGE_KEY,
        'news.json',
        '更新履歴'
    );

    // 2. イベント情報の読み込み
    await loadAndRenderNews(
        '.event-news-list',
        EVENT_STORAGE_KEY,
        'event_news.json',
        'イベント情報'
    );
});

// 汎用的なニュース読み込み・表示関数
async function loadAndRenderNews(selector, storageKey, jsonFile, label) {
    const listElement = document.querySelector(selector);
    if (!listElement) return;

    try {
        let data = [];
        const storedData = localStorage.getItem(storageKey);

        if (storedData) {
            data = JSON.parse(storedData);
        } else {
            const response = await fetch(jsonFile);
            if (response.ok) {
                data = await response.json();
            }
        }

        listElement.innerHTML = '';
        if (data.length === 0) {
            listElement.innerHTML = `
                <dl class="news-item">
                    <dt>-</dt>
                    <dd>現在${label}はありません。</dd>
                </dl>`;
            return;
        }

        data.forEach(item => {
            const row = document.createElement('dl');

            // イベント情報の場合は特別なクラスを追加し、日付を表示しない
            if (label === 'イベント情報') {
                row.className = 'news-item event-item';
                // 日付要素は作成しない、または非表示にする
                // ここでは内容のみを表示する簡単な構造にする
                const dd = document.createElement('dd');
                dd.textContent = item.content;
                row.appendChild(dd);
            } else {
                // 通常のお知らせ
                row.className = 'news-item';

                const dt = document.createElement('dt');
                dt.textContent = item.date;

                const dd = document.createElement('dd');
                dd.textContent = item.content;

                row.appendChild(dt);
                row.appendChild(dd);
            }

            listElement.appendChild(row);
        });
    } catch (e) {
        console.error(`${label}の読み込みエラー:`, e);
        listElement.innerHTML = `
            <dl class="news-item">
                <dt>-</dt>
                <dd>読み込みに失敗しました。</dd>
            </dl>`;
    }
}

// お知らせを追加するヘルパー関数(管理者用: news.json作成サポート)
window.addNews = async function (content) {
    try {
        let newsData;

        // まずローカルストレージをチェック
        const storedData = localStorage.getItem(STORAGE_KEY);

        if (storedData) {
            newsData = JSON.parse(storedData);
        } else {
            // ローカルストレージにデータがない場合はJSONファイルから読み込み
            const response = await fetch('news.json');
            newsData = await response.json();
        }

        // 今日の日付を取得(YYYY.MM.DD形式)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}.${month}.${day}`;

        // 新しいお知らせを配列の先頭に追加
        const newNewsItem = {
            date: dateStr,
            content: content
        };
        newsData.unshift(newNewsItem);

        // ローカルストレージに保存
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newsData));
        console.log('お知らせをローカルストレージに保存しました');

        // JSONデータをコンソールに出力(バックアップ用)
        console.log('=== 更新されたお知らせデータ ===');
        console.log(JSON.stringify(newsData, null, 2));
        console.log('================================');

        alert(`お知らせを追加しました:\n${dateStr} - ${content}\n\n変更は自動的に保存されています。\nページをリロードすると反映されます。`);

        // ページをリロードして変更を反映
        if (confirm('ページをリロードして変更を反映しますか？')) {
            location.reload();
        }

        return newNewsItem;
    } catch (error) {
        console.error('お知らせの追加エラー:', error);
        alert('お知らせの追加に失敗しました: ' + error.message);
        return null;
    }
};

// 使用例をコンソールに表示
console.log('%c📢 お知らせ管理', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
console.log('お知らせはローカルストレージに保存されます。');
console.log('admin.htmlから管理するか、コンソールで以下のコマンドを実行してください:');
console.log('%caddNews("お知らせの内容");', 'font-size: 14px; background: #f0f0f0; padding: 5px;');
console.log('例: addNews("新商品「抹茶ケーキ」を追加しました。");');
