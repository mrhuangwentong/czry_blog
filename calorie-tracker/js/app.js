/**
 * 热量计算识别APP - 主应用逻辑
 */

(function () {
    'use strict';

    // ==================== 状态管理 ====================
    const state = {
        currentPage: 'home',
        mode: 'ai', // 'ai' or 'manual'
        uploadedImage: null,
        selectedFood: null,
        currentServing: 100, // 克
        currentResult: null,
        statsDate: new Date(),
        history: JSON.parse(localStorage.getItem('calorie_history') || '[]'),
        calorieGoal: 2000, // 每日目标热量
    };

    // ==================== DOM 元素 ====================
    const $ = (id) => document.getElementById(id);

    const elements = {
        // 导航
        navTabs: document.querySelectorAll('.nav-tab'),
        pages: document.querySelectorAll('.page'),

        // 上传
        uploadArea: $('uploadArea'),
        fileInput: $('fileInput'),
        uploadBtn: $('uploadBtn'),
        uploadPreview: $('uploadPreview'),
        previewImage: $('previewImage'),
        removeImage: $('removeImage'),

        // 模式切换
        modeTabs: document.querySelectorAll('.mode-tab'),
        manualSelect: $('manualSelect'),

        // 食物选择
        foodSearch: $('foodSearch'),
        categoryBtns: document.querySelectorAll('.category-btn'),
        foodGrid: $('foodGrid'),
        recognizeBtn: $('recognizeBtn'),

        // 结果弹窗
        resultModal: $('resultModal'),
        resultClose: $('resultClose'),
        resultFoodName: $('resultFoodName'),
        resultImg: $('resultImg'),
        resultImage: $('resultImage'),
        resultCalories: $('resultCalories'),
        resultProtein: $('resultProtein'),
        resultCarbs: $('resultCarbs'),
        resultFat: $('resultFat'),
        proteinBar: $('proteinBar'),
        carbsBar: $('carbsBar'),
        fatBar: $('fatBar'),
        servingInput: $('servingInput'),
        servingMinus: $('servingMinus'),
        servingPlus: $('servingPlus'),
        quickBtns: document.querySelectorAll('.quick-btn'),
        totalCalorie: $('totalCalorie'),
        cancelResult: $('cancelResult'),
        saveResult: $('saveResult'),

        // 历史记录
        historyList: $('historyList'),
        historyEmpty: $('historyEmpty'),
        clearHistory: $('clearHistory'),

        // 统计
        currentDate: $('currentDate'),
        prevDay: $('prevDay'),
        nextDay: $('nextDay'),
        calorieRing: $('calorieRing'),
        todayCalories: $('todayCalories'),
        calorieRemain: $('calorieRemain'),
        todayProtein: $('todayProtein'),
        todayCarbs: $('todayCarbs'),
        todayFat: $('todayFat'),
        todayMealList: $('todayMealList'),
        statsEmpty: $('statsEmpty'),

        // 食物库
        foodCount: $('foodCount'),
        librarySearch: $('librarySearch'),
        foodLibraryList: $('foodLibraryList'),

        // 其他
        loadingOverlay: $('loadingOverlay'),
        toast: $('toast'),
        toastMessage: $('toastMessage'),
    };

    // ==================== 工具函数 ====================
    function showToast(message, duration = 2000) {
        elements.toastMessage.textContent = message;
        elements.toast.style.display = 'block';
        clearTimeout(showToast._timer);
        showToast._timer = setTimeout(() => {
            elements.toast.style.display = 'none';
        }, duration);
    }

    function showLoading() {
        elements.loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        elements.loadingOverlay.style.display = 'none';
    }

    function formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function formatTime(date) {
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }

    function isToday(dateStr) {
        return dateStr === formatDate(new Date());
    }

    function getDateLabel(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateStr === formatDate(today)) return '今天';
        if (dateStr === formatDate(yesterday)) return '昨天';

        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return `${date.getMonth() + 1}月${date.getDate()}日 ${weekDays[date.getDay()]}`;
    }

    function saveHistory() {
        localStorage.setItem('calorie_history', JSON.stringify(state.history));
    }

    // ==================== 页面导航 ====================
    function switchPage(pageName) {
        state.currentPage = pageName;

        elements.navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.page === pageName);
        });

        elements.pages.forEach(page => {
            page.classList.toggle('active', page.id === `page-${pageName}`);
        });

        // 页面进入时刷新对应内容
        if (pageName === 'history') {
            renderHistory();
        } else if (pageName === 'stats') {
            renderStats();
        } else if (pageName === 'foods') {
            renderFoodLibrary(FOOD_DATABASE);
        }
    }

    // ==================== 图片上传 ====================
    function handleFileSelect(file) {
        if (!file || !file.type.startsWith('image/')) {
            showToast('请选择有效的图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            state.uploadedImage = e.target.result;
            elements.previewImage.src = state.uploadedImage;
            elements.uploadPreview.style.display = 'block';
            elements.uploadArea.querySelector('.upload-content').style.display = 'none';
            updateRecognizeBtn();
        };
        reader.readAsDataURL(file);
    }

    function removeUploadedImage() {
        state.uploadedImage = null;
        elements.uploadPreview.style.display = 'none';
        elements.uploadArea.querySelector('.upload-content').style.display = 'flex';
        elements.fileInput.value = '';
        updateRecognizeBtn();
    }

    function initUpload() {
        // 点击上传
        elements.uploadBtn.addEventListener('click', () => {
            elements.fileInput.click();
        });

        elements.uploadArea.addEventListener('click', (e) => {
            if (!state.uploadedImage && !e.target.closest('.btn')) {
                elements.fileInput.click();
            }
        });

        elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
            }
        });

        // 拖拽上传
        elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.uploadArea.classList.add('drag-over');
        });

        elements.uploadArea.addEventListener('dragleave', () => {
            elements.uploadArea.classList.remove('drag-over');
        });

        elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.uploadArea.classList.remove('drag-over');
            if (e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        // 移除图片
        elements.removeImage.addEventListener('click', (e) => {
            e.stopPropagation();
            removeUploadedImage();
        });
    }

    // ==================== 识别模式切换 ====================
    function switchMode(mode) {
        state.mode = mode;

        elements.modeTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });

        if (mode === 'ai') {
            elements.uploadArea.style.display = 'flex';
            elements.manualSelect.style.display = 'none';
        } else {
            elements.uploadArea.style.display = 'none';
            elements.manualSelect.style.display = 'block';
            renderFoodGrid('all', '');
        }

        updateRecognizeBtn();
    }

    function initModeTabs() {
        elements.modeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                switchMode(tab.dataset.mode);
            });
        });
    }

    // ==================== 食物选择网格 ====================
    function renderFoodGrid(category, keyword) {
        let foods = getFoodByCategory(category);
        if (keyword) {
            foods = foods.filter(f =>
                f.name.toLowerCase().includes(keyword.toLowerCase())
            );
        }

        if (foods.length === 0) {
            elements.foodGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: var(--text-tertiary);">
                    <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
                    <p>没有找到匹配的食物</p>
                </div>
            `;
            return;
        }

        elements.foodGrid.innerHTML = foods.map(food => `
            <div class="food-item ${state.selectedFood && state.selectedFood.id === food.id ? 'selected' : ''}" 
                 data-id="${food.id}">
                <div class="food-emoji">${food.emoji}</div>
                <div class="food-name">${food.name}</div>
                <div class="food-cal">${food.calories} 大卡</div>
            </div>
        `).join('');

        // 绑定点击事件
        elements.foodGrid.querySelectorAll('.food-item').forEach(item => {
            item.addEventListener('click', () => {
                const foodId = parseInt(item.dataset.id);
                state.selectedFood = getFoodById(foodId);
                // 更新选中状态
                elements.foodGrid.querySelectorAll('.food-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                updateRecognizeBtn();
            });
        });
    }

    function initFoodSelection() {
        // 分类筛选
        elements.categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderFoodGrid(btn.dataset.category, elements.foodSearch.value);
            });
        });

        // 搜索
        elements.foodSearch.addEventListener('input', () => {
            const activeCategory = document.querySelector('.category-btn.active').dataset.category;
            renderFoodGrid(activeCategory, elements.foodSearch.value);
        });
    }

    function updateRecognizeBtn() {
        let canRecognize = false;

        if (state.mode === 'ai') {
            canRecognize = state.uploadedImage !== null;
        } else {
            canRecognize = state.selectedFood !== null;
        }

        elements.recognizeBtn.disabled = !canRecognize;
    }

    // ==================== 识别逻辑 ====================
    function doRecognize() {
        if (state.mode === 'ai' && state.uploadedImage) {
            // 模拟AI识别
            showLoading();
            setTimeout(() => {
                // 随机选择一种食物模拟识别结果
                const food = getRandomFood();
                state.currentResult = { ...food };
                state.currentServing = 100;
                hideLoading();
                showResult(state.currentResult, state.uploadedImage);
            }, 1500 + Math.random() * 1000);
        } else if (state.mode === 'manual' && state.selectedFood) {
            // 手动选择直接显示结果
            state.currentResult = { ...state.selectedFood };
            state.currentServing = 100;
            showResult(state.currentResult, null);
        }
    }

    // ==================== 结果展示 ====================
    function showResult(food, imageUrl) {
        elements.resultFoodName.textContent = food.name;
        elements.resultCalories.textContent = food.calories;
        elements.resultProtein.textContent = food.protein.toFixed(1) + 'g';
        elements.resultCarbs.textContent = food.carbs.toFixed(1) + 'g';
        elements.resultFat.textContent = food.fat.toFixed(1) + 'g';

        // 营养进度条
        const maxProtein = 30;
        const maxCarbs = 60;
        const maxFat = 40;

        elements.proteinBar.style.width = Math.min((food.protein / maxProtein) * 100, 100) + '%';
        elements.carbsBar.style.width = Math.min((food.carbs / maxCarbs) * 100, 100) + '%';
        elements.fatBar.style.width = Math.min((food.fat / maxFat) * 100, 100) + '%';

        // 图片
        if (imageUrl) {
            elements.resultImage.style.display = 'flex';
            elements.resultImg.src = imageUrl;
        } else {
            elements.resultImage.style.display = 'none';
        }

        // 份量
        elements.servingInput.value = 100;
        updateServingCalculation();

        // 重置快速按钮
        elements.quickBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.grams === '100');
        });

        elements.resultModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeResult() {
        elements.resultModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function updateServingCalculation() {
        const grams = state.currentServing;
        const factor = grams / 100;
        const food = state.currentResult;

        if (!food) return;

        const totalCal = Math.round(food.calories * factor);
        elements.totalCalorie.textContent = `${totalCal} 大卡`;

        // 更新营养数值显示（基于当前份量）
        elements.resultProtein.textContent = (food.protein * factor).toFixed(1) + 'g';
        elements.resultCarbs.textContent = (food.carbs * factor).toFixed(1) + 'g';
        elements.resultFat.textContent = (food.fat * factor).toFixed(1) + 'g';
    }

    function initResultModal() {
        elements.resultClose.addEventListener('click', closeResult);
        elements.cancelResult.addEventListener('click', closeResult);

        // 点击遮罩关闭
        elements.resultModal.querySelector('.result-overlay').addEventListener('click', closeResult);

        // 份量调整
        elements.servingMinus.addEventListener('click', () => {
            let val = parseInt(elements.servingInput.value) || 100;
            val = Math.max(1, val - 10);
            elements.servingInput.value = val;
            state.currentServing = val;
            updateQuickButtons(val);
            updateServingCalculation();
        });

        elements.servingPlus.addEventListener('click', () => {
            let val = parseInt(elements.servingInput.value) || 100;
            val = Math.min(1000, val + 10);
            elements.servingInput.value = val;
            state.currentServing = val;
            updateQuickButtons(val);
            updateServingCalculation();
        });

        elements.servingInput.addEventListener('input', () => {
            let val = parseInt(elements.servingInput.value) || 1;
            val = Math.max(1, Math.min(1000, val));
            state.currentServing = val;
            updateQuickButtons(val);
            updateServingCalculation();
        });

        elements.quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const grams = parseInt(btn.dataset.grams);
                elements.servingInput.value = grams;
                state.currentServing = grams;
                elements.quickBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateServingCalculation();
            });
        });

        // 保存记录
        elements.saveResult.addEventListener('click', saveCurrentResult);
    }

    function updateQuickButtons(grams) {
        elements.quickBtns.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.grams) === grams);
        });
    }

    // ==================== 保存记录 ====================
    function saveCurrentResult() {
        if (!state.currentResult) return;

        const factor = state.currentServing / 100;
        const record = {
            id: Date.now(),
            foodId: state.currentResult.id,
            foodName: state.currentResult.name,
            foodEmoji: state.currentResult.emoji,
            grams: state.currentServing,
            calories: Math.round(state.currentResult.calories * factor),
            protein: parseFloat((state.currentResult.protein * factor).toFixed(1)),
            carbs: parseFloat((state.currentResult.carbs * factor).toFixed(1)),
            fat: parseFloat((state.currentResult.fat * factor).toFixed(1)),
            date: formatDate(new Date()),
            time: formatTime(new Date()),
            timestamp: Date.now(),
        };

        state.history.unshift(record);
        saveHistory();

        // 重置选择状态
        state.selectedFood = null;
        if (state.mode === 'ai') {
            removeUploadedImage();
        } else {
            // 清除选中
            elements.foodGrid.querySelectorAll('.food-item').forEach(i => i.classList.remove('selected'));
            updateRecognizeBtn();
        }

        closeResult();
        showToast(`已记录：${record.foodName} ${record.calories} 大卡`);
    }

    // ==================== 历史记录 ====================
    function renderHistory() {
        if (state.history.length === 0) {
            elements.historyList.style.display = 'none';
            elements.historyEmpty.style.display = 'block';
            return;
        }

        elements.historyList.style.display = 'flex';
        elements.historyEmpty.style.display = 'none';

        // 按日期分组
        const groups = {};
        state.history.forEach(item => {
            if (!groups[item.date]) {
                groups[item.date] = [];
            }
            groups[item.date].push(item);
        });

        let html = '';
        const sortedDates = Object.keys(groups).sort().reverse();

        sortedDates.forEach(date => {
            const dayItems = groups[date];
            const dayTotalCal = dayItems.reduce((sum, i) => sum + i.calories, 0);

            html += `
                <div class="history-date-group">
                    <div class="history-date-label">
                        ${getDateLabel(date)} · 共 ${dayTotalCal} 大卡
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
            `;

            dayItems.forEach(item => {
                html += `
                    <div class="history-item" data-id="${item.id}">
                        <div class="history-emoji">${item.foodEmoji}</div>
                        <div class="history-info">
                            <div class="history-name">${item.foodName}</div>
                            <div class="history-meta">${item.grams}克 · ${item.time}</div>
                        </div>
                        <div class="history-cal">
                            <div class="history-cal-value">${item.calories}</div>
                            <div class="history-cal-unit">大卡</div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        elements.historyList.innerHTML = html;
    }

    function initHistory() {
        elements.clearHistory.addEventListener('click', () => {
            if (state.history.length === 0) return;
            if (confirm('确定要清空所有历史记录吗？')) {
                state.history = [];
                saveHistory();
                renderHistory();
                showToast('历史记录已清空');
            }
        });
    }

    // ==================== 每日统计 ====================
    function renderStats() {
        const dateStr = formatDate(state.statsDate);

        // 日期显示
        if (isToday(dateStr)) {
            elements.currentDate.textContent = '今天';
        } else {
            elements.currentDate.textContent = getDateLabel(dateStr);
        }

        // 禁用下一天按钮（如果是今天）
        elements.nextDay.disabled = isToday(dateStr);

        // 获取当天记录
        const dayRecords = state.history.filter(item => item.date === dateStr);

        if (dayRecords.length === 0) {
            elements.todayMealList.style.display = 'none';
            elements.statsEmpty.style.display = 'block';
        } else {
            elements.todayMealList.style.display = 'flex';
            elements.statsEmpty.style.display = 'none';

            elements.todayMealList.innerHTML = dayRecords.map(item => `
                <div class="meal-item" data-id="${item.id}">
                    <div class="meal-emoji">${item.foodEmoji}</div>
                    <div class="meal-info">
                        <div class="meal-name">${item.foodName} · ${item.grams}g</div>
                        <div class="meal-time">${item.time}</div>
                    </div>
                    <div class="meal-cal">${item.calories} 大卡</div>
                    <button class="meal-del" title="删除">✕</button>
                </div>
            `).join('');

            // 绑定删除
            elements.todayMealList.querySelectorAll('.meal-del').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemEl = e.target.closest('.meal-item');
                    const id = parseInt(itemEl.dataset.id);
                    deleteRecord(id);
                });
            });
        }

        // 计算总营养
        const totalCalories = dayRecords.reduce((sum, i) => sum + i.calories, 0);
        const totalProtein = dayRecords.reduce((sum, i) => sum + i.protein, 0);
        const totalCarbs = dayRecords.reduce((sum, i) => sum + i.carbs, 0);
        const totalFat = dayRecords.reduce((sum, i) => sum + i.fat, 0);

        elements.todayCalories.textContent = totalCalories;
        elements.todayProtein.textContent = totalProtein.toFixed(1) + 'g';
        elements.todayCarbs.textContent = totalCarbs.toFixed(1) + 'g';
        elements.todayFat.textContent = totalFat.toFixed(1) + 'g';

        // 剩余热量
        const remain = state.calorieGoal - totalCalories;
        if (remain > 0) {
            elements.calorieRemain.textContent = `还剩 ${remain} 大卡`;
        } else {
            elements.calorieRemain.textContent = `已超出 ${Math.abs(remain)} 大卡`;
        }

        // 环形进度条
        const ring = elements.calorieRing;
        const circumference = 339.292; // 2 * PI * 54
        const progress = Math.min(totalCalories / state.calorieGoal, 1);
        const offset = circumference * (1 - progress);

        // 设置颜色
        if (progress > 1) {
            ring.style.stroke = '#fa5252';
        } else if (progress > 0.8) {
            ring.style.stroke = '#ffa94d';
        } else {
            ring.style.stroke = 'var(--primary-color)';
        }

        ring.style.strokeDashoffset = offset;
    }

    function deleteRecord(id) {
        if (!confirm('确定删除这条记录吗？')) return;
        state.history = state.history.filter(item => item.id !== id);
        saveHistory();
        renderStats();
        renderHistory();
        showToast('记录已删除');
    }

    function initStats() {
        elements.prevDay.addEventListener('click', () => {
            state.statsDate.setDate(state.statsDate.getDate() - 1);
            renderStats();
        });

        elements.nextDay.addEventListener('click', () => {
            const today = new Date();
            const next = new Date(state.statsDate);
            next.setDate(next.getDate() + 1);
            if (next <= today) {
                state.statsDate = next;
                renderStats();
            }
        });
    }

    // ==================== 食物库 ====================
    function renderFoodLibrary(foods) {
        elements.foodCount.textContent = `${foods.length} 种食物`;

        if (foods.length === 0) {
            elements.foodLibraryList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>没有找到食物</h3>
                    <p>试试其他关键词</p>
                </div>
            `;
            return;
        }

        // 按分类分组
        const groups = {};
        foods.forEach(food => {
            if (!groups[food.category]) {
                groups[food.category] = [];
            }
            groups[food.category].push(food);
        });

        let html = '';
        Object.keys(groups).forEach(category => {
            html += `
                <div style="margin-bottom: 16px;">
                    <div style="font-size: 13px; color: var(--text-tertiary); margin-bottom: 8px; padding-left: 4px;">
                        ${category} (${groups[category].length})
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
            `;

            groups[category].forEach(food => {
                html += `
                    <div class="library-item" data-id="${food.id}">
                        <div class="library-emoji">${food.emoji}</div>
                        <div class="library-info">
                            <div class="library-name">${food.name}</div>
                            <div class="library-meta">
                                蛋白质 ${food.protein}g · 碳水 ${food.carbs}g · 脂肪 ${food.fat}g
                            </div>
                        </div>
                        <div class="library-cal">
                            <div class="library-cal-value">${food.calories}</div>
                            <div class="library-cal-unit">大卡/100g</div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        elements.foodLibraryList.innerHTML = html;

        // 绑定点击事件 - 点击食物查看详情
        elements.foodLibraryList.querySelectorAll('.library-item').forEach(item => {
            item.addEventListener('click', () => {
                const foodId = parseInt(item.dataset.id);
                const food = getFoodById(foodId);
                state.currentResult = { ...food };
                state.currentServing = 100;
                showResult(state.currentResult, null);
            });
        });
    }

    function initFoodLibrary() {
        elements.librarySearch.addEventListener('input', () => {
            const keyword = elements.librarySearch.value.trim();
            const results = searchFood(keyword);
            renderFoodLibrary(results);
        });
    }

    // ==================== 导航初始化 ====================
    function initNavigation() {
        elements.navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                switchPage(tab.dataset.page);
            });
        });
    }

    // ==================== 识别按钮 ====================
    function initRecognizeBtn() {
        elements.recognizeBtn.addEventListener('click', doRecognize);
    }

    // ==================== 初始化 ====================
    function init() {
        initNavigation();
        initUpload();
        initModeTabs();
        initFoodSelection();
        initRecognizeBtn();
        initResultModal();
        initHistory();
        initStats();
        initFoodLibrary();

        // 初始状态
        updateRecognizeBtn();

        console.log('🔥 热量计算识别APP 已加载');
        console.log(`📊 食物数据库：${FOOD_DATABASE.length} 种食物`);
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
