from pathlib import Path
import json,threading,re,urllib.request,urllib.parse
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent;D=R/'docs'
class QuietHandler(SimpleHTTPRequestHandler):
 def translate_path(self,path):
  prefix='/076-model-review/'
  return super().translate_path(path[len(prefix)-1:] if path.startswith(prefix) else '/__missing__')
 def log_message(self,*args):pass
def main():
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(D)));thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start();base=f'http://127.0.0.1:{server.server_port}/076-model-review/';errors=[];bad=[];external=[];injected=[];shots=R/'qa';shots.mkdir(exist_ok=True);versions=json.loads((D/'versions.json').read_text(encoding='utf-8'));records=[]
 try:
  with sync_playwright() as pw:
   browser=pw.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',headless=True,args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
   page=browser.new_page(viewport={'width':1600,'height':1000},device_scale_factor=1)
   def request(r):
    if r.url.startswith(('http:','https:')) and not r.url.startswith(base):
     host=urllib.parse.urlsplit(r.url).hostname
     if host.endswith('.kaspersky-labs.com'):injected.append(host)
     else:external.append(r.url)
   page.route('**/*',lambda route:route.continue_() if route.request.url.startswith((base,'data:','blob:')) else route.abort())
   page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:bad.append([r.status,r.url]) if r.status>=400 else None);page.on('request',request)
   for version in versions:
    page.goto(base+'?view='+version['id']+'#'+version['id'],wait_until='load');page.wait_for_function("document.getElementById('loading').hidden",timeout=45000)
    iframe=page.frame_locator('#model-frame');iframe.locator('canvas').first.wait_for(state='visible');bb=iframe.locator('canvas').first.bounding_box();assert bb['width']>400 and bb['height']>300,(version['id'],bb)
    page.screenshot(path=str(shots/(version['id']+'_desktop.png')))
    page.locator('#show-report').click();page.wait_for_function("document.getElementById('loading').hidden")
    img_result=iframe.locator('body').evaluate("async b=>{const all=Array.from(b.querySelectorAll('img'));for(const i of all)i.loading='eager';await Promise.all(all.map(i=>i.decode().catch(()=>{})));return all.map(i=>({src:i.src,ok:i.complete&&i.naturalWidth>0}))}");assert all(q['ok'] for q in img_result),(version['id'],img_result)
    records.append({'version':version['id'],'desktop_canvas':bb,'report_images':len(img_result),'model_bytes':len(urllib.request.urlopen(base+version['model']).read())})
   page.set_viewport_size({'width':844,'height':390})
   for version in versions:
    page.goto(base+'?view='+version['id']+'#'+version['id'],wait_until='load');page.wait_for_function("document.getElementById('loading').hidden",timeout=45000);iframe=page.frame_locator('#model-frame');bb=iframe.locator('canvas').first.bounding_box();assert bb['width']>=830 and bb['height']>=270,(version['id'],bb)
   page.goto(base+'#v6',wait_until='load');page.wait_for_function("document.getElementById('loading').hidden");iframe=page.frame_locator('#model-frame');bb=iframe.locator('canvas').bounding_box();assert bb['width']>=830 and bb['height']>=270,bb
   page.screenshot(path=str(shots/'v6_landscape.png'));iframe.locator('#tools-toggle').click();assert iframe.locator('aside').is_visible();iframe.locator('#tools-toggle').click()
   page.locator('#versions').select_option('v5');page.wait_for_function("document.getElementById('loading').hidden");iframe.locator('#site-tools').click();assert iframe.locator('aside').first.is_visible();iframe.locator('#site-tools').click();bb=iframe.locator('canvas').bounding_box();assert bb['width']>=830 and bb['height']>=270,bb
   page.screenshot(path=str(shots/'v5_landscape.png'))
   page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(shots/'phone_rotate.png'));assert page.locator('#rotate').is_visible();page.locator('#continue-portrait').click();assert not page.locator('#rotate').is_visible()
   # Simulate a failed geometry download. Outer spinner must end, error must be
   # visible in the child, timer cancelled, and report navigation still work.
   page.set_viewport_size({'width':844,'height':390});page.route('**/model.bin',lambda route:route.abort());page.goto(base+'?failure=v6#v6',wait_until='load');page.wait_for_function("document.getElementById('loading').hidden && timer===null");assert '失败' in page.frame_locator('#model-frame').locator('#hosted-load').inner_text();assert '失败' in page.locator('#state').inner_text();page.locator('#show-report').click();page.wait_for_function("document.getElementById('loading').hidden");assert page.frame_locator('#model-frame').locator('h1').count()>0
   assert not errors and not bad and not external,(errors,bad,external)
   browser.close()
  # Check every local HTML link and media reference, not just the first screen.
  broken=[];checked=0
  for f in D.rglob('*.html'):
   for attr,raw in re.findall(r'(href|src)="([^"]+)"',f.read_text(encoding='utf-8')):
    val=__import__('html').unescape(raw);u=urllib.parse.urlsplit(val)
    if not u.path or u.scheme or u.netloc or u.path.startswith('data:'):continue
    target=(D/u.path.lstrip('/')) if u.path.startswith('/') else (f.parent/urllib.parse.unquote(u.path));checked+=1
    if not target.exists():broken.append([str(f.relative_to(D)),raw])
  result={'status':'PASS' if not broken else 'FAIL','versions':records,'phone_landscape':[844,390],'portrait_rotate_prompt':'PASS','scripts':errors,'http_errors':bad,'unexpected_external_requests':external,'network_isolation':'all non-loopback browser requests blocked during QA; no host security settings changed','host_antivirus_injected_requests_blocked':len(injected),'host_antivirus_origins':sorted(set(injected)),'local_links_checked':checked,'broken_links':broken,'native_Rhino_UI':'NOT_CHECKED','iOS_actual_device':'NOT_CHECKED'}
  result['failed_model_download_recovery']='PASS: outer spinner ends; error visible; timer cleared; report still accessible'
  (R/'mirror_validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(result,ensure_ascii=False));assert not broken
 finally:server.shutdown();server.server_close()
if __name__=='__main__':main()
