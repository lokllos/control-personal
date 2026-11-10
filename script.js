// --- NAVEGACIÓN Y PAUSA AUTOMÁTICA DEL JUEGO ---
function switchTab(tabId, btnElement) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  if (btnElement) btnElement.classList.add('active');
  
  if (tabId !== 'arcade' && gameRunning && !gamePaused) {
    togglePauseGame();
  }
}

// --- ALMACENAMIENTO DE DATOS ---
let quickTasks = JSON.parse(localStorage.getItem('adrian_quick_tasks')) || [];
let goals = JSON.parse(localStorage.getItem('adrian_goals')) || [];
let works = JSON.parse(localStorage.getItem('adrian_works')) || [];

const literaryQuotes = [
  "«Lo que sabemos es una gota, lo que ignoramos es un océano.» — Isaac Newton",
  "«El secreto de adelantarse es empezar.» — Mark Twain",
  "«No juzgues cada día por lo que cosechas, sino por las semillas que plantas.» — Robert Louis Stevenson",
  "«La perseverancia es muy importante. No debes rendirte a menos que te veas obligado a hacerlo.» — Inspirado en Clásicos",
  "«Haz lo que puedas, con lo que tengas, donde estés.» — Theodore Roosevelt",
  "«El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el valor para continuar.» — Winston Churchill",
  "«Cree que puedes y ya estarás a medio camino.» — Theodore Roosevelt",
  "«El hombre es dueño de su destino y su destino es su propia mente.» — Marcus Aurelius (Meditaciones)"
];

function getRandomQuote() {
  return literaryQuotes[Math.floor(Math.random() * literaryQuotes.length)];
}

function saveData() {
  localStorage.setItem('adrian_quick_tasks', JSON.stringify(quickTasks));
  localStorage.setItem('adrian_goals', JSON.stringify(goals));
  localStorage.setItem('adrian_works', JSON.stringify(works));
  renderAll();
}

function addQuickTask() {
  const input = document.getElementById('quick-task-input');
  if (!input.value.trim()) return;
  quickTasks.push({ id: Date.now(), text: input.value, done: false });
  input.value = '';
  saveData();
}

function toggleQuickTask(id) {
  quickTasks = quickTasks.map(t => t.id === id ? {...t, done: !t.done} : t);
  saveData();
}

function deleteQuickTask(id) {
  quickTasks = quickTasks.filter(t => t.id !== id);
  saveData();
}

// --- GESTIÓN DE OBJETIVOS CON ESPACIOS INTACTOS ---
function saveGoal() {
  const editId = document.getElementById('edit-goal-id').value;
  const title = document.getElementById('goal-title').value;
  const date = document.getElementById('goal-date').value;
  const status = document.getElementById('goal-status').value;

  if (!title.trim()) return;

  if (editId) {
    goals = goals.map(g => (g.id == editId ? { ...g, title, date, status } : g));
  } else {
    goals.push({
      id: Date.now(),
      title,
      date,
      status,
      quote: getRandomQuote()
    });
  }

  resetGoalForm();
  saveData();
}

function editGoal(id) {
  const goal = goals.find(g => g.id === id);
  if (!goal) return;

  document.getElementById('edit-goal-id').value = goal.id;
  document.getElementById('goal-title').value = goal.title;
  document.getElementById('goal-date').value = goal.date || '';
  document.getElementById('goal-status').value = goal.status;
  
  document.getElementById('goal-form-title').textContent = "Editar Objetivo Estratégico";
  document.getElementById('goal-submit-btn').textContent = "Actualizar Objetivo";
  document.getElementById('goal-cancel-btn').style.display = 'block';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetGoalForm() {
  document.getElementById('edit-goal-id').value = '';
  document.getElementById('goal-title').value = '';
  document.getElementById('goal-date').value = '';
  document.getElementById('goal-status').value = 'por-iniciar';
  
  document.getElementById('goal-form-title').textContent = "Nuevo Objetivo Estratégico";
  document.getElementById('goal-submit-btn').textContent = "Registrar Objetivo";
  document.getElementById('goal-cancel-btn').style.display = 'none';
}

function deleteGoal(id) {
  goals = goals.filter(g => g.id !== id);
  saveData();
}

function addWork() {
  const title = document.getElementById('work-title').value;
  const date = document.getElementById('work-date').value;
  const obs = document.getElementById('work-obs').value;
  if (!title.trim()) return;
  works.push({ id: Date.now(), title, date, obs, subtasks: [] });
  document.getElementById('work-title').value = '';
  document.getElementById('work-obs').value = '';
  saveData();
}

function addSubtask(workId, inputEl) {
  if (!inputEl.value.trim()) return;
  works = works.map(w => {
    if (w.id === workId) {
      w.subtasks.push({ id: Date.now(), text: inputEl.value, done: false });
    }
    return w;
  });
  saveData();
}

function toggleSubtask(workId, subId) {
  works = works.map(w => {
    if (w.id === workId) {
      w.subtasks = w.subtasks.map(s => s.id === subId ? {...s, done: !s.done} : s);
    }
    return w;
  });
  saveData();
}

function deleteWork(id) {
  works = works.filter(w => w.id !== id);
  saveData();
}

function renderAll() {
  document.getElementById('quick-tasks-list').innerHTML = quickTasks.map(t => `
    <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px;">
      <span class="formatted-text-block" style="${t.done ? 'text-decoration:line-through; opacity:0.5;' : ''}" onclick="toggleQuickTask(${t.id})">${t.text}</span>
      <button class="delete-btn" onclick="deleteQuickTask(${t.id})">✕</button>
    </div>
  `).join('');

  const statusMap = {
    'por-iniciar': { text: 'Por Iniciar', class: 'bg-por-iniciar', pct: 15, color: '#ef4444' },
    'en-desarrollo': { text: 'En Desarrollo', class: 'bg-en-desarrollo', pct: 50, color: '#f59e0b' },
    'fase-final': { text: 'Fase Final', class: 'bg-fase-final', pct: 85, color: '#38bdf8' },
    'completado': { text: 'Completado', class: 'bg-completado', pct: 100, color: '#10b981' }
  };

  document.getElementById('goals-list').innerHTML = goals.map(g => {
    const info = statusMap[g.status];
    return `
      <div class="card status-${g.status}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="flex:1; padding-right:8px;">
            <div class="formatted-text-block"><strong>${g.title}</strong></div>
            <div style="font-size:0.75rem; color:var(--accent); margin-top:6px;">Plazo Límite: ${g.date || 'Sin fecha'}</div>
          </div>
          <div>
            <button class="edit-btn" onclick="editGoal(${g.id})">Editar</button>
            <button class="delete-btn" onclick="deleteGoal(${g.id})">✕</button>
          </div>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${info.pct}%; background:${info.color}"></div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-muted);">
          <span class="badge-status ${info.class}">${info.text}</span>
          <span>Avance: ${info.pct}%</span>
        </div>
        ${g.quote ? `<div class="literary-quote">${g.quote}</div>` : ''}
      </div>
    `;
  }).join('');

  document.getElementById('works-list').innerHTML = works.map(w => {
    const total = w.subtasks.length;
    const done = w.subtasks.filter(s => s.done).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="flex:1; padding-right:8px;">
            <div class="formatted-text-block"><strong>${w.title}</strong></div>
            <div style="font-size:0.75rem; color:var(--accent); margin-top:4px;">Plazo: ${w.date || 'Sin fecha'}</div>
          </div>
          <button class="delete-btn" onclick="deleteWork(${w.id})">✕</button>
        </div>
        ${w.obs ? `<div class="formatted-text-block" style="font-size:0.8rem; color:var(--text-muted); margin:8px 0;">${w.obs}</div>` : ''}
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${pct}%; background:var(--accent)"></div>
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">Subtareas: ${done}/${total} (${pct}%)</div>
        <div>
          ${w.subtasks.map(s => `
            <div class="subtask-item ${s.done ? 'done' : ''}" onclick="toggleSubtask(${w.id}, ${s.id})">
              <input type="checkbox" ${s.done ? 'checked' : ''}>
              <span class="formatted-text-block">${s.text}</span>
            </div>
          `).join('')}
        </div>
        <div style="display:flex; gap:6px; margin-top:10px;">
          <input type="text" class="input-field" placeholder="Agregar paso..." style="margin-bottom:0; font-size:0.75rem;" onkeypress="if(event.key==='Enter') addSubtask(${w.id}, this)">
        </div>
      </div>
    `;
  }).join('');
}

// --- RELOJ Y TEMAS ---
let currentMode = 'auto';
function setEnv(mode, btnElement) {
  currentMode = mode;
  document.querySelectorAll('.env-btn').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  updateTheme();
}

function updateTheme() {
  const hour = new Date().getHours();
  let mode = currentMode;
  if (mode === 'auto') {
    if (hour >= 6 && hour < 12) mode = 'manana';
    else if (hour >= 12 && hour < 20) mode = 'tarde';
    else mode = 'noche';
  }
  if (mode === 'manana') {
    document.body.style.background = 'linear-gradient(135deg, #0284c7, #38bdf8, #fef08a)';
  } else if (mode === 'tarde') {
    document.body.style.background = 'linear-gradient(135deg, #4c1d95, #c026d3, #fb923c)';
  } else {
    document.body.style.background = 'linear-gradient(135deg, #090d16, #0f172a, #1e1b4b)';
  }
}

function updateClock() {
  const d = new Date();
  document.getElementById('clock').textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  document.getElementById('date').textContent = `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]}`;
  updateTheme();
}
setInterval(updateClock, 1000);
updateClock();

// --- CANVAS DE FONDO ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let particles = Array.from({ length: 30 }, () => ({
  x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2 + 1, dx: Math.random() * 0.5 + 0.2, dy: Math.random() * 0.5 + 0.2
}));

function animateBg() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    p.x += p.dx; p.y += p.dy;
    if (p.x > canvas.width) p.x = 0;
    if (p.y > canvas.height) p.y = 0;
  });
  requestAnimationFrame(animateBg);
}
animateBg();

// --- MINIJUEGO WAR SPACE ARCADE Y CONTROLES DE PAUSA ---
let audioEnabled = true;
let audioCtx = null;
function toggleAudio() {
  audioEnabled = !audioEnabled;
  document.getElementById('audio-toggle-btn').textContent = audioEnabled ? "🔊 Audio: ON" : "🔇 Audio: OFF";
}

function initAudio() { if (!audioCtx && audioEnabled) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }

function playSound(type) {
  if (!audioEnabled || gamePaused) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'laser') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(700, now); osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
      gain.gain.setValueAtTime(0.04, now); gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
    } else if (type === 'superlaser') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(900, now); osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
      gain.gain.setValueAtTime(0.08, now); gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
    } else if (type === 'missile') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);
      gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
    } else if (type === 'explosion') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(15, now + 0.3);
      gain.gain.setValueAtTime(0.12, now); gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
    }
    osc.start(now); osc.stop(now + 0.35);
  } catch(e) {}
}

const gCanvas = document.getElementById('gameCanvas');
const gCtx = gCanvas.getContext('2d');

let gameRunning = false;
let gamePaused = false;
let score = 0;
let level = 1;
let lives = 3;
let powerMissiles = 2;
let player = { x: 160, y: 190, w: 30, h: 26, speed: 6, tilt: 0 };
let bullets = [];
let enemyBullets = [];
let missiles = [];
let powerUps = [];
let enemies = [];
let shootingStars = [];
let explosionFX = [];
let floatingTexts = [];
let keys = {};
let lastEnemyShot = 0;
let superLaserTimer = 0;
let tripleWeaponTimer = 0;
let mothership = { x: 180, y: -60, targetY: 15, w: 120, h: 42, active: false, laserScan: 0 };

for(let i = 0; i < 80; i++) {
  shootingStars.push({
    x: Math.random() * gCanvas.width,
    y: Math.random() * gCanvas.height,
    length: Math.random() * 20 + 10,
    speed: Math.random() * 4 + 2,
    alpha: Math.random() * 0.7 + 0.3,
    isShooting: Math.random() < 0.1
  });
}

window.addEventListener('keydown', e => { 
  if (e.code === 'Space') {
    if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;
    e.preventDefault(); 
    if (gameRunning && !gamePaused) shootBullet();
  }
  keys[e.code] = true; 
  if((e.code === 'KeyB' || e.code === 'KeyX') && gameRunning && !gamePaused) triggerPowerMissile();
  if(e.code === 'KeyP' && gameRunning) togglePauseGame();
});
window.addEventListener('keyup', e => keys[e.code] = false);

const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnShoot = document.getElementById('btn-shoot');
const btnBomb = document.getElementById('btn-bomb');

if(btnUp) { btnUp.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowUp'] = true; }); btnUp.addEventListener('touchend', () => keys['ArrowUp'] = false); }
if(btnDown) { btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowDown'] = true; }); btnDown.addEventListener('touchend', () => keys['ArrowDown'] = false); }
if(btnLeft) { btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowLeft'] = true; }); btnLeft.addEventListener('touchend', () => keys['ArrowLeft'] = false); }
if(btnRight) { btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowRight'] = true; }); btnRight.addEventListener('touchend', () => keys['ArrowRight'] = false); }
if(btnShoot) { btnShoot.addEventListener('touchstart', (e) => { e.preventDefault(); shootBullet(); }); }
if(btnBomb) { btnBomb.addEventListener('touchstart', (e) => { e.preventDefault(); triggerPowerMissile(); }); }

function initGame() {
  document.getElementById('game-modal').classList.add('hidden');
  score = 0; level = 1; lives = 3; powerMissiles = 2;
  player.x = gCanvas.width / 2 - 15; player.y = 190;
  superLaserTimer = 0; tripleWeaponTimer = 0;
  bullets = []; enemyBullets = []; missiles = []; powerUps = []; enemies = []; explosionFX = []; floatingTexts = [];
  gameRunning = true;
  gamePaused = false;
  document.getElementById('pause-btn').textContent = "⏸️ Pausar";
  triggerMothershipSpawn();
  updateGameStats();
  requestAnimationFrame(gameLoop);
}

function togglePauseGame() {
  if (!gameRunning) return;
  gamePaused = !gamePaused;
  const pBtn = document.getElementById('pause-btn');
  if (gamePaused) {
    pBtn.textContent = "▶️ Reanudar";
  } else {
    pBtn.textContent = "⏸️ Pausar";
    requestAnimationFrame(gameLoop);
  }
}

function stopGame() {
  gameRunning = false;
  gamePaused = false;
  document.getElementById('pause-btn').textContent = "⏸️ Pausar";
  gCtx.fillStyle = '#020617';
  gCtx.fillRect(0, 0, gCanvas.width, gCanvas.height);
}

function triggerMothershipSpawn() {
  mothership.y = -60;
  mothership.active = true;
  mothership.laserScan = 0;
}

function shootBullet() {
  if(!gameRunning || gamePaused) return;
  if (superLaserTimer > 0) {
    playSound('superlaser');
    bullets.push({ x: player.x + player.w/2 - 4, y: player.y - 10, w: 8, h: 22, speed: 12, color: '#ec4899', isSuper: true });
  } else if (tripleWeaponTimer > 0) {
    playSound('laser');
    bullets.push({ x: player.x + 2, y: player.y, w: 3, h: 14, speed: 9, color: '#38bdf8' });
    bullets.push({ x: player.x + player.w/2 - 1, y: player.y - 4, w: 3, h: 14, speed: 9, color: '#38bdf8' });
    bullets.push({ x: player.x + player.w - 5, y: player.y, w: 3, h: 14, speed: 9, color: '#38bdf8' });
  } else {
    playSound('laser');
    bullets.push({ x: player.x + 4, y: player.y, w: 3, h: 14, speed: 9, color: '#38bdf8' });
    bullets.push({ x: player.x + player.w - 7, y: player.y, w: 3, h: 14, speed: 9, color: '#38bdf8' });
  }
}

function triggerPowerMissile() {
  if(!gameRunning || gamePaused || powerMissiles <= 0) return;
  powerMissiles--;
  updateGameStats();
  playSound('missile');
  missiles.push({ x: player.x + player.w / 2 - 3, y: player.y, w: 6, h: 18, speed: 10 });
}

function createExplosion(x, y, color, maxRadius) {
  playSound('explosion');
  explosionFX.push({ x, y, radius: 4, maxRadius, alpha: 1.0, color, particles: Array.from({ length: 8 }, () => ({ x, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, alpha: 1.0 })) });
}

function spawnEnemiesForLevel() {
  enemies = [];
  if (level === 7) {
    enemies.push({ x: gCanvas.width / 2 - 45, y: 35, w: 90, h: 40, speed: 2.2, dir: 1, hp: 70, maxHp: 70, isBoss: true, isHunter: true });
  } else {
    let count = 4 + (level * 2);
    let speed = 0.8 + (level * 0.2);
    let baseHp = level >= 3 ? 3 : 2; 
    for (let i = 0; i < count; i++) {
      let isHunter = (level >= 3 && i % 2 === 0);
      enemies.push({ x: (i % 6) * 48 + 15, y: Math.floor(i / 6) * 22 + 30, w: 26, h: 18, speed, dir: 1, hp: baseHp, maxHp: baseHp, isHunter, isBoss: false, waveOffset: i * 0.7 });
    }
  }
}

function updateGameStats() {
  document.getElementById('game-round').textContent = level;
  document.getElementById('game-score').textContent = score;
  document.getElementById('game-lives').textContent = lives;
  document.getElementById('game-bombs').textContent = powerMissiles;
}

function showModal(victory) {
  gameRunning = false;
  gamePaused = false;
  const modal = document.getElementById('game-modal');
  document.getElementById('modal-title').textContent = victory ? "🏆 ¡VICTORIA SUPREMA!" : "💥 MISIÓN FALLIDA";
  document.getElementById('modal-msg').innerHTML = victory ? 
    "Has destruido la Flota Nodriza y asegurado el sector estelar." : 
    "Tu nave de combate ha sido aniquilada en el frente de batalla.";
  document.getElementById('modal-score-val').textContent = score;
  modal.classList.remove('hidden');
}

function drawRealisticJet(x, y, w, h, tilt) {
  gCtx.save();
  gCtx.translate(x + w / 2, y + h / 2);
  gCtx.rotate(tilt);

  gCtx.fillStyle = '#06b6d4';
  gCtx.beginPath();
  gCtx.moveTo(-w*0.2, h/2);
  gCtx.lineTo(0, h/2 + (Math.random() * 8 + 6));
  gCtx.lineTo(w*0.2, h/2);
  gCtx.fill();

  gCtx.fillStyle = '#475569';
  gCtx.beginPath();
  gCtx.moveTo(0, -h/2);
  gCtx.lineTo(-w/2, h*0.4);
  gCtx.lineTo(-w*0.2, h/2);
  gCtx.lineTo(w*0.2, h/2);
  gCtx.lineTo(w/2, h*0.4);
  gCtx.closePath();
  gCtx.fill();

  gCtx.fillStyle = '#38bdf8';
  gCtx.beginPath();
  gCtx.moveTo(0, -h*0.3);
  gCtx.lineTo(-w*0.15, h*0.1);
  gCtx.lineTo(w*0.15, h*0.1);
  gCtx.closePath();
  gCtx.fill();

  gCtx.restore();
}

function drawEnemyWarShip(e) {
  if (e.isBoss) {
    gCtx.fillStyle = '#991b1b';
    gCtx.fillRect(e.x, e.y, e.w, e.h);
    gCtx.fillStyle = '#f59e0b';
    gCtx.fillRect(e.x + e.w * 0.3, e.y + e.h * 0.3, e.w * 0.4, e.h * 0.4);
    let hpPct = e.hp / e.maxHp;
    gCtx.fillStyle = 'rgba(0,0,0,0.6)'; gCtx.fillRect(e.x, e.y - 7, e.w, 4);
    gCtx.fillStyle = '#10b981'; gCtx.fillRect(e.x, e.y - 7, e.w * hpPct, 4);
  } else {
    gCtx.fillStyle = e.isHunter ? '#dc2626' : '#64748b';
    gCtx.beginPath();
    gCtx.moveTo(e.x + e.w/2, e.y + e.h);
    gCtx.lineTo(e.x, e.y);
    gCtx.lineTo(e.x + e.w*0.3, e.y + e.h*0.3);
    gCtx.lineTo(e.x + e.w*0.7, e.y + e.h*0.3);
    gCtx.lineTo(e.x + e.w, e.y);
    gCtx.closePath();
    gCtx.fill();
  }
}

function gameLoop() {
  if (!gameRunning || gamePaused) return;

  gCtx.fillStyle = '#020617';
  gCtx.fillRect(0, 0, gCanvas.width, gCanvas.height);

  gCtx.fillStyle = '#ffffff';
  shootingStars.forEach(s => {
    gCtx.globalAlpha = s.alpha;
    if (s.isShooting) {
      gCtx.fillRect(s.x, s.y, s.length, 1.5);
      s.x -= s.speed * 1.5;
      s.y += s.speed;
      if (s.x < 0 || s.y > gCanvas.height) { s.x = gCanvas.width + 20; s.y = Math.random() * gCanvas.height; }
    } else {
      gCtx.fillRect(s.x, s.y, 1.5, 1.5);
      s.y += s.speed * 0.3;
      if (s.y > gCanvas.height) s.y = 0;
    }
  });
  gCtx.globalAlpha = 1.0;

  if (mothership.active) {
    if (mothership.y < mothership.targetY) {
      mothership.y += 0.8;
    } else {
      spawnEnemiesForLevel();
      mothership.active = false;
    }
    gCtx.fillStyle = '#1e293b';
    gCtx.beginPath();
    gCtx.ellipse(mothership.x, mothership.y, mothership.w / 2, mothership.h / 2, 0, 0, Math.PI * 2);
    gCtx.fill();
    gCtx.strokeStyle = '#ef4444';
    gCtx.lineWidth = 2;
    gCtx.stroke();

    mothership.laserScan += 0.1;
    gCtx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    gCtx.lineWidth = 3;
    gCtx.beginPath();
    gCtx.moveTo(mothership.x, mothership.y + mothership.h/2);
    gCtx.lineTo(mothership.x + Math.sin(mothership.laserScan)*80, gCanvas.height);
    gCtx.stroke();
  }

  if (superLaserTimer > 0) superLaserTimer--;
  if (tripleWeaponTimer > 0) tripleWeaponTimer--;

  let movingLeft = keys['ArrowLeft'] || keys['KeyA'];
  let movingRight = keys['ArrowRight'] || keys['KeyD'];
  let movingUp = keys['ArrowUp'] || keys['KeyW'];
  let movingDown = keys['ArrowDown'] || keys['KeyS'];

  if (movingLeft && player.x > 0) { player.x -= player.speed; player.tilt = -0.25; }
  else if (movingRight && player.x < gCanvas.width - player.w) { player.x += player.speed; player.tilt = 0.25; }
  else { player.tilt = 0; }
  if (movingUp && player.y > 35) player.y -= player.speed;
  if (movingDown && player.y < gCanvas.height - player.h - 10) player.y += player.speed;

  drawRealisticJet(player.x, player.y, player.w, player.h, player.tilt);

  bullets.forEach((b, index) => {
    b.y -= b.speed;
    gCtx.fillStyle = b.color;
    gCtx.fillRect(b.x, b.y, b.w, b.h);
    if (b.y < 0) bullets.splice(index, 1);
  });

  gCtx.fillStyle = '#fde047';
  missiles.forEach((m, mIdx) => {
    m.y -= m.speed;
    gCtx.fillRect(m.x, m.y, m.w, m.h);
    enemies.forEach((e) => {
      if (m.x < e.x + e.w && m.x + m.w > e.x && m.y < e.y + e.h && m.y + m.h > e.y) {
        missiles.splice(mIdx, 1);
        createExplosion(e.x + e.w/2, e.y + e.h/2, '#fde047', 70);
        let destroyedCount = 0;
        enemies = enemies.filter(en => {
          let dist = Math.hypot((en.x + en.w/2) - (e.x + e.w/2), (en.y + en.h/2) - (e.y + e.h/2));
          if (dist < 80) { destroyedCount++; return false; }
          return true;
        });
        if (destroyedCount >= 3) {
          floatingTexts.push({ text: "💥 ¡BOOM SUPREMO!", x: e.x - 25, y: e.y, alpha: 1.0, color: '#fde047' });
        }
        score += 250; updateGameStats();
      }
    });
    if (m.y < 0) missiles.splice(mIdx, 1);
  });

  let now = Date.now();
  if (now - lastEnemyShot > (1000 - level * 50) && enemies.length > 0 && !mothership.active) {
    let randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    enemyBullets.push({ x: randomEnemy.x + randomEnemy.w / 2, y: randomEnemy.y + randomEnemy.h, w: 3, h: 10, speed: 4.5 });
    playSound('laser');
    lastEnemyShot = now;
  }

  gCtx.fillStyle = '#ef4444';
  enemyBullets.forEach((eb, index) => {
    eb.y += eb.speed;
    gCtx.fillRect(eb.x, eb.y, eb.w, eb.h);
    if (eb.x > player.x && eb.x < player.x + player.w && eb.y > player.y && eb.y < player.y + player.h) {
      enemyBullets.splice(index, 1);
      lives--;
      createExplosion(player.x + player.w/2, player.y + player.h/2, '#ef4444', 35);
      updateGameStats();
      if (lives <= 0) showModal(false);
    }
    if (eb.y > gCanvas.height) enemyBullets.splice(index, 1);
  });

  powerUps.forEach((p, pIdx) => {
    p.y += 1.5;
    gCtx.fillStyle = p.type === 'triple' ? '#38bdf8' : '#ec4899';
    gCtx.beginPath(); gCtx.arc(p.x, p.y, 9, 0, Math.PI * 2); gCtx.fill();
    if (p.x > player.x && p.x < player.x + player.w && p.y > player.y && p.y < player.y + player.h) {
      playSound('superlaser');
      if (p.type === 'triple') { tripleWeaponTimer = 300; floatingTexts.push({ text: "⚡ ¡ARMAS TRIPLES!", x: player.x, y: player.y - 10, alpha: 1.0, color: '#38bdf8' }); }
      else { superLaserTimer = 250; floatingTexts.push({ text: "🔥 ¡SUPER RAYO PLASMA!", x: player.x, y: player.y - 10, alpha: 1.0, color: '#ec4899' }); }
      powerUps.splice(pIdx, 1);
    }
    if (p.y > gCanvas.height) powerUps.splice(pIdx, 1);
  });

  enemies.forEach(e => {
    if (e.isHunter) {
      if (e.x < player.x) e.x += e.speed * 0.65;
      if (e.x > player.x) e.x -= e.speed * 0.65;
      e.y += e.speed * 0.4;
    } else {
      e.x += e.speed * e.dir;
      e.y += Math.sin(Date.now() * 0.004 + e.waveOffset) * 0.35;
      if (e.x > gCanvas.width - e.w || e.x < 0) { e.dir *= -1; if (!e.isBoss) e.y += 5; }
    }
    if (e.y >= player.y - 10) { lives--; showModal(false); }
  });

  enemies.forEach((e, eIndex) => {
    drawEnemyWarShip(e);
    bullets.forEach((b, bIndex) => {
      if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
        if (!b.isSuper) bullets.splice(bIndex, 1);
        e.hp--;
        if (e.hp <= 0) {
          createExplosion(e.x + e.w/2, e.y + e.h/2, '#38bdf8', 35);
          if (Math.random() < 0.45) {
            let buffType = Math.random() < 0.5 ? 'triple' : 'super';
            powerUps.push({ x: e.x + e.w / 2, y: e.y, type: buffType });
          }
          enemies.splice(eIndex, 1);
          score += e.isBoss ? 800 : (40 * level);
          updateGameStats();
        }
      }
    });
  });

  explosionFX.forEach((fx, fxIdx) => {
    fx.radius += 2.5; fx.alpha -= 0.03;
    gCtx.strokeStyle = fx.color; fx.lineWidth = 1.5;
    gCtx.beginPath(); gCtx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2); gCtx.stroke();
    if (fx.alpha <= 0) explosionFX.splice(fxIdx, 1);
  });

  floatingTexts.forEach((ft, ftIdx) => {
    ft.y -= 0.8; ft.alpha -= 0.025;
    gCtx.font = "bold 12px 'Plus Jakarta Sans'"; gCtx.fillStyle = ft.color;
    gCtx.globalAlpha = Math.max(0, ft.alpha); gCtx.fillText(ft.text, ft.x, ft.y); gCtx.globalAlpha = 1.0;
    if (ft.alpha <= 0) floatingTexts.splice(ftIdx, 1);
  });

  if (enemies.length === 0 && !mothership.active) {
    if (level < 7) { level++; updateGameStats(); triggerMothershipSpawn(); }
    else { showModal(true); }
  }

  if (gameRunning && !gamePaused) requestAnimationFrame(gameLoop);
}

renderAll();