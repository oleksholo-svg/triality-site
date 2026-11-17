// Интро-видео перед сайтом. Подключается в <head> без defer: класс .iv ставится до отрисовки,
// поэтому оверлей появляется сразу, без вспышки сайта (инлайн-скрипты запрещены CSP).
(function(){
  var html=document.documentElement,seen=false,done=false,timer;
  try{seen=sessionStorage.getItem('introSeen')==='1';sessionStorage.setItem('introSeen','1')}catch(e){}
  var show=!seen&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(show)html.classList.add('iv');

  function finish(){
    if(done)return;done=true;clearTimeout(timer);
    var ov=document.getElementById('iv');
    if(ov){
      ov.classList.add('out'); // .out держит display:block, пока идёт затухание
      setTimeout(function(){var v=ov.querySelector('video');if(v){v.pause();v.removeAttribute('src');v.load()}ov.remove()},650);
    }
    html.classList.remove('iv');
    document.dispatchEvent(new Event('introdone'));
  }
  // Если видео не заиграло (или застряло) за 3 с — показываем сайт. Таймер стартует сразу, даже до разбора body.
  function arm(){clearTimeout(timer);timer=setTimeout(finish,3000)}
  if(show)arm();

  // readyState 'interactive' наступает раньше, чем выполняются defer-скрипты, — видео стартует как можно раньше
  function init(){
    var ov=document.getElementById('iv');
    if(!show){if(ov)ov.remove();return}
    var v=ov&&ov.querySelector('video');
    if(!v){finish();return}
    v.addEventListener('playing',function(){clearTimeout(timer)});
    v.addEventListener('waiting',arm);
    v.addEventListener('ended',finish);
    v.addEventListener('error',finish);
    ov.querySelector('button').addEventListener('click',finish);
    v.muted=true;
    try{var p=v.play();if(p&&p.catch)p.catch(finish)}catch(e){finish()}
  }
  if(document.readyState==='loading')document.addEventListener('readystatechange',init,{once:true});else init();
})();
