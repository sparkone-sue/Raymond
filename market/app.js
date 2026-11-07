(()=>{'use strict';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={price:'Average selling price',sales:'Sales',newListings:'New listings',activeListings:'Active listings'};
const regionNames={Overall:'GTA · Overall','905':'905 · Suburbs','416':'416 · Toronto'};
const propertyNames={All:'All properties',Detached:'Detached',
'Semi-Detached':'Semi-detached',Townhouse:'Townhouse','Condo Apartment':'Condo apartment'};
const nf=new Intl.NumberFormat('en-CA',{maximumFractionDigits:0});
const fmt=(v,metric='price')=>v==null?'—':(metric==='price'?'$':'')+nf.format(v);
const pct=v=>v==null?'—':(v>0?'+':'')+v.toFixed(1)+'%';
const change=(a,b)=>a==null||b==null||b===0?null:(a/b-1)*100;
// A signed value and arrow communicate direction without relying on colour alone.
const deltaClass=value=>value==null||Math.round(value*10)===0?'neutral':value>0?'positive':'negative';
function deltaMarkup(value){const direction=deltaClass(value);const arrow=direction==='neutral'?'':`<svg viewBox="0 0 18 18" aria-hidden="true" class="trend-arrow"><path d="${direction==='positive'?'M2 13l5-5 4 3 5-7M11 4h5v5':'M2 5l5 5 4-3 5 7M11 14h5V9'}"/></svg>`;const rounded=value==null?null:Math.round(value*10)/10;return `<span class="delta ${direction}">${pct(rounded)}${arrow}</span>`}

const period=r=>r.year+'-'+String(r.month).padStart(2,'0');
const monthName=m=>new Date(2000,m-1,1).toLocaleDateString('en-CA',{month:'short'});
const periodLabel=r=>`${monthName(r.month)} ${r.year}`;
const defaultUrl=`https://docs.google.com/spreadsheets/d/${MarketData.DEFAULT_ID}/edit?gid=0`;
const cacheKey='raymond-market-statistics-v2';
let rows=MarketData.parse(SHEET_SNAPSHOT.matrix),busy=false;
let state={region:'Overall',property:'All',year:2026,month:9,expanded:false};
try {const saved=JSON.parse(localStorage.getItem(cacheKey));if(saved?.rows?.length)rows=saved.rows} catch {}
const currentRows=()=>rows.filter(r=>r.region===state.region&&r.property===state.property);
const get=(year,month)=>currentRows().find(r=>r.year===year&&r.month===month);
const color=year=>year===state.year?'#20468c':year===state.year-1?'#b2784a':'#969b9f';
function options(el,list,value){el.replaceChildren(...list.map(([v,label])=>{const o=document.createElement('option');o.value=v;o.textContent=label;return o}));el.value=value}
function initialize(latest=true){
 if(latest){const last=rows.at(-1);state.year=last.year;state.month=last.month}
 const regions=[...new Set(rows.map(r=>r.region))];if(!regions.includes(state.region))state.region=regions[0];
 options($('region'),regions.map(r=>[r,regionNames[r]||r]),state.region);reconcile();render();
}
function reconcile(){
 const props=[...new Set(rows.filter(r=>r.region===state.region).map(r=>r.property))];if(!props.includes(state.property))state.property=props[0];
 options($('property'),props.map(p=>[p,propertyNames[p]||p]),state.property);
 const records=currentRows().filter(r=>['price','sales','newListings','activeListings'].some(k=>r[k]!=null));
 if(!records.some(r=>r.year===state.year&&r.month===state.month)){const last=records.at(-1);state.year=last.year;state.month=last.month}
 options($('period'),[...records].reverse().map(r=>[period(r),periodLabel(r)]),period(state));
 panels.forEach(p=>p.clearYears());
}
function render(){
 const r=get(state.year,state.month)||{},prev=get(state.year-1,state.month)||{},last=get(state.month===1?state.year-1:state.year,state.month===1?12:state.month-1)||{};
 const yoy=change(r.price,prev.price),mom=change(r.price,last.price),salesYoY=change(r.sales,prev.sales);
 const tiles=[['Average selling price',fmt(r.price),`${deltaMarkup(mom)} MoM · vs. previous month`],['Sales',fmt(r.sales,'sales')+' <small>homes</small>',`${deltaMarkup(salesYoY)} YoY · vs. same month last year`],['Price change · YoY',deltaMarkup(yoy),`${monthName(state.month)} ${state.year-1}: ${fmt(prev.price)}`],['Active listings',r.activeListings==null?'—':fmt(r.activeListings,'activeListings')+' <small>homes</small>',r.activeListings==null?'Not provided for this segment':`${fmt(r.newListings,'sales')} new listings`]];
 $('kpis').innerHTML=tiles.map(([label,value,sub])=>`<article class="kpi"><p>${label}</p><strong>${value}</strong><small>${sub}</small></article>`).join('');
 panels.forEach(p=>p.render());
 renderTable();
 $('insight').innerHTML=`<p class="insight-lead">${periodLabel(state)}: average selling price ${mom===null?'was':mom<0?'fell':'rose'} <b class="${mom===null?'':deltaClass(mom)}">${mom===null?fmt(r.price):Math.abs(mom).toFixed(1)+'%'}</b>${mom===null?'':', month over month'}.</p><p class="insight-body">${regionNames[state.region]||esc(state.region)} · ${propertyNames[state.property]||esc(state.property)}<br>${fmt(r.sales,'sales')} homes sold this month. ${yoy===null?'A prior-year price comparison is unavailable.':`The average selling price was ${Math.abs(yoy).toFixed(1)}% ${yoy<0?'lower':'higher'} than the same month last year.`}${r.ldom==null?'':` Average listing days on market: ${fmt(r.ldom,'sales')}.`}</p>`;
}
function renderTable(){
 document.querySelector('.lower-grid').classList.toggle('expanded',state.expanded);
 const rs=currentRows().filter(r=>r.year===state.year).reverse();$('table-period').textContent=String(state.year);
 $('table-body').innerHTML=(state.expanded?rs:rs.slice(0,5)).map(r=>`<tr class="${r.month===state.month?'selected':''}"><td>${monthName(r.month)}</td><td>${fmt(r.price)}</td><td>${fmt(r.sales,'sales')}</td><td>${deltaMarkup(change(r.price,get(r.year-1,r.month)?.price))}</td></tr>`).join('');
 $('expand').hidden=rs.length<=5;$('expand').textContent=state.expanded?'Show fewer months ↑':'Show all months ↓';
}
function createPanel(panel,metric,sharedState){
 const own={metric,hidden:new Set()};
 const state=new Proxy(own,{get:(target,key)=>key in target?target[key]:sharedState[key]});
 const selectors={'chart-title':'h2','chart-subtitle':'.chart-subtitle','unit':'.chart-unit','years':'.years','range':'.chart-range','chart-kind':'.chart-kind','chart':'.chart','chart-detail':'.chart-detail','coverage':'.chart-coverage'};
 const $=id=>panel.querySelector(selectors[id]);
 let months=[],series=[],readIndex=0,barLayout=null;
 const isListingsMetric=['newListings','activeListings'].includes(state.metric);
 const segmentHasMetric=()=>currentRows().some(r=>r[state.metric]!=null);
 const useOverall=()=>isListingsMetric&&!segmentHasMetric();
 const metricRows=()=>useOverall()?rows.filter(r=>r.region==='Overall'&&r.property==='All'):currentRows();
 const metricGet=(year,month)=>metricRows().find(r=>r.year===year&&r.month===month);

 function render(){
 $('chart-title').textContent=names[state.metric];$('chart-subtitle').textContent=useOverall()?'GTA · Overall / All properties · Monthly comparison (regional breakdown not supplied)':`${regionNames[state.region]||state.region} / ${propertyNames[state.property]||state.property} · Monthly comparison`;
 $('unit').textContent=state.metric==='price'?'Canadian dollars · CAD':'Number of homes';
 document.querySelectorAll('[data-metric]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.metric===state.metric)));
 const available=[state.year-2,state.year-1,state.year].filter(y=>metricRows().some(r=>r.year===y&&r[state.metric]!=null));
 $('years').replaceChildren(...available.map(y=>{const b=document.createElement('button');b.type='button';b.className='year';b.style.setProperty('--year-color',color(y));b.innerHTML=`<i></i>${y}`;b.setAttribute('aria-pressed',String(!state.hidden.has(y)));b.setAttribute('aria-label',`${state.hidden.has(y)?'Show':'Hide'} ${y}`);b.onclick=()=>{state.hidden.has(y)?state.hidden.delete(y):state.hidden.add(y);render()};return b}));
 const range=$('range').value;const start=range==='6'?Math.max(1,state.month-5):1,end=range==='12'?12:state.month;
 months=Array.from({length:end-start+1},(_,i)=>start+i);
 series=available.filter(y=>!state.hidden.has(y)).reverse().map(y=>({name:String(y),colour:color(y),values:months.map(m=>metricGet(y,m)?.[state.metric]??null)}));
 draw();readIndex=Math.max(0,months.indexOf(state.month));readout(readIndex);
 const valid=metricRows().filter(v=>v.year===state.year&&v[state.metric]!=null).map(v=>v.month);
 $('coverage').textContent=valid.length?`${state.year} data available: ${monthName(Math.min(...valid))}–${monthName(Math.max(...valid))}`:'This metric is not available for the selected year';
 }
function readout(i){readIndex=Math.max(0,Math.min(months.length-1,i));$('chart-detail').innerHTML=`<strong>${monthName(months[readIndex])}</strong>`+series.map(s=>`<span class="readout" style="--year-color:${s.colour}"><i></i>${s.name}<b>${fmt(s.values[readIndex],state.metric)}</b></span>`).join('')}
function draw(){
 const el=$('chart');barLayout=null;Charts.dispose(el);el.replaceChildren();const all=series.flatMap(s=>s.values).filter(v=>v!=null);
 if(!all.length){const hasMetric=currentRows().some(r=>r.year<=state.year&&r.year>=state.year-2&&r[state.metric]!=null);el.innerHTML='<div class="chart-empty">'+(!hasMetric?'This metric is not provided for this property segment.':series.length?'This metric is not available for this selection.':'Select a year to view the trend.')+'</div>';return}
 const h=el.clientHeight,labels=months.map(monthName);
 if($('chart-kind').value==='bar'){drawBars(el,labels,series,h);return}
 const min=state.metric==='price'?Math.min(...all)*.96:0;
 Charts.line(el,{labels,series,format:v=>fmt(v,state.metric),tickFormat:v=>state.metric==='price'?'$'+(v>=1000000?(v/1000000).toFixed(2)+'M':(v/1000).toFixed(0)+'K'):nf.format(v),height:()=>el.clientHeight,min});
}
function drawBars(el,labels,ss,h){
 const w=el.clientWidth,left=innerWidth<640?52:66,right=12,top=12,bottom=28,plot=w-left-right;const vals=ss.flatMap(s=>s.values).filter(v=>v!=null),max=Math.max(...vals,1),raw=max/4,mag=10**Math.floor(Math.log10(raw)),step=[1,2,2.5,5,10].map(v=>v*mag).find(v=>v>=raw),limit=(Math.floor(max/step)+1)*step;
 const y=v=>h-bottom-(v/limit)*(h-top-bottom),gw=plot/labels.length,bw=Math.max(1,Math.min(18,(gw-8)/ss.length));
 barLayout={w,h,left,right,top,bottom,gw,y,series:ss};
 let markup=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(names[state.metric])} by month and year">`;
 for(let v=0;v<=limit;v+=step){markup+=`<line x1="${left}" x2="${w-right}" y1="${y(v)}" y2="${y(v)}" stroke="#e9ecf0"/><text x="${left-10}" y="${y(v)+4}" text-anchor="end" fill="#606975" font-size="12">${state.metric==='price'?'$'+(v>=1000000?(v/1000000).toFixed(2)+'M':(v/1000).toFixed(0)+'K'):nf.format(v)}</text>`}
 markup+=`<rect class="bar-hover-band" x="0" y="${top}" width="${gw}" height="${h-top-bottom}" fill="#20468c" opacity="0.05" visibility="hidden"/>`;
 labels.forEach((label,i)=>{if(innerWidth>640||i%3===0)markup+=`<text x="${left+gw*(i+.5)}" y="${h-5}" fill="#606975" font-size="12" text-anchor="middle">${label}</text>`;ss.forEach((s,j)=>{const v=s.values[i];if(v==null)return;markup+=`<rect x="${left+gw*(i+.5)+(j-ss.length/2)*bw}" y="${y(v)}" width="${Math.max(1,bw-2)}" height="${Math.max(0,y(0)-y(v))}" fill="${s.colour}"></rect>`})});
 el.innerHTML=markup+'</svg><div class="chart-tip bar-tooltip" role="tooltip" style="opacity:0"></div>';
}
$('chart').addEventListener('chartread',ev=>readout(ev.detail.index));
function hideBarTip(){const tip=$('chart').querySelector('.bar-tooltip');if(tip)tip.style.opacity='0';$('chart').querySelector('.bar-hover-band')?.setAttribute('visibility','hidden')}
function showBarTip(index,clientY){
 if(!barLayout)return;const el=$('chart'),tip=el.querySelector('.bar-tooltip');if(!tip)return;const g=barLayout,rect=el.getBoundingClientRect();
 tip.innerHTML=`<div class="tooltip-label">${monthName(months[index])} · ${names[state.metric]}</div>`+g.series.map(s=>`<div class="tooltip-row"><i style="background:${s.colour}"></i><span>${s.name}</span><b>${fmt(s.values[index],state.metric)}</b></div>`).join('');
 const x=g.left+g.gw*(index+.5),values=g.series.map(s=>s.values[index]).filter(v=>v!=null),anchorY=clientY==null?(values.length?g.y(Math.max(...values)):g.h/2):clientY-rect.top;
 tip.style.left=Math.max(4,Math.min(x-tip.offsetWidth/2,g.w-tip.offsetWidth-4))+'px';tip.style.top=Math.max(4,Math.min(anchorY-tip.offsetHeight-14,g.h-tip.offsetHeight-4))+'px';tip.style.opacity='1';
 const band=el.querySelector('.bar-hover-band');band?.setAttribute('x',g.left+index*g.gw);band?.setAttribute('visibility','visible');readout(index);
}
function barRead(ev){if(!barLayout)return;const r=$('chart').getBoundingClientRect(),g=barLayout,x=ev.clientX-r.left,y=ev.clientY-r.top;if(x<g.left||x>g.w-g.right||y<g.top||y>g.h-g.bottom){hideBarTip();return}const i=Math.min(months.length-1,Math.floor((x-g.left)/g.gw));showBarTip(i,ev.clientY)}
$('chart').addEventListener('pointermove',barRead);$('chart').addEventListener('pointerdown',barRead);
$('chart').addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')hideBarTip()});
$('chart').addEventListener('blur',hideBarTip);
$('chart').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();readout(readIndex+(e.key==='ArrowRight'?1:-1));if(barLayout)showBarTip(readIndex)}});
document.addEventListener('pointerdown',e=>{if(!$('chart').contains(e.target))hideBarTip()});

 $('range').onchange=render;$('chart-kind').onchange=render;
 return {render,clearYears:()=>own.hidden.clear(),reset:()=>{own.hidden.clear();$('range').value='12';$('chart-kind').value=metric==='price'?'line':'bar'}};
}
const panels=[...document.querySelectorAll('[data-chart-metric]')].map(el=>createPanel(el,el.dataset.chartMetric,state));
$('region').onchange=()=>{state.region=$('region').value;reconcile();render()};
$('property').onchange=()=>{state.property=$('property').value;reconcile();render()};
$('period').onchange=()=>{[state.year,state.month]=$('period').value.split('-').map(Number);panels.forEach(p=>p.clearYears());render()};
$('reset').onclick=()=>{Object.assign(state,{region:'Overall',property:'All',year:2026,month:9,expanded:false});panels.forEach(p=>p.reset());initialize()};
$('expand').onclick=()=>{state.expanded=!state.expanded;renderTable()};
async function refresh(){
 if(busy)return;busy=true;
 try{const data=await MarketData.load(defaultUrl);rows=data;try{localStorage.setItem(cacheKey,JSON.stringify({rows}))}catch{}$('market-notice').hidden=true;initialize(false)}
 catch{const note=$('market-notice');note.textContent='An update is temporarily unavailable. Showing the latest available market figures.';note.hidden=false}
 finally{busy=false}
}
let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>panels.forEach(p=>p.render()),150)});
document.fonts.ready.then(()=>{initialize();refresh()});
})();
