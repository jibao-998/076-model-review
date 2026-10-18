# V9 independent native geometry review

Reviewed the actual saved files in `outputs/076_Observation_V9`, independently reconstructing their extrusion profiles and collision meshes. This checker does not import the delivered build or verification scripts, and writes only review files under `work`.

Reviewed assembled SHA-256: `91ccbbf2ed096be40bcf0853755e0bc534109f5659251c5d861b18e2a53b6616`.

**Result: the requested geometry and motion checks pass.** Physical stop fixing, strength, actuator, friction, manufacturing tolerances and Rhino desktop interaction remain unverified.

| Check | Independently observed result |
|---|---|
| Actual saved 3DM files | Assembled 314, exploded 314, skeleton 125, planking jig 128 objects; all valid, mm, no native meshes |
| Whole flight deck | One native solid extrusion; one connected planar profile; no interior holes; X0–800; Z76–79; only one deck/service-hatch member |
| Removable carrier | `SERVICE_HATCH` carries the whole deck, both islands, their decoration and all nine markings; all carrier offsets equal (0,0,190) |
| Native versus scene | Native names and assembly tags match; independently transformed assembled geometry exactly matches every saved exploded geometry encoding |
| Native profile binding | All 194 native solid extrusion contours checked against scene cap triangles; polygon-panel area difference is numerical roundoff; largest boundary approximation is 0.001773 mm on inherited propeller hubs |
| Local opening structure | Modified native V8 names are FRAME_08_X460, FRAME_12_X710, HANGAR_STBD_WALL, UPPER_CROSSPLATE_SERVICE_RUNNER and WELL_LIFT_OUT_BEAM_X710; original ledge/cheek/bearing parts are removed or replaced, with all changes explicitly listed in JSON |
| Lift placement | Starboard platform lies between the two island extents; port platform lies aft of both islands; native deck/platform edge separation is 0.5 mm |
| Continuous native motion | Each platform plus four carriage pieces has a clear complete 32 mm Z sweep; whole deck/island carrier has a clear 190 mm upward sweep; roof has a clear 80 mm sweep after carrier removal |
| Open observation/transfer corridors | No fixed physical extrusion intrudes into either requested open prism |
| Floor thresholds | Each lowered platform top and transfer-floor top is Z47; each platform has the full 52 mm native boundary contact with its fixed transfer floor; uncovered transfer-floor strip area is zero |
| Guide and sleeve axes | Native extrusion directions are vertical; lower and upper carriage/stop Z separation is zero at the two travel limits |
| Meaningful mechanism contacts | Each arm contacts the platform over 4.4 mm²; arm/sleeve and upper-stop/sleeve overlap in XY over 10.29 mm²; each rod contacts its support; each support contacts the fixed floor over 27 or 30 mm² |
| Assembled interference | No positive-volume collision among physical solid extrusions; 16 inherited decorative superstructure joins listed separately |
| Retained skin | Seven saved native retained subpatches agree with V8 mother surfaces to at most 6.83e-13 mm sampled deviation; their scene vertices agree with the native surfaces exactly |
| Open skin corridor audit | 241,133 saved native surface samples; no points inside either clear corridor |
| Protected well and stern | Seven named protected native geometries exactly match V8 encoding; well interior X610–776/Y−22–22/Z25–44 has no physical extrusion intrusion; 273 total V8 geometries remain exactly unchanged |

The first reviewed version had four floating upper stops: the stop bore was radius 1.05 mm around a radius 1 mm rod, leaving a nominal 0.05 mm gap and no other fixed-solid attachment. This was reported and corrected before the final review. The current native rings use exact circular radius-1 mm bores, contact their correct rods, and explicitly describe bonding/clamping as a D-level model assumption. The prior geometry issue is resolved at the nominal-contact level; that is not a verification of real axial restraint, adhesive strength or clamp performance.

The independent continuous sweeps use contours reconstructed from the saved native extrusions, rather than trusting scene vertices. Curved profiles are sampled at 512 parameter intervals. Scene cap unions receive a 1e-7 mm seam-healing buffer only for boundary-distance comparison; the raw symmetric-difference areas are retained. Non-solid hull skin is checked separately through native sampling and exact mother-surface parameter domains, never represented as a closed volume. These checks do not prove watertightness, structural reliability or unsampled continuous clearance to every open surface.

Evidence: `work/v9_native_review.json`. Reproduce with PowerShell:

```powershell
$env:PYTHONPATH='work/lib'
& 'C:/Program Files/Python312/python.exe' 'work/v9_native_review.py'
```

The run reports `geometry_checks_pass: true`. The final result binds to the SHA above; changes to the deliverables require rerunning the checker.
