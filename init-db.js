const db = require('./database');

function init() {
  const data = db.loadData();

  if (data.users.length > 0) {
    console.log('✅ 数据库已有数据，跳过初始化');
    return;
  }

  // 演示学生账号
  data.users.push(
    { id: 1, username: 'stu001', password: '123456', display_name: '小明', created_at: '2026-09-01T08:00:00.000Z' },
    { id: 2, username: 'stu002', password: '123456', display_name: '小红', created_at: '2026-09-01T08:00:00.000Z' },
    { id: 3, username: 'stu003', password: '123456', display_name: '小华', created_at: '2026-09-01T08:00:00.000Z' },
    { id: 4, username: 'stu004', password: '123456', display_name: '小刚', created_at: '2026-09-01T08:00:00.000Z' }
  );

  // 演示作品（使用新结构：只有代码类作品有数据，图片/视频需要学生上传）
  data.works = [
    {
      id: 1, student_id: 1, title: '接水果游戏', type: 'game', description: '用键盘左右键控制挡板接住水果，接住得分，漏掉会扣分',
      code_content: '<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1a1a2e;font-family:Arial}canvas{background:#16213e;border:2px solid #0f3460;border-radius:8px}</style></head><body><canvas id="g" width="400" height="600"></canvas><script>const c=document.getElementById("g"),ctx=c.getContext("2d");let p={x:200,w:80},b=[],s=0,f=0;document.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")p.x=Math.max(0,p.x-20);if(e.key==="ArrowRight")p.x=Math.min(320,p.x+20)});setInterval(()=>{b.push({x:Math.random()*380,y:0})},800);(function d(){ctx.clearRect(0,0,400,600);for(let i=b.length-1;i>=0;i--){b[i].y+=4;ctx.beginPath();ctx.arc(b[i].x,b[i].y,15,0,Math.PI*2);ctx.fillStyle="#e94560";ctx.fill();if(b[i].y+15>570&&b[i].x>p.x&&b[i].x<p.x+p.w){s++;b.splice(i,1)}else if(b[i].y>600){b.splice(i,1);f++}}ctx.fillStyle="#0f3460";ctx.fillRect(p.x,570,p.w,15);ctx.fillStyle="#fff";ctx.font="20px Arial";ctx.fillText("得分: "+s,10,30);ctx.fillText("漏掉: "+f,300,30);requestAnimationFrame(d)})()</script></body></html>',
      image_data: null, video_data: null, screenshot_data: null,
      created_at: '2026-09-01T11:00:00.000Z'
    },
    {
      id: 2, student_id: 2, title: '躲避小球', type: 'game', description: '控制方块躲避掉落的红色小球，碰到的越多得分越高',
      code_content: '<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#2d1b69;font-family:Arial}canvas{background:#1a1a2e;border:2px solid #4a3f8a;border-radius:8px}</style></head><body><canvas id="c" width="400" height="600"></canvas><script>const cv=document.getElementById("c"),ctx=cv.getContext("2d");let px=180,balls=[],score=0,direction=null;document.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")direction="left";if(e.key==="ArrowRight")direction="right"});setInterval(()=>{balls.push({x:Math.random()*380,y:0,r:Math.random()*10+10})},600);(function update(){if(direction==="left"){px-=5;direction=null}if(direction==="right"){px+=5;direction=null}px=Math.max(0,Math.min(360,px))})();(function draw(){ctx.clearRect(0,0,400,600);for(let i=balls.length-1;i>=0;i--){balls[i].y+=3;ctx.beginPath();ctx.arc(balls[i].x,balls[i].y,balls[i].r,0,Math.PI*2);ctx.fillStyle="#ff6b6b";ctx.fill();if(balls[i].y+balls[i].r>580&&balls[i].x>px&&balls[i].x<px+40){score++;balls.splice(i,1)}else if(balls[i].y>600){balls.splice(i,1)}}ctx.fillStyle="#4ecdc4";ctx.fillRect(px,575,40,25);ctx.fillStyle="#fff";ctx.font="20px Arial";ctx.fillText("得分: "+score,10,30);requestAnimationFrame(draw)})()</script></body></html>',
      image_data: null, video_data: null, screenshot_data: null,
      created_at: '2026-09-01T11:10:00.000Z'
    },
    {
      id: 3, student_id: 3, title: '简易计算器', type: 'app', description: '一个功能完整的加减乘除计算器，支持连续运算',
      code_content: '<!DOCTYPE html><html><head><style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0;font-family:Arial}.calc{background:#333;padding:20px;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.3)}.display{background:#fff;padding:15px;font-size:24px;text-align:right;margin-bottom:10px;border-radius:5px;min-height:30px}.buttons{display:grid;grid-template-columns:repeat(4,60px);gap:5px}button{padding:15px;font-size:18px;border:none;border-radius:5px;cursor:pointer}button.num{background:#555;color:#fff}button.op{background:#f90;color:#fff}button.c{background:#c00;color:#fff}button.eq{background:#090;color:#fff}button:hover{opacity:0.8}</style></head><body><div class="calc"><div class="display" id="d">0</div><div class="buttons"><button class="c" onclick="c()">C</button><button class="op" onclick="i(\'/\')">/</button><button class="op" onclick="i(\'*\')">*</button><button class="op" onclick="i(\'-\')">-</button><button class="num" onclick="i(\'7\')">7</button><button class="num" onclick="i(\'8\')">8</button><button class="num" onclick="i(\'9\')">9</button><button class="op" onclick="i(\'+\')">+</button><button class="num" onclick="i(\'4\')">4</button><button class="num" onclick="i(\'5\')">5</button><button class="num" onclick="i(\'6\')">6</button><button class="eq" onclick="e()">=</button><button class="num" onclick="i(\'1\')">1</button><button class="num" onclick="i(\'2\')">2</button><button class="num" onclick="i(\'3\')">3</button><button class="num" onclick="i(\'0\')">0</button></div></div><script>let dp="0";function i(v){dp=dp==="0"?v:dp+v;document.getElementById("d").textContent=dp}function e(){try{dp=eval(dp).toString();document.getElementById("d").textContent=dp}catch{alert("错误")}}function c(){dp="0";document.getElementById("d").textContent=dp}</script></body></html>',
      image_data: null, video_data: null, screenshot_data: null,
      created_at: '2026-09-01T15:00:00.000Z'
    }
  ];

  db.saveData(data);
  console.log('✅ 数据库初始化完成（含演示数据）');
  console.log('👦 演示账号: stu001 ~ stu004 / 123456');
  console.log('🎮 演示作品: 接水果游戏、躲避小球、简易计算器');
}

init();