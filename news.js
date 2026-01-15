// お知らせを動的に読み込んで表示するスクリプト
document.addEventListener('DOMContentLoaded', async () => {
    const newsListElement = document.querySelector('.news-list');

    if (!newsListElement) {
        console.warn('お知らせリストの要素が見つかりません');
        return;
    }

    try {
        // JSONファイルからお知らせデータを取得
        const response = await fetch('news.json');
        if (!response.ok) {
            throw new Error('お知らせデータの読み込みに失敗しました');
        }

        const newsData = await response.json();

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

// お知らせを追加するヘルパー関数（グローバルに公開）
window.addNews = async function (content) {
    try {
        // 現在のお知らせデータを取得
        const response = await fetch('news.json');
        const newsData = await response.json();

        // 今日の日付を取得（YYYY.MM.DD形式）
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

        // JSONデータをコンソールに出力（手動でコピーしてnews.jsonに保存）
        console.log('=== 更新されたお知らせデータ ===');
        console.log(JSON.stringify(newsData, null, 2));
        console.log('================================');
        console.log('上記のJSONデータをコピーして、news.jsonファイルに保存してください。');

        // ブラウザでダウンロード可能にする
        const blob = new Blob([JSON.stringify(newsData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'news.json';
        a.textContent = 'news.jsonをダウンロード';
        a.style.cssText = 'position:fixed;top:10px;right:10px;z-index:10000;background:#4CAF50;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;box-shadow:0 2px 10px rgba(0,0,0,0.2);';
        document.body.appendChild(a);

        // 3秒後に自動削除
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 10000);

        alert(`お知らせを追加しました:\n${dateStr} - ${content}\n\n右上のリンクから更新されたnews.jsonをダウンロードして、元のファイルと置き換えてください。`);

        return newNewsItem;
    } catch (error) {
        console.error('お知らせの追加エラー:', error);
        alert('お知らせの追加に失敗しました: ' + error.message);
        return null;
    }
};

// 使用例をコンソールに表示
console.log('%c📢 お知らせ追加方法', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
console.log('コンソールで以下のコマンドを実行してください:');
console.log('%caddNews("お知らせの内容");', 'font-size: 14px; background: #f0f0f0; padding: 5px;');
console.log('例: addNews("新商品「抹茶ケーキ」を追加しました。");');
