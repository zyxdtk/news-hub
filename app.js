// 来源过滤
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const newsCards = document.querySelectorAll('.news-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有 active 类
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
