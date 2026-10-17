"""Run in Rhino Python after opening hull_bulbous_bow_v1.3dm. NOT RUN here.
Read-only topology analysis in memory; does not Join/modify saved document geometry.
"""
import os,json,datetime
import Rhino
import scriptcontext as sc

def main():
 names=['BOW_FORE_STBD_NURBS','BOW_FORE_PORT_NURBS','BOW_AFT_STBD_NURBS','BOW_AFT_PORT_NURBS','BOW_UPPER_STEM_STRIP','TRANSOM_REFERENCE_CAP']
 objects={obj.Attributes.Name:obj for obj in sc.doc.Objects if obj.Attributes.Name in names}
 missing=[name for name in names if name not in objects]
 if missing:raise RuntimeError('Open hull_bulbous_bow_v1.3dm first. Missing: '+str(missing))
 copies=[objects[name].Geometry.DuplicateBrep() for name in names]
 joined=Rhino.Geometry.Brep.JoinBreps(copies,sc.doc.ModelAbsoluteTolerance)
 parts=[]
 if joined:
  for b in joined:
   edges=b.DuplicateNakedEdgeCurves(True,True)
   parts.append({'valid':b.IsValid,'solid':b.IsSolid,'faces':b.Faces.Count,'naked_edge_curves':len(edges) if edges else 0})
 stamp=datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
 parent=os.path.dirname(sc.doc.Path)
 if not parent:raise RuntimeError('Save the model to its delivered directory before running QA')
 output=os.path.join(parent,'Rhino_native_QA_'+stamp);os.makedirs(output)
 result={'backend':'Actual RhinoCommon in active Rhino document','document':sc.doc.Path,'join_tolerance_mm':sc.doc.ModelAbsoluteTolerance,'joined_in_memory_only':True,'parts':parts,'Zebra':'MANUAL_VISUAL_REVIEW_PENDING','CurvatureGraph':'MANUAL_VISUAL_REVIEW_PENDING','self_intersection':'NOT_CHECKED'}
 with open(os.path.join(output,'native_topology.json'),'w') as f:json.dump(result,f,indent=2)
 print('Native topology written to: '+output)
 print('For Zebra: select the four BOW_FORE/AFT surfaces, run _Zebra, restore Bow_Close_3D and Bow_Profile named views, capture with _ViewCaptureToFile.')
 print('For CurvatureGraph: show BOW_REBUILD_PROFILE_EXACT layer, select BOW_CENTER_PROFILE_EXACT and BOW_BOTTOM_PROFILE_EXACT, run _CurvatureGraph; capture with _ViewCaptureToFile.')
 print('Use _ShowEdges on an analysis copy for naked/non-manifold edges. This script does not certify visual fairness or self-intersection.')

if __name__=='__main__':main()
