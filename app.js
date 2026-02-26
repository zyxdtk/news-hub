// 搜索功能
function searchFeed() {
    const input = document.getElementById('search-input');
    const filterText = input.value.toLowerCase();
    const taskFilter = document.getElementById('task-filter').value;
    const tagFilter = document.getElementById('tag-filter').value;
    
    const cards = document.querySelectorAll('.feed-card');
    
    cards.forEach(card => {
        const title = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
        const summary = (card.querySelector('.card-summary')?.textContent || '').toLowerCase();
        const tags = (card.querySelector('.card-tags')?.textContent || '').toLowerCase();
        const task = card.querySelector('.task-badge')?.textContent.toLowerCase() || '';
        
        const matchSearch = !filterText || title.includes(filterText) || summary.includes(filterText) || tags.includes(filterText);
        const matchTask = taskFilter === 'all' || task === taskFilter;
        const matchTag = tagFilter === 'all' || tags.includes(tagFilter.toLowerCase());
        
        if (matchSearch && matchTask && matchTag) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 筛选功能
function filterFeed() {
    searchFeed();
}

// 打开全文
function openFullText(id) {
    window.open(`full-text/${id}.html`, '_blank');
}

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
