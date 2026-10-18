(function(root){
 'use strict';
 const safeKey=k=>typeof k==='string'&&k.length>0&&k.length<=200&&!['__proto__','prototype','constructor'].includes(k);
 const finite=(n,lo,hi)=>typeof n==='number'&&Number.isFinite(n)&&n>=lo&&n<=hi;
 const vec=(v,bound)=>Array.isArray(v)&&v.length===3&&v.every(n=>finite(n,-bound,bound));
 function validate(s,version,hash){
  if(!s||typeof s!=='object'||s.schema!==1||s.version!==version||s.hash!==hash)return null;
  const c=s.camera;
  if(!c||!vec(c.position,20000)||!vec(c.target,10000)||!vec(c.up,1)||Math.hypot(...c.up)<.5||!finite(c.zoom,.01,100)||!finite(c.halfHeight,.01,20000))return null;
  if(Math.hypot(...c.position.map((v,i)=>v-c.target[i]))<.01)return null;
  if(!safeKey(s.mode)||!finite(s.explosion,0,1)||(s.selected!==null&&!safeKey(s.selected)))return null;
  if(!finite(s.steering,-30,30)||!Number.isInteger(s.serviceStep)||s.serviceStep<0||s.serviceStep>5)return null;
  for(const key of ['groups','parts'])if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key])||Object.keys(s[key]).length>1000)return null;
  for(const [k,v]of Object.entries(s.groups))if(!safeKey(k)||typeof v!=='boolean')return null;
  for(const [k,v]of Object.entries(s.parts))if(!safeKey(k)||!v||!vec(v.offset,3000)||typeof v.visible!=='boolean')return null;
  const result={schema:1,version,hash,camera:{position:[...c.position],target:[...c.target],up:[...c.up],zoom:c.zoom,halfHeight:c.halfHeight},mode:s.mode,explosion:s.explosion,selected:s.selected,groups:{...s.groups},parts:Object.fromEntries(Object.entries(s.parts).map(([k,v])=>[k,{offset:[...v.offset],visible:v.visible}])),steering:s.steering,serviceStep:s.serviceStep};
  for(const key of ['view','scope'])if(s[key]!==undefined){if(!safeKey(s[key]))return null;result[key]=s[key]}
  if(s.flags){if(Object.keys(s.flags).length>40)return null;result.flags={};for(const[k,v]of Object.entries(s.flags)){if(!safeKey(k)||typeof v!=='boolean')return null;result.flags[k]=v}}
  if(s.assemblies){if(typeof s.assemblies!=='object'||Array.isArray(s.assemblies)||Object.keys(s.assemblies).length>30)return null;result.assemblies={};for(const[k,v]of Object.entries(s.assemblies)){if(!safeKey(k)||!vec(v,3000))return null;result.assemblies[k]=[...v]}}
  if(version==='v9'&&result.assemblies){for(const [k,v]of Object.entries(result.assemblies)){if(k.startsWith('ELEVATOR_')&&(!['ELEVATOR_STBD','ELEVATOR_PORT'].includes(k)||v[0]!==0||v[1]!==0||v[2]<-32||v[2]>0))return null;if(['SERVICE_HATCH','HANGAR_HATCH','HANGAR_ROOF','HANGAR_CASSETTE'].includes(k)&&(v[0]!==0||v[1]!==0||v[2]<0||v[2]>400))return null}}
  return result;
 }
 function encode(s){const text=JSON.stringify(s);if(text.length>60000)throw Error('评审状态过大，请减少逐件位移后分享');return btoa(Array.from(new TextEncoder().encode(text),b=>String.fromCharCode(b)).join('')).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'')}
 function decode(token,version,hash){try{if(typeof token!=='string'||token.length>80000||!/^[A-Za-z0-9_-]+$/.test(token))return null;const bytes=Uint8Array.from(atob(token.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));return validate(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)),version,hash)}catch{return null}}
 const api={encode,decode,validate};if(typeof module!=='undefined')module.exports=api;else root.ReviewState=api;
})(typeof globalThis==='undefined'?this:globalThis);
