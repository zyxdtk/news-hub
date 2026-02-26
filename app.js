// 全局变量
let currentArticle = null;
let translatedContent = null;

// 来源过滤
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const newsCards = document.querySelectorAll('.news-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const source = btn.dataset.source;
            newsCards.forEach(card => {
                if (source === 'all' || card.classList.contains(`source-${source}`)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 下拉刷新
    let startY = 0;
    document.addEventListener('touchstart', e => {
        startY = e.touches[0].clientY;
    });
    document.addEventListener('touchend', e => {
        const endY = e.changedTouches[0].clientY;
        if (endY - startY > 100 && window.scrollY === 0) {
            location.reload();
        }
    });
});

// 显示文章详情
function showArticle(event, link) {
    event.preventDefault();
    const card = link.closest('.news-card');
    const title = card.querySelector('h3 a').textContent;
    const url = card.dataset.url;
    
    currentArticle = { title, url };
    translatedContent = null;
    
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-original').href = url;
    document.getElementById('modal-content').innerHTML = '';
    document.getElementById('modal-loading').style.display = 'block';
    document.getElementById('modal-translate-btn').style.display = 'inline-block';
    document.getElementById('article-modal').style.display = 'flex';
    
    // 自动开始翻译
    translateCurrentArticle();
}

// 关闭弹窗
function closeModal(event) {
    if (event.target === document.getElementById('article-modal')) {
        document.getElementById('article-modal').style.display = 'none';
    }
}

// 翻译文章
async function translateCurrentArticle() {
    if (!currentArticle) return;
    
    const contentDiv = document.getElementById('modal-content');
    const loadingDiv = document.getElementById('modal-loading');
    const translateBtn = document.getElementById('modal-translate-btn');
    
    loadingDiv.style.display = 'block';
    contentDiv.innerHTML = '';
    translateBtn.disabled = true;
    translateBtn.textContent = '🤖 翻译中...';
    
    try {
        // 调用本地翻译 API（需要后端支持）
        // 这里使用一个简单的方案：调用 Ollama API
        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen2.5:7b',
                prompt: `请翻译以下网页内容为中文，只返回翻译结果：\n\nURL: ${currentArticle.url}\n\n标题：${currentArticle.title}\n\n请提供完整的中文翻译：`,
                stream: false
            })
        });
        
        const data = await response.json();
        translatedContent = data.response || '翻译失败';
        contentDiv.innerHTML = translatedContent.replace(/\n/g, '<br>');
    } catch (error) {
        console.error('翻译失败:', error);
        contentDiv.innerHTML = `<p>⚠️ 翻译失败，请查看原文：</p><a href="${currentArticle.url}" target="_blank">${currentArticle.url}</a>`;
    }
    
    loadingDiv.style.display = 'none';
    translateBtn.disabled = false;
    translateBtn.textContent = '🌐 重新翻译';
}

// ESC 关闭弹窗
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.getElementById('article-modal').style.display = 'none';
    }
});
