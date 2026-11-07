/* Read-only adapter for the supplied TRREB sheet; derived percent columns are ignored. */
(()=>{
const DEFAULT_ID='1ZsvWxKExTU6z7vWe3KD-8WWUX7vCQJGSrwSxDyDwS_Y';
const norm=v=>String(v??'').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g,'');
const number=v=>v===null||v===undefined||String(v).trim()===''?null:(Number.isFinite(Number(String(v).replace(/[$,%\s,]/g,'')))?Number(String(v).replace(/[$,%\s,]/g,'')):null);
const month=v=>{if(typeof v==='number'&&v>=1&&v<=12)return v;const s=String(v??'').trim().toLowerCase();const n=parseInt(s);if(n>=1&&n<=12)return n;return ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].findIndex(m=>s.startsWith(m))+1};
function parse(matrix){
 const hi=matrix.findIndex(r=>r.some(x=>norm(x)==='year')&&r.some(x=>norm(x)==='month'));
 if(hi<0)throw Error('YEAR and MONTH columns were not found. Keep the original column headers.');
 const heads=matrix[hi].map(norm);const col=(...names)=>heads.findIndex(x=>names.includes(x));
 const yi=col('year'),mi=col('month'),ri=col('region','area'),ti=col('propertytype','property');
 const metricCols={price:col('averageprice','avgprice','price'),sales:col('salesactivity','sales'),newListings:col('newlisting','newlistings'),activeListings:col('activelisting','activelistings'),ldom:col('averageldom','ldom'),pdom:col('averagepdom','pdom')};
 const wide=[];for(const region of ['905','416'])for(const [kind,property]of [['house','Detached'],['semi','Semi-Detached'],['townhouse','Townhouse'],['condoapartment','Condo Apartment']])wide.push({region,property,price:col(`${region}${kind}averageprice`,`${region}${kind}price`),sales:col(`${region}${kind}sales`)});
 let year=null;const rows=[],keys=new Set();
 const add=row=>{if(!['price','sales','newListings','activeListings','ldom','pdom'].some(k=>row[k]!==null&&row[k]!==undefined))return;const key=[row.year,row.month,row.region,row.property].join('|');if(keys.has(key))throw Error(`Duplicate record: ${key}. Please check the source spreadsheet.`);keys.add(key);rows.push(row)};
 for(const cells of matrix.slice(hi+1)){
  const next=number(cells[yi]);if(next!==null&&Number.isInteger(next)&&next>=1900&&next<=2100)year=next;
  const m=month(cells[mi]);if(!year||!m)continue;
  const region=ri>=0?String(cells[ri]||'Overall'):'Overall';const property=ti>=0?String(cells[ti]||'All'):'All';
  const row={year,month:m,region,property};for(const[k,i]of Object.entries(metricCols))row[k]=i>=0?number(cells[i]):null;add(row);
  for(const c of wide){if(c.price<0&&c.sales<0)continue;add({year,month:m,region:c.region,property:c.property,price:c.price>=0?number(cells[c.price]):null,sales:c.sales>=0?number(cells[c.sales]):null,newListings:null,activeListings:null,ldom:null,pdom:null})}
 }
 if(!rows.length)throw Error('No valid market records were found.');
 return rows.sort((a,b)=>a.year-b.year||a.month-b.month);
}
function sheetInfo(url){const u=new URL(url);if(u.hostname!=='docs.google.com')throw Error('Enter a Google Sheets URL.');const m=u.pathname.match(/^\/spreadsheets\/d\/([\w-]+)/);if(!m)throw Error('The spreadsheet URL could not be recognized.');const gid=u.searchParams.get('gid')||new URLSearchParams(u.hash.slice(1)).get('gid')||'0';if(!/^\d+$/.test(gid))throw Error('Invalid sheet ID.');return{id:m[1],gid}}
function load(url){
 const{id,gid}=sheetInfo(url);return new Promise((resolve,reject)=>{
  const callback='mw_'+Date.now()+'_'+Math.random().toString(36).slice(2);const script=document.createElement('script');let timer;
  const clean=()=>{clearTimeout(timer);script.remove();delete window[callback]};
  const fail=()=>{clean();reject(Error('Could not read the spreadsheet. Check your connection and make sure general access is set to “Anyone with the link”.'))};
  window[callback]=payload=>{clean();try{if(payload.status==='error')throw Error(payload.errors?.[0]?.detailed_message||'Google Sheets returned an error');const t=payload.table;const matrix=[t.cols.map(c=>c.label),...t.rows.map(r=>r.c.map(c=>c?.v??null))];resolve(parse(matrix))}catch(e){reject(e)}};
  script.src=`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?gid=${gid}&headers=1&range=A1:X20000&tqx=${encodeURIComponent('out:json;responseHandler:'+callback)}&_=${Date.now()}`;script.onerror=fail;timer=setTimeout(fail,15000);document.head.append(script);
 })
}
window.MarketData={parse,load,sheetInfo,DEFAULT_ID};
})();
