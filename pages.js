// Скрипт отдельных страниц (perekup/, join/). На главной работает script.js.
(function(){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
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

// Кеш для быстрой повторной загрузки (тот же sw.js, что и на главной)
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
})();
