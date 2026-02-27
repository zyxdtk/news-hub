// 全局变量
let currentArticle = null;
let translatedContent = null;
let activeFilters = [];  // 当前激活的筛选条件 [{type: 'task', value: 'agi-watcher'}, ...]

// 添加筛选条件
function addFilter(type, value) {
    // 检查是否已存在
    const exists = activeFilters.some(f => f.type === type && f.value === value);
    if (exists) return;
    
    activeFilters.push({ type, value });
    renderFilters();
    filterNews();
}

// 移除筛选条件
function removeFilter(index) {
    activeFilters.splice(index, 1);
    renderFilters();
    filterNews();
}

// 清除所有筛选
function clearFilters() {
    activeFilters = [];
    renderFilters();
    filterNews();
}

// 渲染筛选标签
function renderFilters() {
    const container = document.getElementById('active-filters');
    if (!container) return;
    
    if (activeFilters.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    activeFilters.forEach((filter, index) => {
        const label = filter.value;
        html += `<span class="filter-tag">
            ${filter.type === 'task' ? '📋' : filter.type === 'date' ? '📅' : filter.type === 'tag' ? '🏷️' : '🌐'} ${label}
            <span class="remove" onclick="removeFilter(${index})">×</span>
        </span>`;
    });
    
    container.innerHTML = html;
}

// 来源过滤
document.addEventListener('DOMContentLoaded', () => {
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

// 搜索和筛选功能
function searchNews() {
    filterNews();  // 使用统一的筛选逻辑
}

// 筛选逻辑（支持多个筛选条件，且的关系）
function filterNews() {
    const input = document.getElementById('search-input');
    const filterText = input ? input.value.toLowerCase() : '';
    
    const newsCards = document.querySelectorAll('.news-card');
    
    newsCards.forEach(card => {
        const title = (card.dataset.title || '').toLowerCase();
        const titleZh = (card.dataset.titleZh || '').toLowerCase();
        const tags = (card.dataset.tags || '').toLowerCase();
        const task = (card.dataset.task || '').toLowerCase();
        const date = (card.dataset.date || '').toLowerCase();
        const source = (card.dataset.source || '').toLowerCase();
        
        // 检查搜索词
        const matchSearch = !filterText || 
                           title.includes(filterText) || 
                           titleZh.includes(filterText) || 
                           tags.includes(filterText);
        
        // 检查所有筛选条件（且的关系）
        let matchAllFilters = true;
        for (const filter of activeFilters) {
            if (filter.type === 'task' && task !== filter.value.toLowerCase()) {
                matchAllFilters = false;
                break;
            }
            if (filter.type === 'date' && date !== filter.value.toLowerCase()) {
                matchAllFilters = false;
                break;
            }
            if (filter.type === 'tag' && !tags.includes(filter.value.toLowerCase())) {
                matchAllFilters = false;
                break;
            }
            if (filter.type === 'source' && source !== filter.value.toLowerCase()) {
                matchAllFilters = false;
                break;
            }
        }
        
        if (matchSearch && matchAllFilters) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

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
