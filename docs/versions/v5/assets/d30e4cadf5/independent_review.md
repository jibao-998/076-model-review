# Independent V5 review

Reviewed 2026-10-17. Focused rereview of final bearing and UI reset changes; saved native geometry, scene data and embedded viewer scene agree. Only this review file was edited. This review applies to the hashes below.

## Previous P1 resolved for gravity seating

The earlier unsupported lift-out crown finding is resolved geometrically. X665/X750/X772 now have two horizontal 3 × 3 mm bearing faces at Z72.25; X710 has one such integral face and a 3 × 3 mm bracket contact at Z69.75. Each beam has 18.0 mm² nominal upward bearing area, computed by intersecting actual scene triangle faces rather than inferring area from point tests. Native Profile3d contours match the generated profiles. The latest X710 bracket X708.5–711.5, Y−47.5–−44.5, Z47–69.75 has a full 9.0 mm² base contact with the retained upper plate and 9.0 mm² top contact with the beam.

These details provide modeled gravity seats. They do not establish hold-down, shock resistance, material strength or a watertight/operational assembly. No new blocking defect was found in this focused geometry/UI review at the stated design-layout scope.

## Independently verified

- Native readback: 233 valid objects, 0 native meshes, unique names, matching scene/native counts. All 191 expected unchanged V4 native objects compare identically by geometry serialization before bbox-cache mutation.
- Motion test executed successfully: independent offsets and explosion compose correctly, baseline data stays immutable, RPM/pause/reset and shaft-axis rotation pass. Motion source hash is unchanged from that tested revision. The final selectPart(null) and Restore All UI edits were inspected: they now clear selection/highlight, footer, picker and XYZ fields. These last reset-only paths were checked by source inspection; the separate generated browser QA reports 233 independent offsets/restores, 144 view/orbit checks, timed RPM/play/pause, zero errors and zero HTTP requests. Embedded HTML scene JSON equals the latest assembly_scene.json, including the inward-shifted X710 bracket.
- Well ceiling rebates retain the full declared inner ceiling X610–776, Y±22. The five barrier planes still bound interior Z25–44; the transom aperture is the sixth face. This is enclosure geometry, not waterproof-joint verification.
- Both roof paths were checked using continuous swept solids for a +Z130 mm translation, made by extruding each complete footprint through its entire occupied height. After deck/crown removal, exact solid intersections against remaining modeled wooden components found zero positive-volume clashes: 6 candidate pairs for well roof, 5 for hangar roof. The final bracket adjustment remains outside both roof footprints. This is stronger than checking 2 mm-spaced poses for these two simple translations.
- Supplemental blade screen: 14,040 sampled blade vertices, both propellers, 10-degree angular increments, every 22nd mesh vertex; 0 sampled points inside the local outer-hull reference (958 local skin triangles, barycentric XZ section test). Propeller/skin source geometry is unchanged. This sample does not prove exact swept clearance or clearance to a 3 mm inward skin.

## Remaining limits

- Current generated validation reports 73 structural solids, 11 volume-valid gear solids, 122 static candidate pairs, and no positive-volume clashes. The 10 propeller blades and 4 shaft struts are open surfaces and excluded from that solid boolean check; a full-angle exact clearance test is absent.
- The generator reports 414 sampled service poses for two roofs, two walls and floor, plus continuous roof sweep checks with the same 6/5 candidates and zero intersections as the independent sweep method. Wall paths move inward then aft; floor path follows wall removal, vertical lift, roll and further lift. This rereview independently strengthens only the two roof sweeps. It does not establish every frame/beam/plate installation path or tool/hand access.
- Hardware is explicitly UNSELECTED. Motor-to-shaft drive, mounts, shaft seals, crown/bracket retention and manufacturing fits, removable-joint sealing, 3 mm skin versus 1.25 mm frame inset, weight/floatation and physical operation remain unresolved. Do not describe physical assembly or operation as completed.
- Final report-link and packaging validation belong to the subsequent packaging step and are not covered by this geometry review. Native Rhino UI and physical assembly have not been tested.

## SHA-256 binding

- `source/build_functional.py`: `1c1982e4b627306688ffe22e898038a2a352d616d11fae3b49ad5978ff718056`
- `source/motion.js`: `4a814284405d3dae82c83f23e459312d5e0186cd12594fa20884a50b18385a4f`
- `source/viewer_template.html`: `0d1e3d3663a3aeca5ebc05ba5a941cbfc9246f889414e12f79b049f5cb8744fa`
- `source/verify_functional.py`: `e0e338a88181c83e55df365754b0a4d66b6f248e74ba1df351a48f6c964bc8ea`
- `source/verify_browser.py`: `9a1dccc9145449746f4a19bf1d9bc25f2e21ea879b631b520ce33494f18205f8`
- `076_assembled_v5.3dm`: `62e14f7d17ff5cbf43d9290c011dcf71edee6b13978f421e3de14d34ae5856be`
- `assembly_scene.json`: `fd058df74e7591b802014abc7a4f98df30a29e83d2315d504def132b34cab425`
- `076_V5_功能与内部观察.html`: `df4526c5004c05e1dbf576c886cd9283e67fab78fb621742e694865b56a72023`
- `parameters.json`: `8eaa234a0e39db477906ebb8e329a0d6dd90f2ce16394d340e94cc67abe826e3`
- `functional_validation.json`: `2d7c1cdc34c35cbe5bc78e4ea123cc6704f52ddbe688f1f8f9c5b34fd2939889`
- `browser_validation.json`: `7d0511d27137e9fc0dd5ea2bee3cdc7870080f45c02a9796cd20864f368e8164`
