# 少儿AI创作实践平台 - 搭建计划（V2.0）

## 目标

打造一个完整的少儿AI创作实践平台：

* 学生可以在平台内进行多种AI创作实操：**AI生成图片、AI生成视频、AI做游戏、AI做软件/小程序**

* 平台内置AI对话助手，学生直接跟AI聊天生成代码

* 作品自动保存到平台存档

* 老师可以导入学生、布置任务、批改评分

* 家长通过分享链接/二维码直接查看作品（无需注册）

## 技术架构

**全栈一体化方案**，开箱即用：

| 层级      | 技术                            |
| ------- | ----------------------------- |
| 后端      | Node.js + Express + SQLite    |
| 前端      | 纯 HTML/CSS/JavaScript         |
| 数据库     | SQLite（零配置，单文件存储）             |
| AI对话    | 内置AI聊天面板，模拟响应 → 后续接入真实LLM API |
| AI生成图片  | 框架预留 → 后续接入 Seedream          |
| AI生成视频  | 框架预留 → 后续接入 Seedance          |
| 代码/作品存储 | SQLite存储HTML代码，媒体文件存在本地       |

## 支持的AI创作类型

| 类型        | 实现方式                                  | 存储           |
| --------- | ------------------------------------- | ------------ |
| AI生成图片    | 输入描述 → 预留AI生成接口 → 保存作品                | 图片文件+元数据     |
| AI生成视频    | 输入描述 → 预留AI生成接口 → 保存作品                | 视频文件+元数据     |
| AI做游戏     | 在AI对话面板中描述需求 → AI生成HTML代码 → 实时预览 → 提交 | HTML代码存储     |
| AI做软件/小程序 | 同上，同一代码创作空间，类型标签不同                    | HTML代码/zip存档 |

## 角色与功能

### 老师

* **导入学生**：批量输入学生姓名，系统自动生成账号和初始密码

* **布置任务**：选择任务类型（图片/视频/游戏/小程序），填写标题和描述

* **查看作品**：按任务查看所有学生提交，在线预览

* **批改评分**：给作品打分 + 写评语

* **分享给家长**：生成分享链接 + 二维码，发给家长

### 学生

* **登录**：使用老师分配的账号登录

* **任务列表**：看到老师布置的待完成任务

* **AI对话创作**（代码类任务）：

  * 左侧AI聊天面板：跟AI对话，描述需求，AI生成代码

  * 右侧代码编辑区：AI生成的代码自动填入，可手动修改

  * 实时预览区：即时看到运行效果

  * 满意后点击提交

* **图片创作**：输入描述词 → 提交生成请求 → 保存作品

* **视频创作**：输入描述词 → 提交生成请求 → 保存作品

* **作品集**：查看自己所有提交的作品、评分和评语

### 家长

* 点击老师分享的链接 / 扫码 → 直接查看作品

* 看到：作品运行效果、学生姓名、任务名称、老师评语

* 支持转发分享

## 页面结构

```
public/
├── index.html                    # 登录页
├── css/style.css                 # 全局样式（儿童友好）
├── teacher/
│   ├── dashboard.html            # 老师工作台：任务统计、最近提交动态
│   ├── students.html             # 学生管理：批量导入学生、查看列表
│   ├── assignments.html          # 任务管理：创建任务、查看任务列表
│   └── review.html               # 作品批改：按任务查看、预览、评分
├── student/
│   ├── dashboard.html            # 学生工作台：任务列表 + 作品集
│   ├── workspace-image.html      # 图片创作：输入描述 → 提交
│   ├── workspace-video.html      # 视频创作：输入描述 → 提交
│   └── workspace-code.html       # 代码创作：AI对话 + 实时预览
│                                 # 同时支持"游戏"和"软件/小程序"
└── parent/
    └── view.html                 # 家长查看页（无登录，公开访问）
```

## 数据模型（简化版）

```
Users (用户)
├── id, username, password, role(teacher/student), display_name
└── role: teacher/student，老师可以管理多个学生

Assignments (创作任务)
├── id, title, description, type(image/video/game/app),
├── teacher_id, created_at
└── 老师创建任务，不按班级分组

AssignmentStudents (任务分配)
├── id, assignment_id, student_id
└── 一个任务可以分配给多个学生

Submissions (作品提交)
├── id, assignment_id, student_id, title,
├── prompt, code_content, file_path,
├── score, comment, created_at
└── 存储作品，包括AI生成的代码、文件路径、评分评语

ShareLinks (分享链接)
├── id, submission_id, token, created_at
└── 生成唯一token，家长通过链接无登录访问

ChatHistory (AI对话记录)
├── id, student_id, assignment_id, role(user/ai), content, created_at
└── 记录学生在代码创作空间中的AI对话，方便追溯创作过程
```

## API 接口

| 方法       | 路径                          | 说明                   |
| -------- | --------------------------- | -------------------- |
| POST     | /api/login                  | 登录                   |
| GET      | /api/students               | 获取学生列表（老师可见）         |
| POST     | /api/students/batch-import  | 批量导入学生               |
| POST     | /api/students               | 单个添加学生               |
| DELETE   | /api/students/:id           | 删除学生                 |
| GET/POST | /api/assignments            | 任务列表/创建              |
| GET      | /api/assignments/:id        | 获取任务详情               |
| POST     | /api/assignments/:id/assign | 分配任务给学生              |
| GET/POST | /api/submissions            | 提交列表/提交作品            |
| PUT      | /api/submissions/:id/review | 批改作品                 |
| POST     | /api/ai/chat                | AI对话接口（模拟→后续接入真实API） |
| POST     | /api/share/generate         | 生成分享链接               |
| GET      | /api/share/:token           | 获取作品信息（公开）           |

## 实现步骤

### Step 1: 后端基础（已完成）

* server.js — Express主服务，API路由

* database.js — 数据库操作封装

* init-db.js — 建表 + 插入演示数据

### Step 2: 样式

* public/css/style.css — 儿童友好样式（紫色主题、圆角、大按钮）

### Step 3: 前端页面

1. 登录页 index.html
2. 老师端（4页）：工作台 → 学生管理 → 任务管理 → 作品批改
3. 学生端（4页）：工作台 → 图片创作 → 视频创作 → 代码创作（含AI对话）
4. 家长端（1页）：作品查看

### Step 4: AI对话功能

* workspace-code.html 左侧：AI聊天面板（对话气泡样式）

* 右侧：代码编辑器（textarea）+ iframe实时预览

* AI对话接口（模拟版）：根据关键词返回预设代码模板

* 后续接入真实API时只需替换 /api/ai/chat 的实现

### Step 5: 分享功能

* 生成唯一token

* 家长无登录访问，看到作品预览

### Step 6: 演示数据

* 1老师账号：teacher / 123456

* 3学生账号：学生1、学生2、学生3

* 4个不同类型的任务（图片/视频/游戏/小程序）

* 每个类型1个演示作品

## 验证流程

1. `npm install && npm run init-db && npm start`
2. 老师登录 → 导入学生 → 布置任务
3. 学生登录 → 看到任务 → 进入创作空间 → AI对话生成代码 → 提交
4. 老师批改 → 生成分享链接
5. 家长打开链接查看作品

