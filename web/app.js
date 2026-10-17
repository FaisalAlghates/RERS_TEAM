import { MODE, LIMITS } from './config.js';

const store = await (MODE === 'firebase' ? import('./store-firebase.js') : import('./store-demo.js'));
const { auth, data, live } = store;

const $app = document.getElementById('app');
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = (t) => new Date(t).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const icons = {
  dash: 'M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z',
  bld: 'M4 21V5l8-3 8 3v16h-6v-5h-4v5z',
  sen: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  cam: 'M4 7h11a2 2 0 0 1 2 2v1.5l4-2.5v8l-4-2.5V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z',
  mon: 'M3 12h4l3-8 4 16 3-8h4',
  rep: 'M6 2h9l5 5v15H6zm8 1.5V8h4.5M9 13h8M9 17h8',
  pay: 'M2 6h20v12H2zm0 4h20',
};
const icon = (k) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[k]}"/></svg>`;

const ROUTES = [
  ['dashboard', 'Dashboard', 'dash'],
  ['monitoring', 'Live monitoring', 'mon'],
  ['buildings', 'Buildings', 'bld'],
  ['sensors', 'Sensors', 'sen'],
  ['cameras', 'Cameras', 'cam'],
  ['reports', 'Reports', 'rep'],
  ['billing', 'Plans', 'pay'],
];

let user = null;
let cleanup = [];
const onLeave = (fn) => cleanup.push(fn);

/* ---------- shared pieces ---------- */
const level = (r) => {
  if (r.gasLeak || (r.temp ?? 0) >= LIMITS.tempDanger) return 'danger';
  if (
    (r.temp ?? 0) >= LIMITS.tempWarn ||
    (r.humidity ?? 50) < LIMITS.humLow ||
    (r.humidity ?? 50) > LIMITS.humHigh
  )
    return 'warn';
  return 'ok';
};
const pill = (l) =>
  `<span class="pill ${l}">${{ ok: 'Normal', warn: 'Warning', danger: 'Emergency' }[l]}</span>`;
const table = (cols, rows, empty) =>
  rows.length
    ? `<div class="table-wrap"><table><thead><tr>${cols
        .map((c) => `<th scope="col">${esc(c[0])}</th>`)
        .join('')}</tr></thead><tbody>${rows
        .map(
          (r) =>
            `<tr>${cols.map((c) => `<td${c[2] ? ` class="${c[2]}"` : ''}>${c[1](r)}</td>`).join('')}</tr>`,
        )
        .join('')}</tbody></table></div>`
    : `<p class="empty">${esc(empty)}</p>`;
const gauge = (value, min, max, unit, label, lvl) => {
  const pct = value == null ? 0 : Math.max(0, Math.min(1, (value - min) / (max - min)));
  const len = 251.3;
  const color = { ok: 'var(--ok)', warn: 'var(--warn)', danger: 'var(--danger)' }[lvl];
  return `<div class="gauge" role="img" aria-label="${esc(label)} ${value ?? 'no reading'} ${esc(unit)}">
    <svg viewBox="0 0 200 120"><path class="track" d="M20 100a80 80 0 0 1 160 0" fill="none" stroke-width="14" stroke-linecap="round"/>
    <path class="arc" d="M20 100a80 80 0 0 1 160 0" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${len}" stroke-dashoffset="${len * (1 - pct)}"/>
    <text x="100" y="92" text-anchor="middle" fill="currentColor" font-size="34" font-weight="700">${value ?? '–'}</text>
    <text x="100" y="112" text-anchor="middle" fill="var(--muted)" font-size="13">${esc(unit)}</text></svg>
    <div style="text-align:center;color:var(--muted);font-size:13px">${esc(label)}</div></div>`;
};
const spark = (arr, color) => {
  if (arr.length < 2) return '<svg class="spark"></svg>';
  const lo = Math.min(...arr);
  const hi = Math.max(...arr);
  const span = hi - lo || 1;
  const pts = arr
    .map((v, i) => `${(i / (arr.length - 1)) * 300},${50 - ((v - lo) / span) * 44}`)
    .join(' ');
  return `<svg class="spark" viewBox="0 0 300 54" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
};

/* ---------- shell ---------- */
function shell(route, title, lead, body, actions = '') {
  const demo =
    MODE === 'demo'
      ? `<div class="demo-bar" role="note">Demo with sample data: nothing is sent anywhere. The live system reads real ESP32 sensors through Firebase.</div>`
      : '';
  $app.innerHTML = `${demo}<div class="shell"><aside class="side">
    <a class="brand" href="#dashboard"><span class="mark" aria-hidden="true">R</span><span><b>RERS</b><small>Rapid Emergency Response</small></span></a>
    <nav class="nav" aria-label="Main">${ROUTES.map(
      ([id, label, ic]) =>
        `<a href="#${id}" ${id === route ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span></a>`,
    ).join('')}</nav>
    <div class="who"><b>${esc(user?.name)}</b>${esc(user?.email)}<br /><button class="btn ghost" id="out" style="margin-top:10px;width:100%">Sign out</button></div>
  </aside><main class="main" id="main" tabindex="-1"><div class="topbar"><div><h1>${esc(title)}</h1><p class="lead">${esc(lead)}</p></div><div>${actions}</div></div>${body}</main></div>`;
  document.title = `${title} · RERS`;
  document.getElementById('out').onclick = async () => {
    await auth.signOut();
    user = null;
    location.hash = 'login';
  };
}

/* ---------- views ---------- */
async function viewLogin() {
  let mode = 'in';
  const draw = () => {
    $app.innerHTML = `<div class="auth"><section class="hero"><a class="brand" href="#login" style="padding:0"><span class="mark" aria-hidden="true">R</span><span><b>RERS</b><small>Rapid Emergency Response System</small></span></a>
      <h1>Every building, one calm screen.</h1>
      <p class="lead">Gas-leak, temperature and humidity sensors and cameras feed one live dashboard, so a problem is seen in seconds instead of minutes.</p>
      <ul><li>Live readings from ESP32 sensors</li><li>Warnings and emergencies logged automatically</li><li>Buildings, sensors, cameras and reports in one place</li></ul></section>
      <section class="panel">${MODE === 'demo' ? '<p class="lead" role="note">Demo: any email and password work, and nothing leaves your browser.</p>' : ''}
      <div class="tabs" role="tablist"><button role="tab" aria-selected="${mode === 'in'}" data-m="in">Sign in</button><button role="tab" aria-selected="${mode === 'up'}" data-m="up">Create account</button></div>
      <form id="f" class="grid" novalidate>
        ${mode === 'up' ? '<div class="field"><label for="n">Full name</label><input id="n" autocomplete="name" required /></div>' : ''}
        <div class="field"><label for="e">Email</label><input id="e" type="email" autocomplete="email" required /></div>
        <div class="field"><label for="p">Password</label><input id="p" type="password" autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}" minlength="6" required /></div>
        <p class="err" id="err" role="alert"></p>
        <button class="btn primary" type="submit">${mode === 'in' ? 'Sign in' : 'Create account'}</button>
      </form></section></div>`;
    document.querySelectorAll('.tabs button').forEach(
      (b) =>
        (b.onclick = () => {
          mode = b.dataset.m;
          draw();
        }),
    );
    document.getElementById('f').onsubmit = async (ev) => {
      ev.preventDefault();
      const err = document.getElementById('err');
      const email = document.getElementById('e').value.trim();
      const pw = document.getElementById('p').value;
      const name = document.getElementById('n')?.value.trim();
      if (!email.includes('@') || pw.length < 6 || (mode === 'up' && !name)) {
        err.textContent =
          'Enter a valid email, a password of 6+ characters' + (mode === 'up' ? ' and your name.' : '.');
        return;
      }
      try {
        user = mode === 'in' ? await auth.signIn(email, pw) : await auth.signUp(name, email, pw);
        location.hash = 'dashboard';
      } catch (e) {
        err.textContent = (e?.code || e?.message || 'Could not sign in').replace('auth/', '').replace(/-/g, ' ');
      }
    };
  };
  draw();
}

async function viewDashboard() {
  const [b, s, c, r] = await Promise.all(['buildings', 'sensors', 'cameras', 'reports'].map((k) => data.list(k)));
  const open = r.filter((x) => x.level !== 'ok').length;
  shell(
    'dashboard',
    `Welcome, ${user.name}`,
    'Your buildings at a glance. Open Live monitoring for readings as they arrive.',
    `<div class="grid g4">
      <div class="card kpi"><div class="label">Buildings</div><div class="value">${b.length}</div><div class="hint">under watch</div></div>
      <div class="card kpi"><div class="label">Sensors</div><div class="value">${s.length}</div><div class="hint">gas · temperature · humidity</div></div>
      <div class="card kpi"><div class="label">Cameras</div><div class="value">${c.length}</div><div class="hint">registered</div></div>
      <div class="card kpi"><div class="label">Incidents logged</div><div class="value">${open}</div><div class="hint">warnings and emergencies</div></div>
    </div>
    <div class="grid g2" style="margin-top:16px">
      <div class="card"><h2>Buildings <a class="btn" href="#buildings">Manage</a></h2>${table(
        [
          ['Name', (x) => esc(x.name)],
          ['Type', (x) => esc(x.type)],
          ['Zone', (x) => esc(x.zone)],
          ['Floors', (x) => esc(x.floors), 'num'],
        ],
        b.slice(0, 5),
        'No buildings yet.',
      )}</div>
      <div class="card"><h2>Recent incidents <a class="btn" href="#reports">All reports</a></h2>${table(
        [
          ['When', (x) => fmt(x.at)],
          ['Building', (x) => esc(x.building)],
          ['Type', (x) => esc(x.kind)],
          ['Level', (x) => pill(x.level)],
        ],
        r.slice(0, 5),
        'Nothing logged.',
      )}</div></div>`,
    '<a class="btn primary" href="#monitoring">Open live monitoring</a>',
  );
}

async function viewMonitoring() {
  const cams = await data.list('cameras');
  shell(
    'monitoring',
    'Live monitoring',
    live.demo
      ? 'Simulated device readings, refreshed every 1.5 s. Use the buttons to rehearse an emergency.'
      : 'Readings written by the ESP32 to the Realtime Database.',
    `<div id="alert" class="alert ok" role="status" aria-live="polite"></div>
    <div class="grid g3" id="gauges"></div>
    <div class="grid g2" style="margin-top:16px">
      <div class="card"><h2>Temperature history</h2><div id="sp-t"></div></div>
      <div class="card"><h2>Humidity history</h2><div id="sp-h"></div></div>
    </div>
    ${
      live.demo
        ? `<div class="card" style="margin-top:16px"><h2>Rehearse an incident</h2><div style="display:flex;gap:12px;flex-wrap:wrap">
      <button class="btn danger" data-sim="gas">Simulate gas leak</button><button class="btn danger" data-sim="fire">Simulate fire (rising heat)</button><button class="btn" data-sim="">Clear</button></div></div>`
        : ''
    }
    <div class="card" style="margin-top:16px"><h2>Cameras</h2><div class="cams">${
      cams.length
        ? cams
            .map(
              (c, i) =>
                `<figure class="cam" style="margin:0"><canvas data-cam="${i}" width="320" height="200" aria-label="Camera ${esc(c.name)}"></canvas><span class="tag">${esc(c.name)}</span><span class="rec">● LIVE</span></figure>`,
            )
            .join('')
        : '<p class="empty">No cameras registered.</p>'
    }</div>${live.demo ? '<p class="lead" style="margin-top:8px">Demo cameras show a simulated signal, not real video.</p>' : ''}</div>`,
  );
  let hist = { t: [], h: [] };
  let lastLevel = 'ok';
  const off = live.subscribe(async (r) => {
    const g = document.getElementById('gauges');
    if (!g) return;
    if (r.temp != null) hist.t.push(r.temp);
    if (r.humidity != null) hist.h.push(r.humidity);
    hist = { t: hist.t.slice(-40), h: hist.h.slice(-40) };
    const lvl = level(r);
    const tl = r.temp >= LIMITS.tempDanger ? 'danger' : r.temp >= LIMITS.tempWarn ? 'warn' : 'ok';
    const hl = r.humidity < LIMITS.humLow || r.humidity > LIMITS.humHigh ? 'warn' : 'ok';
    g.innerHTML = `<div class="card">${gauge(r.temp, 0, 80, '°C', 'Temperature', tl)}</div><div class="card">${gauge(r.humidity, 0, 100, '% RH', 'Humidity', hl)}</div>
      <div class="card" style="display:grid;place-items:center;text-align:center;gap:6px"><div style="font-size:44px" aria-hidden="true">${r.gasLeak ? '⚠' : '✓'}</div><b>Gas</b>${pill(r.gasLeak ? 'danger' : 'ok')}<span class="lead">${r.gasLeak ? 'Leak detected' : 'No leak'}</span></div>`;
    document.getElementById('sp-t').innerHTML = spark(hist.t, 'var(--info)');
    document.getElementById('sp-h').innerHTML = spark(hist.h, 'var(--ok)');
    const a = document.getElementById('alert');
    a.className = `alert ${lvl}`;
    a.innerHTML =
      lvl === 'ok'
        ? `<b>All clear</b><span>Last reading ${new Date(r.at).toLocaleTimeString('en-GB')}</span>`
        : lvl === 'warn'
          ? '<b>Warning: conditions outside the normal range</b><span>Check the area</span>'
          : `<b>EMERGENCY: ${r.gasLeak ? 'gas leak detected' : 'dangerous temperature'}</b><span>Follow your evacuation plan and call the civil defence number</span>`;
    if (lvl !== 'ok' && lvl !== lastLevel) {
      await data.add('reports', {
        at: Date.now(),
        building: 'Al Noor Tower',
        kind: r.gasLeak ? 'Gas leak' : r.temp >= LIMITS.tempDanger ? 'High temperature' : 'Out-of-range reading',
        level: lvl,
        note: `Temp ${r.temp} °C · humidity ${r.humidity}% · gas ${r.gasLeak ? 'LEAK' : 'ok'}`,
      });
    }
    lastLevel = lvl;
  });
  onLeave(off);
  document.querySelectorAll('[data-sim]').forEach((b) => (b.onclick = () => live.simulate(b.dataset.sim || null)));
  // simulated camera feeds
  const cvs = [...document.querySelectorAll('canvas[data-cam]')];
  let timer;
  const tmp = document.createElement('canvas');
  tmp.width = 80;
  tmp.height = 50;
  const draw = () => {
    cvs.forEach((cv, i) => {
      const img = tmp.getContext('2d').createImageData(80, 50);
      for (let p = 0; p < img.data.length; p += 4) {
        const v = 14 + Math.random() * 26;
        img.data[p] = img.data[p + 1] = img.data[p + 2] = v;
        img.data[p + 3] = 255;
      }
      tmp.getContext('2d').putImageData(img, 0, 0);
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmp, 0, 0, 320, 200);
      ctx.fillStyle = '#9fb3c8';
      ctx.font = '12px monospace';
      ctx.fillText(`CAM ${i + 1}  ${new Date().toLocaleTimeString('en-GB')}`, 10, 190);
    });
    if (!reduceMotion) timer = setTimeout(draw, 160);
  };
  draw();
  onLeave(() => clearTimeout(timer));
}

function crud({ route, title, lead, kind, cols, fields, addLabel, empty, needsBuilding }) {
  return async () => {
    const [rows, bl] = await Promise.all([data.list(kind), data.list('buildings')]);
    const bname = (id) => esc(bl.find((x) => x.id === id)?.name ?? '—');
    const opts = (f) =>
      f.options === 'buildings'
        ? bl.map((x) => `<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('')
        : f.options.map((o) => `<option>${esc(o)}</option>`).join('');
    const inputs = fields
      .map(
        (f) =>
          `<div class="field"><label for="f-${f.k}">${esc(f.label)}</label>${
            f.options
              ? `<select id="f-${f.k}" required>${opts(f)}</select>`
              : `<input id="f-${f.k}" type="${f.type || 'text'}" ${f.min != null ? `min="${f.min}"` : ''} required />`
          }</div>`,
      )
      .join('');
    shell(
      route,
      title,
      lead,
      `<div class="card"><h2>${esc(addLabel)}</h2>${
        needsBuilding && !bl.length
          ? '<p class="empty">Add a building first.</p>'
          : `<form id="f" class="form">${inputs}<button class="btn primary" type="submit">Add</button></form>`
      }<p class="err" id="err" role="alert"></p></div>
      <div class="card" style="margin-top:16px"><h2>${esc(title)} (${rows.length})</h2>${table(
        [
          ...cols(bname),
          [
            '',
            (x) =>
              `<button class="btn danger" data-del="${esc(x.id)}" aria-label="Delete ${esc(x.name ?? x.kind ?? '')}">Delete</button>`,
          ],
        ],
        rows,
        empty,
      )}</div>`,
    );
    const form = document.getElementById('f');
    if (form)
      form.onsubmit = async (ev) => {
        ev.preventDefault();
        const obj = {};
        for (const f of fields) {
          const v = document.getElementById(`f-${f.k}`).value.trim();
          if (!v) {
            document.getElementById('err').textContent = 'Fill in every field.';
            return;
          }
          obj[f.k] = f.type === 'number' ? Number(v) : v;
        }
        try {
          await data.add(kind, obj);
          await route$();
        } catch (e) {
          document.getElementById('err').textContent = e?.message || 'Could not save.';
        }
      };
    document.querySelectorAll('[data-del]').forEach(
      (b) =>
        (b.onclick = async () => {
          await data.remove(kind, b.dataset.del);
          await route$();
        }),
    );
  };
}

const viewBuildings = crud({
  route: 'buildings',
  title: 'Buildings',
  lead: 'Add the buildings you protect. Sensors and cameras attach to them.',
  kind: 'buildings',
  addLabel: 'Add a building',
  empty: 'No buildings yet.',
  fields: [
    { k: 'name', label: 'Name' },
    { k: 'type', label: 'Type', options: ['Residential', 'Commercial', 'Warehouse', 'Industrial', 'Public'] },
    { k: 'zone', label: 'Zone / area' },
    { k: 'floors', label: 'Floors', type: 'number', min: 1 },
    { k: 'entrances', label: 'Entrances', type: 'number', min: 1 },
    { k: 'exits', label: 'Exits', type: 'number', min: 1 },
  ],
  cols: () => [
    ['Name', (x) => esc(x.name)],
    ['Type', (x) => esc(x.type)],
    ['Zone', (x) => esc(x.zone)],
    ['Floors', (x) => esc(x.floors), 'num'],
    ['Entrances', (x) => esc(x.entrances), 'num'],
    ['Exits', (x) => esc(x.exits), 'num'],
  ],
});
const viewSensors = crud({
  route: 'sensors',
  title: 'Sensors',
  lead: 'Gas-leak, temperature and humidity sensors on ESP32 devices.',
  kind: 'sensors',
  addLabel: 'Add a sensor',
  empty: 'No sensors yet.',
  needsBuilding: true,
  fields: [
    { k: 'building', label: 'Building', options: 'buildings' },
    { k: 'kind', label: 'Sensor type', options: ['Gas leak', 'Temperature', 'Humidity'] },
    { k: 'location', label: 'Location (room, floor)' },
    { k: 'device', label: 'Device ID' },
  ],
  cols: (bname) => [
    ['Building', (x) => bname(x.building)],
    ['Type', (x) => esc(x.kind)],
    ['Location', (x) => esc(x.location)],
    ['Device', (x) => esc(x.device)],
  ],
});
const viewCameras = crud({
  route: 'cameras',
  title: 'Cameras',
  lead: 'Register the cameras that watch each building.',
  kind: 'cameras',
  addLabel: 'Add a camera',
  empty: 'No cameras yet.',
  needsBuilding: true,
  fields: [
    { k: 'building', label: 'Building', options: 'buildings' },
    { k: 'name', label: 'Camera name' },
    { k: 'stream', label: 'Stream address' },
  ],
  cols: (bname) => [
    ['Building', (x) => bname(x.building)],
    ['Name', (x) => esc(x.name)],
    ['Stream', (x) => esc(x.stream)],
  ],
});

async function viewReports() {
  const r = await data.list('reports');
  const csv = () => {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const body = [
      ['when', 'building', 'type', 'level', 'note'],
      ...r.map((x) => [new Date(x.at).toISOString(), x.building, x.kind, x.level, x.note]),
    ]
      .map((l) => l.map(q).join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([body], { type: 'text/csv' }));
    a.download = 'rers-reports.csv';
    a.click();
  };
  shell(
    'reports',
    'Reports',
    'Every warning and emergency is logged with the readings at that moment.',
    `<div class="card">${table(
      [
        ['When', (x) => fmt(x.at)],
        ['Building', (x) => esc(x.building)],
        ['Type', (x) => esc(x.kind)],
        ['Level', (x) => pill(x.level)],
        ['Note', (x) => esc(x.note)],
      ],
      r,
      'No incidents logged.',
    )}</div>`,
    '<button class="btn" id="csv">Download CSV</button>',
  );
  document.getElementById('csv').onclick = csv;
}

async function viewBilling() {
  const plans = [
    ['Starter', 'One building, up to 5 sensors and 2 cameras', ['Live dashboard', 'Incident log', 'CSV export']],
    ['Professional', 'Up to 10 buildings', ['Everything in Starter', 'Unlimited sensors and cameras', 'Priority support']],
    ['Enterprise', 'Portfolios and city bodies', ['Everything in Professional', 'Custom thresholds', 'Integration help']],
  ];
  shell(
    'billing',
    'Plans',
    'Pricing is not set yet. This page shows the plan layout only; no payment is taken.',
    `<div class="grid g3">${plans
      .map(
        ([n, d, f], i) =>
          `<div class="card plan ${i === 1 ? 'pick' : ''}"><h2>${n}${i === 1 ? ' <span class="pill ok">Popular</span>' : ''}</h2><div class="price">Price to be announced</div><p class="lead">${d}</p><ul>${f.map((x) => `<li>${x}</li>`).join('')}</ul><button class="btn ${i === 1 ? 'primary' : ''}" disabled>Not available yet</button></div>`,
      )
      .join('')}</div>`,
  );
}

/* ---------- router ---------- */
const VIEWS = {
  login: viewLogin,
  dashboard: viewDashboard,
  monitoring: viewMonitoring,
  buildings: viewBuildings,
  sensors: viewSensors,
  cameras: viewCameras,
  reports: viewReports,
  billing: viewBilling,
};
async function route$() {
  cleanup.forEach((f) => f());
  cleanup = [];
  user = user ?? (await auth.current());
  let id = location.hash.slice(1) || (user ? 'dashboard' : 'login');
  if (!VIEWS[id]) id = 'dashboard';
  if (!user && id !== 'login') id = 'login';
  if (user && id === 'login') id = 'dashboard';
  if (location.hash.slice(1) !== id) {
    location.hash = id;
    return;
  }
  try {
    await VIEWS[id]();
  } catch (e) {
    $app.innerHTML = `<main class="main"><h1>Something went wrong</h1><p class="lead">${esc(e?.message || e)}</p><p><a class="btn" href="#login">Back to sign in</a></p></main>`;
  }
  if (id !== 'login') document.getElementById('main')?.focus({ preventScroll: true });
}
addEventListener('hashchange', route$);
route$();
