// 'demo'     : everything runs in the browser with sample data (no account, nothing is sent anywhere). Used on GitHub Pages.
// 'firebase' : real Firebase Auth + Firestore + Realtime Database (the ESP32 writes /house/temp, /house/humidity, /house/gas-leak).
export const MODE = new URLSearchParams(location.search).get('mode') === 'firebase' ? 'firebase' : 'demo';

// Alert thresholds (editable defaults for the demo; not certified safety limits)
export const LIMITS = { tempWarn: 38, tempDanger: 50, humLow: 20, humHigh: 80 };
