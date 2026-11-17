// Защита от встраивания сайта в чужой iframe (clickjacking)
if(window.top!==window.self){try{window.top.location=window.self.location}catch(e){document.documentElement.style.display='none'}}

(function(){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt=n=>n.toLocaleString('ru-RU');
const t=document.getElementById('title');
t.innerHTML=[...t.textContent].map((c,i)=>`<span aria-hidden="true" style="--i:${i}">${c}</span>`).join('');
// анимации появления — после интро-видео (intro.js), если оно ещё идёт
const startIntro=()=>document.body.classList.add('intro');
if(document.documentElement.classList.contains('iv'))document.addEventListener('introdone',startIntro,{once:true});else startIntro();
const tickTxt='<span>TRIALITY<b>•</b>GTA 5 RP<b>•</b>СЕРВЕР BLAINE<b>•</b>НАБОР ОТКРЫТ<b>•</b></span>';
document.getElementById('tick').innerHTML=tickTxt.repeat(8);
const bg=document.getElementById('burger'),mn=document.getElementById('mnav');
bg.onclick=()=>{const o=mn.classList.toggle('open');bg.setAttribute('aria-expanded',o)};
mn.addEventListener('click',e=>{if(e.target.tagName==='A'){mn.classList.remove('open');bg.setAttribute('aria-expanded',false)}});
function count(el){const end=+el.dataset.count;if(reduce||end<2){el.textContent=fmt(end);return}
  const t0=performance.now(),d=1800;(function f(n){const p=Math.min(1,(n-t0)/d),e=1-Math.pow(1-p,4);el.textContent=fmt(Math.round(end*e));if(p<1)requestAnimationFrame(f)})(t0)}
const counted=new WeakSet();
function runCounts(root){root.querySelectorAll('[data-count]').forEach(el=>{if(!counted.has(el)){counted.add(el);count(el)}})}
if('IntersectionObserver' in window&&!reduce){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const el=e.target;el.classList.remove('pre');runCounts(el);io.unobserve(el)}}),{threshold:.15});
  document.querySelectorAll('.rv').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight)el.classList.add('pre');io.observe(el)});
}

const fig=document.getElementById('art').firstElementChild;
let wWidth = window.innerWidth;
let wHeight = window.innerHeight;
window.addEventListener('resize', () => {
    wWidth = window.innerWidth;
    wHeight = window.innerHeight;
}, { passive: true });

let pmTicking = false;
addEventListener('pointermove', e => {
    if (reduce || e.pointerType !== 'mouse' || pmTicking) return;
    pmTicking = true;
    requestAnimationFrame(() => {
        const x = e.clientX / wWidth - .5, y = e.clientY / wHeight - .5;
        fig.style.translate = `${x * -14}px ${y * -10}px`;
        pmTicking = false;
    });
}, { passive: true });

const N=15,photos=Array.from({length:N},(_,i)=>`${i+1}.jpg`);
const tr=document.getElementById('track');
tr.innerHTML=photos.map((s,i)=>`<button class="ph" data-i="${i}" aria-label="Открыть фото ${i+1} из ${N}"><img src="${s}" loading="lazy" decoding="async" alt="Фото ${i+1}"><span>${String(i+1).padStart(2,'0')} / ${N}</span></button>`).join('');

const lb=document.getElementById('lb'),li=document.getElementById('lbImg'),lc=document.getElementById('lbC');let li_i=0,lastFocus;
function show(i){li_i=(i+N)%N;li.src=photos[li_i];li.alt=`Фото ${li_i+1} из истории семьи`;lc.textContent=`${li_i+1} / ${N}`}
function open(i){lastFocus=document.activeElement;show(i);lb.hidden=false;requestAnimationFrame(()=>lb.classList.add('open'));document.getElementById('lbX').focus()}
function close(){lb.classList.remove('open');setTimeout(()=>{lb.hidden=true},350);lastFocus&&lastFocus.focus()}
tr.addEventListener('click',e=>{const b=e.target.closest('.ph');if(b)open(+b.dataset.i)});
document.getElementById('lbX').onclick=close;
document.getElementById('lbP').onclick=()=>show(li_i-1);document.getElementById('lbN').onclick=()=>show(li_i+1);
lb.addEventListener('click',e=>{if(e.target===lb)close()});
addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(li_i-1);if(e.key==='ArrowRight')show(li_i+1)});

const gv = document.getElementById('groundVid');
const hv = document.getElementById('heroVid');

function playVideos() {
    if (hv) {
        hv.play().catch(e => console.log('Hero video play failed:', e));
    }
    if (gv) {
        gv.play().catch(e => console.log('Ground video play failed:', e));
    }
}

playVideos();
document.addEventListener('click', playVideos, { once: true });
document.addEventListener('scroll', playVideos, { once: true, passive: true });
document.addEventListener('touchstart', playVideos, { once: true, passive: true });

document.querySelectorAll('.promo').forEach(b=>b.addEventListener('click',()=>{
  const code=b.dataset.code,ok=b.querySelector('.ok');
  const done=t=>{ok.textContent=t;b.classList.add('copied');clearTimeout(b._t);b._t=setTimeout(()=>b.classList.remove('copied'),1600)};
  const fallback=()=>{const r=document.createRange();r.selectNodeContents(b.querySelector('b'));const sel=getSelection();sel.removeAllRanges();sel.addRange(r);done('Выделено, нажмите Ctrl+C')};
  try{navigator.clipboard.writeText('/promo '+code).then(()=>done('Скопировано'),fallback)}catch(e){fallback()}
}));

const cv=document.getElementById('stars'),cx=cv.getContext('2d');
let W,H,D=1,F=[],P=[],SH=[],nextShoot=0;
function size(){
  D=Math.min(2,devicePixelRatio||1);
  W=cv.width=innerWidth*D;
  H=cv.height=innerHeight*D;
  
  const isMobile = innerWidth < 768;
  const n = isMobile ? 50 : Math.min(120,Math.round(innerWidth*innerHeight/8000));
  
  F=Array.from({length:n},()=>{const l=Math.random();return{x:Math.random()*W,y:Math.random()*H,r:(l<.7?.35+Math.random()*.5:.8+Math.random()*.9)*D,l:l<.6?.03:l<.9?.08:.16,a:Math.random()*6.3,s:.6+Math.random()*2.2,c:Math.random()<.25?'255,230,255':Math.random()<.5?'215,170,255':'190,140,255'}});
  P=Array.from({length:isMobile?20:Math.min(40,Math.round(innerWidth/20))},()=>({x:Math.random()*W,y:Math.random()*H,r:(Math.random()*1.3+.4)*D,v:(Math.random()*.22+.05)*D,a:Math.random()*6.3,w:Math.random()*6.3}));
}
size();
addEventListener('resize',size,{passive:true});

function shoot(){
  const fromLeft=Math.random()<.5,ang=(fromLeft?1:-1)*(.35+Math.random()*.35);
  const sp=(9+Math.random()*7)*D;
  SH.push({x:fromLeft?Math.random()*W*.6:W*.4+Math.random()*W*.6,y:Math.random()*H*.45,vx:Math.cos(Math.abs(ang))*sp*(fromLeft?1:-1),vy:Math.abs(Math.sin(ang))*sp,life:1,len:(110+Math.random()*120)*D})
}

let lastFrame = 0;
function draw(now){
  now = now || performance.now();
  
  if (now - lastFrame < 33) {
    requestAnimationFrame(draw);
    return;
  }
  
  const dt = Math.min(50, now - lastFrame) / 16.67;
  lastFrame = now;
  const sy = scrollY * D;
  cx.clearRect(0,0,W,H);
  
  for(let i=0; i<F.length; i++){
    const f = F[i];
    f.a += .02 * f.s * dt;
    const tw = .5 + .5 * Math.sin(f.a);
    let y = (f.y - sy * f.l) % H;
    if(y < 0) y += H;
    const al = .15 + .75 * tw * tw;
    cx.fillStyle = `rgba(${f.c},${al})`;
    
    if (f.r < 1.2) {
       cx.fillRect(f.x, y, f.r*2, f.r*2);
    } else {
       cx.beginPath(); cx.arc(f.x,y,f.r,0,7); cx.fill();
    }
  }
  
  for(let i=0; i<P.length; i++){
    const p = P[i];
    p.y -= p.v*dt; p.a += .02*dt; p.w += .01*dt;
    p.x += Math.sin(p.w)*.15*D*dt;
    if(p.y < -5){ p.y = H+5; p.x = Math.random()*W; }
    cx.fillStyle = `rgba(210,150,255,${.3+.35*Math.sin(p.a)})`;
    cx.beginPath(); cx.arc(p.x,p.y,p.r,0,7); cx.fill();
  }
  
  if(now > nextShoot){ shoot(); nextShoot = now + 4000 + Math.random()*6000; }
  SH = SH.filter(s => (s.life-=.012*dt) > 0 && s.x>-400 && s.x<W+400 && s.y<H+400);
  
  for(let i=0; i<SH.length; i++){
    const s = SH[i];
    s.x += s.vx*dt; s.y += s.vy*dt;
    const m = Math.hypot(s.vx,s.vy), tx = s.x-s.vx/m*s.len, ty = s.y-s.vy/m*s.len;
    
    cx.strokeStyle = `rgba(210,140,255,${s.life*.8})`;
    cx.lineWidth = 1.5*D;
    cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(s.x,s.y); cx.lineTo(tx,ty); cx.stroke();
    
    cx.fillStyle = `rgba(255,245,255,${s.life})`;
    cx.beginPath(); cx.arc(s.x,s.y,1.8*D,0,7); cx.fill();
  }
  
  if(!reduce) requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

// ===== 3D-наклон карточек за курсором (фото «Истории» не трогаем) =====
if(!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches){
  // [селектор карточки, макс. угол, [слой внутри, глубина сдвига в px]...]
  const cfg=[
    ['.app',7,[['.pic',-8],['.in',6]]],
    ['.lead-card',6,[['.lead-pic img',-10],['.lead-in',6]]],
    ['.cr',7,[['.cr-art img',-14],['.cr-in',6]]],
    ['.fact',9,[]]
  ];
  cfg.forEach(([sel,max,layers])=>document.querySelectorAll(sel).forEach(card=>{
    card.classList.add('tilt');
    layers.forEach(([ls,d])=>card.querySelectorAll(ls).forEach(el=>{el.classList.add('tilt-layer');el.style.setProperty('--d',d)}));
    const g=document.createElement('i');g.className='tilt-glare';g.setAttribute('aria-hidden','true');card.appendChild(g);
    let raf=0,ev=null;
    const apply=()=>{raf=0;if(!ev)return;
      const r=card.getBoundingClientRect();
      const px=Math.min(1,Math.max(0,(ev.clientX-r.left)/r.width)),py=Math.min(1,Math.max(0,(ev.clientY-r.top)/r.height));
      const mx=px*2-1,my=py*2-1;
      card.style.setProperty('--ry',(mx*max).toFixed(2)+'deg');
      card.style.setProperty('--rx',(-my*max).toFixed(2)+'deg');
      card.style.setProperty('--mx',mx.toFixed(3));
      card.style.setProperty('--my',my.toFixed(3));
      card.style.setProperty('--gx',(px*100).toFixed(1)+'%');
      card.style.setProperty('--gy',(py*100).toFixed(1)+'%');
    };
    card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')card.classList.add('tilting')});
    card.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;ev=e;if(!raf)raf=requestAnimationFrame(apply)},{passive:true});
    card.addEventListener('pointerleave',()=>{ev=null;card.classList.remove('tilting');
      ['--rx','--ry','--mx','--my'].forEach(v=>card.style.setProperty(v,v.includes('r')?'0deg':'0'))});
  }));
}

// Кеш для быстрой повторной загрузки (sw.js)
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
