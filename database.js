const fs = require('fs');
const path = require('path');

// 是否启用云数据库（Neon Postgres）。设置了 DATABASE_URL 就使用云库，否则用本地 JSON 文件。
const DATABASE_URL = process.env.DATABASE_URL || null;

const DATA_FILE = path.join(__dirname, 'data', 'data.json');
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// 初始数据结构
const DEFAULT_DATA = { users: [], works: [] };

// 内存缓存：所有读写先走内存，保证 server.js 的同步调用不被打断
let memoryData = null;
let pool = null;

function initPool() {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

async function ensureTable() {
  if (!pool) initPool();
  await pool.query(`CREATE TABLE IF NOT EXISTS app_state (id INT PRIMARY KEY, value JSONB NOT NULL)`);
}

// 启动时加载数据到内存
async function loadIntoMemory() {
  if (DATABASE_URL) {
    await ensureTable();
    const rs = await pool.query(`SELECT value FROM app_state WHERE id = 1`);
    if (rs.rows.length > 0) {
      memoryData = rs.rows[0].value;
    } else {
      memoryData = JSON.parse(JSON.stringify(DEFAULT_DATA));
      await pool.query(`INSERT INTO app_state(id, value) VALUES($1, $2) ON CONFLICT (id) DO NOTHING`, [1, JSON.stringify(memoryData)]);
    }
    return;
  }
  // 本地文件模式
  try {
    if (fs.existsSync(DATA_FILE)) {
      memoryData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('数据文件损坏，重建中...');
  }
  if (!memoryData) memoryData = JSON.parse(JSON.stringify(DEFAULT_DATA));
}

// 读取数据（同步，返回内存缓存）
function loadData() {
  if (!memoryData) memoryData = JSON.parse(JSON.stringify(DEFAULT_DATA));
  return memoryData;
}

// 保存数据（同步更新内存 + 异步落盘；云库模式返回 Promise，便于等待写入完成）
function saveData(data) {
  memoryData = data;
  if (DATABASE_URL) {
    return ensureTable()
      .then(() => pool.query(
        `INSERT INTO app_state(id, value) VALUES($1, $2) ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value`,
        [1, JSON.stringify(data)]
      ))
      .catch(e => { console.error('云数据库保存失败:', e.message); });
  }
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('本地文件保存失败:', e.message);
  }
}

// 获取自增ID
function nextId(arr) {
  return arr.length > 0 ? Math.max(...arr.map(r => r.id)) + 1 : 1;
}

// 导出数据库操作方法
const db = {
  init: loadIntoMemory,
  loadData,
  saveData,
  nextId
};

module.exports = db;