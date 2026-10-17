// Demo store: sample data kept in this browser's localStorage. No network, no real accounts.
const KEY = 'rers-demo-v1';
const seed = () => ({
  user: null,
  buildings: [
    { id: 'b1', name: 'Al Noor Tower', type: 'Residential', zone: 'Riyadh · Al Olaya', floors: 18, entrances: 2, exits: 4 },
    { id: 'b2', name: 'Harbour Logistics Hub', type: 'Warehouse', zone: 'Dammam · Port District', floors: 2, entrances: 3, exits: 6 },
  ],
  sensors: [
    { id: 's1', building: 'b1', kind: 'Gas leak', location: 'Kitchen, floor 4', device: 'ESP32-A1' },
    { id: 's2', building: 'b1', kind: 'Temperature', location: 'Lobby', device: 'ESP32-A1' },
    { id: 's3', building: 'b1', kind: 'Humidity', location: 'Lobby', device: 'ESP32-A1' },
    { id: 's4', building: 'b2', kind: 'Temperature', location: 'Cold store', device: 'ESP32-B7' },
  ],
  cameras: [
    { id: 'c1', building: 'b1', name: 'Main entrance', stream: 'rtsp://demo/entrance' },
    { id: 'c2', building: 'b1', name: 'Parking level 1', stream: 'rtsp://demo/parking' },
    { id: 'c3', building: 'b2', name: 'Loading dock', stream: 'rtsp://demo/dock' },
  ],
  reports: [
    { id: 'r1', at: Date.now() - 86400000 * 3, building: 'Al Noor Tower', kind: 'Gas leak', level: 'danger', note: 'Kitchen sensor tripped; cleared after 4 min.' },
    { id: 'r2', at: Date.now() - 86400000 * 1.2, building: 'Harbour Logistics Hub', kind: 'High temperature', level: 'warn', note: 'Cold store reached 39 °C.' },
    { id: 'r3', at: Date.now() - 3600000 * 5, building: 'Al Noor Tower', kind: 'Daily check', level: 'ok', note: 'All sensors reporting.' },
  ],
});
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? seed();
  } catch {
    return seed();
  }
};
const save = (s) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode: the demo keeps working for this page view */
  }
};
let state = load();
const uid = () => Math.random().toString(36).slice(2, 9);

export const auth = {
  async current() {
    return state.user;
  },
  async signIn(email) {
    state.user = { name: email.split('@')[0], email };
    save(state);
    return state.user;
  },
  async signUp(name, email) {
    state.user = { name, email };
    save(state);
    return state.user;
  },
  async signOut() {
    state.user = null;
    save(state);
  },
};

export const data = {
  async list(kind) {
    return [...state[kind]].reverse();
  },
  async add(kind, obj) {
    const row = { id: uid(), ...obj };
    state[kind].push(row);
    save(state);
    return row;
  },
  async remove(kind, id) {
    state[kind] = state[kind].filter((r) => r.id !== id);
    save(state);
  },
  async reset() {
    state = seed();
    save(state);
  },
};

// Simulated device: a slow random walk, plus a button to simulate a gas leak or a fire.
let sim = { temp: 27.4, humidity: 44, gasLeak: false, force: null };
export const live = {
  demo: true,
  subscribe(cb) {
    const tick = () => {
      sim.temp += (Math.random() - 0.5) * 0.6 + (sim.force === 'fire' ? 3.2 : (27.5 - sim.temp) * 0.05);
      sim.humidity += (Math.random() - 0.5) * 1.2 + (44 - sim.humidity) * 0.04;
      sim.gasLeak = sim.force === 'gas';
      cb({ temp: +sim.temp.toFixed(1), humidity: +sim.humidity.toFixed(0), gasLeak: sim.gasLeak, at: Date.now() });
    };
    tick();
    const id = setInterval(tick, 1500);
    return () => clearInterval(id);
  },
  simulate(kind) {
    sim.force = kind;
  },
};
