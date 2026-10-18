'use strict';
const $=id=>document.getElementById(id),frame=$('model-frame'),loading=$('loading');
let versions=[],current=null,content='model',attempt=0,timer=null,review=null,awaitRestore=false,ready=false,serviceStep=0,desired=null,issuePending=null,lastPart=null;
const saved=new Map();let lockedPose=null;
function toast(text){$('toast').textContent=text;$('toast').hidden=false;setTimeout(()=>$('toast').hidden=true,3500)}
function post(type,extra={}){if(current)frame.contentWindow?.postMessage({type,version:current.id,attempt:String(attempt),...extra},location.origin)}
function remember(s){if(!current)return;const v=ReviewState.validate(s,current.id,current.model_sha256);if(!v)return;saved.set(current.id,v);$('drive-overlay').checked=!!v.flags?.['review-drive-overlay'];for(const side of ['stbd','port']){const pct=Math.round(-100*(v.assemblies?.['ELEVATOR_'+side.toUpperCase()]?.[2]||0)/32);$('lift-'+side).value=pct;$('lift-'+side+'-value').textContent=pct===0?'上位':pct===100?'下位':pct+'%下降'}try{sessionStorage.setItem('076.review.'+current.id,JSON.stringify(v))}catch{}}
function capture(){try{if(content==='model'&&ready&&frame.contentWindow.reviewBridge){const s=frame.contentWindow.reviewBridge.capture();remember(s);return s}}catch{}return saved.get(current?.id)}
function hashParts(){const raw=location.hash.slice(1),[path,query]=raw.split('?');const[id,type]=path.split('/');return{id,content:type==='report'?'report':'model',token:new URLSearchParams(query||'').get('state')}}
function updateUrl(token){if(!current)return;history.replaceState(null,'','#'+current.id+(content==='report'?'/report':'')+(token?'?state='+token:''))}
function showPanel(on){document.body.classList.toggle('panel-closed',!on);$('issues-panel').setAttribute('aria-hidden',String(!on));$('show-issues').classList.toggle('active',on)}
function openContent(which){
 capture();if(which==='model'&&!desired)desired=saved.get(current.id)||null;content=which;attempt++;ready=false;awaitRestore=false;loading.hidden=false;$('load-error').hidden=true;$('download-progress').value=0;$('loading-note').textContent=which==='report'?'正在打开本版报告':'首次下载后即可旋转浏览';
 const url=new URL(which==='report'?current.report:current.viewer,location.href);url.searchParams.set('attempt',String(attempt));url.searchParams.set('reviewRevision',current.viewer_revision||window.SITE_REVISION||'1');frame.src=url.href;
 $('show-model').classList.toggle('active',which==='model');$('show-report').classList.toggle('active',which==='report');updateUrl();clearTimeout(timer);timer=setTimeout(()=>$('loading-note').textContent='下载仍在进行，可以重试或切到报告。',30000);
}
function error(message){clearTimeout(timer);timer=null;loading.hidden=true;$('error-detail').textContent=message;$('load-error').hidden=false}
async function choose(id,which='model',token=null){
 const previous=capture();lockedPose=$('lock-camera').checked&&previous?previous.camera:null;issuePending=null;current=versions.find(v=>v.id===id)||versions[0];
 $('versions').value=current.id;$('download').href=current.model;$('download').download='076_'+current.id+'_REVIEW_ONLY.3dm';$('version-title').textContent=current.label+' · '+current.title;$('version-description').textContent=current.description;$('version-note').textContent=(current.historical?'历史评审 / ':'当前评审 / ')+current.label+' · 800 mm';$('blocker-summary').textContent=(current.review_notes||[])[0]||'制造与实物测试待验证';$('parameter-link').href=current.parameters;$('review-link').href=current.review;
 desired=token?ReviewState.decode(token,current.id,current.model_sha256):saved.get(current.id);
 if(token&&!desired)toast('分享状态无效或模型版本已变化，已使用本版默认视角。');
 if(!desired){try{desired=ReviewState.validate(JSON.parse(sessionStorage.getItem('076.review.'+current.id)),current.id,current.model_sha256)}catch{}}
 if(lockedPose&&desired)desired={...desired,camera:lockedPose};
 const chosen=current.id;review=null;lastPart=null;partCard(null);$('issue-list').replaceChildren();openContent(which);
 try{const res=await fetch(current.review);if(!res.ok)throw Error('本版评审记录暂不可用');const data=await res.json();if(current.id!==chosen)return;review=data;renderReview()}catch(e){toast(e.message)}
}
function node(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el}
function renderReview(){
 $('blocker-summary').textContent=review.issues.map(i=>i.short).join(' / ');
 $('issue-list').replaceChildren(...review.issues.map(i=>{const card=node('article',undefined,'issue');card.append(node('h3',i.title),node('span',i.status,'badge'+(i.status.includes('几何修正')?' checked':'')),node('p',i.finding),node('small','关闭条件：'+i.close));const row=node('div',undefined,'row'),b=node('button','定位部件');b.onclick=()=>{if(content!=='model'||!ready){issuePending=i.id;if(content!=='model')openContent('model')}else{issuePending=null;post('review-locate',{issue:i.id})}if(innerWidth<1050)showPanel(false)};row.append(b);const a=node('a','查看证据 ↗');a.href=i.evidence;a.target='_blank';a.rel='noopener';row.append(a);card.append(row);return card}));
 const list=node('ul');for(const c of review.changes)list.append(node('li',c));$('change-list').replaceChildren(list);
 $('parameter-summary').replaceChildren(...review.parameters.map(p=>node('p',p)));
 $('hardware-summary').replaceChildren(...review.hardware.map(p=>node('p',p)));
 $('evidence-links').replaceChildren(...(review.evidence_links||[]).map(item=>{const p=node('p'),a=node('a',item.label+' ↗');a.href=item.href;a.target='_blank';a.rel='noopener';p.append(a);return p}));
 $('service-panel').hidden=!review.service_supported;$('elevator-panel').hidden=!review.elevators_supported;serviceUI(serviceStep);
 $('performance-status').textContent='首次可操作、解析和帧率记录见本次测试；桌面软件渲染不代表真实手机性能。';
 if(lastPart)partCard(lastPart);
}
function serviceUI(step){serviceStep=step;if(!review)return;$('service-note').textContent=review.service_supported?'先按顺序清除拆装条件，再演示机库上提。':'本历史版本未实现此维修流程。';$('service-steps').replaceChildren(...review.service_steps.map((s,i)=>node('li',s,i===step?'current':i<step?'done':'')));$('service-next').disabled=step>=5;$('service-prev').disabled=step<=0}
for(const side of ['stbd','port']){$('lift-'+side).oninput=e=>post('review-lift',{side:side.toUpperCase(),percent:Number(e.target.value)});$('locate-'+side).onclick=()=>{post('review-locate',{issue:'lift-'+side});if(innerWidth<1050)showPanel(false)}}
function partCard(p){
 lastPart=p;if(!p){$('part-card').replaceChildren(node('h2','零件证据卡'),node('p','点击模型或“定位部件”，查看材料、检查结果与证据。'));return}$('part-card').replaceChildren(node('h2','零件证据卡'),node('p',p.name,'part-name'));
 const own=review?.parts?.[p.name]||{},wood=['frames','keel','longitudinal','deck','lower','liner','hangarwalls','hangarfloor','hangarroof','wellroof','servicebearings','servicehatch','cheeks','plankingjigs','internal','wellbeams','support'].includes(p.group);
 const rows=[['材料 / 板厚',own.material||(wood?'木板 / 3 mm设计厚度；批次实测待填':'参考面、占位或模型部件；实物材料未定')],['用途',own.purpose||p.group],['来源等级','D 模型设计；不代表076真实内部'],['蒙皮方案',own.skin||'椴木条2×约5 mm；胶层目标0.2 mm'],['当前检查',own.check||'未建立该件独立制造验收；动画显隐不代表通过'],['目标 / 基线',own.allowance||'法向目标2.2 mm；历史1.25 mm为基线口径'],['纹理 / 插入',own.assembly||'纹理、切缝补偿及插入路径需试件确认'],['加工状态','评审版 / 不可切割'],['关联问题',(own.issues||review?.issues.filter(i=>i.parts.some(n=>p.name.endsWith(n)||p.name===n)).map(i=>i.title)||[]).join('；')||'未关闭的材料、装配和密封验证'],['源版本 / 哈希',current.id+' / '+current.model_sha256.slice(0,16)+'…']];
 const dl=node('dl');for(const[k,v]of rows)dl.append(node('dt',k),node('dd',v));$('part-card').append(dl);const a=node('a','打开本版证据 ↗');a.href=own.evidence||current.report;a.target='_blank';a.rel='noopener';$('part-card').append(a);if(innerWidth>=1050)showPanel(true);
}
window.addEventListener('message',e=>{
 const d=e.data;if(e.source!==frame.contentWindow||e.origin!==location.origin||d?.version!==current?.id||d.attempt!==String(attempt)||content!=='model')return;
 if(d.type==='model-progress'){if(Number.isFinite(d.total)&&d.total>0&&Number.isFinite(d.received)){$('download-progress').value=Math.min(100,100*d.received/d.total);$('loading-note').textContent=d.phase==='parsing'?'下载完成，构建三维场景…':`下载 ${(d.received/1048576).toFixed(1)} / ${(d.total/1048576).toFixed(1)} MB`}}
 if(d.type==='model-error')error(d.message||'模型载入失败');
 if(d.type==='review-ready'){
  ready=true;const restore=desired||(lockedPose?{...d.state,camera:lockedPose}:null);if(restore){awaitRestore=true;post('review-restore',{state:restore})}else remember(d.state);
  if(issuePending){post('review-locate',{issue:issuePending});issuePending=null}
 }
 if(d.type==='model-ready'&&!awaitRestore){loading.hidden=true;clearTimeout(timer);timer=null}
 if(d.type==='review-restored'){awaitRestore=false;desired=null;remember(d.state);serviceUI(d.state.serviceStep);loading.hidden=true;clearTimeout(timer);timer=null}
 if(d.type==='review-state'&&!awaitRestore){remember(d.state);serviceUI(d.state.serviceStep)}
 if(d.type==='review-part')partCard(d.part);
 if(d.type==='review-service')serviceUI(d.step);
 if(d.type==='review-open-service'){$('service-panel').open=true;showPanel(true);$('service-panel').scrollIntoView({block:'nearest'})}
});
frame.addEventListener('load',()=>{if(content!=='report')return;try{if(new URL(frame.contentWindow.location.href).searchParams.get('attempt')!==String(attempt))return}catch{return}loading.hidden=true;clearTimeout(timer);timer=null});
$('versions').onchange=e=>choose(e.target.value);$('show-model').onclick=()=>content==='model'?null:openContent('model');$('show-report').onclick=()=>content==='report'?null:openContent('report');
$('show-issues').onclick=()=>showPanel(document.body.classList.contains('panel-closed'));$('show-blockers').onclick=()=>showPanel(true);$('close-panel').onclick=()=>showPanel(false);$('simple-view').onclick=()=>showPanel(false);
$('service-next').onclick=()=>post('review-service',{step:serviceStep+1});$('service-prev').onclick=()=>post('review-service',{step:serviceStep-1});$('service-reset').onclick=()=>post('review-service',{step:0});$('drive-overlay').onchange=e=>post('review-overlay',{on:e.target.checked});
$('lock-camera').onchange=e=>{if(!e.target.checked)lockedPose=null};
$('retry-load').onclick=()=>openContent('model');$('error-report').onclick=()=>openContent('report');
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{toast('浏览器未允许全屏，可继续浏览。')}};
$('copy-link').onclick=async()=>{const s=capture();let token;try{if(s)token=ReviewState.encode(s);updateUrl(token);const url=location.href;try{await navigator.clipboard.writeText(url);toast('已复制：版本、视角、选择、显隐与爆炸状态')}catch{prompt('复制评审状态链接',url)}}catch(e){toast(e.message)}};
window.addEventListener('hashchange',()=>{if(versions.length){const p=hashParts();choose(p.id,p.content,p.token)}});
if(innerWidth<1050)showPanel(false);matchMedia('(max-width:1050px)').addEventListener('change',e=>{if(e.matches)showPanel(false)});
fetch('versions.json?revision='+encodeURIComponent(window.SITE_REVISION||'1')).then(r=>{if(!r.ok)throw Error('版本清单读取失败');return r.json()}).then(v=>{versions=v;for(const item of v){const o=node('option',item.label+' · '+item.title+(!item.historical?' / 当前':''));o.value=item.id;$('versions').append(o)}const p=hashParts();choose(p.id,p.content,p.token)}).catch(e=>error(e.message));
