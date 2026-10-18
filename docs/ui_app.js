'use strict';
// Parent shell owns layout. The adapter invokes existing, validated viewer APIs.
let uiCaps=null,uiState=null,uiNativeOpen=false,uiFreshView=false,uiFreshPending=false;
const modeNames={assembled:'完整装配',full:'完整外形',skeleton:'结构骨架',exploded:'分组爆炸',planking:'蒙皮工装',ghost:'透明外壳',new:'新版外形',old:'历史对照',overlay:'新旧叠加'};
const viewNames={iso:'三维',top:'顶视',port:'左舷',starboard:'右舷',bow:'艏视',stern:'艉视',sternClose:'艉部近看',bowClose:'艏部近看',wellClose:'坞舱近看',hangarClose:'机库近看',gearClose:'轴桨舵',bottom:'底视',mid:'舯剖·静态图',aft:'艉剖·静态图'};
const uiCommand=(action,value)=>post('ui-command',{action,value});
function uiCloseLifts(focus=false){const was=!$('lift-popover').hidden;$('lift-popover').hidden=true;$('main-lifts').setAttribute('aria-expanded','false');if(focus&&was)$('main-lifts').focus()}
function uiFill(select,choices,names){select.replaceChildren(...choices.map(q=>{const option=node('option',names[q.id]||q.label);option.value=q.id;return option}))}
function uiUpdate(state){
 if(state)uiState=state;
 const enabled=ready&&content==='model'&&uiCaps?.version===current?.id&&!uiFreshPending;
 for(const id of ['main-mode','main-view','main-fit','main-reset','main-advanced'])$(id).disabled=!enabled;
 $('main-deck').disabled=!enabled||!uiCaps?.deck;$('main-deck').title=uiCaps?.deck?'整块甲板或本历史版检修甲板':'本版未实现可拆甲板动作，请使用本版原工具';
 $('main-lifts').disabled=!enabled||!uiCaps?.lifts;$('main-lifts').title=uiCaps?.lifts?'双平台沿导轨升降':'本历史版本没有导轨升降演示';
 if(state){for(const[key,id]of [['mode','main-mode'],['view','main-view']])if([...$(id).options].some(o=>o.value===state[key]))$(id).value=state[key];const deck=state.assemblies?.SERVICE_HATCH||state.assemblies?.HANGAR_HATCH;$('main-deck').textContent=deck?.[2]>0?'放回甲板':'取甲板';$('main-deck').setAttribute('aria-pressed',String(!!deck?.[2]));$('part-peek').hidden=!state.selected;$('part-peek').textContent=state.selected?'零件证据 · '+state.selected:''}
 const fixed=current?.id==='v1'&&['mid','aft'].includes(uiState?.view);if(fixed){$('main-mode').disabled=true;$('main-fit').disabled=true}$('main-mode').title=fixed?'剖面是固定参考图，切回三维后调整显示模式':'保留当前观察方向';
 $('model-context').textContent=(current?.label||'076')+' · 800 mm · '+(fixed?'静态剖面参考图':'木质拼装评审');
}
function uiContent(which){uiCaps=null;uiState=null;uiNativeOpen=false;uiFreshPending=false;uiFreshView=which==='model'&&!desired&&!saved.has(current.id);uiCloseLifts();$('part-peek').hidden=true;$('main-advanced').setAttribute('aria-expanded','false');document.body.classList.toggle('report-mode',which==='report');uiUpdate()}
const liftPanel=$('elevator-panel');$('lift-popover').append(liftPanel);liftPanel.open=true;liftPanel.querySelector('summary').style.pointerEvents='none';
$('main-mode').onchange=e=>uiCommand('mode',e.target.value);$('main-view').onchange=e=>uiCommand('view',e.target.value);
$('main-fit').onclick=()=>uiCommand('fit');$('main-reset').onclick=()=>{uiCloseLifts();uiCommand('reset')};
$('main-deck').onclick=()=>{const deck=uiState?.assemblies?.SERVICE_HATCH||uiState?.assemblies?.HANGAR_HATCH;uiCommand('deck',!(deck?.[2]>0))};
$('main-lifts').onclick=()=>{const on=$('lift-popover').hidden;if(on){uiNativeOpen=false;uiCommand('native',false);uiCommand('prepare-lifts');$('lift-popover').hidden=false;$('main-lifts').setAttribute('aria-expanded','true');$('lift-stbd').focus()}else uiCloseLifts(true)};
$('close-lifts').onclick=()=>uiCloseLifts(true);
$('main-advanced').onclick=()=>{uiCloseLifts();uiNativeOpen=!uiNativeOpen;uiCommand('native',uiNativeOpen);$('main-advanced').setAttribute('aria-expanded',String(uiNativeOpen))};
$('part-peek').onclick=()=>{showPanel(true);$('part-card').scrollIntoView({block:'nearest'});$('close-panel').focus()};
function uiEscape(){uiCloseLifts(true);if(uiNativeOpen){uiNativeOpen=false;uiCommand('native',false);$('main-advanced').setAttribute('aria-expanded','false');$('main-advanced').focus()}if(!document.body.classList.contains('panel-closed')){showPanel(false);$('show-issues').focus()}}
document.addEventListener('keydown',e=>{if(e.key==='Escape')uiEscape()});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#lift-popover,#main-lifts'))uiCloseLifts()},{passive:true});
window.addEventListener('message',e=>{
 const d=e.data;if(e.source!==frame.contentWindow||e.origin!==location.origin||d?.version!==current?.id||d.attempt!==String(attempt)||content!=='model')return;
 if(d.type==='ui-ready'){
  const valid=q=>Array.isArray(q)&&q.length<=40&&q.every(x=>typeof x.id==='string'&&x.id.length<=100&&typeof x.label==='string'&&x.label.length<=200);
  if(!valid(d.capabilities?.modes)||!valid(d.capabilities?.views))return;
  uiCaps={...d.capabilities,version:d.version};uiFill($('main-mode'),uiCaps.modes,modeNames);uiFill($('main-view'),uiCaps.views,viewNames);if(uiFreshView){uiFreshView=false;uiFreshPending=true;uiCommand('fit')}uiUpdate(saved.get(current.id));
 }
 if(d.type==='ui-fit'){uiFreshPending=false;remember(d.state);uiUpdate(saved.get(current.id))}
 if(d.type==='ui-tools'){uiNativeOpen=!!d.open;$('main-advanced').setAttribute('aria-expanded',String(uiNativeOpen))}
 if(d.type==='ui-close')uiEscape();
 if(d.type==='ui-canvas-interaction')uiCloseLifts();
 if(d.type==='review-ready'||d.type==='model-ready')uiUpdate(saved.get(current.id));
});
window.UIRefresh={update:uiUpdate,content:uiContent};uiUpdate();
