'use strict';
(function () {
  const byId = id => document.getElementById(id);
  const make = (tag, text, cls) => { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (cls) el.className = cls; return el; };
  const storeKey = '076.scheme.R1-20261019.checks.v1';
  let state = SchemeState.initial(), clock = null, data = null, checks = {};
  function cancelClock() { if (clock !== null) clearInterval(clock); clock = null; }
  function dispatch(action) {
    state = SchemeState.reduce(state, action);
    if (!state.running) cancelClock();
    renderPreview();
  }
  function renderPreview() {
    byId('preview-connect').checked = state.connected;
    const status = byId('connection-state');
    status.textContent = state.connected ? '网页模拟中' : '未接入硬件'; status.classList.toggle('on', state.connected);
    document.querySelectorAll('.preview-control').forEach(el => { el.disabled = !state.connected; });
    byId('preview-start').disabled = !state.connected || state.running;
    byId('preview-status').textContent = state.message;
    for (const side of ['stbd', 'port']) {
      byId('preview-' + side).value = state[side];
      byId(side + '-label').textContent = state[side] === 0 ? '上位（图示）' : state[side] === 100 ? '下位（图示）' : Math.round(state[side]) + '%下降（图示）';
      byId('mini-' + side).style.transform = 'translateY(' + state[side] * .9 + 'px)';
    }
    byId('preview-anchor').value = state.anchor; byId('preview-lights').value = state.lights;
    byId('anchor-label').textContent = state.anchor === 0 ? '收纳（图示）' : Math.round(state.anchor) + '%下放（图示）';
    byId('lights-label').textContent = state.lights === 0 ? '关闭（图示）' : state.lights + '%亮度（图示）';
    byId('mini-anchor').style.transform = 'translateY(' + state.anchor * .65 + 'px)';
    byId('mini-hangar').style.background = state.lights ? 'hsl(48 38% ' + (25 + state.lights * .4) + '%)' : '#536663';
    document.querySelectorAll('#demo-steps li').forEach((el, i) => { el.classList.toggle('current', i === state.step); el.classList.toggle('done', i < state.step); });
  }
  byId('preview-connect').addEventListener('change', e => dispatch({ type: e.target.checked ? 'connect' : 'disconnect' }));
  for (const side of ['stbd', 'port']) byId('preview-' + side).addEventListener('input', e => dispatch({ type: 'lift', side, value: Number(e.target.value) }));
  for (const name of ['anchor', 'lights']) byId('preview-' + name).addEventListener('input', e => dispatch({ type: name, value: Number(e.target.value) }));
  byId('preview-start').addEventListener('click', () => {
    cancelClock(); dispatch({ type: 'start' });
    if (!state.running) return;
    dispatch({ type: 'tick' });
    clock = setInterval(() => dispatch({ type: 'tick' }), 2200);
  });
  byId('preview-stop').addEventListener('click', () => dispatch({ type: 'stop' }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) dispatch({ type: 'disconnect' }); });
  window.addEventListener('pagehide', () => dispatch({ type: 'disconnect' }));
  window.addEventListener('blur', () => { if (state.running) dispatch({ type: 'stop' }); });
  function selectTab(tab, focus = false) {
    const operations = tab === 'operations';
    byId('operations').hidden = !operations; byId('data-panel').hidden = operations;
    for (const [id, selected] of [['tab-operations', operations], ['tab-data', !operations]]) {
      byId(id).setAttribute('aria-selected', String(selected)); byId(id).tabIndex = selected ? 0 : -1;
    }
    if (focus) byId(operations ? 'tab-operations' : 'tab-data').focus();
  }
  for (const name of ['operations', 'data']) {
    const el = byId('tab-' + name);
    el.addEventListener('click', () => selectTab(name));
    el.addEventListener('keydown', e => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        e.preventDefault(); selectTab(e.key === 'Home' ? 'operations' : e.key === 'End' ? 'data' : name === 'operations' ? 'data' : 'operations', true);
      }
    });
  }
  byId('section-position').addEventListener('input', e => {
    const n = Number(e.target.value);
    byId('section-lift').setAttribute('transform', 'translate(0 ' + (2.32 * n) + ')');
    byId('section-position-value').textContent = n === 0 ? '上位' : n === 100 ? '下位' : n + '%下降';
  });
  function saveChecks() {
    try { localStorage.setItem(storeKey, JSON.stringify(checks)); byId('check-storage').textContent = '记录保存在本机浏览器；可导出备份。'; }
    catch { byId('check-storage').textContent = '浏览器不允许保存；本次记录仍可导出，关闭页面后会丢失。'; }
  }
  function restoreChecks() {
    try {
      const raw = JSON.parse(localStorage.getItem(storeKey) || '{}');
      for (const item of data.checks) {
        const value = raw?.[item.id];
        if (!value || !['unverified', 'review', 'pass'].includes(value.status) || typeof value.evidence !== 'string') continue;
        const evidence = value.evidence.slice(0, 2000);
        checks[item.id] = { status: value.status === 'pass' && !evidence.trim() ? 'unverified' : value.status, evidence };
      }
    } catch { byId('check-storage').textContent = '本地记录不可用；当前显示为未验证，可继续填写并导出。'; }
  }
  function renderChecks() {
    restoreChecks();
    for (const item of data.checks) {
      const value = checks[item.id] || { status: 'unverified', evidence: '' }; checks[item.id] = value;
      const row = make('div', undefined, 'check-row'); row.dataset.status = value.status;
      const label = make('label', item.text); label.htmlFor = 'check-' + item.id;
      const select = make('select'); select.id = 'check-' + item.id; select.setAttribute('aria-label', item.text + '：验证状态');
      for (const [v, text] of [['unverified', '未验证'], ['review', '待复查'], ['pass', '通过（自填）']]) { const o = make('option', text); o.value = v; select.append(o); }
      select.value = value.status;
      const input = make('input'); input.value = value.evidence; input.maxLength = 2000; input.placeholder = '证据文件、日期或试验说明'; input.setAttribute('aria-label', item.text + '：证据说明');
      select.addEventListener('change', () => {
        if (select.value === 'pass' && !input.value.trim()) {
          byId('check-status').textContent = '记录“通过”前请填写证据文件、日期或试验说明。'; input.classList.add('invalid'); select.value = value.status; input.focus(); return;
        }
        value.status = select.value; row.dataset.status = value.status; byId('check-status').textContent = ''; saveChecks();
      });
      input.addEventListener('input', () => {
        value.evidence = input.value; input.classList.remove('invalid');
        if (value.status === 'pass' && !input.value.trim()) { value.status = 'unverified'; select.value = 'unverified'; row.dataset.status = 'unverified'; }
        saveChecks();
      });
      row.append(make('span', item.group, 'group'), label, select, input); byId('checks').append(row);
    }
  }
  byId('export-checks').disabled = true;
  byId('export-checks').addEventListener('click', () => {
    if (!data) return;
    const report = { revision: data.revision, exported_at: new Date().toISOString(), geometry_baseline: data.geometry_baseline,
      notice: '用户自填审查记录，未由网页或第三方确认。通过状态需证据；网页预览不替代实物试验。',
      checks: data.checks.map(item => ({ ...item, ...checks[item.id] })), decisions: data.decisions,
      telemetry: { source: 'NOT_CONNECTED', measured_samples: [], fields: data.telemetry } };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const a = make('a'); a.href = url; a.download = '076_R1_审查记录.json'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  renderPreview();
  fetch('scheme_data.json').then(res => { if (!res.ok) throw Error('方案数据读取失败'); return res.json(); }).then(value => {
    data = value;
    for (const p of data.priorities) byId('priority-list').append(make('li', p));
    for (const r of data.requirements) { const row = make('tr'); for (const text of r) row.append(make('td', text)); byId('requirements').append(row); }
    for (const item of data.decisions) { const card = make('article'), h = make('h3', item.item); h.append(make('span', item.status, 'tag')); card.append(h, make('p', item.dependency)); byId('decision-list').append(card); }
    for (const field of data.telemetry) { const card = make('article'), value = make('strong', '— '); value.append(make('span', field.unit, 'unit')); card.append(make('p', field.label), value, make('small', field.basis + ' · 未接入')); byId('telemetry').append(card); }
    for (const step of SchemeState.steps) byId('demo-steps').append(make('li', step.message));
    for (const item of data.next_deliverables) byId('next-deliverables').append(make('li', item));
    renderChecks(); renderPreview(); byId('export-checks').disabled = false;
  }).catch(error => {
    byId('scheme-error').hidden = false;
    byId('scheme-error').textContent = error.message + '。请通过HTTP服务或在线网页打开本页；也可直接查看随包的scheme_data.json与修订稿原文。';
  });
})();
