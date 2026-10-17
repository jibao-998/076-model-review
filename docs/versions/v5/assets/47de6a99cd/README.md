# 076 V5 结构与功能完善

先打开functional_report.html，或076_V5_功能与内部观察.html。原生装配/骨架/爆炸：076_assembled_v5.3dm、076_skeleton_v5.3dm、076_exploded_v5.3dm。旧V4输入及哈希在inputs/v4，原件不覆盖。

目标保持进行中。已验证软件交互与部分结构几何，不具备实物装配或可下水验收结论。阅读goal_audit.json、open_items.csv和assembly_instructions.md；不要直接据此整船切割或下水。

## 可重复生成

Python3.12，预先安装source/requirements.txt中的库。网页所需Three/Orbit与motion.js已内嵌，不联网。可选浏览器QA需要playwright及标准路径安装的Windows Edge。Node用于独立运动控制器测试。

```powershell
python PACKAGE/source/build_functional.py
python PACKAGE/source/verify_functional.py
node PACKAGE/source/test_motion.cjs
python PACKAGE/source/make_viewer.py
python PACKAGE/source/verify_browser.py
python PACKAGE/source/render_diagrams.py
python PACKAGE/source/write_report.py
```

PACKAGE替换为包的完整路径，允许从无关工作目录运行。生成器会覆盖所在包内的生成文件；请先复制副本。三维文件GUID/元数据可能变化，复现以几何、场景和检查结果为准，不要求整个3dm二进制相同。

write_report读取当前检查结果，不能在未复查变化后的HTML时把旧browser_validation当成新验证。independent_review绑定列出的文件哈希，重建后如不匹配应重新检查对应证据。所有新增内部结构为D模型设计，真实076内部与水下轴系仍Unknown。233对象包含预留体/走线等参考对象；并非233件可切割板材。

## 不能由动画得出的结论

演示RPM不是电机选择建议；独立位移不自动保证任意方向无碰撞。原生外壳含零厚度参考面，不能凭Brep有效认定水密或具备浮力结果。当前局部拆装只验证了已列顺序下的木质实体，完整骨架穿装、紧固、密封和运行测试未完成。
