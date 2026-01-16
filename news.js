// お知らせを動的に読み込んで表示するスクリプト
const STORAGE_KEY = 'pol_news_data';

document.addEventListener('DOMContentLoaded', async () => {
    const newsListElement = document.querySelector('.news-list');

    if (!newsListElement) {
        console.warn('お知らせリストの要素が見つかりません');
        return;
    }

    try {
        let newsData = [];
        
        // まずローカルストレージをチェック(管理者のプレビュー用)
        const storedData = localStorage.getItem(STORAGE_KEY);

        if (storedData) {
            newsData = JSON.parse(storedData);
            console.log('ローカルストレージからお知らせを読み込みました(プレビューモード)');
        } else {
            // ローカルストレージになければnews.jsonから読み込み(通常ユーザー)
            const response = await fetch('news.json');
            if (!response.ok) {
                throw new Error('お知らせデータの読み込みに失敗しました');
            }
            newsData = await response.json();
            console.log('news.jsonからお知らせを読み込みました');
        }

        // お知らせリストをクリア
        newsListElement.innerHTML = '';

        // 各お知らせをHTMLに変換して追加
        newsData.forEach(news => {
            const newsItem = document.createElement('dl');
            newsItem.className = 'news-item';

            const dt = document.createElement('dt');
            dt.textContent = news.date;

            const dd = document.createElement('dd');
            dd.textContent = news.content;

            newsItem.appendChild(dt);
            newsItem.appendChild(dd);
            newsListElement.appendChild(newsItem);
        });

        console.log(`${newsData.length}件のお知らせを読み込みました`);
    } catch (error) {
        console.error('お知らせの読み込みエラー:', error);
        // エラー時はデフォルトメッセージを表示
        newsListElement.innerHTML = `
            <dl class="news-item">
                <dt>-</dt>
                <dd>お知らせの読み込みに失敗しました。</dd>
            </dl>
        `;
    }
});

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
