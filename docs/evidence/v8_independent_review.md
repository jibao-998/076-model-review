# V8 independent geometry review — 2026-10-18

**Verdict: PASS_FOR_GEOMETRY_REVIEW_ONLY.** No blocking geometry finding for integrating the present V8 review model. This is not manufacturing, strength, insertion-path, watertightness or Rhino desktop approval. Review was read-only against saved files; no V8 file was changed.

Assembly SHA-256: `a2c7793993c420136dc34f3d4a209371e33a7474a2c46ebca334e999d8e8db39`.

Evidence: `work/v8_geometry_review.json`; independently written checker: `work/review_v8_geometry.py`. Execution: `C:/Program Files/Python312/python.exe -B work/review_v8_geometry.py`, with dependencies from `work/lib` and bytecode disabled. The checker imports no V8 builder, envelope or verifier and does not rerun the implementer scripts as proof. Inputs reviewed include the Task 1 requirements, handoff, report, native/panel/scene files, change record, material records and validation/source code.

## Verified

- All four saved 3DMs read back in millimetres, with no invalid objects and zero native Mesh objects; assembled/exploded have 290 objects, skeleton 101 and jig 104. Each has five named views. Assembled nontemporary geometry spans X=0…800 mm.
- All 53 source hull objects match fresh V6 native geometry encodings. The original `outputs/076_Service_V6/076_assembled_v6.3dm` and frozen copy both retain the approved SHA-256 `6de9a4571aa78f69bf85a0225880a3d48d9cc029c24b0416ce23d4d1a7fe542b`. All 15 frozen input hashes pass. Geometry encoding comparisons occur before bounding-box routines populate serialization caches.
- Independently derived V6→V8 differences agree with the full `actual_native_diff_vs_v6`: six changed objects (two frames and four upper cheeks), three removed objects (two former continuous plates and `WIRE_LIGHT`), and six added objects (four split plates and two light branches). The short `modified_vs_v6` list is a summary, so use the full diff when listing actual changed parts.
- All ten revised native Extrusions are closed solids; native profile polygons, holes, thickness axes, panel JSON and scene vertices/volumes correspond. Polygon symmetric-difference areas and native-to-scene profile vertex errors are zero. Every revised plate is 3 mm thick.
- The revised lower-notch-to-outer/bottom distances are **7.7625521916 mm at X750** and **3.1969536520 mm at X772**, reproduced on both sides. The complete closest segments lie inside actual saved wood. These values describe the revised lower joints, not every inherited slot or a material strength limit.
- The two floor pieces and two lowerplate pieces are each single valid connected polygons. There is no detached 1.44 mm tail or 2.44 mm floor cap. The aft floor spans X751.56…776 with its 40 mm integral tongue across X770.5…773.5; footprint/bearing area is **120 mm²**. The lowerplate ends at X770.44. No unsupported separate tiny aft offcut was found.
- The well's open rectangular interior X610…776, Y−22…22, Z25…44 remains **44 × 19 mm**; intersections against the ten revised solids plus both well walls have no positive volume. Nineteen independently selected bounding-box candidate pairs between revised geometry and all native-tied panel solids have no positive-volume interference. This focused check supplements the implementer's broader static report; it does not recertify every non-panel accessory.
- The native-derived horizontal contacts reproduce the report: aft floor contacts each sidewall over 63.96 mm² and lowerplate over 930.438652 mm²; forward floor contacts each sidewall over 415.32 mm² and lowerplate over 7072 mm². Correct Z19/22/25 plate interfaces were checked. The four cheek profiles have positive face contact to their corresponding frames and remain included in the skin sampling. Contact geometry alone establishes no allowable load or reliable glue bond.
- The saved `WIRE_LIGHT_FIXED` equals the original V6 route without its last segment; `WIRE_LIGHT_WITHDRAWABLE` equals that final segment. Both scene lines equal native polylines. The terminal branch occupies X187…400 at Z70 and must be physically cleared before cassette lifting. The report's removal prerequisite is justified; connector, strain relief and the branch withdrawal swept volume remain unmodeled.

## Independent sampled skin distances

The alternate check uses native profile vertices plus an independent boundary grid with spacing at most 2.3 mm, five extrusion-depth positions, and normalized-UV bounded least squares on saved aft mother surfaces. It checks **20,235 boundary points**. Euclidean closest-surface distances reproduce the 2.2 mm normal-offset design intent within the stated 0.01 mm numerical tolerance. The lowest alternate sample is **2.1998989013 mm** at `FRAME_14_X772`; describing this as a 2.2 mm target passed with numerical tolerance is appropriate. An assertion of every point being at least exactly 2.200000 mm is unsupported.

| Part | Alternate sampled minimum, mm |
|---|---:|
| WELL_INNER_FLOOR_1 | 2.80957249 |
| WELL_INNER_FLOOR_2 | 7.54132546 |
| LOWER_CROSSPLATE_5_FRAMES_1 | 2.21064414 |
| LOWER_CROSSPLATE_5_FRAMES_2 | 2.20984434 |
| FRAME_13_X750 | 2.19993893 |
| FRAME_14_X772 | 2.19989890 |
| FRAME_CHEEK_PORT_X750 | 2.50347922 |
| FRAME_CHEEK_STBD_X750 | 2.50347922 |
| FRAME_CHEEK_PORT_X772 | 2.55089163 |
| FRAME_CHEEK_STBD_X772 | 2.55089163 |

**Nonblocking evidence finding V8-REVIEW-01:** the alternate grid samples the floor corner at `[776, −25, 22]`, giving 2.80957249 mm instead of the implementer grid's 3.02157228 mm. Both exceed the target. This is consistent with the report's explicit sampled-only limitation. Preserve sampled-minimum wording, attach this independent evidence, and avoid treating either grid as a continuous/global guarantee. This does not require changing V8 geometry.

## Remaining qualifications

Keep the public review status and separate closing criteria for native Rhino desktop opening, board grade and grain, pressing/strength tests, complete lower-board insertion and fixtures, 0.06 mm side-seam bonding/sealing, immersion/water operation, and selected hardware/interfaces. The native/static contact checks do not close those items. Lack of real physical hardware is not a blocker for publishing this geometry review with those items visibly open. The current report and handoff make these limitations explicit and do not claim full insertion or wood strength.
