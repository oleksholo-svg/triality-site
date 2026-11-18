// Эффекты поверх сайта: курсор с искрами, магнитные кнопки, буквы заголовков, шторка при переходе по меню.
// Отдельно от script.js: если тут что-то сломается, остальной сайт работает как раньше.
// При «уменьшить движение» в системе ничего не включается.
(function(){
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const html=document.documentElement;
const mouse=matchMedia('(hover:hover) and (pointer:fine)').matches;

// ===== Буквы заголовков секций =====
const heads=document.querySelectorAll('.shead h2,.join h2');
heads.forEach(h=>{
  const txt=h.textContent;
  h.setAttribute('aria-label',txt);
  h.innerHTML=[...txt].map((c,i)=>`<span class="fx-ch" aria-hidden="true" style="--i:${i}">${c}</span>`).join('');
  h.classList.add('fx-split');
});
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('fx-in');io.unobserve(e.target)}}),{threshold:.4});
  heads.forEach(h=>io.observe(h));
}else heads.forEach(h=>h.classList.add('fx-in'));

// ===== Шторка при переходе по пунктам меню =====
const cur=document.createElement('div');
cur.className='fx-curtain';cur.setAttribute('aria-hidden','true');cur.innerHTML='<b>TRIALITY</b>';
document.body.appendChild(cur);
let busy=false;
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]');
  if(!a||busy||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey)return;
  const id=a.getAttribute('href').slice(1),t=id&&document.getElementById(id);
  if(!t)return;
  e.preventDefault(); // обработчик мобильного меню в script.js всё равно срабатывает и закрывает меню
  busy=true;cur.classList.add('in');
  setTimeout(()=>{
    t.scrollIntoView({behavior:'instant',block:'start'});
    history.pushState(null,'','#'+id);
    cur.classList.add('out');
    setTimeout(()=>{cur.style.transition='none';cur.classList.remove('in','out');cur.offsetWidth;cur.style.transition='';busy=false;
      // фокус в раздел, чтобы с клавиатуры Tab шёл дальше по нему
      if(!t.hasAttribute('tabindex'))t.setAttribute('tabindex','-1');t.focus({preventScroll:true})},600);
  },560);
});

if(!mouse)return;

// ===== Курсор =====
const dot=document.createElement('i'),ring=document.createElement('i');
dot.className='fx-dot';ring.className='fx-ring';
dot.setAttribute('aria-hidden','true');ring.setAttribute('aria-hidden','true');ring.dataset.label='СМОТРЕТЬ';
document.body.append(dot,ring);
html.classList.add('fx-cur');
let mx=-100,my=-100,rx=-100,ry=-100,raf=0;
const loop=()=>{
  rx+=(mx-rx)*.2;ry+=(my-ry)*.2;
  ring.style.transform=`translate(${rx}px,${ry}px)`;
  raf=Math.abs(mx-rx)+Math.abs(my-ry)>.1?requestAnimationFrame(loop):0;
};
const HOVER='a,button,.promo,.go.live,label,[role=button]';
addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'){html.classList.remove('fx-on');return}
  if(!html.classList.contains('fx-on')){rx=e.clientX;ry=e.clientY;html.classList.add('fx-on')}
  mx=e.clientX;my=e.clientY;
  dot.style.transform=`translate(${mx}px,${my}px)`;
  if(!raf)raf=requestAnimationFrame(loop);
  spark(e.clientX,e.clientY);
},{passive:true});
document.addEventListener('mouseout',e=>{if(!e.relatedTarget)html.classList.remove('fx-on')});
document.addEventListener('pointerover',e=>{
  const t=e.target.closest?e.target:null;if(!t)return;
  html.classList.toggle('fx-view',!!t.closest('.ph'));
  html.classList.toggle('fx-hover',!t.closest('.ph')&&!!t.closest(HOVER));
});
addEventListener('pointerdown',()=>html.classList.add('fx-down'));
addEventListener('pointerup',()=>html.classList.remove('fx-down'));

// ===== Искры за курсором =====
const cv=document.createElement('canvas');cv.id='fxTrail';cv.setAttribute('aria-hidden','true');
document.body.appendChild(cv);
const cx=cv.getContext('2d');
let D=1,P=[],lx=null,ly=null,draw=0;
const size=()=>{D=Math.min(2,devicePixelRatio||1);cv.width=innerWidth*D;cv.height=innerHeight*D};
size();addEventListener('resize',size,{passive:true});
const COL=['255,240,255','230,180,255','200,120,255','180,77,255'];
function spark(x,y){
  if(lx===null){lx=x;ly=y;return}
  const dist=Math.hypot(x-lx,y-ly),n=Math.min(4,Math.floor(dist/9));
  for(let i=0;i<n&&P.length<140;i++){
    const k=i/n,a=Math.random()*6.28,s=Math.random()*.6;
    P.push({x:(lx+(x-lx)*k)*D,y:(ly+(y-ly)*k)*D,vx:Math.cos(a)*s*D,vy:(Math.sin(a)*s-.25)*D,r:(Math.random()*1.6+.6)*D,life:1,c:COL[Math.random()*4|0]});
  }
  if(n){lx=x;ly=y}
  if(!draw)draw=requestAnimationFrame(frame);
}
function frame(){
  cx.clearRect(0,0,cv.width,cv.height);
  cx.globalCompositeOperation='lighter';
  P=P.filter(p=>(p.life-=.022)>0);
  for(const p of P){
    p.x+=p.vx;p.y+=p.vy;p.vy+=.01*D;
    cx.fillStyle=`rgba(${p.c},${p.life})`;
    cx.beginPath();cx.arc(p.x,p.y,p.r*(.4+p.life*.6),0,7);cx.fill();
  }
  draw=P.length?requestAnimationFrame(frame):0; // пусто — не крутим кадры зря
}

// ===== Магнитные кнопки =====
document.querySelectorAll('.pill,.big,.go.live,.promo,.cr-links a,.burger').forEach(b=>{
  b.classList.add('fx-mag');
  b.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse')return;
    const r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
    b.classList.add('fx-pull');b.style.translate=`${dx*.25}px ${dy*.35}px`;
  },{passive:true});
  b.addEventListener('pointerleave',()=>{b.classList.remove('fx-pull');b.style.translate=''});
});
})();
