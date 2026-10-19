'use strict';
// Presentation only: existing lift/anchor commands and ReviewState remain authoritative.
let v11Side='STBD',v11Angle='front',v11AnchorsOpen=false;
const dock=$('lift-popover');
dock.setAttribute('role','region');dock.setAttribute('aria-label','观察口与升降操作栏');
function v11Controls(){
 for(const side of ['STBD','PORT']){
  $('lift-'+side.toLowerCase()).closest('label').hidden=side!==v11Side;
  $('anchor-'+side.toLowerCase()).closest('label').hidden=side!==v11Side;
 }
 $('anchor-controls').hidden=current?.id!=='v10'||!v11AnchorsOpen;
 $('anchor-toggle').hidden=current?.id!=='v10';
 $('lift-angle').closest('label').hidden=current?.id!=='v10';
 dock.classList.toggle('historical-dock',current?.id==='v9');
 for(const side of ['STBD','PORT'])$('locate-'+side.toLowerCase()).hidden=side!==v11Side;
 $('anchor-toggle').setAttribute('aria-expanded',String(v11AnchorsOpen));
 dock.classList.toggle('anchors-open',v11AnchorsOpen);
 const enabled=ready&&content==='model'&&!!uiCaps?.lifts;
 const percent=Math.round(-100*(uiState?.assemblies?.['ELEVATOR_'+v11Side]?.[2]||0)/32);
 for(const b of document.querySelectorAll('[data-lift-position]')){b.setAttribute('aria-pressed',String(Number(b.dataset.liftPosition)===percent));b.setAttribute('aria-label','所选侧平台'+({'0':'上位','50':'中位','100':'下位'}[b.dataset.liftPosition]))}
 for(const el of dock.querySelectorAll('button,select'))if(el.id!=='close-lifts')el.disabled=!enabled;
 $('model-context').textContent=(current?.label||'076')+' · '+(current?.id==='v10'?'V10几何 · 未验收 / 驱动未选型':'历史原版几何');
 $('lift-size-note').textContent=current?.id==='v10'?'V10几何：52×29 mm候选平台，32 mm暂定行程；观察口露机构与外框收口未验收，驱动UNSELECTED。':'V9历史几何：52×43 mm平台，32 mm演示行程；驱动未选型。';
 document.body.classList.toggle('dock-open',!dock.hidden);
}
function v11Observe(){if(current?.id==='v10')post('v11-observe',{side:v11Side,angle:v11Angle});else post('review-locate',{issue:'lift-'+v11Side.toLowerCase()})}
function v11SyncCamera(state){
 if(current?.id!=='v10'||!state?.camera)return;
 const c=state.camera,t=c.target;
 const side=Math.abs(t[0]-456)<.001&&Math.abs(t[1]-64)<.001?'STBD':Math.abs(t[0]-706)<.001&&Math.abs(t[1]+64)<.001?'PORT':null;
 if(!side)return;v11Side=side;$('lift-side').value=side;
 const sign=side==='STBD'?1:-1,d=c.position.map((v,i)=>v-t[i]),length=Math.hypot(...d);
 for(const[angle,q]of Object.entries({front:[0,260*sign,0],forward:[-145,260*sign,45],aft:[145,260*sign,45],above:[0,260*sign,100],below:[0,260*sign,-65]})){
  if(d.reduce((sum,v,i)=>sum+v*q[i],0)/length/Math.hypot(...q)>.999999){v11Angle=angle;$('lift-angle').value=angle;break}
 }
}
$('lift-side').onchange=e=>{v11Side=e.target.value;v11Controls();v11Observe()};
$('lift-angle').onchange=e=>{v11Angle=e.target.value;v11Observe()};
for(const b of document.querySelectorAll('[data-lift-position]'))b.onclick=()=>post('review-lift',{side:v11Side,percent:Number(b.dataset.liftPosition)});
$('anchor-toggle').onclick=()=>{v11AnchorsOpen=!v11AnchorsOpen;v11Controls()};
// The dock stays available while interacting with the scene; close/Escape is explicit.
$('main-lifts').onclick=()=>{if(!dock.hidden){uiCloseLifts(true);v11Controls();return}uiNativeOpen=false;uiCommand('native',false);uiCommand('prepare-lifts');dock.hidden=false;$('main-lifts').setAttribute('aria-expanded','true');v11Controls();$('lift-side').focus()};
const v11BaseUpdate=window.UIRefresh.update;window.UIRefresh.update=function(state){v11BaseUpdate(state);v11SyncCamera(state);v11Controls()};
const v11BaseContent=window.UIRefresh.content;window.UIRefresh.content=function(which){v11BaseContent(which);v11Controls()};
new MutationObserver(v11Controls).observe(dock,{attributes:true,attributeFilter:['hidden']});
v11Controls();
