function showError(msg){ const el=document.getElementById('error'); el.textContent=msg; el.hidden=false; }
async function fetchCSV(url){
  try{ const res=await fetch(url+'?_ts='+Date.now()); if(!res.ok) throw new Error('HTTP '+res.status);
       const text=await res.text(); const lines=text.trim().split(/\r?\n/);
       const delim=(text.indexOf(';')!==-1 && text.indexOf(',')===-1)?';':','; const rows=lines.map(l=>l.split(delim));
       if(rows.length && rows[0][0].toLowerCase().includes('date')) rows.shift();
       const data=rows.map(([d,v])=>({date:new Date(d), value:parseFloat(String(v).replace(',','.'))}))
                      .filter(r=>!isNaN(r.date)&&isFinite(r.value)).sort((a,b)=>a.date-b.date);
       if(!data.length) throw new Error('Nessun dato parsabile in '+url); return data;
  }catch(err){ console.error('Errore CSV',url,err); showError('Errore lettura '+url+': '+err.message+' — Verifica che i CSV siano nella STESSA cartella di index.html'); return []; } }

function sliceRange(data, days=null, months=null){ if(!data.length) return []; const now=data[data.length-1].date; const from=new Date(now); if(days) from.setDate(from.getDate()-days); if(months) from.setMonth(from.getMonth()-months); return data.filter(d=>d.date>=from); }
function areaTrace(data, fillColor, lineColor){ return { x:data.map(d=>d.date), y:data.map(d=>d.value), mode:'lines', line:{color:lineColor,width:4}, fill:'tozeroy', fillcolor:fillColor, hoverinfo:'x+y' }; }

function layoutBase(){
  return { margin:{l:26,r:6,t:10,b:20},
           paper_bgcolor:'#ffffff', plot_bgcolor:'#ffffff',
           showlegend:false,
           xaxis:{type:'date',showgrid:true,gridcolor:'rgba(0,0,0,0.08)', tickfont:{size:9},automargin: true},
           yaxis:{showgrid:true,gridcolor:'rgba(0,0,0,0.08)', tickfont:{size:12}} };
}
function layoutTight(data){
  if(!data.length) return layoutBase();
  const ys=data.map(d=>d.value); const min=Math.min(...ys), max=Math.max(...ys);
  const pad=(max-min)*0.08 || (min*0.01 || 1);
  const base=layoutBase(); base.yaxis.range=[min-pad, max+pad]; return base;
}

async function drawAll(){
  document.getElementById('error').hidden=true;
  const cfg=window.DASHBOARD_CONFIG;
  const [gold,silver]=await Promise.all([ fetchCSV(cfg.goldCsv), fetchCSV(cfg.silverCsv) ]);
  const BLUE='#003a8c', GOLD='#D4AF37', SILVER='#C0C0C0';

  Plotly.newPlot('gold_15d',  [areaTrace(sliceRange(gold,15,null),GOLD,BLUE)],   layoutTight(sliceRange(gold,15,null)), {displayModeBar:false, responsive:true});
  Plotly.newPlot('silver_15d',[areaTrace(sliceRange(silver,15,null),SILVER,BLUE)],layoutTight(sliceRange(silver,15,null)), {displayModeBar:false, responsive:true});
  Plotly.newPlot('gold_6m',   [areaTrace(sliceRange(gold,null,6),GOLD,BLUE)],    layoutTight(sliceRange(gold,null,6)), {displayModeBar:false, responsive:true});
  Plotly.newPlot('silver_6m', [areaTrace(sliceRange(silver,null,6),SILVER,BLUE)],layoutTight(sliceRange(silver,null,6)), {displayModeBar:false, responsive:true});
  Plotly.newPlot('gold_all',  [areaTrace(gold,GOLD,BLUE)],   layoutBase(), {displayModeBar:false, responsive:true});
  Plotly.newPlot('silver_all',[areaTrace(silver,SILVER,BLUE)],layoutBase(), {displayModeBar:false, responsive:true});
}

function makeQR(){
  const el=document.getElementById('qr');
  el.innerHTML='';
  const cssSize=Math.min(el.clientWidth, el.clientHeight);
  const scale=Math.max(4, Math.ceil((window.devicePixelRatio||1)*4));
  const px=Math.floor(cssSize*scale);

  const q = new QRCode(el, {
    text: window.DASHBOARD_CONFIG.qrLink,
    width: px, height: px,
    colorDark: '#000000', colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });

  const img = el.querySelector('img, canvas');
  if(img){
    img.style.width = cssSize + 'px';
    img.style.height = cssSize + 'px';
    img.style.imageRendering = 'crisp-edges';
  }
}

window.addEventListener('load', async ()=>{
  makeQR(); await drawAll(); window.addEventListener('resize', makeQR);
  setInterval(drawAll, (window.DASHBOARD_CONFIG.refreshSeconds||300)*1000);
});