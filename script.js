// ========== 侧边栏状态管理 ==========
// 侧边栏展开/折叠状态（使用 localStorage 持久化）
// 默认折叠 (collapsed: true)，首次访问时侧边栏隐藏
let sidebarState = {
    collapsed: true,
    sections: {
        task: false,
        source: false,
        date: false
    }
};

// 从 localStorage 加载侧边栏状态
function loadSidebarState() {
    try {
        const saved = localStorage.getItem('news_hub_sidebar');
        if (saved) {
            sidebarState = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load sidebar state:', e);
    }
}

// 保存侧边栏状态到 localStorage
function saveSidebarState() {
    try {
        localStorage.setItem('news_hub_sidebar', JSON.stringify(sidebarState));
    } catch (e) {
        console.error('Failed to save sidebar state:', e);
    }
}

// 切换侧边栏展开/折叠
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebarState.collapsed = !sidebarState.collapsed;
    
    if (sidebarState.collapsed) {
        // 折叠：隐藏侧边栏
        sidebar.classList.add('collapsed');
        if (mainContent) mainContent.classList.remove('with-sidebar');
        if (overlay) overlay.style.display = 'none';
    } else {
        // 展开：显示侧边栏
        sidebar.classList.remove('collapsed');
        if (mainContent) mainContent.classList.add('with-sidebar');
        if (window.innerWidth <= 768 && overlay) overlay.style.display = 'block';
    }
    
    saveSidebarState();
}

// 关闭侧边栏（移动端）
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebarState.collapsed = true;
    sidebar.classList.add('collapsed');
    if (mainContent) mainContent.classList.remove('with-sidebar');
    if (overlay) overlay.style.display = 'none';
    
    saveSidebarState();
}

// 切换导航分区展开/折叠
function toggleNavSection(section) {
    const content = document.getElementById('nav-' + section);
    const header = content.previousElementSibling;
    
    sidebarState.sections[section] = !sidebarState.sections[section];
    
    if (sidebarState.sections[section]) {
        content.classList.remove('collapsed');
        header.classList.remove('collapsed');
    } else {
        content.classList.add('collapsed');
        header.classList.add('collapsed');
    }
    
    saveSidebarState();
}

// 应用侧边栏状态
function applySidebarState() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('sidebarOverlay');
    
    // 应用侧边栏折叠状态（默认折叠）
    if (sidebarState.collapsed && sidebar) {
        sidebar.classList.add('collapsed');
        if (mainContent) mainContent.classList.remove('with-sidebar');
    } else if (sidebar) {
        sidebar.classList.remove('collapsed');
        if (mainContent) mainContent.classList.add('with-sidebar');
    }
    
    // 应用各分区展开/折叠状态
    Object.entries(sidebarState.sections).forEach(([section, collapsed]) => {
        const content = document.getElementById('nav-' + section);
        const header = content ? content.previousElementSibling : null;
        
        if (content && header) {
            if (collapsed) {
                content.classList.add('collapsed');
                header.classList.add('collapsed');
            } else {
                content.classList.remove('collapsed');
                header.classList.remove('collapsed');
            }
        }
    });
    
    // 移动端显示遮罩层
    if (!sidebarState.collapsed && window.innerWidth <= 768 && overlay) {
        overlay.style.display = 'block';
    }
}

// 筛选状态
let activeFilters = {
    task: null,
    source: null,
    date: null
};

let dateFilterValue = null;

// 显示日期筛选提示
function showDateFilter() {
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        statsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        statsSection.style.borderColor = 'var(--primary-color)';
        setTimeout(() => {
            statsSection.style.borderColor = 'var(--border-color)';
        }, 2000);
    }
}

// 显示日历选择器
function showCalendarPicker() {
    const picker = document.getElementById('calendarDatePicker');
    if (picker) {
        picker.click();
    }
}

// 初始化日期选择器
function initDatePicker() {
    flatpickr("#calendarDatePicker", {
        locale: "zh",
        dateFormat: "Y-m-d",
        maxDate: "today",
        onChange: function(selectedDates, dateStr, instance) {
            if (dateStr) {
                toggleFilter('date', dateStr);
            }
        }
    });
}

// 清除搜索
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    searchInput.focus();
    filterNews();
}

// 清除日期筛选
function clearDateFilter() {
    dateFilterValue = null;
    activeFilters.date = null;
    document.getElementById('calendarDatePicker').value = '';
    updateActiveFiltersUI();
    filterNews();
}

// 切换筛选
function toggleFilter(type, value) {
    if (type === 'date') {
        dateFilterValue = value;
    }
    
    if (activeFilters[type] === value) {
        activeFilters[type] = null;
        if (type === 'date') dateFilterValue = null;
    } else {
        activeFilters[type] = value;
    }
    
    updateFilterUI();
    updateActiveFiltersUI();
    filterNews();
}

// 更新筛选 UI
function updateFilterUI() {
    document.querySelectorAll('.filter-option').forEach(option => {
        const type = option.dataset.type;
        const value = option.dataset.value;
        if (activeFilters[type] === value) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// 更新已选筛选标签 UI
function updateActiveFiltersUI() {
    const container = document.getElementById('activeFilters');
    const list = document.getElementById('activeFiltersList');
    
    if (!container || !list) return;
    
    list.innerHTML = '';
    
    const typeLabels = {
        task: '📁 任务',
        source: '📰 来源',
        date: '📅 日期'
    };
    
    let hasFilters = false;
    
    Object.entries(activeFilters).forEach(([type, value]) => {
        if (value) {
            hasFilters = true;
            const tag = document.createElement('span');
            tag.className = 'active-filter-tag';
            tag.innerHTML = `
                ${typeLabels[type] || type}: ${value}
                <span class="remove" data-type="${type}">✕</span>
            `;
            
            const removeBtn = tag.querySelector('.remove');
            if (removeBtn) {
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    removeFilter(type, e);
                });
            }
            list.appendChild(tag);
        }
    });
    
    container.style.display = hasFilters ? 'flex' : 'none';
}

// 移除筛选
function removeFilter(type, event) {
    event.stopPropagation();
    activeFilters[type] = null;
    if (type === 'date') {
        dateFilterValue = null;
        const datePicker = document.getElementById('calendarDatePicker');
        if (datePicker) {
            datePicker.value = '';
        }
    }
    updateFilterUI();
    updateActiveFiltersUI();
    filterNews();
}

// 添加筛选
function addFilter(type, value) {
    activeFilters[type] = value;
    updateFilterUI();
    updateActiveFiltersUI();
    filterNews();
    // 滚动到新闻列表
    const newsGrid = document.querySelector('.news-grid');
    if (newsGrid) {
        newsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// 过滤新闻
function filterNews() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const clearBtn = document.querySelector('.search-clear');
    
    if (clearBtn) {
        clearBtn.style.display = searchTerm ? 'block' : 'none';
    }
    
    document.querySelectorAll('.news-card').forEach(card => {
        let show = true;
        
        if (searchTerm) {
            const title = (card.dataset.title + ' ' + card.dataset.titleZh).toLowerCase();
            if (!title.includes(searchTerm)) {
                show = false;
            }
        }
        
        if (show && activeFilters.task) {
            if (card.dataset.task !== activeFilters.task) {
                show = false;
            }
        }
        
        if (show && activeFilters.source) {
            if (card.dataset.source !== activeFilters.source) {
                show = false;
            }
        }
        
        if (show && activeFilters.date) {
            if (card.dataset.date !== activeFilters.date) {
                show = false;
            }
        }
        
        card.style.display = show ? 'flex' : 'none';
    });
}

// 保存滚动位置并跳转
function saveAndNavigate(url) {
    sessionStorage.setItem('news_hub_scroll_pos', window.scrollY);
    window.location.href = url;
}

// 首页初始化：恢复滚动位置
function initScrollRestore() {
    const savedPos = sessionStorage.getItem('news_hub_scroll_pos');
    if (savedPos !== null) {
        // 延迟一点点执行，确保列表已渲染
        setTimeout(() => {
            window.scrollTo({
                top: parseInt(savedPos),
                behavior: 'instant'
            });
            sessionStorage.removeItem('news_hub_scroll_pos');
        }, 100);
    }
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 加载并应用侧边栏状态
    loadSidebarState();
    applySidebarState();
    
    initDatePicker();
    // 仅在首页初始化滚动恢复
    if (document.querySelector('.news-grid')) {
        initScrollRestore();
        
        // 为详情页链接添加点击处理
        document.querySelectorAll('.news-title a').forEach(link => {
            const originalHref = link.getAttribute('href');
            if (originalHref && originalHref.includes('fulltext/')) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    saveAndNavigate(originalHref);
                });
            }
        });
    }
});
