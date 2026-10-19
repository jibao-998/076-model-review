"""Acceptance of the actual Pages URL, after authenticated publication."""
from pathlib import Path
import json,hashlib,urllib.request,time
from urllib.parse import urljoin
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent
def main():
 receipt=json.loads((R/'deployment_receipt.json').read_text(encoding='utf-8'));base=receipt.get('pages_url')
 assert base and base.startswith('https://'), 'Use the Pages URL returned by GitHub, not an assumed future address'
 base=base.rstrip('/')+'/'
 def get(path):
  with urllib.request.urlopen(urljoin(base,path),timeout=40) as r:return r.status,r.read()
 stamp='?release=v10-'+str(int(time.time()))
 status,body=get(stamp);assert status==200 and hashlib.sha256(body).digest()==hashlib.sha256((R/'docs/index.html').read_bytes()).digest()
 _,body=get('versions.json'+stamp);assert body==(R/'docs/versions.json').read_bytes();versions=json.loads(body);downloads=[]
 for version in versions:
  code,body=get(version['model']);assert code==200 and body==(R/'docs'/version['model']).read_bytes(),version['id'];downloads.append(version['id'])
 errors=[]
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',headless=True,args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  page=b.new_page(viewport={'width':1600,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/*',lambda r:r.continue_() if r.request.url.startswith((base,'data:','blob:')) else r.abort())
  r=page.goto(base+stamp+'#v10',wait_until='load');assert r.status==200
  page.wait_for_function("document.getElementById('loading').hidden",timeout=60000);child=page.frame_locator('#model-frame');child.locator('canvas').wait_for(state='visible');assert page.locator('#load-error').is_hidden()
  assert child.locator('body').evaluate('window.reviewBridge.capture().version')=='v10'
  assert child.locator('body').evaluate('window.reviewBridge.capture().hash')==versions[0]['model_sha256']
  page.screenshot(path=str(R/'qa/public_desktop.png'));page.locator('#show-report').click();page.wait_for_function("document.getElementById('loading').hidden");assert child.locator('h1').count()>0
  page.set_viewport_size({'width':844,'height':390});page.locator('#show-model').click();page.wait_for_function("document.getElementById('loading').hidden",timeout=60000);assert child.locator('canvas').bounding_box()['width']>=830
  page.screenshot(path=str(R/'qa/public_landscape.png'));assert not errors,errors;b.close()
 result={'status':'PASS','url':base,'root_http':200,'unauthenticated_browser':True,'index_bytes_match':True,'native_downloads_match':downloads,'current_3d_and_report':'PASS','phone_landscape':[844,390],'script_errors':errors,'source_commit':receipt['commit_sha'],'actual_iOS':'NOT_CHECKED','original_Sites_domain':'unchanged; separate Cloudflare restriction'}
 (R/'public_validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(result,ensure_ascii=False))
if __name__=='__main__':main()
