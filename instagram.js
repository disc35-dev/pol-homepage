// Instagram Feed Loader
// Note: This requires proper Instagram API credentials (Meta/Facebook App)
// The provided Google Cloud credentials cannot be used for Instagram API

document.addEventListener('DOMContentLoaded', () => {
    // Instagram configuration
    const INSTAGRAM_CONFIG = {
        // TODO: Replace with actual Instagram Access Token from Meta
        accessToken: 'YOUR_INSTAGRAM_ACCESS_TOKEN',
        userId: 'YOUR_USER_ID',
        limit: 9 // Number of posts to display
    };

    const instagramFeed = document.getElementById('instagram-feed');

    // Function to load Instagram posts
    async function loadInstagramPosts() {
        // Check if access token is configured
        if (INSTAGRAM_CONFIG.accessToken === 'YOUR_INSTAGRAM_ACCESS_TOKEN') {
            console.warn('Instagram Access Token not configured. Please add your Meta App credentials.');
            showPlaceholder();
            return;
        }

        try {
            // Instagram Basic Display API endpoint
            const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url&access_token=${INSTAGRAM_CONFIG.accessToken}&limit=${INSTAGRAM_CONFIG.limit}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                console.error('Instagram API Error:', data.error);
                showError(data.error.message);
                return;
            }

            if (data.data && data.data.length > 0) {
                renderPosts(data.data);
            } else {
                showPlaceholder();
            }
        } catch (error) {
            console.error('Failed to load Instagram posts:', error);
            showError('投稿の読み込みに失敗しました。');
        }
    }

    // Render Instagram posts
    function renderPosts(posts) {
        instagramFeed.innerHTML = '';

        posts.forEach(post => {
            const item = document.createElement('div');
            item.className = 'instagram-item';

            const link = document.createElement('a');
            link.href = post.permalink;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            const img = document.createElement('img');
            // Use thumbnail for videos, media_url for images
            img.src = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
            img.alt = post.caption ? post.caption.substring(0, 100) : 'Instagram post';
            img.loading = 'lazy';

            link.appendChild(img);
            item.appendChild(link);
            instagramFeed.appendChild(item);
        });
    }

    // Show placeholder
    function showPlaceholder() {
        instagramFeed.innerHTML = `
            <div class="instagram-item instagram-placeholder">
                <div class="instagram-placeholder-content">
                    <p>Instagram APIの設定が必要です</p>
                    <small>Meta App認証情報を追加してください</small>
                </div>
            </div>
        `;
    }

    // Show error message
    function showError(message) {
        instagramFeed.innerHTML = `
            <div class="instagram-item instagram-placeholder">
                <div class="instagram-placeholder-content">
                    <p>エラー: ${message}</p>
                </div>
            </div>
        `;
    }

    // Load posts on page load
    loadInstagramPosts();
});
