// src/components/_helpers.jsx

// A simple safe field picker that works even if some column names differ
export function pickField(obj, ...fields) {
  for (const f of fields) {
    if (obj && obj[f] !== undefined && obj[f] !== null) return obj[f];
  }
  return null;
}
