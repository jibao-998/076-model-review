# 076 800 mm 船体优化与基础附体 V4

先打开 refinement_report.html；交互页为 076_V4_船体优化_交互预览.html，均可离线双击。

完整装配 / 骨架 / 爆炸：076_assembled_v4.3dm、076_skeleton_v4.3dm、076_exploded_v4.3dm。

总长800 mm，X从艏到艉，+Y右舷，Z向上。所有新增尺寸/水下附体均为D模型设计，实舰水下配置Unknown。9张用户图片均为模型/CGI，8个唯一内容。旧V3不覆盖。

本包是外形与静态结构评审，不是制造图。Rhino桌面、裸边、水密、原生Zebra及实际装配/下水验证NOT_CHECKED。1.25 mm肋骨内缩尚未与3 mm实物蒙皮协调。部分附体仍为零厚度NURBS参考面。

## 重建

需要Python 3.12以及source/requirements.txt列明的第三方库。库需预先安装，本包不包含Python二进制依赖；运行生成器本身不联网。网页所需Three.js与OrbitControls已在包内并内嵌。

从任意目录运行（将PACKAGE替换成本包路径）：

```powershell
python PACKAGE/source/build_assembly.py
python PACKAGE/source/verify_geometry.py
python PACKAGE/source/make_viewer.py
python PACKAGE/source/render_review.py
python PACKAGE/source/write_report.py
```

这些命令只改写所在包内的生成文件。输入在inputs与references；parameters.json为本版输入，resolved_parameters.json记录实际使用值。不要用历史模型做写入目标。3dm的对象GUID/元数据可能随重建变化，判断复现应比较实际几何/场景，不要求原生文件逐字节相等。

source/verify_browser.py为可选网页QA，需要额外playwright与Windows Edge（默认标准安装路径）；它会覆盖views中的网页截图和browser_validation.json。独立解压重建不伪装重新执行Rhino桌面，也不伪装重新完成旧原件哈希核对：原目录的历史保护证据保留在本包原始geometry_validation.json。

source/write_report.py读取已有网页验证结果。因此只重建几何但尚未重新做浏览器检查时，不得把继承的browser_validation.json描述为新生成物的最新检查。

参数有联动约束，不能全部独立修改：甲板Z76、参考高度32及3 mm材料厚度目前受守卫检查；若要改高度/厚度应同步重构母面和配合。SLOT_WIDTH=T+FIT_CLEARANCE，刀缝只作加工补偿元数据；参考蒙皮与桨叶不会由厚度参数自动变成生产实体。

reference_usage.csv给出逐图方向/用途；source_evidence.csv区分A官方、C估算、D模型设计及Unknown，本轮没有新增独立B级水下证据。inputs/public_sources_inherited.csv保留旧资料与冲突，不把整篇报道统一升级评级。

manifest_sha256.json记录包内文件哈希（不含自身）；ZIP的CRC和复现结果见delivery_validation.json。
