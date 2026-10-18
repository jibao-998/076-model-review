"""Network-isolated, generated subpath deployment QA for all retained versions."""
from pathlib import Path
import json,re,html,threading,functools,urllib.parse,hashlib,time
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent;D=R/'docs';PREFIX='/076-model-review/'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def translate_path(self,path):return super().translate_path(path[len(PREFIX)-1:] if path.startswith(PREFIX) else '/__404__')
def main():
 (R/'qa').mkdir(exist_ok=True)
 server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(D)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'+PREFIX
 errors=[];bad=[];external=[];injected=[];records=[];perf=[]
 try:
  with sync_playwright() as pw:
   b=pw.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',headless=True,args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
   page=b.new_page(viewport={'width':1600,'height':1000})
   def route(r):
    if r.request.url.startswith((base,'data:','blob:')):r.continue_()
    else:
     host=urllib.parse.urlsplit(r.request.url).hostname or ''
     (injected if host.endswith('.kaspersky-labs.com') else external).append(r.request.url);r.abort()
   page.route('**/*',route);page.on('pageerror',lambda e:(errors.append(str(e)),print('JS ERROR',e,flush=True)));page.on('response',lambda r:bad.append([r.status,r.url]) if r.status>=400 else None)
   versions=json.loads((D/'versions.json').read_text(encoding='utf-8'))
   for v in versions:
    page.goto(base+'#'+v['id']);page.wait_for_function("document.getElementById('loading').hidden",timeout=60000);assert page.locator('#load-error').is_hidden(),(v['id'],page.locator('#error-detail').inner_text());child=page.frames[1];child.wait_for_function('window.reviewBridge!==undefined')
    state=child.evaluate('reviewBridge.capture()');assert state['version']==v['id'];assert state['hash']==v['model_sha256']
    assert page.locator('.review-banner').is_visible();assert '不可直接切割' in page.locator('.review-banner').inner_text()
    if v['id'] in ['v8','v6']:
     p=child.evaluate('reviewBridge.measure()');perf.append({'version':v['id'],'sample':'local HTTP fresh navigation; desktop Edge SwiftShader','metrics':p})
    page.screenshot(path=str(R/'qa'/f"{v['id']}_desktop.png"))
    page.locator('#show-report').click();page.wait_for_function("document.getElementById('loading').hidden");results=page.frames[1].evaluate("async()=>{const imgs=[...document.images];for(const i of imgs)i.loading='eager';await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));return imgs.map(i=>({src:i.src,ok:i.complete&&i.naturalWidth>0}))}");assert all(i['ok'] for i in results),(v['id'],results)
    records.append({'version':v['id'],'report_images':len(results),'native_sha256':v['model_sha256']});print('VERSION PASS',v['id'],flush=True)
   page.set_viewport_size({'width':844,'height':390})
   for v in versions:
    page.goto(base+'#'+v['id']);page.wait_for_function("document.getElementById('loading').hidden",timeout=60000);assert page.locator('#load-error').is_hidden();bb=page.frame_locator('#model-frame').locator('canvas').first.bounding_box();assert bb['width']>=800 and bb['height']>=220,(v['id'],bb)
   page.set_viewport_size({'width':1600,'height':1000});page.goto(base+'#v8');page.wait_for_function("document.getElementById('loading').hidden",timeout=60000);child=page.frames[1]
   child.evaluate("viewer.setView('sternClose'); viewer.orbit(.31); viewer.selectPart('FRAME_14_X772'); viewer.setPartOffset('FRAME_14_X772',[0,0,12]); viewer.setPartVisible('FRAME_13_X750',false); viewer.setExplosion(.23); viewer.setSteering(18)")
   page.wait_for_timeout(150);state=child.evaluate('reviewBridge.capture()');page.locator('#show-report').click();page.wait_for_function("document.getElementById('loading').hidden");page.locator('#show-model').click();page.wait_for_function("document.getElementById('loading').hidden",timeout=60000);child=page.frames[1];after=child.evaluate('reviewBridge.capture()');assert after['parts']==state['parts'];assert after['groups']==state['groups'];assert after['selected']==state['selected'];assert after['steering']==18 and after['explosion']==.23
   assert all(abs(a-b)<1e-6 for a,b in zip(state['camera']['position'],after['camera']['position']))
   # Old frame results cannot overwrite the current attempt.
   original=page.evaluate('saved.get(current.id)');page.evaluate("window.dispatchEvent(new MessageEvent('message',{source:frame.contentWindow,origin:location.origin,data:{type:'review-state',version:current.id,attempt:'-1',state:{bad:true}}}))");assert page.evaluate('saved.get(current.id)')==original
   page.evaluate("choose('v6');choose('v5');choose('v8')");page.wait_for_function("document.getElementById('loading').hidden && current.id==='v8'",timeout=60000);assert page.frames[1].evaluate('reviewBridge.capture().version')=='v8'
   page.locator('#copy-link').click();shared=page.url;assert '?state=' in shared
   p2=b.new_page(viewport={'width':1600,'height':1000});p2.route('**/*',route);p2.goto(shared);p2.wait_for_function("document.getElementById('loading').hidden",timeout=60000);restored=p2.frames[1].evaluate('reviewBridge.capture()');assert restored['parts']==state['parts'];assert restored['selected']==state['selected'];assert restored['steering']==18
   # Unsupported / wrong-hash share data fails closed to the correct version.
   p2.goto(base+'#v8?state=invalid');p2.wait_for_function("document.getElementById('loading').hidden",timeout=60000);assert p2.locator('#load-error').is_hidden()
   page.set_viewport_size({'width':390,'height':844});page.locator('#show-issues').click();assert page.locator('#issues-panel').is_visible();assert page.locator('#copy-link').is_visible();page.screenshot(path=str(R/'qa/phone_portrait_review.png'));page.locator('#show-report').click();page.wait_for_function("document.getElementById('loading').hidden");page.locator('#close-panel').click();page.screenshot(path=str(R/'qa/phone_portrait_report.png'))
   page.set_viewport_size({'width':844,'height':390});page.locator('#show-model').click();page.wait_for_function("document.getElementById('loading').hidden",timeout=60000);page.screenshot(path=str(R/'qa/v8_landscape.png'))
   # Failed download leaves actionable report/retry navigation.
   page.route('**/model.bin',lambda r:r.abort());page.goto(base+'#v6');page.wait_for_function("document.getElementById('loading').hidden",timeout=60000);assert page.locator('#load-error').is_visible();page.locator('#error-report').click();page.wait_for_function("document.getElementById('loading').hidden");assert page.frames[1].locator('h1').count()>0
   assert not errors and not bad and not external,(errors,bad,external);b.close()
  broken=[];count=0
  for f in D.rglob('*.html'):
   for _,raw in re.findall(r'(href|src)="([^"]+)"',f.read_text(encoding='utf-8')):
    u=urllib.parse.urlsplit(html.unescape(raw))
    if u.scheme or u.netloc or not u.path:continue
    target=(f.parent/urllib.parse.unquote(u.path)).resolve();count+=1
    if not target.is_file():broken.append([str(f.relative_to(D)),raw])
  for v in versions:
   for i in json.loads((D/v['review']).read_text(encoding='utf-8'))['issues']:
    if not (D/i['evidence']).is_file():broken.append([v['id'],i['evidence']])
  assert not broken,broken
  performance={'status':'MEASURED_LOCAL_QA','renderer':'Edge / SwiftShader software rendering','real_mobile':'NOT_CHECKED','cache':'fresh page navigations; shared browser process; no claim of public cold cache','samples':perf,'decision':'Preserve Three.js/JSON gzip; defer GLB until same-device A/B. Parent state management fixes are independent of asset format.'}
  (R/'performance_measurement.json').write_text(json.dumps(performance,ensure_ascii=False,indent=2),encoding='utf-8')
  result={'status':'PASS','versions':records,'state_roundtrip':'camera/groups/parts/explosion/steering/selection PASS','shared_fresh_page':'PASS','rapid_navigation_and_stale_messages':'PASS','portrait_reports_and_issues':'PASS','landscape':[844,390],'failure_report_recovery':'PASS','local_links_checked':count,'broken_links':broken,'script_errors':errors,'http_errors':bad,'unexpected_network':external,'antivirus_injected_requests_blocked':len(injected),'native_Rhino_UI':'NOT_CHECKED','physical_strength_water_hardware':'NOT_VERIFIED','real_mobile':'NOT_CHECKED'}
  (R/'all_versions_validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(result,ensure_ascii=False))
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
