'use strict';
// Extend the existing shell without changing historical viewer commands.
let v10Anchors=[],v10Trays=[];
const v10TrayLabels={ANCHOR_WINCH_STBD:'右舷绞盘托盘',ANCHOR_WINCH_PORT:'左舷绞盘托盘',R1_BATTERY_TRAY:'电池托盘',R1_ELECTRONICS_TRAY:'电子设备托盘'};
const v10TrayPanel=node('details');v10TrayPanel.id='tray-controls';v10TrayPanel.open=true;
v10TrayPanel.append(node('summary','设备托盘 · 条件拆取'),node('p','完成甲板、顶板和机库/场景取出步骤后启用。演示假定驱动、线束和固定件已解除；上提100 mm不代表实物操作已通过。'));
const v10TrayButtons=node('div',undefined,'row');
for(const[assembly,label]of Object.entries(v10TrayLabels)){const b=node('button','取出'+label);b.id='tray-'+assembly;b.disabled=true;b.setAttribute('aria-pressed','false');b.onclick=()=>post('v10-tray',{assembly,on:!(uiState?.assemblies?.[assembly]?.[2]>0)});v10TrayButtons.append(b)}
v10TrayPanel.append(v10TrayButtons);$('service-panel').after(v10TrayPanel);
const v10AnchorPanel=$('anchor-controls');$('lift-popover').append(v10AnchorPanel);
function v10Update(state){
 const v10=current?.id==='v10',enabled=v10&&ready&&content==='model';
 v10AnchorPanel.hidden=!v10;
 v10TrayPanel.hidden=!v10;
 $('main-lifts').textContent=v10?'升降 / 收锚':'升降机';
 $('lift-dialog-title').textContent=v10?'V10 R1 · 升降与收锚演示':'双升降机 · 本版演示';
 $('lift-size-note').textContent=v10?'52×29 mm候选平台；32 mm暂定行程，驱动UNSELECTED。3 g仅为飞机质量。':'V9历史基线：52×43 mm平台、32 mm行程；驱动未选型。';
 for(const side of ['STBD','PORT']){
  const input=$('anchor-'+side.toLowerCase()),row=v10Anchors.find(a=>a.side===side),percent=row&&state?Math.round(-100*(state.assemblies?.[row.assembly]?.[2]||0)/row.drop_mm):0;
  input.disabled=!enabled||!row;input.value=percent;
  $('anchor-'+side.toLowerCase()+'-value').textContent=!row?'原生组件待生成':percent===0?'收起':percent===100?'演示下放70 mm':percent+'% · '+(70*percent/100).toFixed(1)+' mm';
 }
 const canRemove=enabled&&state?.serviceStep>=4&&(state.assemblies?.SERVICE_HATCH?.[2]||0)>=190&&(state.assemblies?.HANGAR_ROOF?.[2]||0)>=100&&(state.assemblies?.HANGAR_CASSETTE?.[2]||0)>=100;
 for(const[assembly,label]of Object.entries(v10TrayLabels)){const raised=(state?.assemblies?.[assembly]?.[2]||0)>0,b=$('tray-'+assembly);b.disabled=!enabled||!v10Trays.includes(assembly)||(!raised&&!canRemove);b.textContent=(raised?'放回':'取出')+label;b.setAttribute('aria-pressed',String(raised));b.title=canRemove?'D模型100 mm条件拆取演示':'先按维修顺序取走甲板、顶板与机库/场景'}
}
const v10BaseUpdate=window.UIRefresh.update;window.UIRefresh.update=function(state){v10BaseUpdate(state);v10Update(state)};
const v10BaseContent=window.UIRefresh.content;window.UIRefresh.content=function(which){v10Anchors=[];v10Trays=[];v10BaseContent(which);v10Update(null)};
for(const side of ['STBD','PORT'])$('anchor-'+side.toLowerCase()).oninput=e=>post('v10-anchor',{side,percent:Number(e.target.value)});
window.addEventListener('message',e=>{
 const d=e.data;if(e.source!==frame.contentWindow||e.origin!==location.origin||d?.version!==current?.id||d.attempt!==String(attempt)||content!=='model')return;
 if(d.type==='v10-ready'&&Array.isArray(d.anchors)){v10Anchors=d.anchors.filter(a=>['STBD','PORT'].includes(a.side)&&['ANCHOR_STBD','ANCHOR_PORT'].includes(a.assembly)&&a.drop_mm>0&&a.drop_mm<=70);v10Trays=Array.isArray(d.trays)?d.trays.filter(a=>Object.hasOwn(v10TrayLabels,a)):[];v10Update(saved.get(current.id))}
 if(d.type==='ui-ready'||d.type==='review-ready')v10Update(saved.get(current.id));
});
v10Update(null);
