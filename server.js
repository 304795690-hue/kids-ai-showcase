const express = require('express');
const path = require('path');
const db = require('./database');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 数据处理的文件路径
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ===== 工具函数 =====
function load() {
  return db.loadData();
}
function save(data) {
  return db.saveData(data);
}
function nextId(data, table) {
  return data[table].length > 0 ? Math.max(...data[table].map(r => r.id)) + 1 : 1;
}

// 登录态中间件
function requireAuth(req, res, next) {
  const studentId = req.headers['x-student-id'];
  if (!studentId) {
    return res.status(401).json({ success: false, message: '请先登录' });
  }
  const data = load();
  const user = data.users.find(u => u.id === parseInt(studentId));
  if (!user) {
    return res.status(401).json({ success: false, message: '用户不存在' });
  }
  req.student = user;
  next();
}

// ===== 注册/登录API =====
app.post('/api/register', (req, res) => {
  try {
    const { display_name, password } = req.body;
    const data = load();

    let maxId = 0;
    data.users.forEach(u => {
      const m = u.username.match(/^stu(\d+)$/);
      if (m) {
        const num = parseInt(m[1]);
        if (num > maxId) maxId = num;
      }
    });
    maxId++;
    const username = 'stu' + String(maxId).padStart(3, '0');

    const id = nextId(data, 'users');
    data.users.push({
      id, username, password, display_name,
      created_at: new Date().toISOString()
    });
    save(data);

    res.json({ success: true, user: { id, username, display_name } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const data = load();
    const user = data.users.find(u => u.username === username && u.password === password);
    if (user) {
      res.json({
        success: true,
        user: { id: user.id, username: user.username, display_name: user.display_name }
      });
    } else {
      res.json({ success: false, message: '账号或密码错误' });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ===== 作品管理API（需要登录） =====

// 获取我的作品
app.get('/api/my-works', requireAuth, (req, res) => {
  try {
    const data = load();
    const works = data.works
      .filter(w => w.student_id === req.student.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    // 返回列表时去掉大文件数据
    res.json(works.map(w => ({
      ...w,
      image_data: null,
      video_data: null,
      screenshot_data: null
    })));
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 上传作品（接收 JSON body，文件数据用 base64）
app.post('/api/works', requireAuth, (req, res) => {
  try {
    const { title, type, description, code_content, image_data, video_data, screenshot_data } = req.body;
    const data = load();
    const id = nextId(data, 'works');

    const work = {
      id,
      student_id: req.student.id,
      title: title || '未命名作品',
      type: type || 'image',
      description: description || '',
      code_content: code_content || null,
      image_data: image_data || null,
      video_data: video_data || null,
      screenshot_data: screenshot_data || null,
      created_at: new Date().toISOString()
    };

    data.works.push(work);
    save(data);

    res.json({ success: true, work });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 删除作品
app.delete('/api/works/:id', requireAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = load();
    const work = data.works.find(w => w.id === id);
    if (!work) {
      return res.status(404).json({ success: false, message: '作品不存在' });
    }
    if (work.student_id !== req.student.id) {
      return res.status(403).json({ success: false, message: '无权删除此作品' });
    }

    data.works = data.works.filter(w => w.id !== id);
    save(data);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ===== 公开画廊API（无需登录） =====

// 获取所有作品列表（公开，不包含文件数据）
app.get('/api/gallery', (req, res) => {
  try {
    const { type } = req.query;
    const data = load();
    let works = data.works;

    if (type && type !== 'all') {
      works = works.filter(w => w.type === type);
    }

    works = works.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 补充学生姓名，去掉大数据
    works = works.map(w => {
      const u = data.users.find(u => u.id === w.student_id);
      return {
        id: w.id, title: w.title, type: w.type, description: w.description,
        student_name: u ? u.display_name : '未知',
        created_at: w.created_at,
        student_id: w.student_id,
        // 只返回缩略图数据（如果有图片），不返回视频
        has_image: !!w.image_data,
        has_video: !!w.video_data,
        has_screenshot: !!w.screenshot_data,
        has_code: !!w.code_content
      };
    });

    res.json(works);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 获取单个作品详情（包含文件数据）
app.get('/api/gallery/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = load();
    const work = data.works.find(w => w.id === id);
    if (!work) {
      return res.status(404).json({ error: '作品不存在' });
    }
    const u = data.users.find(u => u.id === work.student_id);
    res.json({ ...work, student_name: u ? u.display_name : '未知' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 启动
app.listen(PORT, () => {
  console.log('🚀 少儿AI作品展示平台已启动！');
  console.log(`📌 访问地址: http://localhost:${PORT}`);
  console.log('🎨 公开画廊: http://localhost:' + PORT + '/gallery.html');
  console.log('👦 学生登录: http://localhost:' + PORT + '/index.html');
});