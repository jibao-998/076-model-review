# 076 model review · Deep-blue bridge UI

UI revision `baea4789d61691ca`: navy console, cyan controls, static gray-blue model background, 44px controls. Default native geometry remains V10. Right-side study is an unselected candidate with concealment FAIL. UI/browser validation does not verify physical hardware or manufacturing.

Design references only: [OpenBridge](https://github.com/Ocean-Industries-Concept-Lab/openbridge-webcomponents), [KIP](https://github.com/mxtommy/Kip). No new framework, copied source, fonts or icons. Existing Three.js notices retained. Historical model assets and reports preserved.

---

# 076 model review — GitHub Pages mirror

Ten review versions of the 800 mm wooden model, including the V9 whole-deck
and guided side-elevator revision and nine preserved historical CAD downloads. Interactive 3D,
reports, parameters and native Rhino downloads are available. Desktop,
landscape 3D and portrait report/problem reading are supported. Internal structure,
bulb and running gear include model-design
assumptions; this is a review model, not released manufacturing data.

`docs/` contains byte-identical copies of the reviewed static website plus
`.nojekyll`. The original Sites project and CAD files are preserved. No Sites
project identity, Git metadata or credentials are copied into the public assets.
Web-page text contains no local user-directory paths. Byte-preserved native
Rhino downloads retain their historical save-path metadata; these files are
the same downloads already present on the original public review website.
Third-party notices and source attributions are retained.

Public entry: https://jibao-998.github.io/076-model-review/?release=ui1#v9

UI1 uses a light workbench with a full-width model viewport and one common toolbar.
Review evidence and original advanced tools open as overlays. Two-column lift
controls support landscape touch screens; portrait reports remain readable.
Fresh views fit visible geometry while existing camera/session/share states are
preserved. All ten CAD, parameter, report and review files are unchanged by UI1.

The review interface links open issues to parts and evidence. Camera, visibility,
selection, explosion, offsets and steering can be restored per version or shared
with a model-hash-bound URL. Service steps show disconnect/withdraw prerequisites;
fixtures and connectors remain unselected. V9 has one connected removable deck,
unskinned side observation transitions, guide rods, carriages and stops; the two
platforms demonstrate 32 mm vertical motion. Guide fixation, actuators and physical
handling remain unverified. Exact model coordinates are assumptions, not official
ship dimensions. Seven manufacturer hardware candidates
are documented; complete drive fit, strength, sealing and water operation remain
unverified. Existing Rhino files remain editable; native Rhino desktop is NOT_CHECKED.

Publication identity is recorded in `mirror-project.json`. Actual build/public
verification state is recorded in the local deployment receipt, not its historical
preparation-status field.

## Publish

1. Authenticate GitHub CLI in your own browser:
   `gh auth login --hostname github.com --git-protocol https --web`
2. Run `python publish.py --check` to verify account and asset checksums.
3. Run `python publish.py` to create the dedicated public repository, push the
   static files and enable Pages from `main:/docs`.
4. Wait for Pages to build, then verify the returned URL, all versions and
   downloads from an unauthenticated browser and the intended visitor networks.
   `python verify_public.py` checks the actual returned URL, all native downloads,
   desktop 3D/report viewing and landscape phone layout using Playwright/Edge.

The publisher never force-pushes or overwrites an unmarked repository, and does
not change global Git settings. A successful deployment request does not prove
that every visitor network can open the site. This mirror does not change the
original Sites domain's Cloudflare security policy.

## Update

Generate the next reviewed website, copy only its static output into `docs/`,
refresh `mirror_manifest_sha256.json`, rerun the subpath/browser checks and
publish the same repository. Never copy an entire local project into `docs/`.
