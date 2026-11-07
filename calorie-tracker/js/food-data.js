/**
 * 食物数据库
 * 每100克食物的营养成分
 * calories: 热量（大卡）
 * protein: 蛋白质（克）
 * carbs: 碳水化合物（克）
 * fat: 脂肪（克）
 * category: 分类
 * emoji: 图标
 */
const FOOD_DATABASE = [
    // 主食类
    { id: 1, name: '白米饭', calories: 116, protein: 2.6, carbs: 25.6, fat: 0.3, category: '主食', emoji: '🍚' },
    { id: 2, name: '馒头', calories: 221, protein: 7.0, carbs: 47.0, fat: 1.1, category: '主食', emoji: '🍞' },
    { id: 3, name: '面条（煮）', calories: 109, protein: 3.9, carbs: 22.0, fat: 0.4, category: '主食', emoji: '🍜' },
    { id: 4, name: '面包', calories: 312, protein: 8.3, carbs: 58.6, fat: 5.1, category: '主食', emoji: '🍞' },
    { id: 5, name: '饺子', calories: 240, protein: 8.0, carbs: 32.0, fat: 8.0, category: '主食', emoji: '🥟' },
    { id: 6, name: '包子', calories: 227, protein: 7.8, carbs: 41.0, fat: 3.4, category: '主食', emoji: '🥟' },
    { id: 7, name: '燕麦片', calories: 367, protein: 15.0, carbs: 61.0, fat: 7.0, category: '主食', emoji: '🥣' },
    { id: 8, name: '红薯', calories: 99, protein: 1.1, carbs: 23.1, fat: 0.2, category: '主食', emoji: '🍠' },
    
    // 肉类
    { id: 9, name: '鸡胸肉', calories: 165, protein: 31.0, carbs: 0, fat: 3.6, category: '肉类', emoji: '🍗' },
    { id: 10, name: '牛肉（瘦）', calories: 125, protein: 20.2, carbs: 1.2, fat: 4.2, category: '肉类', emoji: '🥩' },
    { id: 11, name: '猪肉（瘦）', calories: 143, protein: 20.3, carbs: 1.5, fat: 6.2, category: '肉类', emoji: '🥓' },
    { id: 12, name: '红烧肉', calories: 450, protein: 18.0, carbs: 8.0, fat: 38.0, category: '肉类', emoji: '🍖' },
    { id: 13, name: '鸡腿', calories: 181, protein: 16.0, carbs: 0, fat: 13.0, category: '肉类', emoji: '🍗' },
    { id: 14, name: '鱼（清蒸）', calories: 113, protein: 20.4, carbs: 0, fat: 3.5, category: '肉类', emoji: '🐟' },
    { id: 15, name: '虾', calories: 93, protein: 18.6, carbs: 2.8, fat: 0.8, category: '肉类', emoji: '🦐' },
    
    // 蔬菜类
    { id: 16, name: '西兰花', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, category: '蔬菜', emoji: '🥦' },
    { id: 17, name: '西红柿', calories: 19, protein: 0.9, carbs: 4.0, fat: 0.2, category: '蔬菜', emoji: '🍅' },
    { id: 18, name: '黄瓜', calories: 16, protein: 0.8, carbs: 2.9, fat: 0.2, category: '蔬菜', emoji: '🥒' },
    { id: 19, name: '胡萝卜', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, category: '蔬菜', emoji: '🥕' },
    { id: 20, name: '白菜', calories: 17, protein: 1.5, carbs: 3.2, fat: 0.1, category: '蔬菜', emoji: '🥬' },
    { id: 21, name: '菠菜', calories: 28, protein: 2.6, carbs: 4.5, fat: 0.3, category: '蔬菜', emoji: '🥬' },
    { id: 22, name: '土豆', calories: 77, protein: 2.0, carbs: 16.5, fat: 0.1, category: '蔬菜', emoji: '🥔' },
    
    // 水果类
    { id: 23, name: '苹果', calories: 54, protein: 0.2, carbs: 13.5, fat: 0.2, category: '水果', emoji: '🍎' },
    { id: 24, name: '香蕉', calories: 93, protein: 1.4, carbs: 22.0, fat: 0.2, category: '水果', emoji: '🍌' },
    { id: 25, name: '橙子', calories: 48, protein: 0.8, carbs: 11.1, fat: 0.2, category: '水果', emoji: '🍊' },
    { id: 26, name: '葡萄', calories: 44, protein: 0.5, carbs: 10.3, fat: 0.2, category: '水果', emoji: '🍇' },
    { id: 27, name: '西瓜', calories: 26, protein: 0.6, carbs: 5.8, fat: 0.1, category: '水果', emoji: '🍉' },
    { id: 28, name: '草莓', calories: 32, protein: 1.0, carbs: 7.1, fat: 0.2, category: '水果', emoji: '🍓' },
    
    // 蛋奶豆类
    { id: 29, name: '鸡蛋', calories: 144, protein: 13.3, carbs: 2.8, fat: 8.8, category: '蛋奶', emoji: '🥚' },
    { id: 30, name: '牛奶', calories: 54, protein: 3.0, carbs: 3.4, fat: 3.2, category: '蛋奶', emoji: '🥛' },
    { id: 31, name: '酸奶', calories: 72, protein: 2.5, carbs: 9.3, fat: 2.7, category: '蛋奶', emoji: '🥛' },
    { id: 32, name: '豆腐', calories: 81, protein: 8.1, carbs: 3.8, fat: 3.7, category: '蛋奶', emoji: '🧈' },
    { id: 33, name: '豆浆', calories: 31, protein: 1.8, carbs: 1.1, fat: 1.6, category: '蛋奶', emoji: '🥛' },
    
    // 零食甜点
    { id: 34, name: '巧克力', calories: 586, protein: 4.2, carbs: 53.4, fat: 40.1, category: '零食', emoji: '🍫' },
    { id: 35, name: '薯片', calories: 536, protein: 6.6, carbs: 52.0, fat: 34.6, category: '零食', emoji: '🍟' },
    { id: 36, name: '饼干', calories: 486, protein: 9.0, carbs: 68.0, fat: 20.0, category: '零食', emoji: '🍪' },
    { id: 37, name: '蛋糕', calories: 347, protein: 7.2, carbs: 57.0, fat: 11.0, category: '零食', emoji: '🍰' },
    { id: 38, name: '冰淇淋', calories: 207, protein: 3.5, carbs: 24.0, fat: 11.0, category: '零食', emoji: '🍦' },
    { id: 39, name: '花生', calories: 567, protein: 24.8, carbs: 16.1, fat: 44.3, category: '零食', emoji: '🥜' },
    
    // 饮料类
    { id: 40, name: '可乐', calories: 43, protein: 0, carbs: 10.6, fat: 0, category: '饮料', emoji: '🥤' },
    { id: 41, name: '果汁', calories: 46, protein: 0.7, carbs: 10.4, fat: 0.2, category: '饮料', emoji: '🧃' },
    { id: 42, name: '咖啡（加糖）', calories: 60, protein: 0.3, carbs: 12.0, fat: 0.2, category: '饮料', emoji: '☕' },
    { id: 43, name: '奶茶', calories: 120, protein: 2.0, carbs: 20.0, fat: 3.5, category: '饮料', emoji: '🧋' },
    { id: 44, name: '啤酒', calories: 43, protein: 0.4, carbs: 3.6, fat: 0, category: '饮料', emoji: '🍺' },

    // 中餐常见菜
    { id: 45, name: '麻婆豆腐', calories: 185, protein: 12.0, carbs: 8.0, fat: 12.0, category: '肉类', emoji: '🥘' },
    { id: 46, name: '宫保鸡丁', calories: 215, protein: 18.0, carbs: 10.0, fat: 12.0, category: '肉类', emoji: '🍛' },
    { id: 47, name: '番茄炒蛋', calories: 120, protein: 8.0, carbs: 6.0, fat: 7.5, category: '蔬菜', emoji: '🍳' },
    { id: 48, name: '炒青菜', calories: 65, protein: 2.0, carbs: 4.0, fat: 5.0, category: '蔬菜', emoji: '🥬' },
    { id: 49, name: '蛋炒饭', calories: 180, protein: 6.0, carbs: 25.0, fat: 6.5, category: '主食', emoji: '🍚' },
    { id: 50, name: '牛肉面', calories: 180, protein: 12.0, carbs: 22.0, fat: 5.5, category: '主食', emoji: '🍜' },
];

/**
 * 根据名称搜索食物
 */
function searchFood(keyword) {
    if (!keyword) return FOOD_DATABASE;
    const lower = keyword.toLowerCase();
    return FOOD_DATABASE.filter(f => 
        f.name.toLowerCase().includes(lower) || 
        f.category.toLowerCase().includes(lower)
    );
}

/**
 * 按分类获取食物
 */
function getFoodByCategory(category) {
    if (category === 'all') return FOOD_DATABASE;
    return FOOD_DATABASE.filter(f => f.category === category);
}

/**
 * 根据ID获取食物
 */
function getFoodById(id) {
    return FOOD_DATABASE.find(f => f.id === id);
}

/**
 * 随机获取一种食物（用于模拟AI识别）
 */
function getRandomFood() {
    return FOOD_DATABASE[Math.floor(Math.random() * FOOD_DATABASE.length)];
}
