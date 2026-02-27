
let activeFilters = {
    task: null,
    source: null,
    date: null
};

let dateFilterValue = null;

function showDateFilter() {
    // 点击 Header 时间时，滚动到统计区域并显示日期选择器提示
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        statsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // 高亮统计区域
        statsSection.style.borderColor = 'var(--primary-color)';
        setTimeout(() => {
            statsSection.style.borderColor = 'var(--border-color)';
        }, 2000);
    }
    // 提示用户点击任务/来源标签进行筛选
    alert('💡 提示：点击下方的任务或来源标签进行筛选。日期筛选功能开发中...');
}

// 显示日历选择器
function showCalendarPicker() {
    const picker = document.getElementById('calendarDatePicker');
    if (picker) {
        picker.click();
    }
}

function initDatePicker() {
    // 主日期选择器（已移除）
    if (document.getElementById('datePicker')) {
        flatpickr("#datePicker", {
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
    
    // 日历选择器（用于"更多日期"按钮）
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

function showFilters() {
    document.getElementById('filterPanel').style.display = 'block';
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    searchInput.focus();
    filterNews();
}

function clearDateFilter() {
    dateFilterValue = null;
    activeFilters.date = null;
    document.getElementById('datePicker').value = '';
    updateActiveFiltersUI();
    filterNews();
}

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
            
            // 添加点击事件监听器
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

function removeFilter(type, event) {
    event.stopPropagation();
    activeFilters[type] = null;
    if (type === 'date') {
        dateFilterValue = null;
        document.getElementById('datePicker').value = '';
    }
    updateFilterUI();
    updateActiveFiltersUI();
    filterNews();
}

function addFilter(type, value) {
    activeFilters[type] = value;
    updateFilterUI();
    updateActiveFiltersUI();
    filterNews();
    document.getElementById('filterPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

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

document.addEventListener('DOMContentLoaded', function() {
    initDatePicker();
});
