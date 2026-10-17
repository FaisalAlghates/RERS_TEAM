// Firebase store (open the app with ?mode=firebase). Uses ../JS/firebase.js for the web config.
// Firestore: users/{uid}, buildings, sensors, cameras, reports · Realtime Database: /house/{temp,humidity,gas-leak} (written by the ESP32)
import { auth as fbAuth, db, app } from '../JS/firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { getDatabase, onValue, ref } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';

const wrap = (u) => (u ? { name: u.displayName || u.email.split('@')[0], email: u.email, uid: u.uid } : null);

export const auth = {
  current: () => new Promise((res) => onAuthStateChanged(fbAuth, (u) => res(wrap(u)), () => res(null))),
  async signIn(email, pw) {
    return wrap((await signInWithEmailAndPassword(fbAuth, email, pw)).user);
  },
  async signUp(name, email, pw) {
    const { user } = await createUserWithEmailAndPassword(fbAuth, email, pw);
    await updateProfile(user, { displayName: name });
    await setDoc(doc(db, 'users', user.uid), { name, email });
    return wrap(user);
  },
  signOut: () => fbSignOut(fbAuth),
};

export const data = {
  async list(kind) {
    const snap = await getDocs(query(collection(db, kind), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async add(kind, obj) {
    const row = { ...obj, createdAt: Date.now() };
    const ref_ = await addDoc(collection(db, kind), row);
    return { id: ref_.id, ...row };
  },
  remove: (kind, id) => deleteDoc(doc(db, kind, id)),
  reset: async () => {},
};

export const live = {
  demo: false,
  subscribe(cb) {
    const state = { temp: null, humidity: null, gasLeak: false };
    const push = () => cb({ ...state, at: Date.now() });
    const rtdb = getDatabase(app);
    const subs = [
      onValue(ref(rtdb, 'house/temp'), (s) => ((state.temp = s.val()), push())),
      onValue(ref(rtdb, 'house/humidity'), (s) => ((state.humidity = s.val()), push())),
      onValue(ref(rtdb, 'house/gas-leak'), (s) => ((state.gasLeak = !!s.val()), push())),
    ];
    return () => subs.forEach((off) => off());
  },
  simulate() {},
};
