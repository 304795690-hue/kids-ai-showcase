const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'data.json');

// 确保目录存在
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// 初始数据结构
const DEFAULT_DATA = {
  users: [],
  works: []
};

// 读取数据
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('数据文件损坏，重建中...');
  }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

// 保存数据
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 获取自增ID
function nextId(arr) {
  return arr.length > 0 ? Math.max(...arr.map(r => r.id)) + 1 : 1;
}

// 导出数据库操作方法
const db = {
  loadData,
  saveData,
  nextId
};

module.exports = db;