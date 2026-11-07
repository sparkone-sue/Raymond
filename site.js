(()=>{'use strict';
const header=document.querySelector('.site-header'),nav=document.querySelector('.site-nav'),toggle=document.querySelector('.nav-toggle');
const updateHeader=()=>header?.classList.toggle('scrolled',window.scrollY>30);updateHeader();window.addEventListener('scroll',updateHeader,{passive:true});
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('open',open)});
nav?.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav?.classList.remove('open');toggle?.setAttribute('aria-expanded','false')}});
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver'in window&&!reduced.matches){const reveal=new IntersectionObserver(entries=>{entries.forEach(({target,isIntersecting})=>{if(isIntersecting){target.classList.remove('pending');reveal.unobserve(target)}})},{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('pending');reveal.observe(el)}})}
function animateNumber(el){const target=Number(el.dataset.count),duration=1500,start=performance.now();if(reduced.matches)return;const prefix=el.dataset.prefix||'',suffix=el.dataset.suffix||'';const tick=now=>{const progress=Math.min(1,(now-start)/duration),value=Math.round(target*(1-Math.pow(1-progress,3)));el.textContent=prefix+value+suffix;if(progress<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)}
const counters=document.querySelectorAll('[data-count]');if('IntersectionObserver'in window){const ob=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){animateNumber(e.target);ob.unobserve(e.target)}},{threshold:.5});counters.forEach(el=>ob.observe(el))}
const track=document.querySelector('.transactions-track');if(track){const cards=[...track.children],prev=document.querySelector('[data-carousel=prev]'),next=document.querySelector('[data-carousel=next]'),pause=document.querySelector('[data-carousel=pause]'),progress=document.querySelector('.carousel-position');let paused=reduced.matches,hover=false,focused=false,index=0,timer;
const step=()=>cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:track.clientWidth;
const update=()=>{index=Math.min(cards.length-1,Math.max(0,Math.round(track.scrollLeft/step())));if(progress)progress.textContent=(index+1)+' of '+cards.length};
const move=d=>{const last=Math.max(0,Math.round((track.scrollWidth-track.clientWidth)/step()));index=(index+d+last+1)%(last+1);track.scrollTo({left:index*step(),behavior:reduced.matches?'auto':'smooth'})};
prev?.addEventListener('click',()=>move(-1));next?.addEventListener('click',()=>move(1));
const setPause=()=>{pause.textContent=paused?'Play slideshow':'Pause slideshow';pause.setAttribute('aria-pressed',String(paused))};setPause();pause?.addEventListener('click',()=>{paused=!paused;setPause()});
track.addEventListener('mouseenter',()=>hover=true);track.addEventListener('mouseleave',()=>hover=false);track.addEventListener('focusin',()=>focused=true);track.addEventListener('focusout',()=>focused=false);track.addEventListener('scroll',update,{passive:true});track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
timer=setInterval(()=>{if(!paused&&!hover&&!focused&&!document.hidden)move(1)},5000);window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});update();}
})();
