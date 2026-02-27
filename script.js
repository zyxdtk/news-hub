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

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initDatePicker();
});
