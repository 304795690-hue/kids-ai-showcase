# 少儿AI作品展示平台 - 重构计划

## 目标

将现有平台简化为"学生上传作品 → 家长公开浏览"的纯展示平台。

## 设计变更

### 数据模型简化

* 移除 `assignments`, `assignment_students`, `chat_history` 表

* 简化 `submissions` → `works`（作品）

* `users` 只保留学生角色

* 移除 `share_links`（改为公开画廊，无需独立分享链接）

### 角色流程

```
学生注册/登录 → 上传作品 → 家长访问公开链接 → 浏览所有作品
```

### 作品类型

| 类型     | 数据存储                |
| ------ | ------------------- |
| 图片     | 上传图片文件，前端直接显示       |
| 游戏     | 粘贴HTML代码，前端iframe预览 |
| 视频     | 上传视频文件，前端video播放    |
| 小程序/软件 | 上传截图或代码，前端展示截图+代码   |

## 具体修改

### 1. 后端 - server.js

**移除：**

* 老师相关API（学生管理、任务管理、批改评分）

* AI对话API（chat相关）

* 分享链接生成API

**新增/修改：**

* `POST /api/register` - 学生注册

* `POST /api/login` - 学生登录

* `GET /api/my-works` - 获取我的作品（需登录）

* `POST /api/works` - 上传作品（需登录，支持文件上传和代码粘贴）

* `DELETE /api/works/:id` - 删除自己的作品（需登录）

* `GET /api/gallery` - 公开画廊，获取所有作品（无需登录）

* `GET /api/gallery/:id` - 获取单个作品详情（无需登录）

### 2. 后端 - database.js

* 数据表结构从6个简化为3个：`users`, `works`

* 移除 `assignments`, `assignment_students`, `share_links`, `chat_history`

### 3. 后端 - init-db.js

* 只初始化演示学生账号和演示作品

### 4. 前端 - 删除文件

* `public/teacher/` 整个目录（老师端所有页面）

* `public/student/workspace-image.html`

* `public/student/workspace-video.html`

* `public/student/workspace-code.html`

### 5. 前端 - 修改文件

* `public/index.html` → 学生登录页（移除老师登录入口）

* `public/css/style.css` → 适配新布局

### 6. 前端 - 新增文件

* `public/register.html` → 学生注册页

* `public/student/dashboard.html` → 学生主页（我的作品列表 + 上传入口）

* `public/student/upload.html` → 作品上传页（支持四种类型）

* `public/gallery.html` → 公开画廊（家长浏览页，无需登录）

## 详细页面设计

### 公开画廊 `/gallery.html`（家长端）

* 顶部：平台名称 + 欢迎语

* 筛选栏：按类型筛选（全部/图片/游戏/视频/小程序）

* 作品网格展示：卡片形式，每张卡片显示：

  * 作品缩略图（图片显示图片、游戏显示代码截图示意、视频显示视频封面）

  * 作品标题

  * 学生姓名

  * 作品类型标签

  * 上传时间

* 点击卡片 → 进入作品详情页（弹窗或新页面）

* 详情页显示完整作品预览

### 学生主页 `/student/dashboard.html`

* 登录后进入

* 顶部：欢迎语 + 上传按钮

* 我的作品列表：表格形式，显示标题、类型、时间、操作（删除）

* 点击"上传作品" → 跳转上传页

### 上传页 `/student/upload.html`

* 作品标题（输入框）

* 作品类型（下拉选择：图片/游戏/视频/小程序）

* 作品描述（文本域，可选）

* 根据类型显示不同上传方式：

  * 图片：文件选择器（.jpg, .png, .gif, .webp）

  * 游戏：代码编辑区（textarea，粘贴HTML代码）

  * 视频：文件选择器（.mp4, .webm）

  * 小程序：文件选择器（上传截图）+ 代码编辑区（可选）

* 提交按钮

### 注册页 `/register.html`

* 输入姓名

* 输入密码

* 确认密码

* 注册后自动登录跳转

## 验证步骤

1. 启动服务器，访问 <http://localhost:3001>
2. 注册一个新学生账号
3. 登录后上传一个图片作品、一个游戏作品、一个视频作品
4. 访问 `/gallery.html` 确认所有作品可见
5. 按类型筛选确认正常工作
6. 点击作品查看详情

<br />
