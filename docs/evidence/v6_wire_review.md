# V6 wire-reserve and direct mounting review

2026-10-17. Read-only audit of the authoritative saved V6 scene/native snapshot. Only work/v6_wire_review.json and this file were written. Full pair records, route endpoints, box bounds, graph results and native provenance are in the JSON. Status: **nominal static 4×4 mm reserves PASS; cassette removal has an explicit lamp-branch prerequisite.** This does not establish physical electrical/mechanical operation.

## Static wire clearance

- All 9 native WIRE polylines exactly match saved route coordinates: 17 orthogonal segments. Unique endpoints and all orthogonal segment intersections form a connected graph of 25 nodes and 24 edges; all 25 nodes reached.
- Each segment uses the same V5 method: its centerline plus a ±2 mm cube, giving a 4×4 mm transverse reserve and 2 mm endpoint caps. Boolean collision threshold is positive volume greater than 0.0001 mm³.
- All 142 closed permanent wooden objects were included, covering frames, keel, longitudinal members, plates, decks, elevator platforms, cabin panels, catwalks/supports, local cheeks, crown beams, all 16 servicebearing brackets/keys and superstructure details. Every included mesh is a connected positive-volume solid. Reserved hardware/space boxes and temporary planking braces are excluded from this permanent-wood test.
- Native tie-out covers every included wooden object: 80 generated native extrusion profiles, 116 outer/inner profile rings and 80 extrusion vectors match panel details; remaining 62 permanent wood geometries encode identically to V5. This avoids relying only on display meshes for the newly cut wire apertures.
- **34 wire/wood broadphase pairs, including 8 servicebearing pairs: zero positive-volume collisions.** All new brackets have continuous passage for the nominal trunks. An additional conservative check against 11 other closed permanent objects in runninggear also found no wire collision.

Current source/verify_service.py does not contain this complete wire graph/envelope regression check. Its general service PASS should not be read as wiring evidence; this separate artifact supplies the V6 snapshot evidence. Future permanent-board changes need the same check rerun.

## Cassette removal and lamp lead

The final LIGHT segment (zero-based segment3) runs from (187,0,70) to (400,0,70), through the moving hangar front-wall sleeve into the cassette. Before extraction, this branch must be disconnected and physically cleared from the moving/fixed interface, or be a defined cassette pigtail that moves with the cassette. Merely retaining the fixed reserve in place while raising the cabin is not a valid service state: at +10 mm lift the front wall intersects that fixed 4×4 reserve by 48.0 mm³.

With only that terminal lamp branch disengaged/moving, the remaining 16 fixed wire segments have zero intersections with the continuous conservative cassette sweep X190–595, Y−35–41, Z44–206. The connector location, cable support, strain relief, slack and actual unplug/withdraw procedure are unselected and unmodeled; the existing instruction to unplug the lamp is a prerequisite, not an operational demonstration.

## Directly supported physical integration gaps

**Motor planning reserves do not match the existing straight shaft axes.** Both shaft roots are at (722,±28,18). Reserved motor boxes occupy X620–655 and Z8–18. Extrapolating the saved native shaft centerline forward gives Z56.25 at X620 and Z43.125 at X655, entirely above those boxes; the longitudinal gap between each box end and the modeled shaft start is 67 mm. Thus the present planning boxes cannot be claimed as a completed coaxial drive arrangement. Motor placement or transmission architecture, mounts and couplings remain an engineering/hardware decision; no device size or specification is inferred here.

Rudder/stock geometry and linked steering animation are represented, while selected servo, arms, linkage, bearings, seals and physical actuation are absent. WIRE_SERVO is a reserved route, not installed steering hardware. Actual motor/servo mounting and motion therefore remain NOT_VERIFIED. The existing stern tubes have two native profiles (a represented bore), and shaft/tube solid overlap is zero; this review does not assert a nonexistent solid-tube defect.

## Limits

These are nominal clearance reserves, not selected cable diameters, connectors, bend-radius or current-capacity checks. Open reference skin surfaces are not a closed physical 2 mm skin, so wood/skin allowance and waterproofness remain separate gates. No native Rhino UI, physical electrical test, installed-hardware test or water operation was performed. No public-site review is included.

## SHA-256 binding

- `076_assembled_v6.3dm`: `6de9a4571aa78f69bf85a0225880a3d48d9cc029c24b0416ce23d4d1a7fe542b`
- `assembly_scene.json`: `d144c9563995be18827ec01422773315189d57e96f21b46bf378115e3415ba40`
- `panel_details.json`: `9b877ea8f204331da16c4fbbe44ca91fc1406266782e586c37dd8cb2d598cf29`
- `parameters.json`: `237f9be75c28bc417a2d9976d9100bed7786c0be31cb0105a65894747ace7d57`
- `source/build_service.py`: `af6ffe9dc31e212070dcad46e4361f5f3929ca971fdaf99118ae8c013e820ad4`
- `source/verify_service.py`: `07bd06d0021a46b4d7f8e68a62a4e8873ce0c344b8071a268c4076420c2393dc`
