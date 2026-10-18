"""Publish this isolated static mirror using an already authenticated GitHub CLI.
Never reads/prints tokens, changes global Git settings, force-pushes or overwrites
an unmarked existing repository. A successful request is not a live-browser pass.
"""
from pathlib import Path
import json,hashlib,subprocess,sys,os,base64
R=Path(__file__).resolve().parent
ENV=dict(os.environ);ENV.pop('GH_DEBUG',None);ENV['GH_HOST']='github.com'

def run(args,check=True,data=None):
 p=subprocess.run(args,cwd=R,env=ENV,input=data,text=True,encoding='utf-8',capture_output=True)
 if check and p.returncode:raise RuntimeError(p.stderr.strip() or p.stdout.strip() or 'Command failed')
 return p

def api(path,method='GET',body=None,check=True):
 args=['gh','api','--hostname','github.com','--method',method,path]
 if body is not None:args+=['--input','-']
 p=run(args,check=check,data=json.dumps(body) if body is not None else None)
 return p,json.loads(p.stdout) if p.returncode==0 and p.stdout.strip() else None

def validate():
 manifest=json.loads((R/'mirror_manifest_sha256.json').read_text(encoding='utf-8'))
 for name,h in manifest.items():
  file=(R/'docs'/name).resolve()
  if not file.is_relative_to((R/'docs').resolve()) or not file.is_file() or hashlib.sha256(file.read_bytes()).hexdigest()!=h:raise RuntimeError('Mirror checksum mismatch: '+name)
 actual={f.relative_to(R/'docs').as_posix() for f in (R/'docs').rglob('*') if f.is_file()}
 if actual!=set(manifest):raise RuntimeError('Unexpected or missing public assets')
 if '.openai/hosting.json' in actual:raise RuntimeError('Do not publish Sites identity in mirror')
 return json.loads((R/'mirror-project.json').read_text(encoding='utf-8'))

def main():
 target=validate();full=target['owner']+'/'+target['repository']
 if target['project']!='076-800mm-model-review' or target['visibility']!='public' or target['pages_path']!='/docs':raise RuntimeError('Unexpected deployment target')
 auth=run(['gh','auth','status','--hostname','github.com'],check=False)
 if auth.returncode:raise RuntimeError('GitHub CLI is not logged in. Run gh auth login --hostname github.com --git-protocol https --web, then retry. Do not paste tokens into chat.')
 _,user=api('user')
 if user['login'].lower()!=target['owner'].lower():raise RuntimeError('Authenticated account differs from mirror owner; no publication performed')
 if '--check' in sys.argv:
  print(json.dumps({'status':'READY_TO_PUBLISH','target':full,'assets':'hashes match','user':user['login']}));return
 probe,repo=api('repos/'+full,check=False)
 if probe.returncode:
  if 'HTTP 404' not in probe.stderr:raise RuntimeError(probe.stderr)
  run(['gh','repo','create',full,'--public','--description','076 Sichuan 800 mm wooden model: interactive review of eight preserved versions'])
  _,created=api('repos/'+full)
  (R/'created_by_task.json').write_text(json.dumps({'id':created['id'],'full_name':created['full_name']}),encoding='utf-8')
 else:
  if repo.get('private') or repo.get('owner',{}).get('login','').lower()!=target['owner'].lower():raise RuntimeError('Existing repository does not match public owner target')
  marker,content=api('repos/'+full+'/contents/mirror-project.json?ref=main',check=False)
  if marker.returncode:
   receipt=R/'created_by_task.json'
   created=json.loads(receipt.read_text(encoding='utf-8')) if receipt.exists() else {}
   branch,_=api('repos/'+full+'/git/ref/heads/main',check=False)
   empty_ref=('HTTP 404' in branch.stderr) or ('HTTP 409' in branch.stderr and 'Git Repository is empty' in branch.stderr)
   if created.get('id')!=repo['id'] or created.get('full_name')!=repo['full_name'] or repo.get('size')!=0 or not empty_ref:raise RuntimeError('Existing repository is unmarked; refusing to overwrite it')
  else:
   m=json.loads(base64.b64decode(content['content']).decode('utf-8'))
   if any(m.get(k)!=target[k] for k in ['project','owner','repository']):raise RuntimeError('Existing repository marker mismatch')
   if not (R/'.git').is_dir():raise RuntimeError('Existing published mirror requires its original checkout; no history will be replaced')
 if not (R/'.git').exists():run(['git','init','-b','main'])
 remote=run(['git','remote','get-url','origin'],check=False)
 url='https://github.com/'+full+'.git'
 if remote.returncode:run(['git','remote','add','origin',url])
 elif remote.stdout.strip()!=url:raise RuntimeError('Unexpected origin; no remote change performed')
 names=['docs','README.md','.gitattributes','.gitignore','mirror-project.json','mirror_manifest_sha256.json','publish.py','verify_mirror.py','verify_public.py']
 run(['git','add','--',*names])
 allowed={p.relative_to(R).as_posix() for p in (R/'docs').rglob('*') if p.is_file()}|set(names[1:])
 tracked={p for p in run(['git','-c','core.quotepath=false','ls-files','-z']).stdout.split('\0') if p}
 if tracked!=allowed:raise RuntimeError('Git index includes missing/unapproved public files; no commit or push performed')
 entries=run(['git','ls-files','--stage','-z']).stdout.split('\0')
 if any(entry and entry.split()[0] not in ['100644','100755'] for entry in entries):raise RuntimeError('Unexpected symlink or Git submodule; no commit or push performed')
 if run(['git','diff','--cached','--quiet'],check=False).returncode:
  email=str(user['id'])+'+'+user['login']+'@users.noreply.github.com'
  run(['git','-c','user.name='+user['login'],'-c','user.email='+email,'commit','-m','Add V8 geometry evidence and persistent engineering review states'])
 run(['git','-c','credential.helper=','-c','credential.helper=!gh auth git-credential','push','--set-upstream','origin','main'])
 check,pages=api('repos/'+full+'/pages',check=False)
 if check.returncode:
  if 'HTTP 404' not in check.stderr:raise RuntimeError(check.stderr)
  _,pages=api('repos/'+full+'/pages',method='POST',body={'build_type':'legacy','source':{'branch':'main','path':'/docs'}})
 elif pages.get('source')!={'branch':'main','path':'/docs'} or pages.get('cname'):
  raise RuntimeError('Existing Pages settings differ; no settings overwritten')
 receipt={'status':'DEPLOYMENT_REQUESTED','repository_url':'https://github.com/'+full,'pages_url':pages.get('html_url'),'commit_sha':run(['git','rev-parse','HEAD']).stdout.strip(),'pages_state':pages.get('status'),'original_site_preserved':True,'live_browser':'NOT_CHECKED'}
 (R/'deployment_receipt.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8');print(json.dumps(receipt))
if __name__=='__main__':
 try:main()
 except Exception as e:print(str(e),file=sys.stderr);sys.exit(1)
