(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SchemeState = factory();
})(typeof window === 'object' ? window : this, function () {
  'use strict';
  const steps = Object.freeze([
    { message: '机库照明亮起', lights: 65 },
    { message: '右舷平台下降', stbd: 100 },
    { message: '右舷平台回到上位', stbd: 0 },
    { message: '左舷平台下降，观察内景', port: 100 },
    { message: '左舷平台回到上位', port: 0 },
    { message: '锚受控下放（长度待定）', anchor: 100 },
    { message: '锚收回至收纳位置', anchor: 0 },
    { message: '预览完成', lights: 65 }
  ]);
  function initial() {
    return { connected: false, running: false, step: -1, stbd: 0, port: 0,
      anchor: 0, lights: 0, telemetry: null, message: '未接入硬件 · 可启用网页预览' };
  }
  function reduce(state, action) {
    if (action.type === 'disconnect') return { ...state, connected: false, running: false, message: '预览连接已断开 · 后续动作已取消' };
    if (action.type === 'connect') return { ...state, connected: true, running: false, message: '网页预览就绪 · 无真实设备连接' };
    if (action.type === 'stop') return { ...state, running: false, message: '预览已停止 · 保持当前图示位置' };
    if (!state.connected) return state;
    if (action.type === 'start') return { ...state, running: true, step: -1, message: '开始流程预览（次序尚待确认）' };
    if (action.type === 'tick') {
      if (!state.running) return state;
      const next = state.step + 1;
      if (next >= steps.length) return { ...state, running: false, message: '预览完成' };
      return { ...state, ...steps[next], step: next, running: next < steps.length - 1 };
    }
    if (!['lift', 'anchor', 'lights'].includes(action.type) || !Number.isFinite(action.value)) return state;
    const key = action.type === 'lift' ? action.side : action.type;
    if (!['stbd', 'port', 'anchor', 'lights'].includes(key)) return state;
    const value = Math.max(0, Math.min(100, action.value));
    return { ...state, [key]: value, running: false, message: '独立操作预览 · 未发送硬件命令' };
  }
  return { initial, reduce, steps };
});
