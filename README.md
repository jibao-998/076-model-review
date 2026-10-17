# 076 model review — GitHub Pages mirror

Eight preserved versions of the 800 mm wooden model, with interactive 3D,
reports, parameters and native Rhino downloads. Desktop and landscape phones
are supported. Internal structure, bulb and running gear include model-design
assumptions; this is a review model, not released manufacturing data.

`docs/` contains byte-identical copies of the reviewed static website plus
`.nojekyll`. The original Sites project and CAD files are preserved. No Sites
project identity, Git metadata or credentials are copied into the public assets.
Web-page text contains no local user-directory paths. Byte-preserved native
Rhino downloads retain their historical save-path metadata; these files are
the same downloads already present on the original public review website.
Third-party notices and source attributions are retained.

Publication target is recorded in `mirror-project.json`. It is a proposed
target until authenticated publication returns the actual Pages URL.

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
