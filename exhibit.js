/* ===========================
   TRASH TO ART — JRU
   script.js  (optimised)
=========================== */
"use strict";

/* ── 1. CUSTOM CURSOR ─────────────────────────────────── */
const cursor      = document.getElementById("cursor");
const cursorTrail = document.getElementById("cursorTrail");
cursor.style.left = "0"; cursor.style.top = "0";
cursorTrail.style.left = "0"; cursorTrail.style.top = "0";

let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
}, { passive: true });

function animateTrail() {
  const dx = mouseX - trailX, dy = mouseY - trailY;
  if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
    trailX += dx * 0.12; trailY += dy * 0.12;
    cursorTrail.style.transform = `translate(calc(${trailX}px - 50%), calc(${trailY}px - 50%))`;
  }
  requestAnimationFrame(animateTrail);
}
animateTrail();

document.querySelectorAll("a, button, .material-card, .gallery-item, .stat-card").forEach((el) => {
  el.addEventListener("mouseenter", () => { cursor.style.width="28px"; cursor.style.height="28px"; }, { passive: true });
  el.addEventListener("mouseleave", () => { cursor.style.width="14px"; cursor.style.height="14px"; }, { passive: true });
});

let idleTimer;
document.addEventListener("mousemove", () => {
  cursor.style.opacity = "1"; cursorTrail.style.opacity = "0.5";
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { cursor.style.opacity="0"; cursorTrail.style.opacity="0"; }, 3000);
}, { passive: true });


/* ── 2. PARTICLE SYSTEM (single canvas, no DOM spam) ──── */
const pCanvas = document.createElement("canvas");
pCanvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0.55;";
const oldParticles = document.getElementById("particles");
if (oldParticles) oldParticles.replaceWith(pCanvas);
const pCtx = pCanvas.getContext("2d");
const P_COLORS = ["#c8f03c","#f0a500","#ff5733","#4ecdc4"];
const pList = [];
const P_MAX = 16;

function resizePCanvas() { pCanvas.width=innerWidth; pCanvas.height=innerHeight; }
resizePCanvas();
window.addEventListener("resize", resizePCanvas, { passive: true });

function spawnP() {
  if (pList.length >= P_MAX) return;
  pList.push({ x: Math.random()*pCanvas.width, y: pCanvas.height+8,
    r: Math.random()*4+1.5, vx:(Math.random()-.5)*.35, vy:-(Math.random()*.55+.25),
    color: P_COLORS[Math.floor(Math.random()*P_COLORS.length)],
    life:1, decay: Math.random()*.0018+.0009 });
}
setInterval(spawnP, 2800);

(function pLoop() {
  pCtx.clearRect(0,0,pCanvas.width,pCanvas.height);
  for (let i=pList.length-1;i>=0;i--) {
    const p=pList[i]; p.x+=p.vx; p.y+=p.vy; p.life-=p.decay;
    if (p.life<=0||p.y<-8){pList.splice(i,1);continue;}
    pCtx.globalAlpha=p.life*.45; pCtx.fillStyle=p.color;
    pCtx.beginPath(); pCtx.arc(p.x,p.y,p.r,0,Math.PI*2); pCtx.fill();
  }
  pCtx.globalAlpha=1;
  requestAnimationFrame(pLoop);
})();


/* ── 3. SCROLL REVEAL ──────────────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.dataset.delay ? parseFloat(el.dataset.delay)*150 : 0;
      setTimeout(() => el.classList.add("visible"), delay);
      revealObs.unobserve(el);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));


/* ── 4. COUNTER ANIMATION ──────────────────────────────── */
function animateCounter(el, target) {
  const dur=1500, start=performance.now();
  function tick(now) {
    const p=Math.min((now-start)/dur,1);
    el.textContent=Math.round((1-Math.pow(1-p,3))*target);
    if (p<1) requestAnimationFrame(tick); else el.textContent=target;
  }
  requestAnimationFrame(tick);
}
new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      animateCounter(e.target.querySelector(".stat-number"), parseInt(e.target.dataset.count,10));
      e.target._obs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 }).takeRecords;

// simpler approach
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target.querySelector(".stat-number"), parseInt(entry.target.dataset.count,10));
    counterObs.unobserve(entry.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll(".stat-card").forEach((c) => counterObs.observe(c));


/* ── 5. IMPACT METER ───────────────────────────────────── */
const meterFill = document.getElementById("meterFill");
if (meterFill) {
  const mo = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { setTimeout(()=>{meterFill.style.width="100%";},400); mo.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  mo.observe(meterFill.closest(".impact-meter"));
}


/* ── 6. MATERIAL CARDS ─────────────────────────────────── */
const materialCards = document.querySelectorAll(".material-card");
materialCards.forEach((card) => {
  card.addEventListener("click", () => {
    const wasActive = card.classList.contains("active");
    materialCards.forEach((c) => c.classList.remove("active"));
    if (!wasActive) card.classList.add("active");
  });
});


/* ── 7. TIMELINE DELAYS ─────────────────────────────────── */
document.querySelectorAll(".timeline-item").forEach((item) => {
  item.style.transitionDelay = ((parseInt(item.dataset.step,10)||1)-1)*0.12+"s";
});


/* ── 8. GALLERY ENTRANCE ────────────────────────────────── */
const galleryArr = Array.from(document.querySelectorAll(".gallery-item"));
const galObs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = galleryArr.indexOf(entry.target)*.07+"s";
      entry.target.classList.add("visible");
      galObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
galleryArr.forEach((g) => galObs.observe(g));


/* ── 9. SCROLL PARALLAX — throttled ─────────────────────── */
let scrollRAF = false;
const heroVisual = document.getElementById("heroVisual");
const heroBgText = document.querySelector(".hero-bg-text");
window.addEventListener("scroll", () => {
  if (scrollRAF) return; scrollRAF = true;
  requestAnimationFrame(() => {
    const sy = scrollY;
    if (heroVisual) heroVisual.style.transform = `translateY(${sy*.1}px)`;
    if (heroBgText)  heroBgText.style.transform  = `translate(-50%,calc(-50% + ${sy*.06}px))`;
    scrollRAF = false;
  });
}, { passive: true });


/* ── 10. SECTION ACCENT ──────────────────────────────────── */
const sectionColors = { about:"#c8f03c", timeline:"#f0a500", materials:"#4ecdc4", impact:"#ff5733", gallery:"#c8f03c" };
const secObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const c = sectionColors[e.target.id];
      if (c) document.documentElement.style.setProperty("--accent", c);
    }
  });
}, { threshold: 0.45 });
document.querySelectorAll(".section").forEach((s) => secObs.observe(s));


/* ── 11. EASTER EGG ──────────────────────────────────────── */
let typed = "";
document.addEventListener("keydown", (e) => {
  typed += e.key.toLowerCase(); if (typed.length>7) typed=typed.slice(-7);
  if (typed==="recycle") { triggerConfetti(); typed=""; }
});
function triggerConfetti() {
  if (!document.getElementById("cSty")) {
    const s=document.createElement("style"); s.id="cSty";
    s.textContent=`@keyframes cF{0%{transform:translateY(0)rotate(0);opacity:1}100%{transform:translateY(100vh)rotate(720deg);opacity:0}}`;
    document.head.appendChild(s);
  }
  const cols=["#c8f03c","#f0a500","#ff5733","#4ecdc4","#fff"];
  for(let i=0;i<38;i++){
    const d=document.createElement("div");
    d.style.cssText=`position:fixed;width:${Math.random()*8+4}px;height:${Math.random()*8+4}px;background:${cols[i%5]};left:${Math.random()*100}vw;top:-10px;border-radius:${Math.random()>.5?"50%":"0"};z-index:9999;pointer-events:none;animation:cF ${Math.random()*2+1.5}s ease-in forwards`;
    document.body.appendChild(d); setTimeout(()=>d.remove(),3500);
  }
  const m=document.createElement("div");
  m.textContent="♻ JRU Eco Hero! 💚";
  m.style.cssText=`position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:var(--accent);color:#0a0a08;font-family:'Space Mono',monospace;font-size:13px;padding:12px 24px;border-radius:4px;z-index:9999;pointer-events:none`;
  document.body.appendChild(m); setTimeout(()=>m.remove(),3000);
}


/* ══════════════════════════════════════════════════════════
   GAME SYSTEM
══════════════════════════════════════════════════════════ */
const gameInits = { "modal-toss":initPaperToss, "modal-sort":initSorting, "modal-draw":initDrawing, "modal-robot":initRobot };
const activeGames = {};
const gameRAFs  = {};

function openGame(id) {
  const modal = document.getElementById(id); if (!modal) return;
  modal.classList.add("open"); document.body.style.overflow="hidden";
  if (gameInits[id] && !activeGames[id]) { activeGames[id]=true; gameInits[id](); }
}
function closeGame(id) {
  const modal = document.getElementById(id); if (!modal) return;
  modal.classList.remove("open"); document.body.style.overflow="";
  // Pause canvas loops
  if (gameRAFs[id]) { cancelAnimationFrame(gameRAFs[id]); gameRAFs[id]=null; }
}

document.querySelectorAll(".game-trigger").forEach((el) => el.addEventListener("click",()=>openGame(el.dataset.modal)));
document.querySelectorAll(".modal-close-btn").forEach((btn) => btn.addEventListener("click",()=>closeGame(btn.dataset.close)));
document.querySelectorAll(".game-modal").forEach((m) => m.addEventListener("click",(e)=>{ if(e.target===m) closeGame(m.id); }));
document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") document.querySelectorAll(".game-modal.open").forEach(m=>closeGame(m.id)); });


/* ══════════════════════════════════════════════════════════
   GAME 1 — PAPER TOSS
══════════════════════════════════════════════════════════ */
function initPaperToss() {
  const canvas=document.getElementById("tossCanvas"), ctx=canvas.getContext("2d");
  const W=canvas.width, H=canvas.height, G=0.36;
  const CAN={x:W-130,y:H-160,w:76,h:90};
  const SPAWN={x:100,y:H-80};
  let score=0,throws=0,streak=0;
  let ball,drag=null,flying=false,scored=false;
  let effects=[],rimShake=0,active=true;

  function resetBall(){ball={x:SPAWN.x,y:SPAWN.y,vx:0,vy:0,r:18,angle:0};flying=false;scored=false;drag=null;}
  resetBall();
  function hud(){document.getElementById("tossScore").textContent=score;document.getElementById("tossThrows").textContent=throws;document.getElementById("tossStreak").textContent=streak;}

  function update(){
    if(!flying||!ball)return;
    ball.vx*=.997;ball.vy+=G;ball.x+=ball.vx;ball.y+=ball.vy;ball.angle+=ball.vx*.04;
    if(rimShake>0)rimShake-=.2;
    const rx=CAN.x+CAN.w/2,ry=CAN.y,dist=Math.abs(ball.x-rx);
    if(!scored&&ball.y>=ry-10&&ball.y<=ry+20&&dist<CAN.w/2-ball.r/2){
      score++;streak++;throws++;scored=true;rimShake=6;
      effects.push({x:rx,y:ry-20,text:streak>=3?`🔥x${streak}`:"+1",color:streak>=3?"#f0a500":"#c8f03c",life:50,vy:-1.4});
      setTimeout(resetBall,800);hud();
    }
    if(!scored&&Math.abs(ball.y-ry)<14&&dist>CAN.w/2-6&&dist<CAN.w/2+6){ball.vx*=-.35;ball.vy*=-.25;rimShake=3;}
    if(ball.y>H+20||ball.x<-30||ball.x>W+30){
      if(!scored){streak=0;throws++;effects.push({x:W/2,y:H/2,text:"MISS",color:"#ff5733",life:40,vy:-.9});hud();}
      setTimeout(resetBall,500);flying=false;
    }
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    // bg grid (very sparse)
    ctx.strokeStyle="rgba(200,240,60,0.025)";ctx.lineWidth=1;
    for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    // floor
    ctx.fillStyle="#1a2e1a";ctx.fillRect(0,H-28,W,28);
    // can
    const {x,y,w,h}=CAN,sx=rimShake>0?Math.sin(rimShake*2)*2:0;
    ctx.save();ctx.translate(sx,0);
    const gr=ctx.createLinearGradient(x,y,x+w,y);
    gr.addColorStop(0,"#3a3a28");gr.addColorStop(.5,"#5a5a3a");gr.addColorStop(1,"#2a2a1a");
    ctx.fillStyle=gr;
    ctx.beginPath();ctx.moveTo(x+6,y);ctx.lineTo(x+w-6,y);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();ctx.fill();
    ctx.fillStyle="rgba(200,240,60,0.18)";ctx.font="26px serif";ctx.textAlign="center";ctx.fillText("♻",x+w/2,y+h/2+9);
    ctx.shadowColor="#c8f03c";ctx.shadowBlur=rimShake>0?16:4;
    ctx.strokeStyle=rimShake>0?"#ffff00":"#c8f03c";ctx.lineWidth=2.5;
    ctx.beginPath();ctx.ellipse(x+w/2,y,w/2,7,0,0,Math.PI*2);ctx.stroke();
    ctx.shadowBlur=0;ctx.restore();
    // drag preview
    if(drag&&!flying&&ball){
      const dx=ball.x-drag.ex,dy=ball.y-drag.ey,pow=Math.min(Math.sqrt(dx*dx+dy*dy),120);
      if(pow>8){
        const nx=dx/pow,ny=dy/pow;
        ctx.save();ctx.setLineDash([5,6]);ctx.strokeStyle="rgba(200,240,60,0.38)";ctx.lineWidth=1.5;
        ctx.beginPath();let px=ball.x,py=ball.y,pvx=nx*pow*.13,pvy=ny*pow*.13;ctx.moveTo(px,py);
        for(let i=0;i<32;i++){pvx*=.995;pvy+=G;px+=pvx;py+=pvy;ctx.lineTo(px,py);if(py>H)break;}
        ctx.stroke();ctx.setLineDash([]);
        ctx.strokeStyle=`hsl(${100-pow/120*80},90%,55%)`;ctx.lineWidth=2.5;
        ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r+6,-Math.PI/2,-Math.PI/2+pow/120*Math.PI*2);ctx.stroke();
        ctx.restore();
      }
    }
    // ball
    if(ball){
      ctx.save();ctx.translate(ball.x,ball.y);ctx.rotate(ball.angle);
      ctx.shadowColor="rgba(0,0,0,0.35)";ctx.shadowBlur=5;
      ctx.fillStyle="#e8e0c0";ctx.beginPath();ctx.arc(0,0,ball.r,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;ctx.strokeStyle="#c0b890";ctx.lineWidth=1;
      for(let i=0;i<4;i++){const a=i/4*Math.PI*2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*ball.r*.7,Math.sin(a)*ball.r*.7);ctx.stroke();}
      ctx.restore();
    }
    // effects
    effects=effects.filter(e=>e.life>0);
    effects.forEach(e=>{
      ctx.globalAlpha=e.life/50;ctx.fillStyle=e.color;
      ctx.font="bold 24px 'Bebas Neue',sans-serif";ctx.textAlign="center";
      ctx.fillText(e.text,e.x,e.y);e.y+=e.vy;e.life--;
    });ctx.globalAlpha=1;
    if(throws===0&&!flying){
      ctx.fillStyle="rgba(200,240,60,0.4)";ctx.font="12px 'Space Mono',monospace";ctx.textAlign="center";
      ctx.fillText("Drag the paper ball · release to throw!",W/2,34);
    }
  }

  function loop(){if(!active)return;update();draw();gameRAFs["modal-toss"]=requestAnimationFrame(loop);}
  loop();

  // Pause on close
  document.querySelector('[data-close="modal-toss"]').addEventListener("click",()=>{active=false;});
  document.getElementById("modal-toss").addEventListener("click",(e)=>{if(e.target===document.getElementById("modal-toss"))active=false;});
  // Resume on open
  const origTrigger=document.querySelector('[data-modal="modal-toss"]');
  if(origTrigger)origTrigger.addEventListener("click",()=>{if(!active){active=true;loop();}});

  function getPos(e){const r=canvas.getBoundingClientRect(),s=e.touches?e.touches[0]:e;return{x:(s.clientX-r.left)*(W/r.width),y:(s.clientY-r.top)*(H/r.height)};}
  canvas.addEventListener("mousedown",(e)=>{if(flying||!ball)return;const p=getPos(e);if(Math.hypot(p.x-ball.x,p.y-ball.y)<ball.r*2.8)drag={ex:p.x,ey:p.y};});
  canvas.addEventListener("mousemove",(e)=>{if(!drag||flying)return;e.preventDefault();const p=getPos(e);drag.ex=p.x;drag.ey=p.y;});
  canvas.addEventListener("mouseup",()=>{
    if(!drag||flying)return;
    const dx=ball.x-drag.ex,dy=ball.y-drag.ey,pow=Math.min(Math.sqrt(dx*dx+dy*dy),120);
    if(pow<10){drag=null;return;}
    ball.vx=dx/pow*pow*.13;ball.vy=dy/pow*pow*.13;flying=true;drag=null;
  });
  canvas.addEventListener("touchstart",(e)=>{if(flying||!ball)return;const p=getPos(e);if(Math.hypot(p.x-ball.x,p.y-ball.y)<ball.r*2.8)drag={ex:p.x,ey:p.y};},{passive:true});
  canvas.addEventListener("touchmove",(e)=>{if(!drag||flying)return;e.preventDefault();const p=getPos(e);drag.ex=p.x;drag.ey=p.y;},{passive:false});
  canvas.addEventListener("touchend",()=>{
    if(!drag||flying)return;
    const dx=ball.x-drag.ex,dy=ball.y-drag.ey,pow=Math.min(Math.sqrt(dx*dx+dy*dy),120);
    if(pow<10){drag=null;return;}
    ball.vx=dx/pow*pow*.13;ball.vy=dy/pow*pow*.13;flying=true;drag=null;
  });
  document.getElementById("tossReset").addEventListener("click",()=>{score=throws=streak=0;effects=[];rimShake=0;resetBall();hud();active=true;if(!gameRAFs["modal-toss"])loop();});
}


/* ══════════════════════════════════════════════════════════
   GAME 2 — SORTING CHALLENGE
══════════════════════════════════════════════════════════ */
function initSorting() {
  const ITEMS=[
    {name:"Plastic Bottle",emoji:"🧴",rec:true},{name:"Banana Peel",emoji:"🍌",rec:false},
    {name:"Newspaper",emoji:"📰",rec:true},{name:"Food Scraps",emoji:"🍱",rec:false},
    {name:"Glass Jar",emoji:"🫙",rec:true},{name:"Styrofoam Cup",emoji:"🥤",rec:false},
    {name:"Aluminum Can",emoji:"🥫",rec:true},{name:"Dirty Diaper",emoji:"👶",rec:false},
    {name:"Cardboard Box",emoji:"📦",rec:true},{name:"Cigarette Butt",emoji:"🚬",rec:false},
    {name:"Steel Wire",emoji:"🔌",rec:true},{name:"Used Tissue",emoji:"🤧",rec:false},
  ];
  const shuffle=a=>[...a].sort(()=>Math.random()-.5);
  let queue,idx,score;
  const $=id=>document.getElementById(id);
  const card=$("sortItemCard"),emoEl=$("sortItemEmoji"),nameEl=$("sortItemName"),
        progEl=$("sortProgressFill"),fbEl=$("sortFeedback"),scoreEl=$("sortScore"),
        countEl=$("sortCount"),endscreen=$("sortEndscreen"),endScEl=$("endScore");

  function start(){queue=shuffle(ITEMS);idx=0;score=0;endscreen.classList.remove("show");card.className="sort-item-card";show();}
  function show(){
    const it=queue[idx];emoEl.textContent=it.emoji;nameEl.textContent=it.name;
    progEl.style.width=`${idx/queue.length*100}%`;countEl.textContent=`${idx+1}/${queue.length}`;
    scoreEl.textContent=score;fbEl.textContent="";fbEl.className="sort-feedback";card.className="sort-item-card";
  }
  function answer(isRec){
    if(idx>=queue.length)return;
    const ok=queue[idx].rec===isRec;
    score=ok?score+10:Math.max(0,score-5);
    fbEl.textContent=ok?"✅ +10":"❌ -5";fbEl.className="sort-feedback "+(ok?"correct":"wrong");
    card.classList.add(isRec?"fly-left":"fly-right");scoreEl.textContent=score;
    setTimeout(()=>{idx++;idx>=queue.length?end():show();},460);
  }
  function end(){
    progEl.style.width="100%";
    const pct=Math.round(score/(queue.length*10)*100);
    const msg=pct>=80?"🌍 Eco Champion!":pct>=50?"♻️ Good Sorter!":"📚 Keep Learning!";
    endScEl.textContent=`${score}/${queue.length*10} pts — ${msg}`;endscreen.classList.add("show");
  }
  $("sortRecycleBtn").addEventListener("click",()=>answer(true));
  $("sortTrashBtn").addEventListener("click",()=>answer(false));
  $("sortLeftBin").addEventListener("click",()=>answer(true));
  $("sortRightBin").addEventListener("click",()=>answer(false));
  $("sortReset").addEventListener("click",start);
  $("sortPlayAgain").addEventListener("click",start);
  document.addEventListener("keydown",(e)=>{
    if(!document.getElementById("modal-sort").classList.contains("open"))return;
    if(e.key==="ArrowLeft")answer(true);if(e.key==="ArrowRight")answer(false);
  });
  start();
}


/* ══════════════════════════════════════════════════════════
   GAME 3 — DESIGN STUDIO
══════════════════════════════════════════════════════════ */
function initDrawing() {
  const canvas=document.getElementById("drawCanvas"),ctx=canvas.getContext("2d");
  let painting=false,lastX=0,lastY=0,color="#c8f03c",brushSize=4,tool="pen";

  function resize(){const r=canvas.getBoundingClientRect(),img=ctx.getImageData(0,0,canvas.width,canvas.height);canvas.width=r.width;canvas.height=r.height;ctx.putImageData(img,0,0);}
  resize();

  function blankCanvas(){
    ctx.fillStyle="#1a1a10";ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle="rgba(255,255,255,0.03)";ctx.lineWidth=1;
    for(let x=0;x<canvas.width;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke();}
    for(let y=0;y<canvas.height;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke();}
  }
  blankCanvas();
  ctx.fillStyle="rgba(200,240,60,0.13)";ctx.font="14px 'Space Mono',monospace";ctx.textAlign="center";
  ctx.fillText("Your canvas — start sketching!",canvas.width/2,canvas.height/2);

  const gp=e=>{const r=canvas.getBoundingClientRect(),s=e.touches?e.touches[0]:e;return{x:s.clientX-r.left,y:s.clientY-r.top};};

  function h2r(h){const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);return r?{r:parseInt(r[1],16),g:parseInt(r[2],16),b:parseInt(r[3],16)}:null;}
  function fill(sx,sy,fc){
    sx=Math.round(sx);sy=Math.round(sy);
    const d=ctx.getImageData(0,0,canvas.width,canvas.height),data=d.data;
    const i=(sy*canvas.width+sx)*4,tR=data[i],tG=data[i+1],tB=data[i+2],f=h2r(fc);
    if(!f||tR===f.r&&tG===f.g&&tB===f.b)return;
    const stack=[[sx,sy]],vis=new Uint8Array(canvas.width*canvas.height);
    const m=i=>data[i]===tR&&data[i+1]===tG&&data[i+2]===tB;
    const p=i=>{data[i]=f.r;data[i+1]=f.g;data[i+2]=f.b;data[i+3]=255;};
    let lim=0;
    while(stack.length&&lim++<80000){
      const[x,y]=stack.pop();if(x<0||x>=canvas.width||y<0||y>=canvas.height)continue;
      const i=(y*canvas.width+x)*4,vi=y*canvas.width+x;if(vis[vi]||!m(i))continue;
      vis[vi]=1;p(i);stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
    }
    ctx.putImageData(d,0,0);
  }

  canvas.addEventListener("mousedown",(e)=>{e.preventDefault();const p=gp(e);if(tool==="fill"){fill(p.x,p.y,color);return;}painting=true;lastX=p.x;lastY=p.y;});
  canvas.addEventListener("mousemove",(e)=>{if(!painting)return;e.preventDefault();const p=gp(e);ctx.strokeStyle=tool==="eraser"?"#1a1a10":color;ctx.lineWidth=tool==="eraser"?brushSize*3:brushSize;ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();ctx.moveTo(lastX,lastY);ctx.lineTo(p.x,p.y);ctx.stroke();lastX=p.x;lastY=p.y;});
  canvas.addEventListener("mouseup",()=>painting=false);
  canvas.addEventListener("mouseleave",()=>painting=false);
  canvas.addEventListener("touchstart",(e)=>{e.preventDefault();const p=gp(e);if(tool==="fill"){fill(p.x,p.y,color);return;}painting=true;lastX=p.x;lastY=p.y;},{passive:false});
  canvas.addEventListener("touchmove",(e)=>{if(!painting)return;e.preventDefault();const p=gp(e);ctx.strokeStyle=tool==="eraser"?"#1a1a10":color;ctx.lineWidth=tool==="eraser"?brushSize*3:brushSize;ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();ctx.moveTo(lastX,lastY);ctx.lineTo(p.x,p.y);ctx.stroke();lastX=p.x;lastY=p.y;},{passive:false});
  canvas.addEventListener("touchend",()=>painting=false);

  document.querySelectorAll(".color-swatch").forEach(sw=>{sw.addEventListener("click",()=>{document.querySelectorAll(".color-swatch").forEach(s=>s.classList.remove("active"));sw.classList.add("active");color=sw.dataset.color;tool="pen";document.getElementById("penTool").classList.add("active");document.getElementById("eraserTool").classList.remove("active");document.getElementById("fillTool").classList.remove("active");});});
  document.querySelectorAll(".brush-btn").forEach(b=>{b.addEventListener("click",()=>{document.querySelectorAll(".brush-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");brushSize=parseInt(b.dataset.size);});});
  document.getElementById("penTool").addEventListener("click",()=>{tool="pen";document.getElementById("penTool").classList.add("active");document.getElementById("eraserTool").classList.remove("active");document.getElementById("fillTool").classList.remove("active");});
  document.getElementById("eraserTool").addEventListener("click",()=>{tool="eraser";document.getElementById("eraserTool").classList.add("active");document.getElementById("penTool").classList.remove("active");document.getElementById("fillTool").classList.remove("active");});
  document.getElementById("fillTool").addEventListener("click",()=>{tool="fill";document.getElementById("fillTool").classList.add("active");document.getElementById("penTool").classList.remove("active");document.getElementById("eraserTool").classList.remove("active");});
  document.getElementById("clearCanvas").addEventListener("click",blankCanvas);
}


/* ══════════════════════════════════════════════════════════
   GAME 4 — ROBOT BUILDER
══════════════════════════════════════════════════════════ */
function initRobot() {
  const canvas=document.getElementById("robotCanvas"),ctx=canvas.getContext("2d");
  const W=canvas.width,H=canvas.height;
  const SPEECHES={
    idle:["...", "Beep boop.", "Made of recycled dreams."],
    happy:["YAAAAY! ♻️","I love being green!","Eco-robot GO! 🌿"],
    dance:["🕺 BOOGIE!","Move it!","Disco trash! 🪩"],
    sad:["*sad beeps*","The ocean is crying...","Please recycle... 😢"],
  };
  const PC={
    head:{can:"#8a8a5a",box:"#c8a060",bottle:"#80c0e0"},
    body:{crate:"#5a8a5a",carton:"#c08040",barrel:"#808080"},
    arms:{tubes:"#80c0a0",wires:"#e0c030",bottles:"#90b0d0"},
    legs:{cans:"#a0a060",pipes:"#707090",cardboard:"#c0905a"},
  };
  let parts={head:null,body:null,arms:null,legs:null},emotion="idle",animT=0,rafId=null;
  const isOk=()=>parts.head&&parts.body&&parts.arms&&parts.legs;

  function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
  function limb(x1,y1,x2,y2,lw,c){ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  function arm(bx,by,ang,left,c){
    ctx.save();ctx.translate(bx,by);const d=left?-1:1;ctx.rotate(d*ang);
    limb(0,0,d*34,26,11,c);ctx.save();ctx.translate(d*34,26);ctx.rotate(d*.3);
    limb(0,0,d*26,22,9,c);ctx.fillStyle=c;ctx.beginPath();ctx.arc(d*26,22,6.5,0,Math.PI*2);ctx.fill();
    ctx.restore();ctx.restore();
  }

  function frame(){
    ctx.clearRect(0,0,W,H);
    const bg=ctx.createRadialGradient(W/2,H*.8,8,W/2,H/2,H/2);
    bg.addColorStop(0,"#0d1a0d");bg.addColorStop(1,"#0a0a08");
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

    if(!isOk()){
      [["HEAD",80],["BODY",190],["ARMS",280],["LEGS",370]].forEach(([lbl,y],i)=>{
        const done=!![parts.head,parts.body,parts.arms,parts.legs][i];
        ctx.strokeStyle=done?"rgba(200,240,60,0.45)":"rgba(255,255,255,0.1)";
        ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.strokeRect(W/2-50,y-34,100,68);ctx.setLineDash([]);
        ctx.fillStyle=done?"rgba(200,240,60,0.8)":"rgba(255,255,255,0.2)";
        ctx.font="bold 11px 'Space Mono',monospace";ctx.textAlign="center";
        ctx.fillText(done?"✓ "+lbl:lbl,W/2,y);
      });
      ctx.fillStyle="rgba(200,240,60,0.22)";ctx.font="10px 'Space Mono',monospace";ctx.textAlign="center";
      ctx.fillText("← Pick all 4 parts",W/2,H-16);
      return;
    }

    animT+=.032;
    const bob=emotion==="dance"?Math.sin(animT*3)*8:Math.sin(animT)*3;
    const sway=emotion==="dance"?Math.sin(animT*2.5)*6:0;
    const bounce=emotion==="happy"?Math.abs(Math.sin(animT*4))*9:0;
    const droop=emotion==="sad"?11:0;
    ctx.save();ctx.translate(W/2+sway, H/2+bob-bounce);

    // floor shadow
    ctx.save();ctx.fillStyle="rgba(0,0,0,0.22)";ctx.scale(1,.2);
    ctx.beginPath();ctx.ellipse(0,680,50,26,0,0,Math.PI*2);ctx.fill();ctx.restore();

    // legs
    const lc=PC.legs[parts.legs];
    limb(-19,100,-19,150,12,lc);limb(19,100,19,150,12,lc);
    ctx.fillStyle=lc;ctx.fillRect(-32,142,24,12);ctx.fillRect(8,142,24,12);

    // body
    const bc=PC.body[parts.body];
    ctx.fillStyle=bc;ctx.shadowColor=bc;ctx.shadowBlur=9;
    rr(ctx,-48,20,96,84,7);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle="rgba(255,255,255,0.1)";ctx.font="30px serif";ctx.textAlign="center";ctx.fillText("♻",0,70);

    // arms
    const aa=emotion==="happy"?-.65+Math.sin(animT*3)*.2:emotion==="dance"?Math.sin(animT*2)*.4:.16;
    arm(-48,38,aa,true,PC.arms[parts.arms]);arm(48,38,aa,false,PC.arms[parts.arms]);

    // head
    ctx.save();ctx.translate(0,-droop);
    const hc=PC.head[parts.head];ctx.fillStyle=hc;ctx.shadowColor=hc;ctx.shadowBlur=12;
    if(parts.head==="can"){
      ctx.beginPath();ctx.ellipse(0,-60,30,8,0,Math.PI,0);ctx.fill();
      ctx.fillRect(-30,-86,60,28);ctx.beginPath();ctx.ellipse(0,-86,30,8,0,0,Math.PI*2);ctx.fill();
    }else if(parts.head==="box"){rr(ctx,-34,-96,68,58,5);ctx.fill();}
    else{ctx.beginPath();ctx.ellipse(0,-68,26,38,0,0,Math.PI*2);ctx.fill();ctx.fillRect(-8,-110,16,20);}
    ctx.shadowBlur=0;

    // eyes
    const ey=parts.head==="bottle"?-76:parts.head==="can"?-72:-68;
    const blink=Math.sin(animT*.6)>.96;
    [[-15,ey],[15,ey]].forEach(([ex,ey2])=>{
      ctx.fillStyle=emotion==="sad"?"#aaaaff":"#fff";
      ctx.beginPath();ctx.ellipse(ex,ey2,7.5,blink?1:7.5,0,0,Math.PI*2);ctx.fill();
      if(!blink){ctx.fillStyle="#1a1a1a";ctx.beginPath();ctx.arc(ex,ey2+(emotion==="sad"?2:0),3.2,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(ex+1.8,ey2-1.8,1.1,0,Math.PI*2);ctx.fill();}
    });

    // mouth
    const my=parts.head==="bottle"?-48:parts.head==="can"?-44:-42;
    ctx.strokeStyle="#1a1a1a";ctx.lineWidth=2.5;ctx.lineCap="round";ctx.beginPath();
    if(emotion==="happy"||emotion==="dance")ctx.arc(0,my-2,10,.25,Math.PI-.25);
    else if(emotion==="sad")ctx.arc(0,my+4,10,Math.PI+.25,-.25);
    else{ctx.moveTo(-8,my);ctx.lineTo(8,my);}
    ctx.stroke();

    // antenna
    const at=parts.head==="can"?-103:parts.head==="box"?-103:-118;
    ctx.strokeStyle=hc;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,at+13);ctx.lineTo(0,at);ctx.stroke();
    ctx.fillStyle="#c8f03c";ctx.shadowColor="#c8f03c";ctx.shadowBlur=7;
    ctx.beginPath();ctx.arc(0,at,4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.restore();ctx.restore();
  }

  function loop(){frame();rafId=requestAnimationFrame(loop);gameRAFs["modal-robot"]=rafId;}

  function say(e){
    emotion=e;animT=0;
    const line=SPEECHES[e][Math.floor(Math.random()*SPEECHES[e].length)];
    const sp=document.getElementById("robotSpeech");
    sp.textContent=line;sp.classList.add("show");
    setTimeout(()=>sp.classList.remove("show"),3000);
  }

  document.querySelectorAll(".part-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const cat=btn.dataset.cat;
      document.querySelectorAll(`.part-btn[data-cat="${cat}"]`).forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected");parts[cat]=btn.dataset.part;
      if(isOk())document.getElementById("robotEmotions").classList.add("unlocked");
      if(!rafId)loop();
    });
  });
  document.querySelectorAll(".emo-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{say(btn.dataset.emotion);document.querySelectorAll(".emo-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");});
  });
  document.getElementById("robotReset").addEventListener("click",()=>{
    parts={head:null,body:null,arms:null,legs:null};emotion="idle";
    document.querySelectorAll(".part-btn").forEach(b=>b.classList.remove("selected"));
    document.getElementById("robotEmotions").classList.remove("unlocked");
    document.querySelectorAll(".emo-btn").forEach(b=>b.classList.remove("active"));
    document.getElementById("robotSpeech").classList.remove("show");
  });
  // Pause loop when modal closes
  document.querySelector('[data-close="modal-robot"]').addEventListener("click",()=>{cancelAnimationFrame(rafId);rafId=null;});
  loop();
}


/* ══════════════════════════════════════════════════════════
   GALLERY — CANVAS ARTWORK PAINTINGS
══════════════════════════════════════════════════════════ */
(function paintGallery() {

  /* ── ART 1: Archipelago Rising ───────────────────────── */
  const c1 = document.getElementById("art1");
  if (c1) {
    const ctx = c1.getContext("2d"), W = c1.width, H = c1.height;
    // Sky gradient — tropical dusk
    const sky = ctx.createLinearGradient(0,0,0,H*.6);
    sky.addColorStop(0,   "#0a1a3a");
    sky.addColorStop(0.4, "#1a3a6a");
    sky.addColorStop(0.7, "#c06020");
    sky.addColorStop(1,   "#e08030");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(255,255,220,${Math.random()*.8+.2})`;
      ctx.beginPath(); ctx.arc(Math.random()*W, Math.random()*H*.45, Math.random()*1.5+.3, 0, Math.PI*2); ctx.fill();
    }

    // Ocean
    const sea = ctx.createLinearGradient(0, H*.55, 0, H);
    sea.addColorStop(0, "#0d4a7a"); sea.addColorStop(0.5, "#083060"); sea.addColorStop(1, "#041830");
    ctx.fillStyle = sea; ctx.fillRect(0, H*.55, W, H*.45);

    // Ocean shimmer
    ctx.strokeStyle = "rgba(100,180,255,0.18)"; ctx.lineWidth = 1;
    for (let y = H*.58; y < H; y += 14) {
      ctx.beginPath();
      for (let x = 0; x < W; x += 4) ctx.lineTo(x, y + Math.sin(x*.08)*3 + Math.sin(x*.05+y)*2);
      ctx.stroke();
    }

    // Islands (silhouettes)
    function island(x, y, w, h, col) {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, Math.PI, 0); ctx.fill();
      // Palm trees
      for (let i = 0; i < 2; i++) {
        const tx = x - w/3 + i*w*.6, ty = y - h;
        ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx+8, ty-18, tx+4, ty-30); ctx.stroke();
        // Fronds
        for (let a = 0; a < 5; a++) {
          const ang = -Math.PI/2 + (a-2)*.4;
          ctx.strokeStyle = "#1a4a1a"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(tx+4, ty-28);
          ctx.lineTo(tx+4+Math.cos(ang)*18, ty-28+Math.sin(ang)*12); ctx.stroke();
        }
      }
    }
    island(W*.2, H*.62, 55, 18, "#1a3a1a");
    island(W*.55, H*.60, 75, 22, "#1e4a1e");
    island(W*.82, H*.63, 38, 14, "#0f2a0f");

    // Plastic bottle mosaic overlay — tiny colorful fragments
    const bottleColors = ["#e83030","#30a0e0","#e0c030","#30c060","#e060a0","rgba(255,255,255,0.6)"];
    for (let i = 0; i < 180; i++) {
      const bx = Math.random()*W, by = Math.random()*H, bs = Math.random()*6+2;
      ctx.fillStyle = bottleColors[Math.floor(Math.random()*bottleColors.length)];
      ctx.globalAlpha = Math.random()*.4+.1;
      ctx.fillRect(bx, by, bs, bs*.5); 
    }
    ctx.globalAlpha = 1;

    // Fishing net pattern overlay
    ctx.strokeStyle = "rgba(200,180,120,0.12)"; ctx.lineWidth = .8;
    for (let x = 0; x < W; x += 18) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x-20,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 18) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y+10); ctx.stroke(); }

    // Moon reflection
    const moonGrad = ctx.createRadialGradient(W*.75, H*.2, 2, W*.75, H*.2, 28);
    moonGrad.addColorStop(0, "rgba(255,240,180,0.9)"); moonGrad.addColorStop(1, "transparent");
    ctx.fillStyle = moonGrad; ctx.beginPath(); ctx.arc(W*.75, H*.2, 28, 0, Math.PI*2); ctx.fill();

    // Title text painted on
    ctx.font = "bold 13px serif"; ctx.fillStyle = "rgba(255,230,140,0.7)"; ctx.textAlign = "left";
    ctx.fillText("ARCHIPELAGO RISING", 12, H-14);
  }

  /* ── ART 2: The Last Tree ────────────────────────────── */
  const c2 = document.getElementById("art2");
  if (c2) {
    const ctx = c2.getContext("2d"), W = c2.width, H = c2.height;

    // Bleak sky
    const sky = ctx.createLinearGradient(0,0,0,H*.6);
    sky.addColorStop(0,"#c8b090"); sky.addColorStop(.5,"#d4c0a0"); sky.addColorStop(1,"#b89870");
    ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);

    // Texture brush strokes on sky
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(${150+Math.random()*40},${120+Math.random()*30},${80+Math.random()*20},0.12)`;
      ctx.fillRect(Math.random()*W, Math.random()*H*.6, Math.random()*40+10, Math.random()*4+1);
    }

    // Cracked earth
    const earth = ctx.createLinearGradient(0, H*.58, 0, H);
    earth.addColorStop(0,"#6b4020"); earth.addColorStop(.4,"#4a2a10"); earth.addColorStop(1,"#2a1408");
    ctx.fillStyle = earth; ctx.fillRect(0, H*.58, W, H*.42);

    // Crack lines in earth
    ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1.5;
    function crack(x,y,ang,len,depth){
      if(depth<0||len<4)return;
      ctx.beginPath();ctx.moveTo(x,y);
      const ex=x+Math.cos(ang)*len,ey=y+Math.sin(ang)*len;
      ctx.lineTo(ex,ey);ctx.stroke();
      crack(ex,ey,ang-.4+Math.random()*.8,len*.65,depth-1);
      if(Math.random()>.5) crack(ex,ey,ang+.5+Math.random()*.4,len*.5,depth-2);
    }
    for(let i=0;i<6;i++) crack(Math.random()*W, H*.6+Math.random()*20, Math.PI/2+Math.random()*.5-.25, 30+Math.random()*25, 3);

    // The lone tree (cardboard-textured)
    function drawTree(x, baseY, trunkH, col){
      // Trunk
      const trunkGrad = ctx.createLinearGradient(x-8,baseY,x+8,baseY);
      trunkGrad.addColorStop(0,"#3a2a18"); trunkGrad.addColorStop(.5,"#5a3a20"); trunkGrad.addColorStop(1,"#2a1a10");
      ctx.fillStyle = trunkGrad; ctx.fillRect(x-7, baseY-trunkH, 14, trunkH);
      // Bark texture
      ctx.strokeStyle="rgba(0,0,0,0.3)";ctx.lineWidth=1;
      for(let i=0;i<8;i++){ctx.beginPath();ctx.moveTo(x-6,baseY-20-i*trunkH/9);ctx.lineTo(x+6,baseY-18-i*trunkH/9);ctx.stroke();}
      // Bare branches (wire-like)
      function branch(bx,by,ang,len,lw,d){
        if(d<0||len<4)return;
        const ex=bx+Math.cos(ang)*len,ey=by+Math.sin(ang)*len;
        ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineCap="round";
        ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(ex,ey);ctx.stroke();
        branch(ex,ey,ang-.3+Math.random()*.6,len*.65,lw*.7,d-1);
        if(Math.random()>.4) branch(ex,ey,ang+.4+Math.random()*.4,len*.55,lw*.65,d-1);
      }
      // Main branches
      branch(x, baseY-trunkH, -Math.PI/2-.3, 38, 3.5, 4);
      branch(x, baseY-trunkH, -Math.PI/2+.3, 34, 3, 4);
      branch(x, baseY-trunkH*.7, -Math.PI/2-.6, 28, 2.5, 3);
      branch(x, baseY-trunkH*.7, -Math.PI/2+.5, 26, 2.5, 3);
    }
    drawTree(W/2, H*.6, H*.38, "#3a2010");

    // A few dried leaves scattered
    ctx.fillStyle = "#8a5020";
    for(let i=0;i<20;i++){
      const lx=W/2-60+Math.random()*120, ly=H*.3+Math.random()*H*.25;
      ctx.save();ctx.translate(lx,ly);ctx.rotate(Math.random()*Math.PI*2);
      ctx.beginPath();ctx.ellipse(0,0,5,2,0,0,Math.PI*2);ctx.fill();ctx.restore();
    }

    // Muted sun haze
    const haze = ctx.createRadialGradient(W*.15, H*.08, 5, W*.15, H*.08, 80);
    haze.addColorStop(0,"rgba(255,200,100,0.45)"); haze.addColorStop(1,"transparent");
    ctx.fillStyle=haze; ctx.fillRect(0,0,W,H);

    ctx.font="bold 11px serif";ctx.fillStyle="rgba(80,50,20,0.6)";ctx.textAlign="left";
    ctx.fillText("THE LAST TREE",10,H-12);
  }

  /* ── ART 3: Circuit of Life ──────────────────────────── */
  const c3 = document.getElementById("art3");
  if (c3) {
    const ctx = c3.getContext("2d"), W = c3.width, H = c3.height;

    // Dark PCB background
    ctx.fillStyle = "#050e08"; ctx.fillRect(0,0,W,H);
    const bgGrad = ctx.createRadialGradient(W/2,H/2,20,W/2,H/2,W*.7);
    bgGrad.addColorStop(0,"#0a1a0e");bgGrad.addColorStop(1,"#020808");
    ctx.fillStyle=bgGrad;ctx.fillRect(0,0,W,H);

    // Circuit traces
    function trace(x,y,dir,len,color){
      ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.lineCap="square";
      ctx.beginPath();ctx.moveTo(x,y);
      const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
      let cx=x,cy=y;
      for(let i=0;i<len;i++){
        const step=Math.random()>.6?16:8;
        if(Math.random()>.7){const d=dirs[Math.floor(Math.random()*4)];cx+=d[0]*step;cy+=d[1]*step;}
        else{const d=dirs[dir%4];cx+=d[0]*step;cy+=d[1]*step;}
        ctx.lineTo(cx,cy);
      }
      ctx.stroke();
      // Pads
      ctx.fillStyle=color;ctx.beginPath();ctx.arc(cx,cy,2.5,0,Math.PI*2);ctx.fill();
    }
    const traceColors=["rgba(0,200,80,0.4)","rgba(0,180,60,0.25)","rgba(0,240,100,0.3)","rgba(100,255,150,0.2)"];
    for(let i=0;i<40;i++) trace(Math.random()*W,Math.random()*H,Math.floor(Math.random()*4),8+Math.floor(Math.random()*6),traceColors[i%4]);

    // Human face silhouette made of circuit elements
    const cx2=W/2, cy2=H*.46;
    // Face glow
    const faceGlow=ctx.createRadialGradient(cx2,cy2,10,cx2,cy2,90);
    faceGlow.addColorStop(0,"rgba(0,200,80,0.12)");faceGlow.addColorStop(1,"transparent");
    ctx.fillStyle=faceGlow;ctx.beginPath();ctx.arc(cx2,cy2,90,0,Math.PI*2);ctx.fill();

    // Head outline in dots
    ctx.strokeStyle="rgba(0,255,100,0.7)";ctx.lineWidth=1.5;ctx.setLineDash([3,5]);
    ctx.beginPath();ctx.ellipse(cx2,cy2,65,80,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);

    // Eyes — glowing LEDs
    function led(x,y,r,col){
      ctx.shadowColor=col;ctx.shadowBlur=12;
      ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
      ctx.strokeStyle="rgba(255,255,255,0.5)";ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(x,y,r+3,0,Math.PI*2);ctx.stroke();
    }
    led(cx2-22,cy2-18,5,"#00ff88");led(cx2+22,cy2-18,5,"#00ff88");

    // Nose — resistor
    ctx.strokeStyle="rgba(0,220,80,0.8)";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(cx2,cy2-10);ctx.lineTo(cx2,cy2+10);ctx.stroke();
    ctx.fillStyle="rgba(0,180,60,0.6)";ctx.fillRect(cx2-5,cy2,10,6);

    // Mouth — data bus line
    ctx.strokeStyle="rgba(0,255,100,0.8)";ctx.lineWidth=2;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(cx2-22,cy2+30);ctx.quadraticCurveTo(cx2,cy2+40,cx2+22,cy2+30);ctx.stroke();

    // Connecting wires across face
    for(let i=0;i<12;i++){
      ctx.strokeStyle=`rgba(0,${180+Math.random()*75},${60+Math.random()*40},0.25)`;
      ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(cx2-65+Math.random()*130,cy2-80+Math.random()*160);
      ctx.lineTo(cx2-65+Math.random()*130,cy2-80+Math.random()*160);ctx.stroke();
    }

    // IC chips
    function chip(x,y,w,h){
      ctx.fillStyle="rgba(0,40,20,0.9)";ctx.strokeStyle="rgba(0,200,80,0.6)";ctx.lineWidth=1;
      ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);
      for(let i=1;i<4;i++){ctx.strokeStyle="rgba(0,180,60,0.4)";ctx.lineWidth=.8;
        ctx.beginPath();ctx.moveTo(x+i*w/4,y);ctx.lineTo(x+i*w/4,y+h);ctx.stroke();}
    }
    chip(cx2-80,cy2-30,22,14);chip(cx2+58,cy2-30,22,14);chip(cx2-80,cy2+10,22,14);chip(cx2+58,cy2+10,22,14);

    ctx.font="bold 11px monospace";ctx.fillStyle="rgba(0,255,100,0.6)";ctx.textAlign="left";
    ctx.fillText("CIRCUIT OF LIFE",8,H-12);
  }

  /* ── ART 4: Wind Harvest ─────────────────────────────── */
  const c4 = document.getElementById("art4");
  if (c4) {
    const ctx = c4.getContext("2d"), W = c4.width, H = c4.height;

    // Fiery sky
    const sky = ctx.createLinearGradient(0,0,0,H*.65);
    sky.addColorStop(0,"#0a0818"); sky.addColorStop(.3,"#3a1020"); sky.addColorStop(.6,"#c03020"); sky.addColorStop(1,"#e06010");
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

    // Clouds
    for(let i=0;i<8;i++){
      const cx=Math.random()*W,cy=H*.1+Math.random()*H*.35,r=20+Math.random()*35;
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
      cg.addColorStop(0,"rgba(180,60,20,0.35)");cg.addColorStop(1,"transparent");
      ctx.fillStyle=cg;ctx.beginPath();ctx.ellipse(cx,cy,r*2,r,0,0,Math.PI*2);ctx.fill();
    }

    // Ground
    const grd=ctx.createLinearGradient(0,H*.63,0,H);
    grd.addColorStop(0,"#2a1808");grd.addColorStop(1,"#180c04");
    ctx.fillStyle=grd;ctx.fillRect(0,H*.63,W,H*.37);

    // Windmills — tin can turbines
    function windmill(x,y,h,bladelen,rot,col){
      // Tower
      ctx.strokeStyle=col;ctx.lineWidth=4;ctx.lineCap="butt";
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-h);ctx.stroke();
      // Hub
      ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-h,6,0,Math.PI*2);ctx.fill();
      // Blades
      for(let i=0;i<3;i++){
        const ang=rot+i*(Math.PI*2/3);
        const bx=x+Math.cos(ang)*bladelen,by=y-h+Math.sin(ang)*bladelen;
        ctx.strokeStyle=col;ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(x,y-h);ctx.lineTo(bx,by);ctx.stroke();
        // Blade width taper
        ctx.fillStyle=`rgba(180,120,40,0.5)`;
        ctx.beginPath();
        ctx.moveTo(x+Math.cos(ang+.3)*4,y-h+Math.sin(ang+.3)*4);
        ctx.lineTo(bx+Math.cos(ang+.1)*3,by+Math.sin(ang+.1)*3);
        ctx.lineTo(bx,by);ctx.closePath();ctx.fill();
      }
    }
    windmill(W*.18,H*.64,H*.3,30, .3,   "#8a7040");
    windmill(W*.42,H*.64,H*.38,38, 1.1,  "#a08040");
    windmill(W*.68,H*.64,H*.28,26, .7,   "#806030");
    windmill(W*.88,H*.64,H*.22,20, 2.0,  "#706030");

    // Sun glare on horizon
    const sunG=ctx.createRadialGradient(W*.5,H*.63,0,W*.5,H*.63,80);
    sunG.addColorStop(0,"rgba(255,140,20,0.5)");sunG.addColorStop(1,"transparent");
    ctx.fillStyle=sunG;ctx.fillRect(0,0,W,H);

    // Stars
    for(let i=0;i<30;i++){
      ctx.fillStyle=`rgba(255,220,180,${Math.random()*.6+.2})`;
      ctx.beginPath();ctx.arc(Math.random()*W,Math.random()*H*.4,Math.random()*1.2+.3,0,Math.PI*2);ctx.fill();
    }

    ctx.font="bold 11px serif";ctx.fillStyle="rgba(255,160,60,0.7)";ctx.textAlign="left";
    ctx.fillText("WIND HARVEST",10,H-12);
  }

  /* ── ART 5: Woven Histories ──────────────────────────── */
  const c5 = document.getElementById("art5");
  if (c5) {
    const ctx = c5.getContext("2d"), W = c5.width, H = c5.height;

    // Background — dark loom
    ctx.fillStyle = "#1a0a08"; ctx.fillRect(0,0,W,H);

    // Woven fabric — interlaced threads
    const warpColors = [
      "#c84020","#e0a020","#2080c0","#40b040","#8040c0","#e06040",
      "#20a080","#c06080","#6040a0","#a08020","#4080e0","#e04080",
      "#60c040","#c06020","#2060a0","#a04060","#40a060","#e08020",
    ];
    const STRIPE_W = W / warpColors.length;

    // Warp threads (vertical)
    warpColors.forEach((col, i) => {
      const x = i * STRIPE_W;
      const grad = ctx.createLinearGradient(x,0,x+STRIPE_W,0);
      grad.addColorStop(0, col+"aa"); grad.addColorStop(.5, col); grad.addColorStop(1, col+"88");
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, STRIPE_W, H);
    });

    // Weft threads (horizontal) — interweave effect
    for (let y = 0; y < H; y += 6) {
      const weftColor = warpColors[Math.floor(y/6) % warpColors.length];
      const isOver = (Math.floor(y/6) % 2 === 0);
      ctx.fillStyle = weftColor + "cc";
      ctx.fillRect(0, y, W, 3);
      // Shadow for depth
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, y+3, W, 1);
    }

    // Darken edges (loom shadow)
    const edgeL = ctx.createLinearGradient(0,0,W*.12,0);
    edgeL.addColorStop(0,"rgba(0,0,0,0.6)");edgeL.addColorStop(1,"transparent");
    ctx.fillStyle=edgeL;ctx.fillRect(0,0,W*.12,H);
    const edgeR = ctx.createLinearGradient(W,0,W*.88,0);
    edgeR.addColorStop(0,"rgba(0,0,0,0.6)");edgeR.addColorStop(1,"transparent");
    ctx.fillStyle=edgeR;ctx.fillRect(W*.88,0,W*.12,H);

    // Texture noise overlay
    for(let i=0;i<400;i++){
      ctx.fillStyle=`rgba(0,0,0,${Math.random()*.15})`;
      ctx.fillRect(Math.random()*W,Math.random()*H,Math.random()*3+1,Math.random()*6+1);
    }

    // Fringe at edges
    for(let x=6;x<W;x+=STRIPE_W/2){
      ctx.strokeStyle=warpColors[Math.floor(x/STRIPE_W)%warpColors.length]+"cc";ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+Math.random()*4-2,-8+Math.random()*4);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x,H);ctx.lineTo(x+Math.random()*4-2,H+8+Math.random()*4);ctx.stroke();
    }

    // Stitched title
    ctx.font="bold 13px serif";ctx.fillStyle="rgba(255,240,200,0.8)";ctx.textAlign="left";
    ctx.shadowColor="rgba(0,0,0,0.8)";ctx.shadowBlur=4;
    ctx.fillText("WOVEN HISTORIES",14,H-14);ctx.shadowBlur=0;
  }

})();