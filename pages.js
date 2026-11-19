// Скрипт отдельных страниц (perekup/, join/). На главной работает script.js.
(function(){
const reduce=false; // анимации у всех, даже при «уменьшить движение» в системе — как на главной (так решил владелец сайта)
const fmt=n=>n.toLocaleString('ru-RU');

// Мобильное меню
const bg=document.getElementById('burger'),mn=document.getElementById('mnav');
if(bg&&mn){
  bg.addEventListener('click',()=>{const o=mn.classList.toggle('open');bg.setAttribute('aria-expanded',o)});
  mn.addEventListener('click',e=>{if(e.target.tagName==='A'){mn.classList.remove('open');bg.setAttribute('aria-expanded',false)}});
}

// Плавное появление блоков при прокрутке
if('IntersectionObserver' in window&&!reduce){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pre');io.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll('.rv').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight)el.classList.add('pre');io.observe(el)});
}

// Число скачиваний Перекупа (то же событие download-perekup, что и на главной).
// Не пришло (блокировщик рекламы, нет сети) — строка просто не показывается.
const dl=document.getElementById('dlCount');
if(dl&&window.fetch){
  const word=n=>{const a=n%10,b=n%100;return a===1&&b!==11?'скачивание':a>=2&&a<=4&&(b<12||b>14)?'скачивания':'скачиваний'};
  fetch('https://triality.goatcounter.com/counter/download-perekup.json',{cache:'no-store',credentials:'omit'})
    .then(r=>r.ok?r.json():Promise.reject())
    .then(d=>{const n=parseInt(String(d&&d.count).replace(/\D/g,''),10);if(!(n>0))return;
      dl.querySelector('b').textContent=fmt(n);dl.querySelector('.w').textContent=word(n);dl.hidden=false})
    .catch(()=>{});
}

// Текущая версия Перекупа (файл кладёт на сайт deploy.yml при каждой публикации)
const ver=document.getElementById('verBox');
if(ver&&window.fetch){
  fetch('/perekup-version.txt',{cache:'no-store'})
    .then(r=>r.ok?r.text():Promise.reject())
    .then(t=>{t=t.trim();if(!/^v?\d+(\.\d+){1,3}$/.test(t))return;
      ver.querySelector('b').textContent=t.replace(/^v/,'');ver.hidden=false})
    .catch(()=>{});
}

// Видео внизу страницы: запускаем сразу и ещё раз при первом действии (на случай запрета автоплея)
const gv=document.getElementById('groundVid');
if(gv){const play=()=>gv.play().catch(()=>{});play();
  ['click','scroll','touchstart'].forEach(ev=>document.addEventListener(ev,play,{once:true,passive:true}));}

// Звёзды и падающие звёзды на фоне (как на главной)
const cv=document.getElementById('stars');
if(cv&&cv.getContext){
  const cx=cv.getContext('2d');
  let W,H,D=1,F=[],P=[],SH=[],nextShoot=0,last=0;
  const size=()=>{D=Math.min(2,devicePixelRatio||1);W=cv.width=innerWidth*D;H=cv.height=innerHeight*D;
    const mob=innerWidth<768,n=mob?50:Math.min(120,Math.round(innerWidth*innerHeight/8000));
    F=Array.from({length:n},()=>{const l=Math.random();return{x:Math.random()*W,y:Math.random()*H,r:(l<.7?.35+Math.random()*.5:.8+Math.random()*.9)*D,l:l<.6?.03:l<.9?.08:.16,a:Math.random()*6.3,s:.6+Math.random()*2.2,c:Math.random()<.25?'255,230,255':Math.random()<.5?'215,170,255':'190,140,255'}});
    P=Array.from({length:mob?20:Math.min(40,Math.round(innerWidth/20))},()=>({x:Math.random()*W,y:Math.random()*H,r:(Math.random()*1.3+.4)*D,v:(Math.random()*.22+.05)*D,a:Math.random()*6.3,w:Math.random()*6.3}));};
  size();addEventListener('resize',size,{passive:true});
  const shoot=()=>{const L=Math.random()<.5,ang=(L?1:-1)*(.35+Math.random()*.35),sp=(9+Math.random()*7)*D;
    SH.push({x:L?Math.random()*W*.6:W*.4+Math.random()*W*.6,y:Math.random()*H*.45,vx:Math.cos(Math.abs(ang))*sp*(L?1:-1),vy:Math.abs(Math.sin(ang))*sp,life:1,len:(110+Math.random()*120)*D})};
  const draw=now=>{
    if(now-last<33){requestAnimationFrame(draw);return}
    const dt=Math.min(50,now-last)/16.67;last=now;const sy=scrollY*D;cx.clearRect(0,0,W,H);
    for(const f of F){f.a+=.02*f.s*dt;const tw=.5+.5*Math.sin(f.a);let y=(f.y-sy*f.l)%H;if(y<0)y+=H;
      cx.fillStyle=`rgba(${f.c},${.15+.75*tw*tw})`;if(f.r<1.2)cx.fillRect(f.x,y,f.r*2,f.r*2);else{cx.beginPath();cx.arc(f.x,y,f.r,0,7);cx.fill()}}
    for(const p of P){p.y-=p.v*dt;p.a+=.02*dt;p.w+=.01*dt;p.x+=Math.sin(p.w)*.15*D*dt;if(p.y<-5){p.y=H+5;p.x=Math.random()*W}
      cx.fillStyle=`rgba(210,150,255,${.3+.35*Math.sin(p.a)})`;cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill()}
    if(now>nextShoot){shoot();nextShoot=now+4000+Math.random()*6000}
    SH=SH.filter(s=>(s.life-=.012*dt)>0&&s.x>-400&&s.x<W+400&&s.y<H+400);
    for(const s of SH){s.x+=s.vx*dt;s.y+=s.vy*dt;const m=Math.hypot(s.vx,s.vy),tx=s.x-s.vx/m*s.len,ty=s.y-s.vy/m*s.len;
      cx.strokeStyle=`rgba(210,140,255,${s.life*.8})`;cx.lineWidth=1.5*D;cx.lineCap='round';cx.beginPath();cx.moveTo(s.x,s.y);cx.lineTo(tx,ty);cx.stroke();
      cx.fillStyle=`rgba(255,245,255,${s.life})`;cx.beginPath();cx.arc(s.x,s.y,1.8*D,0,7);cx.fill()}
    if(!reduce)requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}

// 3D-наклон карточек за курсором — тот же, что на главной (только мышь)
if(!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){
  // [селектор, макс. угол, [слой внутри, глубина сдвига в px]]
  const cfg=[
    ['.card',8,[]],
    ['.steps li',8,[]],
    ['.shot',6,[['img',-8]]],
    ['.more a',7,[]]
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
      card.style.setProperty('--ry',(mx*max).toFixed(2)+'deg');card.style.setProperty('--rx',(-my*max).toFixed(2)+'deg');
      card.style.setProperty('--mx',mx.toFixed(3));card.style.setProperty('--my',my.toFixed(3));
      card.style.setProperty('--gx',(px*100).toFixed(1)+'%');card.style.setProperty('--gy',(py*100).toFixed(1)+'%');
    };
    card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')card.classList.add('tilting')});
    card.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;ev=e;if(!raf)raf=requestAnimationFrame(apply)},{passive:true});
    card.addEventListener('pointerleave',()=>{ev=null;card.classList.remove('tilting');
      ['--rx','--ry'].forEach(v=>card.style.setProperty(v,'0deg'));['--mx','--my'].forEach(v=>card.style.setProperty(v,'0'))});
  }));
}

// Кеш для быстрой повторной загрузки (тот же sw.js, что и на главной)
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
})();
